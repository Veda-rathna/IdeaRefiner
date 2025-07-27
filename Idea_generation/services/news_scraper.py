import requests
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime, timezone, timedelta
import logging
from django.utils.dateparse import parse_datetime
from django.db import models
from django.contrib import messages
from django.shortcuts import render
from django.core.paginator import Paginator
from background_task import background
import google.generativeai as genai
import os
from django.db import models

# Configure logging
logger = logging.getLogger(__name__)

# Configure Gemini API (replace with your API key)
genai.configure(api_key=os.getenv('GEMINI_API_KEY', 'AIzaSyAAjsLrF0dD0HE9x477ELL6jQGez0cjQxI'))

# Django Model for NewsArticle
class NewsArticles(models.Model):
    title = models.CharField(max_length=500)
    url = models.URLField(unique=True)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    source = models.CharField(max_length=100)
    published_date = models.DateTimeField(null=True, blank=True)
    image_url = models.URLField(blank=True)
    keywords = models.JSONField(default=list)
    is_active = models.BooleanField(default=True)
    scraped_date = models.DateTimeField(auto_now_add=True)
    news_prompt = models.TextField(blank=True)  # Add this new field

    class Meta:
        ordering = ['-published_date']

    def __str__(self):
        return self.title

class TechNewsScraper:
    def __init__(self):
        # Update sources to use TechCrunch category feeds
        self.sources = {
            'latest': {
                'rss_url': 'https://techcrunch.com/feed/',
                'name': 'TechCrunch Latest'
            },
            'startups': {
                'rss_url': 'https://techcrunch.com/startups/feed/',
                'name': 'TechCrunch Startups'
            },
            'venture': {
                'rss_url': 'https://techcrunch.com/venture/feed/',
                'name': 'TechCrunch Venture'
            },
            'ai': {
                'rss_url': 'https://techcrunch.com/artificial-intelligence/feed/',
                'name': 'TechCrunch AI'
            },
            'apps': {
                'rss_url': 'https://techcrunch.com/apps/feed/',
                'name': 'TechCrunch Apps'
            }
        }

    def delete_all_articles(self):
        """
        Delete all news articles from the database.
        """
        try:
            deleted_count = NewsArticles.objects.all().delete()[0]
            logger.info(f"Deleted {deleted_count} articles")
            return deleted_count
        except Exception as e:
            logger.error(f"Error deleting all articles: {str(e)}")
            return 0

    def scrape_all_sources(self, limit_per_source=10):
        """
        Scrape news from all TechCrunch categories
        """
        total_articles = 0
        
        # Don't delete existing articles, just add new ones
        for source_key, source_config in self.sources.items():
            try:
                articles_count = self.scrape_rss_feed(
                    source_config['rss_url'], 
                    source_config['name'], 
                    limit=limit_per_source
                )
                total_articles += articles_count
                logger.info(f"Scraped {articles_count} articles from {source_config['name']}")
            except Exception as e:
                logger.error(f"Error scraping {source_config['name']}: {str(e)}")
        
        return total_articles

    def generate_news_prompt(self, keywords: list) -> str:
        """Generate idea prompt using article keywords"""
        return f"""Generate an innovative and unique idea based on the combination of the following technological keywords: {', '.join(keywords)}.

Provide a detailed description of the idea, including its potential impact, target audience, and a basic implementation approach. The idea should be practical yet creative, addressing a real-world problem across domains like technology, sustainability, or healthcare.

Format the response with the following structure:

**Idea Title**: [A catchy title for the idea]

**Problem Statement**: [A detailed description of the problem being addressed, including its significance and who it affects]

**Idea Description**: [A comprehensive explanation of the idea, how it leverages the given technologies, and its innovative aspects]

**Potential Impact**: [The expected benefits, such as economic, social, or environmental impacts, and who will benefit]

**Target Audience**: [Who the solution is intended for, e.g., businesses, consumers, specific industries]

**Implementation Approach**: [A high-level plan for developing the solution, including key steps or technologies involved]

Ensure the response is detailed, descriptive, at least 300 words, and strictly follows the specified format. Do not omit any section."""

    def scrape_rss_feed(self, rss_url, source_name, limit=10):
        """
        Scrape articles from an RSS feed and process with Gemini API.
        """
        try:
            feed = feedparser.parse(rss_url)
            articles_created = 0

            for entry in feed.entries[:limit]:
                try:
                    # Extract basic information
                    title = entry.get('title', '')
                    url = entry.get('link', '')
                    summary = entry.get('summary', '')
                    image_url = ''
                    content = ''

                    # Parse published date
                    published_date = None
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        published_date = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                    elif hasattr(entry, 'published'):
                        try:
                            published_date = parse_datetime(entry.published)
                        except:
                            pass

                    # Clean summary and extract content
                    if summary:
                        soup = BeautifulSoup(summary, 'html.parser')
                        summary = soup.get_text().strip()[:1000]
                        img_tag = soup.find('img')
                        if img_tag and img_tag.get('src'):
                            image_url = img_tag['src']
                        content = soup.get_text().strip()

                    # Try to get image from media_content or enclosure
                    if not image_url:
                        if 'media_content' in entry and isinstance(entry['media_content'], list) and entry['media_content']:
                            image_url = entry['media_content'][0].get('url', '')
                        elif 'enclosures' in entry and isinstance(entry['enclosures'], list) and entry['enclosures']:
                            image_url = entry['enclosures'][0].get('href', '')

                    # Fallback: fetch Open Graph image
                    if not image_url and url:
                        try:
                            headers = {'User-Agent': 'Mozilla/5.0'}
                            resp = requests.get(url, headers=headers, timeout=5)
                            if resp.status_code == 200:
                                soup = BeautifulSoup(resp.content, 'html.parser')
                                og_img = soup.find('meta', property='og:image')
                                if og_img and og_img.get('content'):
                                    image_url = og_img['content']
                        except Exception as e:
                            logger.warning(f"Could not fetch Open Graph image for {url}: {str(e)}")

                    # Summarize content (fallback to summary or title)
                    summary_text = content or summary or title

                    # Extract keywords (simple approach: split title into words, or use more advanced NLP if needed)
                    keywords = [word.strip('.,:;!?()[]') for word in title.split() if len(word) > 3][:5]

                    # Analyze with Gemini API
                    try:
                        model = genai.GenerativeModel('gemini-1.5-flash')
                        prompt = f"""
                        Analyze the following text and provide a structured summary in bullet points.
                        If possible, include a table summarizing key details (e.g., main topic, sentiment, key entities).
                        Text: {summary_text[:1000]}
                        """
                        response = model.generate_content(prompt)
                        structured_content = response.text
                    except Exception as e:
                        logger.error(f"Gemini API error for {title}: {str(e)}")
                        structured_content = summary_text  # Fallback to raw summary

                    # Generate prompt using keywords
                    news_prompt = self.generate_news_prompt(keywords)

                    # Save article
                    article, created = NewsArticles.objects.get_or_create(
                        url=url,
                        defaults={
                            'title': title,
                            'summary': summary,
                            'content': content,
                            'source': source_name,
                            'published_date': published_date,
                            'image_url': image_url,
                            'keywords': keywords,
                            'news_prompt': news_prompt,  # Add the prompt
                            'is_active': True
                        }
                    )

                    if created:
                        articles_created += 1
                        logger.info(f"Created new article: {title[:50]}...")
                    
                except Exception as e:
                    logger.error(f"Error processing article from {source_name}: {str(e)}")
                    continue

            return articles_created
            
        except Exception as e:
            logger.error(f"Error scraping RSS feed {rss_url}: {str(e)}")
            return 0

# Background task to scrape every hour
@background(schedule=timedelta(hours=1))
def scheduled_news_scraping():
    """Background task to scrape TechCrunch news every hour"""
    try:
        scraper = TechNewsScraper()
        total_articles = scraper.scrape_all_sources(limit_per_source=5)
        logger.info(f"Scheduled TechCrunch scraping completed: {total_articles} articles scraped")
    except Exception as e:
        logger.error(f"Scheduled scraping failed: {str(e)}")