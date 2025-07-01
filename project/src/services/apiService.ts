// API service functions for news scraping and OpenAI integration
const API_BASE_URL = 'http://localhost:3001/api';

export class NewsScraperService {
  /**
   * Fetches latest technology news from the backend API
   */
  static async fetchLatestNews(category?: string, limit?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (limit) params.append('limit', limit.toString());
      
      const url = `${API_BASE_URL}/news${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching news:', error);
      // Return empty array on error - the UI will handle this gracefully
      return [];
    }
  }

  /**
   * Fetches available news categories
   */
  static async fetchCategories(): Promise<string[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/news/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success ? data.data : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  /**
   * Triggers manual news refresh
   */
  static async refreshNews(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/news/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error refreshing news:', error);
      return false;
    }
  }

  /**
   * Checks if the backend API is available
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}

export class OpenAIService {
  private static apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  /**
   * Generates project ideas based on news articles and user preferences
   */
  static async generateProjectIdea(newsContext: string, userQuery: string): Promise<string> {
    // Placeholder for OpenAI API integration
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('🤖 Generating AI response...');
        const mockResponse = `Based on the latest news about ${newsContext}, here's a project idea:

**Smart News Analyzer**
Build an AI-powered application that analyzes tech news sentiment and predicts trending technologies. 

**Key Features:**
- Real-time news sentiment analysis
- Technology trend prediction
- Interactive dashboard with charts
- Email alerts for important developments

**Tech Stack:**
- Frontend: React + TypeScript + Chart.js
- Backend: Node.js + Express
- AI: OpenAI API for text analysis
- Database: MongoDB for storing articles

**Getting Started:**
1. \`npx create-react-app news-analyzer --template typescript\`
2. \`npm install openai chart.js axios\`
3. Set up your OpenAI API key in .env file

Would you like me to provide more specific implementation details?`;
        resolve(mockResponse);
      }, 2000);
    });
  }

  /**
   * Provides code snippets and implementation guidance
   */
  static async getCodeHelp(query: string): Promise<string> {
    console.log(`💻 Getting code help for: ${query}`);
    // Implementation would integrate with OpenAI Codex or GPT-4
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Here\'s a code snippet to help you get started...');
      }, 1500);
    });
  }

  /**
   * Explains project structure and dependency installation
   */
  static async explainProjectSetup(projectType: string): Promise<string> {
    console.log(`📁 Explaining setup for: ${projectType}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        const setupGuide = `## Project Setup Guide for ${projectType}

### 1. Create Project Structure
\`\`\`bash
mkdir my-${projectType.toLowerCase().replace(' ', '-')}-project
cd my-${projectType.toLowerCase().replace(' ', '-')}-project
npm init -y
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install react react-dom typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react tailwindcss
\`\`\`

### 3. Folder Structure
\`\`\`
src/
  components/
  services/
  hooks/
  types/
  utils/
public/
  index.html
\`\`\`

This structure provides a solid foundation for scalable development!`;
        resolve(setupGuide);
      }, 1000);
    });
  }
}