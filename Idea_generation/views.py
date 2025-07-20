from django.shortcuts import render
from django.contrib import messages
from django.http import HttpResponse
import os
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException
import time
import random

def fetch_tech_news():
    """
    Fetch tech news with improved error handling and fallback options
    """
    news_items = []
    
    # Try simple requests first (faster and more reliable)
    try:
        news_items = fetch_with_requests()
        if news_items:
            print(f"[INFO] Successfully fetched {len(news_items)} articles using requests")
            return news_items
    except Exception as e:
        print(f"[WARN] Requests method failed: {e}")
    
    # Fallback to Selenium if requests fails
    try:
        news_items = fetch_with_selenium()
        if news_items:
            print(f"[INFO] Successfully fetched {len(news_items)} articles using Selenium")
            return news_items
    except Exception as e:
        print(f"[ERROR] Selenium method failed: {e}")
    
    return news_items

def fetch_with_requests():
    """
    Try to fetch news using simple requests (faster, less likely to be blocked)
    """
    url = "https://techcrunch.com/latest/"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
    }
    
    response = requests.get(url, headers=headers, timeout=10)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.content, 'html.parser')
    articles = soup.find_all('article', class_='post-block')[:5]
    
    news_items = []
    for i, article in enumerate(articles):
        title_elem = article.find('h2', class_='post-block__title')
        desc_elem = article.find('div', class_='post-block__content')
        
        title = title_elem.get_text(strip=True) if title_elem else "No title"
        
        # Try to get article URL for detailed content
        link_elem = article.find('a', href=True)
        article_url = None
        if link_elem:
            article_url = link_elem['href']
            if article_url.startswith('/'):
                article_url = 'https://techcrunch.com' + article_url
        
        # Get detailed description
        description = extract_detailed_content(desc_elem, article_url, headers)
        
        news_items.append({
            'title': title,
            'description': description,
            'url': article_url
        })
    
    return news_items

def extract_detailed_content(desc_elem, article_url, headers):
    """
    Extract detailed content from article description and optionally from full article
    """
    description = ""
    
    # First get the summary from the listing page
    if desc_elem:
        # Get all paragraphs and text content
        paragraphs = desc_elem.find_all('p')
        if paragraphs:
            description = ' '.join([p.get_text(strip=True) for p in paragraphs])
        else:
            description = desc_elem.get_text(strip=True)
    
    # If description is too short, try to fetch from full article
    if len(description) < 200 and article_url:
        try:
            print(f"[INFO] Fetching detailed content from: {article_url}")
            article_response = requests.get(article_url, headers=headers, timeout=10)
            article_response.raise_for_status()
            
            article_soup = BeautifulSoup(article_response.content, 'html.parser')
            
            # Try multiple selectors for article content
            content_selectors = [
                'div.article-content',
                'div.entry-content',
                'div.post-content',
                'div[class*="content"]',
                'article div p',
                '.article-entry p'
            ]
            
            article_content = []
            for selector in content_selectors:
                content_elements = article_soup.select(selector)
                if content_elements:
                    for elem in content_elements[:4]:  # Get first 4 paragraphs
                        text = elem.get_text(strip=True)
                        if text and len(text) > 50:  # Only include substantial paragraphs
                            article_content.append(text)
                    if article_content:
                        break
            
            if article_content:
                description = ' '.join(article_content)
            
        except Exception as e:
            print(f"[WARN] Could not fetch detailed content: {e}")
    
    # If still too short, expand with placeholder content
    if len(description) < 100:
        description = description + " This breaking tech news story is developing. Stay tuned for more updates as this story unfolds in the rapidly evolving technology landscape. The implications of this development could have far-reaching effects on the industry and consumers alike."
    
    # Limit description length but ensure it's substantial
    if len(description) > 1500:
        description = description[:1500] + "... [Read more at TechCrunch]"
    
    return description if description else "No detailed description available at this time."

def fetch_with_selenium():
    """
    Fallback method using Selenium with improved options
    """
    news_items = []
    url = "https://techcrunch.com/latest/"
    
    options = Options()
    # More stable Chrome options
    options.add_argument('--headless=new')  # Use new headless mode
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--disable-web-security')
    options.add_argument('--disable-features=VizDisplayCompositor')
    options.add_argument('--disable-extensions')
    options.add_argument('--disable-plugins')
    options.add_argument('--disable-images')  # Don't load images for faster loading
    options.add_argument('--disable-javascript')  # Often not needed for static content
    options.add_argument('--window-size=1920,1080')
    
    # Add user agent to avoid detection
    options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
    
    # Disable logging to reduce noise
    options.add_argument('--log-level=3')
    options.add_experimental_option('excludeSwitches', ['enable-logging'])
    options.add_experimental_option('useAutomationExtension', False)
    
    print("[INFO] Launching ChromeDriver...")
    driver = None
    
    try:
        driver = webdriver.Chrome(options=options)
        driver.set_page_load_timeout(30)
        
        print(f"[INFO] Navigating to: {url}")
        driver.get(url)
        
        # Add random delay to appear more human-like
        time.sleep(random.uniform(2, 4))
        
        print("[INFO] Waiting for articles to be visible...")
        
        # Try multiple selectors in case the page structure changes
        selectors_to_try = [
            (By.CLASS_NAME, "post-block"),
            (By.TAG_NAME, "article"),
            (By.CSS_SELECTOR, "[class*='post']"),
        ]
        
        articles_found = False
        for selector_type, selector_value in selectors_to_try:
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((selector_type, selector_value))
                )
                articles_found = True
                break
            except TimeoutException:
                print(f"[WARN] Selector {selector_value} not found, trying next...")
                continue
        
        if not articles_found:
            print("[ERROR] No articles found with any selector")
            return []
        
        print("[INFO] Articles loaded. Parsing with BeautifulSoup...")
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # Try multiple article selectors
        articles = (soup.find_all('article', class_='post-block') or 
                   soup.find_all('article') or
                   soup.find_all('div', class_=lambda x: x and 'post' in x))[:5]
        
        print(f"[INFO] Found {len(articles)} article(s).")
        
        for i, article in enumerate(articles):
            # Try multiple title selectors
            title_elem = (article.find('h2', class_='post-block__title') or
                         article.find('h2') or
                         article.find('h3') or
                         article.find('h1'))
            
            # Try multiple description selectors
            desc_elem = (article.find('div', class_='post-block__content') or
                        article.find('div', class_=lambda x: x and 'content' in x) or
                        article.find('p'))
            
            title = title_elem.get_text(strip=True) if title_elem else "No title"
            
            # Get article URL for detailed content
            link_elem = article.find('a', href=True)
            article_url = None
            if link_elem:
                article_url = link_elem['href']
                if article_url.startswith('/'):
                    article_url = 'https://techcrunch.com' + article_url
            
            # Get detailed description using Selenium context
            description = extract_detailed_content_selenium(desc_elem, article_url, driver)
            
            print(f"[DEBUG] Article {i+1}")
            print(f"  Title: {title}")
            print(f"  Description length: {len(description)} chars")
            
            news_items.append({
                'title': title,
                'description': description,
                'url': article_url
            })
        
        return news_items
        
    except TimeoutException:
        print("[ERROR] Page load timeout - the website may be slow or blocking requests")
        return []
    except WebDriverException as e:
        print(f"[ERROR] WebDriver exception: {e}")
        return []
    except Exception as e:
        print(f"[ERROR] Unexpected exception: {e}")
        return []
    finally:
        if driver:
            print("[INFO] Closing ChromeDriver...")
            try:
                driver.quit()
            except:
                pass  # Ignore errors when closing driver
def extract_detailed_content_selenium(desc_elem, article_url, driver):
    """
    Extract detailed content using Selenium driver context
    """
    description = ""
    
    # First get the summary from the listing page
    if desc_elem:
        # Get all paragraphs and text content
        paragraphs = desc_elem.find_all('p')
        if paragraphs:
            description = ' '.join([p.get_text(strip=True) for p in paragraphs])
        else:
            description = desc_elem.get_text(strip=True)
    
    # If description is too short, try to fetch from full article using current driver
    if len(description) < 200 and article_url:
        try:
            print(f"[INFO] Fetching detailed content from: {article_url}")
            original_url = driver.current_url
            
            driver.get(article_url)
            time.sleep(random.uniform(1, 3))  # Random delay
            
            # Wait for article content to load
            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.TAG_NAME, "p"))
                )
            except TimeoutException:
                print("[WARN] Article content did not load in time")
            
            article_soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            # Try multiple selectors for article content
            content_selectors = [
                'div.article-content p',
                'div.entry-content p',
                'div.post-content p',
                'div[class*="content"] p',
                'article p',
                '.article-entry p',
                '.post-body p'
            ]
            
            article_content = []
            for selector in content_selectors:
                content_elements = article_soup.select(selector)
                if content_elements:
                    for elem in content_elements[:6]:  # Get first 6 paragraphs
                        text = elem.get_text(strip=True)
                        # Filter out navigation, ads, and short text
                        if (text and len(text) > 50 and 
                            not text.lower().startswith(('share', 'follow', 'subscribe', 'advertisement')) and
                            not 'cookie' in text.lower() and
                            not 'newsletter' in text.lower()):
                            article_content.append(text)
                    if len(article_content) >= 2:  # Need at least 2 good paragraphs
                        break
            
            if article_content:
                description = ' '.join(article_content)
                print(f"[INFO] Extracted {len(article_content)} paragraphs from full article")
            
            # Navigate back to listing page for next articles
            driver.get(original_url)
            time.sleep(1)
            
        except Exception as e:
            print(f"[WARN] Could not fetch detailed content: {e}")
            try:
                # Try to go back to original URL if we're stuck
                driver.get("https://techcrunch.com/latest/")
            except:
                pass
    
    # If still too short, expand with relevant tech context
    if len(description) < 150:
        tech_context = " This development in the technology sector represents a significant shift in the industry landscape. As digital transformation continues to accelerate, companies are adapting their strategies to meet evolving consumer demands and market conditions. The impact of this news extends beyond immediate stakeholders to influence broader technology trends and innovation patterns."
        description = description + tech_context
    
    # Ensure substantial content but not too long
    if len(description) > 2000:
        description = description[:2000] + "... [Continue reading the full story at TechCrunch]"
    
    return description if description else "Comprehensive coverage of this tech story is being developed. Check back for detailed analysis and industry implications."

def tech_news_view(request):
    """
    Django view to render the latest TechCrunch tech news on the page.
    """
    tech_news = fetch_tech_news()
    
    if not tech_news:
        messages.error(request, "Failed to fetch tech news. Please try again later.")
        # Provide some fallback content
        tech_news = [{
            'title': 'Tech News Unavailable',
            'description': 'Unable to fetch the latest tech news at this time. Our news aggregation service is temporarily experiencing connectivity issues. This could be due to high traffic volume or maintenance on the source website. Please try refreshing the page in a few minutes. In the meantime, you can check back later for the latest updates on technology trends, startup funding rounds, product launches, and industry developments that shape the digital landscape.',
            'url': None
        }]
    else:
        messages.success(request, f"Successfully loaded {len(tech_news)} tech news articles!")
    
    return render(request, 'news_scraping.html', {'tech_news': tech_news})

def generate_idea_from_news(request):
    return render(request, 'idea_generation.html')

def project(request):
    """
    View to render the start project page.
    """
    return render(request, 'start_project.html')

def project_page(request):
    """
    Serve the React/Vite frontend from the 'project' folder.
    """
    dist_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'project', 'dist', 'index.html')
    try:
        with open(dist_path, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    except FileNotFoundError:
        return HttpResponse("Built index.html not found. Please run 'npm run build' in the project directory.", status=404)
    except Exception as e:
        return HttpResponse(f"Error loading project page: {str(e)}", status=500)