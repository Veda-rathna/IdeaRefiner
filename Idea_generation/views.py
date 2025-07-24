from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
from django.core.paginator import Paginator
from django.contrib import messages
from .models import NewsArticle
from .services.news_scraper import TechNewsScraper

def home(request):
    # Get latest 5 news articles for home page preview
    latest_news = NewsArticle.objects.filter(is_active=True)[:5]
    return render(request, 'home.html', {'latest_news': latest_news})

def news_scraping(request):
    # Handle scraping request
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'scrape':
            try:
                scraper = TechNewsScraper()
                total_articles = scraper.scrape_all_sources(limit_per_source=10)
                messages.success(request, f'Successfully scraped {total_articles} new articles!')
            except Exception as e:
                messages.error(request, f'Error scraping news: {str(e)}')
        elif action == 'refresh':
            pass
    # Get articles with pagination
    articles_list = NewsArticle.objects.filter(is_active=True)
    paginator = Paginator(articles_list, 20)
    page_number = request.GET.get('page')
    articles = paginator.get_page(page_number)
    source_counts = {}
    for source in ['TechCrunch', 'Hacker News', 'Dev.to', 'The Verge']:
        count = NewsArticle.objects.filter(source=source, is_active=True).count()
        source_counts[source] = count
    context = {
        'articles': articles,
        'source_counts': source_counts,
        'total_articles': NewsArticle.objects.filter(is_active=True).count()
    }
    return render(request, 'news_scraping.html', context)

def news_detail(request, pk):
    # Show detailed news article
    from django.shortcuts import get_object_or_404
    article = get_object_or_404(NewsArticle, pk=pk, is_active=True)
    return render(request, 'news_detail.html', {'article': article})

def idea_generation(request):
    idea = None
    if request.method == 'POST':
        idea = request.POST.get('idea')
    return render(request, 'idea_generation.html', {'idea': idea})

def start_project(request):
    project_name = None
    if request.method == 'POST':
        project_name = request.POST.get('project_name')
    return render(request, 'start_project.html', {'project_name': project_name})