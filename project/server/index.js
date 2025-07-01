import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import { NewsScraperService } from './services/newsScraper.js';
import { NewsStorage } from './services/newsStorage.js';
import { ChatbotService } from './services/chatbotService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const newsStorage = new NewsStorage();
const chatbotService = new ChatbotService();

// News Routes
app.get('/api/news', async (req, res) => {
  try {
    const { category, limit = 20 } = req.query;
    const news = await newsStorage.getNews(category, parseInt(limit));
    res.json({
      success: true,
      data: news,
      total: news.length
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch news'
    });
  }
});

app.get('/api/news/categories', async (req, res) => {
  try {
    const categories = await newsStorage.getCategories();
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories'
    });
  }
});

app.post('/api/news/refresh', async (req, res) => {
  try {
    console.log('🔄 Manual news refresh triggered');
    await scrapeAndStoreNews();
    const news = await newsStorage.getNews();
    res.json({
      success: true,
      message: 'News refreshed successfully',
      total: news.length
    });
  } catch (error) {
    console.error('Error refreshing news:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh news'
    });
  }
});

// Chatbot Routes
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    console.log('💬 Processing chat message:', message);
    
    // Get recent news context
    const newsContext = await chatbotService.getNewsContext();
    
    // Generate AI response
    const response = await chatbotService.generateResponse(message, newsContext);
    
    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process message',
      fallback: 'I apologize, but I\'m having trouble processing your request right now. Please try again later.'
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'News scraper API is running',
    timestamp: new Date().toISOString(),
    services: {
      news: 'active',
      chatbot: 'active'
    }
  });
});

// Function to scrape and store news
async function scrapeAndStoreNews() {
  try {
    console.log('📰 Starting news scraping...');
    const scraper = new NewsScraperService();
    
    // Scrape from multiple sources
    const sources = [
      { name: 'TechCrunch', url: 'https://techcrunch.com/', category: 'Tech News' },
      { name: 'Hacker News', url: 'https://news.ycombinator.com/', category: 'Tech News' },
      { name: 'The Verge', url: 'https://www.theverge.com/tech', category: 'Tech News' }
    ];

    for (const source of sources) {
      try {
        console.log(`🔍 Scraping ${source.name}...`);
        const articles = await scraper.scrapeNews(source.url, source.name, source.category);
        
        for (const article of articles) {
          await newsStorage.addArticle(article);
        }
        
        console.log(`✅ Successfully scraped ${articles.length} articles from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error scraping ${source.name}:`, error.message);
      }
    }
    
    console.log('🎉 News scraping completed');
  } catch (error) {
    console.error('❌ Error in scraping process:', error);
  }
}

// Schedule news scraping every 30 minutes
cron.schedule('*/30 * * * *', () => {
  console.log('⏰ Scheduled news scraping started');
  scrapeAndStoreNews();
});

// Initial news scraping on server start
setTimeout(() => {
  scrapeAndStoreNews();
}, 2000);

app.listen(PORT, () => {
  console.log(`🚀 News scraper server running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  /api/news - Fetch latest news`);
  console.log(`   GET  /api/news/categories - Get news categories`);
  console.log(`   POST /api/news/refresh - Manual refresh`);
  console.log(`   POST /api/chat - Chat with AI assistant`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`\n🤖 Chatbot APIs supported:`);
  console.log(`   - Groq API (Recommended - Fast & Free)`);
  console.log(`   - Cohere API (Alternative)`);
  console.log(`   - Hugging Face API (Backup)`);
  console.log(`   - Intelligent fallbacks (Always works)`);
});