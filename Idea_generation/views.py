from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator
from django.contrib import messages
from .models import NewsArticle
from .services.news_scraper import NewsArticles, TechNewsScraper  # Update import
from .services.idea_generation import IdeaGenerationService
import json

def home(request):
    """
    Display the latest 5 news articles on the home page.
    """
    latest_news = NewsArticles.objects.filter(is_active=True).order_by('-published_date')[:5]
    context = {
        'latest_news': latest_news,
    }
    return render(request, 'home.html', context)

def news_scraping(request):
    """View for displaying scraped news articles"""
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'scrape':
            try:
                # Delete existing articles
                NewsArticles.objects.all().delete()
                
                # Initialize scraper and scrape new articles
                scraper = TechNewsScraper()
                new_articles = []

                # Scrape from each source
                for source_key, source_info in scraper.sources.items():
                    try:
                        articles = scraper.scrape_rss_feed(
                            source_info['rss_url'],
                            source_info['name'],
                            limit=10
                        )
                        if articles > 0:
                            new_articles.append(f"{articles} from {source_info['name']}")
                    except Exception as e:
                        messages.warning(request, f"Error scraping {source_info['name']}: {str(e)}")

                if new_articles:
                    messages.success(request, f"Successfully scraped: {', '.join(new_articles)}")
                else:
                    messages.warning(request, "No new articles were found")

            except Exception as e:
                messages.error(request, f'Error during scraping: {str(e)}')

    # Get all active articles from database with pagination
    articles_list = NewsArticles.objects.filter(is_active=True).order_by('-published_date')
    paginator = Paginator(articles_list, 20)  # Show 20 articles per page
    page_number = request.GET.get('page')
    articles = paginator.get_page(page_number)

    # Get source statistics
    source_counts = {}
    for source in ['TechCrunch', 'Hacker News', 'Dev.to', 'The Verge']:
        count = NewsArticles.objects.filter(source=source, is_active=True).count()
        source_counts[source] = count

    context = {
        'articles': articles,
        'source_counts': source_counts,
        'total_articles': NewsArticles.objects.filter(is_active=True).count()
    }
    return render(request, 'news_scraping.html', context)

def news_detail(request, pk):
    """View for displaying individual news article details"""
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
    latest_news = NewsArticles.objects.filter(is_active=True).order_by('-published_date')[:5]
    articles = []
    for article in latest_news:
        articles.append({
            'title': article.title,
            'url': article.url,
            'source': article.source,
            'published_date': article.published_date.strftime("%b %d") if article.published_date else "",
        })
    return JsonResponse({'articles': articles})