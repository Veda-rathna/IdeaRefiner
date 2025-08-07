from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator
from django.contrib import messages
from .models import NewsArticle
from .services.news_scraper import NewsArticles, TechNewsScraper  # Update import
import redis
import os
from django.conf import settings
from urllib.parse import urlparse

# Prefer REDIS_URL if present, else build from parts
REDIS_URL = os.environ.get('REDIS_URL')
if REDIS_URL:
    parsed = urlparse(REDIS_URL)
    redis_client = redis.Redis(
        host=parsed.hostname,
        port=parsed.port,
        db=int(parsed.path.lstrip('/') or 0),
        username=parsed.username,
        password=parsed.password,
        ssl=parsed.scheme == 'rediss',
        decode_responses=True
    )
else:
    REDIS_HOST = os.environ.get('REDIS_HOST', getattr(settings, 'REDIS_HOST', 'localhost'))
    REDIS_PORT = int(os.environ.get('REDIS_PORT', getattr(settings, 'REDIS_PORT', 6379)))
    REDIS_DB = int(os.environ.get('REDIS_DB', getattr(settings, 'REDIS_DB', 0)))
    REDIS_PASSWORD = os.environ.get('REDIS_PASSWORD', getattr(settings, 'REDIS_PASSWORD', None))
    if REDIS_PASSWORD == '':
        REDIS_PASSWORD = None
    REDIS_SSL = os.environ.get('REDIS_SSL', getattr(settings, 'REDIS_SSL', 'False')).lower() in ['true', '1', 'yes']
    redis_pool_kwargs = {
        'host': REDIS_HOST,
        'port': REDIS_PORT,
        'db': REDIS_DB,
        'decode_responses': True
    }
    if REDIS_PASSWORD is not None:
        redis_pool_kwargs['password'] = REDIS_PASSWORD
    if REDIS_SSL:
        from redis.connection import SSLConnection
        redis_pool_kwargs['connection_class'] = SSLConnection
    redis_pool = redis.ConnectionPool(**redis_pool_kwargs)
    redis_client = redis.Redis(connection_pool=redis_pool)
from .services.idea_generation import IdeaGenerationService
import json

def home(request):
    """
    Display the latest 5 news articles on the home page.
    """
    # Try to get latest news from Redis cache first
    latest_news = []
    news_keys = redis_client.keys('news_article:*')
    if news_keys:
        news_items = redis_client.mget(news_keys)
        import json as _json
        news_objs = []
        for item in news_items:
            if not item:
                continue
            try:
                news_objs.append(_json.loads(item))
            except Exception:
                # Fallback: try to eval legacy Python dict string
                try:
                    import ast
                    news_objs.append(ast.literal_eval(item))
                except Exception:
                    continue
        # Sort by published_date desc, filter is_active
        news_objs = [n for n in news_objs if n.get('is_active')]
        news_objs.sort(key=lambda x: x.get('published_date', ''), reverse=True)
        latest_news = news_objs[:5]
    else:
        latest_news = list(NewsArticles.objects.filter(is_active=True).order_by('-published_date')[:5])

    context = {
        'latest_news': latest_news,
    }
    return render(request, 'home.html', context)

def news_scraping(request):
    """View for displaying scraped news articles"""

    # Scraping logic removed. This view now only displays news articles and statistics.


    # Try to get all active articles from Redis cache first
    news_keys = redis_client.keys('news_article:*')
    articles_list = []
    if news_keys:
        news_items = redis_client.mget(news_keys)
        import json as _json
        news_objs = []
        for item in news_items:
            if not item:
                continue
            try:
                news_objs.append(_json.loads(item))
            except Exception:
                try:
                    import ast
                    news_objs.append(ast.literal_eval(item))
                except Exception:
                    continue
        articles_list = [n for n in news_objs if n.get('is_active')]
        # Ensure every dict has a valid 'id' and 'pk' for template reverse URL
        for n in articles_list:
            if isinstance(n, dict):
                if 'id' in n:
                    n['pk'] = n['id']
                elif 'pk' in n:
                    n['id'] = n['pk']
        articles_list.sort(key=lambda x: x.get('published_date', ''), reverse=True)
    else:
        articles_list = list(NewsArticles.objects.filter(is_active=True).order_by('-published_date'))

    paginator = Paginator(articles_list, 20)  # Show 20 articles per page
    page_number = request.GET.get('page')
    articles = paginator.get_page(page_number)

    # Get source statistics

    # Get source statistics (from cache if possible, else DB)
    source_counts = {}
    sources = ['TechCrunch', 'Hacker News', 'Dev.to', 'The Verge']
    if articles_list and isinstance(articles_list[0], dict):
        for source in sources:
            count = sum(1 for a in articles_list if a.get('source') == source and a.get('is_active'))
            source_counts[source] = count
    else:
        for source in sources:
            count = NewsArticles.objects.filter(source=source, is_active=True).count()
            source_counts[source] = count

    total_articles = len(articles_list) if articles_list and isinstance(articles_list[0], dict) else NewsArticles.objects.filter(is_active=True).count()
    context = {
        'articles': articles,
        'source_counts': source_counts,
        'total_articles': total_articles
    }
    return render(request, 'news_scraping.html', context)

def news_detail(request, pk):
    """View for displaying individual news article details"""
    # Try Redis first
    article = None
    redis_key = f'news_article:{pk}'
    article_json = redis_client.get(redis_key)
    if article_json:
        import json as _json
        try:
            article = _json.loads(article_json)
        except Exception:
            try:
                import ast
                article = ast.literal_eval(article_json)
            except Exception:
                article = None
    else:
        article = get_object_or_404(NewsArticles, pk=pk, is_active=True)

    context = {
        'article': article,
    }
    return render(request, 'news_detail.html', context)

def idea_generation(request):
    context = {}
    idea_service = None

    try:
        idea_service = IdeaGenerationService()
    except ValueError as e:
        messages.error(request, str(e))
        return redirect('home')

    # Initialize or restore conversation
    if 'conversation_history' in request.session:
        idea_service.conversation_history = json.loads(request.session['conversation_history'])
    else:
        idea_service = IdeaGenerationService()

    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'generate_idea':
            news_id = request.POST.get('news_id')
            generated_idea = idea_service.start_idea_conversation(int(news_id))
            context['generated_idea'] = generated_idea

        elif action == 'continue_conversation':
            user_input = request.POST.get('user_input')
            response = idea_service.continue_conversation(user_input)
            context['conversation_response'] = response

    # Save conversation history to session
    request.session['conversation_history'] = json.dumps(idea_service.conversation_history)
    context['conversation_history'] = idea_service.conversation_history

    return render(request, 'idea_generation.html', context)

def start_project(request):
    project_name = None
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
    return render(request, 'start_project.html', {'project_name': project_name})

def get_latest_news(request):
    """API endpoint to get latest news articles"""
    # Try Redis first
    news_keys = redis_client.keys('news_article:*')
    articles = []
    if news_keys:
        news_items = redis_client.mget(news_keys)
        import json as _json
        news_objs = []
        for item in news_items:
            if not item:
                continue
            try:
                news_objs.append(_json.loads(item))
            except Exception:
                try:
                    import ast
                    news_objs.append(ast.literal_eval(item))
                except Exception:
                    continue
        news_objs = [n for n in news_objs if n.get('is_active')]
        news_objs.sort(key=lambda x: x.get('published_date', ''), reverse=True)
        for article in news_objs[:5]:
            articles.append({
                'title': article.get('title'),
                'url': article.get('url'),
                'source': article.get('source'),
                'published_date': article.get('published_date', "")[:10],
            })
    else:
        latest_news = NewsArticles.objects.filter(is_active=True).order_by('-published_date')[:5]
        for article in latest_news:
            articles.append({
                'title': article.title,
                'url': article.url,
                'source': article.source,
                'published_date': article.published_date.strftime("%b %d") if article.published_date else "",
            })
    return JsonResponse({'articles': articles})