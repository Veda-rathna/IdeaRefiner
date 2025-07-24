import requests
import feedparser
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import logging
from django.utils.dateparse import parse_datetime
from ..models import NewsArticle

logger = logging.getLogger(__name__)

class TechNewsScraper:
    """
    Service class for scraping tech news from various sources
    """
    
    def __init__(self):
        self.sources = {
            'techcrunch': {
                'rss_url': 'https://techcrunch.com/feed/',
                'name': 'TechCrunch'
            },
            'hackernews': {
                'rss_url': 'https://hnrss.org/frontpage',
                'name': 'Hacker News'
            },
            'dev_to': {
                'rss_url': 'https://dev.to/feed',
                'name': 'Dev.to'
            },
            'verge': {
                'rss_url': 'https://www.theverge.com/rss/index.xml',
                'name': 'The Verge'
            }
        }
        
    def scrape_all_sources(self, limit_per_source=10):
        """
        Scrape news from all configured sources
        """
        total_articles = 0
        
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
    
    def scrape_rss_feed(self, rss_url, source_name, limit=10):
        """
        Scrape articles from an RSS feed
        """
        try:
            # Parse RSS feed
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
                    
                    # Clean summary (remove HTML tags)
                    if summary:
                        soup = BeautifulSoup(summary, 'html.parser')
                        summary = soup.get_text().strip()[:1000]  # Limit summary length
                        # Try to extract image from summary HTML
                        img_tag = soup.find('img')
                        if img_tag and img_tag.get('src'):
                            image_url = img_tag['src']
                        # Try to extract more content if available
                        content = soup.get_text().strip()
                    # Try to get image from media_content or enclosure
                    if not image_url:
                        if 'media_content' in entry:
                            media = entry['media_content']
                            if isinstance(media, list) and media and 'url' in media[0]:
                                image_url = media[0]['url']
                        elif 'enclosures' in entry:
                            enclosures = entry['enclosures']
                            if isinstance(enclosures, list) and enclosures and 'href' in enclosures[0]:
                                image_url = enclosures[0]['href']
                    # Fallback: try to get image from entry.image or entry.thumbnail
                    if not image_url:
                        image_url = entry.get('image', '') or entry.get('thumbnail', '')
                    # Final fallback: fetch Open Graph image from article page
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
                    

                    # Send to Gemini API for keyword extraction
                    from .gemini_api import extract_keywords_and_structure

                    # Use gensim to summarize article content
                    from .local_summarizer import summarize_text
                    summary_text = summarize_text(content or summary or title)

                    article, created = NewsArticle.objects.get_or_create(
                        url=url,
                        defaults={
                            'title': title,
                            'summary': summary,
                            'source': source_name,
                            'published_date': published_date,
                            'image_url': image_url,
                            'content': summary_text,
                            'keywords': [],
                        }
                    )

                    # If article already exists, update content if missing
                    if not created:
                        updated = False
                        if not article.content:
                            article.content = summary_text
                            updated = True
                        if updated:
                            article.save()

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
    
    def scrape_custom_site(self, url, source_name):
        """
        Scrape a custom website (for sites without RSS)
        This is a basic implementation - can be extended for specific sites
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # This is a generic implementation - you'd need to customize
            # the selectors based on the specific website structure
            articles = soup.find_all('article') or soup.find_all('div', class_=['post', 'article', 'story'])
            
            articles_created = 0
            for article in articles[:10]:  # Limit to 10 articles
                try:
                    title_elem = article.find(['h1', 'h2', 'h3']) or article.find('a')
                    if not title_elem:
                        continue
                        
                    title = title_elem.get_text().strip()
                    
                    # Try to find the URL
                    link_elem = article.find('a') or title_elem
                    if link_elem and link_elem.get('href'):
                        article_url = link_elem['href']
                        if article_url.startswith('/'):
                            article_url = f"{url.rstrip('/')}{article_url}"
                    else:
                        continue
                    
                    # Try to find summary
                    summary_elem = article.find('p') or article.find('div', class_=['excerpt', 'summary'])
                    summary = summary_elem.get_text().strip()[:500] if summary_elem else ''
                    
                    # Create article
                    article_obj, created = NewsArticle.objects.get_or_create(
                        url=article_url,
                        defaults={
                            'title': title,
                            'summary': summary,
                            'source': source_name,
                        }
                    )
                    
                    if created:
                        articles_created += 1
                        
                except Exception as e:
                    logger.error(f"Error processing custom article: {str(e)}")
                    continue
                    
            return articles_created
            
        except Exception as e:
            logger.error(f"Error scraping custom site {url}: {str(e)}")
            return 0
    
    def clean_old_articles(self, days_old=30):
        """
        Remove articles older than specified days
        """
        from django.utils import timezone
        from datetime import timedelta
        
        cutoff_date = timezone.now() - timedelta(days=days_old)
        deleted_count = NewsArticle.objects.filter(scraped_date__lt=cutoff_date).delete()[0]
        logger.info(f"Deleted {deleted_count} old articles")
        return deleted_count
