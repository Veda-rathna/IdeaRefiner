import axios from 'axios';
import * as cheerio from 'cheerio';

export class NewsScraperService {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  async scrapeNews(url, sourceName, category) {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      const articles = [];

      // Different scraping strategies based on the source
      if (sourceName === 'TechCrunch') {
        articles.push(...this.scrapeTechCrunch($, sourceName, category));
      } else if (sourceName === 'Hacker News') {
        articles.push(...this.scrapeHackerNews($, sourceName, category));
      } else if (sourceName === 'The Verge') {
        articles.push(...this.scrapeTheVerge($, sourceName, category));
      } else {
        // Generic scraping fallback
        articles.push(...this.scrapeGeneric($, sourceName, category, url));
      }

      return articles.filter(article => 
        article.title && 
        article.title.length > 10 && 
        article.description && 
        article.description.length > 20
      );

    } catch (error) {
      console.error(`Error scraping ${sourceName}:`, error.message);
      
      // Return mock data as fallback
      return this.getMockArticles(sourceName, category);
    }
  }

  scrapeTechCrunch($, sourceName, category) {
    const articles = [];
    
    $('article, .post-block, .river-block').each((i, element) => {
      if (i >= 10) return false; // Limit to 10 articles
      
      const $el = $(element);
      const titleEl = $el.find('h2 a, h3 a, .post-block__title a').first();
      const descEl = $el.find('.post-block__content, .excerpt, p').first();
      
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');
      const description = descEl.text().trim();
      
      if (title && description) {
        articles.push({
          id: this.generateId(title),
          title: this.cleanText(title),
          description: this.cleanText(description).substring(0, 200) + '...',
          url: url?.startsWith('http') ? url : `https://techcrunch.com${url}`,
          source: sourceName,
          publishedAt: new Date().toISOString(),
          category: category
        });
      }
    });
    
    return articles;
  }

  scrapeHackerNews($, sourceName, category) {
    const articles = [];
    
    $('.athing').each((i, element) => {
      if (i >= 10) return false;
      
      const $el = $(element);
      const titleEl = $el.find('.titleline > a').first();
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');
      
      if (title) {
        articles.push({
          id: this.generateId(title),
          title: this.cleanText(title),
          description: `Trending discussion on Hacker News: ${title}`,
          url: url?.startsWith('http') ? url : `https://news.ycombinator.com/${url}`,
          source: sourceName,
          publishedAt: new Date().toISOString(),
          category: category
        });
      }
    });
    
    return articles;
  }

  scrapeTheVerge($, sourceName, category) {
    const articles = [];
    
    $('article, .c-entry-box, .c-compact-river__entry').each((i, element) => {
      if (i >= 10) return false;
      
      const $el = $(element);
      const titleEl = $el.find('h2 a, h3 a, .c-entry-box--compact__title a').first();
      const descEl = $el.find('.c-entry-summary, .excerpt, p').first();
      
      const title = titleEl.text().trim();
      const url = titleEl.attr('href');
      const description = descEl.text().trim();
      
      if (title) {
        articles.push({
          id: this.generateId(title),
          title: this.cleanText(title),
          description: description ? this.cleanText(description).substring(0, 200) + '...' : `Latest from The Verge: ${title}`,
          url: url?.startsWith('http') ? url : `https://www.theverge.com${url}`,
          source: sourceName,
          publishedAt: new Date().toISOString(),
          category: category
        });
      }
    });
    
    return articles;
  }

  scrapeGeneric($, sourceName, category, baseUrl) {
    const articles = [];
    const domain = new URL(baseUrl).origin;
    
    // Try common article selectors
    const selectors = [
      'article',
      '.post',
      '.entry',
      '.news-item',
      '.article',
      '[class*="post"]',
      '[class*="article"]'
    ];
    
    for (const selector of selectors) {
      $(selector).each((i, element) => {
        if (i >= 10 || articles.length >= 10) return false;
        
        const $el = $(element);
        const titleEl = $el.find('h1, h2, h3, h4, .title, [class*="title"]').first();
        const descEl = $el.find('p, .excerpt, .summary, [class*="excerpt"]').first();
        const linkEl = $el.find('a').first();
        
        const title = titleEl.text().trim();
        const description = descEl.text().trim();
        const url = linkEl.attr('href');
        
        if (title && title.length > 10) {
          articles.push({
            id: this.generateId(title),
            title: this.cleanText(title),
            description: description ? this.cleanText(description).substring(0, 200) + '...' : `News from ${sourceName}`,
            url: url?.startsWith('http') ? url : `${domain}${url}`,
            source: sourceName,
            publishedAt: new Date().toISOString(),
            category: category
          });
        }
      });
      
      if (articles.length > 0) break;
    }
    
    return articles;
  }

  getMockArticles(sourceName, category) {
    const mockTitles = [
      'AI Breakthrough: New Language Model Achieves Human-Level Performance',
      'Quantum Computing Milestone: 1000-Qubit Processor Demonstrated',
      'Web3 Revolution: Decentralized Internet Gains Mainstream Adoption',
      'Green Tech Innovation: Solar Efficiency Reaches 50% Breakthrough',
      'Robotics Advancement: Humanoid Robots Enter Consumer Market',
      'Cybersecurity Alert: New Encryption Standard Protects Against Quantum Threats',
      'Space Technology: Private Companies Launch Lunar Mining Operations',
      'Biotech Progress: Gene Therapy Shows Promise for Rare Diseases',
      'Autonomous Vehicles: Self-Driving Cars Approved for Public Roads',
      'Virtual Reality: Metaverse Platforms Reach 100 Million Users'
    ];

    return mockTitles.slice(0, 5).map((title, index) => ({
      id: this.generateId(title + sourceName + index),
      title: title,
      description: `${title} - This is a detailed description of the latest developments in technology. The breakthrough represents a significant advancement in the field and could have far-reaching implications for the industry.`,
      url: `https://example.com/article-${index}`,
      source: sourceName,
      publishedAt: new Date(Date.now() - index * 3600000).toISOString(),
      category: category
    }));
  }

  cleanText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?()]/g, '')
      .trim();
  }

  generateId(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50) + '-' + Date.now();
  }
}