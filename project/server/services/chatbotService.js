import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class ChatbotService {
  constructor() {
    // Free API configurations
    this.groqApiKey = process.env.GROQ_API_KEY;
    this.cohereApiKey = process.env.COHERE_API_KEY;
    this.huggingFaceApiKey = process.env.HUGGING_FACE_API_KEY;
    
    // API endpoints
    this.groqEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    this.cohereEndpoint = 'https://api.cohere.ai/v1/generate';
    this.huggingFaceEndpoint = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
  }

  async generateResponse(message, newsContext = '') {
    const providers = [
      { name: 'Groq', method: this.callGroqAPI.bind(this) },
      { name: 'Cohere', method: this.callCohereAPI.bind(this) },
      { name: 'HuggingFace', method: this.callHuggingFaceAPI.bind(this) }
    ];

    // Try each provider in order
    for (const provider of providers) {
      try {
        console.log(`🤖 Trying ${provider.name} API...`);
        const response = await provider.method(message, newsContext);
        if (response) {
          console.log(`✅ ${provider.name} API successful`);
          return response;
        }
      } catch (error) {
        console.log(`❌ ${provider.name} API failed:`, error.message);
        continue;
      }
    }

    // Fallback to local response
    return this.generateFallbackResponse(message, newsContext);
  }

  async callGroqAPI(message, newsContext) {
    if (!this.groqApiKey) {
      throw new Error('Groq API key not configured');
    }

    const systemPrompt = `You are an AI assistant for a tech news and project idea generator app. 
    ${newsContext ? `Recent tech news context: ${newsContext}` : ''}
    
    Help users with:
    - Generating project ideas based on tech trends
    - Providing code examples and implementation guidance
    - Explaining project setup and dependencies
    - Answering questions about technology and programming
    
    Keep responses concise, practical, and focused on actionable advice.`;

    const response = await axios.post(
      this.groqEndpoint,
      {
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${this.groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.choices[0].message.content;
  }

  async callCohereAPI(message, newsContext) {
    if (!this.cohereApiKey) {
      throw new Error('Cohere API key not configured');
    }

    const prompt = `You are an AI assistant for a tech news and project idea generator app.
    ${newsContext ? `Recent tech news: ${newsContext}` : ''}
    
    User question: ${message}
    
    Provide a helpful, concise response focused on tech projects and programming:`;

    const response = await axios.post(
      this.cohereEndpoint,
      {
        model: 'command-light',
        prompt: prompt,
        max_tokens: 400,
        temperature: 0.7,
        stop_sequences: ['\n\n']
      },
      {
        headers: {
          'Authorization': `Bearer ${this.cohereApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    return response.data.generations[0].text.trim();
  }

  async callHuggingFaceAPI(message, newsContext) {
    if (!this.huggingFaceApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await axios.post(
      this.huggingFaceEndpoint,
      {
        inputs: message,
        parameters: {
          max_length: 200,
          temperature: 0.7,
          do_sample: true
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    return response.data[0].generated_text;
  }

  generateFallbackResponse(message, newsContext) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('project') || lowerMessage.includes('idea') || lowerMessage.includes('build')) {
      return `🚀 **Project Idea Based on Current Tech Trends**

Based on the latest technology developments, here's a project suggestion:

**AI-Powered News Analyzer**
- Build a React app that analyzes tech news sentiment
- Use free APIs to categorize and summarize articles
- Add real-time notifications for trending topics
- Include data visualization with Chart.js

**Tech Stack:**
- Frontend: React + TypeScript + Tailwind CSS
- Backend: Node.js + Express
- APIs: Free news APIs + sentiment analysis
- Database: Local storage or free MongoDB Atlas

**Getting Started:**
\`\`\`bash
npx create-react-app news-analyzer --template typescript
npm install axios chart.js lucide-react
\`\`\`

Would you like specific implementation details for any part?`;
    }

    if (lowerMessage.includes('code') || lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return `💻 **Code Help & Implementation Guide**

I can help you with:

**React Components:**
\`\`\`jsx
const NewsCard = ({ article }) => (
  <div className="p-4 border rounded-lg hover:shadow-lg">
    <h3 className="font-bold">{article.title}</h3>
    <p className="text-gray-600">{article.description}</p>
  </div>
);
\`\`\`

**API Integration:**
\`\`\`javascript
const fetchNews = async () => {
  const response = await fetch('/api/news');
  const data = await response.json();
  return data;
};
\`\`\`

**Common Setup Commands:**
\`\`\`bash
npm install react axios tailwindcss
npm run dev
\`\`\`

What specific code example would you like to see?`;
    }

    if (lowerMessage.includes('setup') || lowerMessage.includes('install') || lowerMessage.includes('start')) {
      return `🛠️ **Project Setup Guide**

**Quick Start for React + Node.js Project:**

1. **Create Project Structure:**
\`\`\`bash
mkdir my-tech-project
cd my-tech-project
npm init -y
\`\`\`

2. **Install Dependencies:**
\`\`\`bash
# Frontend
npm install react react-dom vite @vitejs/plugin-react
npm install tailwindcss lucide-react axios

# Backend
npm install express cors dotenv
npm install -D nodemon concurrently
\`\`\`

3. **Project Structure:**
\`\`\`
src/
  components/
  services/
  hooks/
server/
  routes/
  services/
public/
\`\`\`

4. **Start Development:**
\`\`\`bash
npm run dev
\`\`\`

Need help with a specific framework or technology?`;
    }

    // Default response
    return `👋 **AI Assistant Ready to Help!**

I can assist you with:

🚀 **Project Ideas** - Generate ideas based on current tech trends
💻 **Code Examples** - React, Node.js, API integration snippets  
🛠️ **Setup Guides** - Project structure and dependency management
📰 **Tech Insights** - Discuss current technology developments
🔧 **Troubleshooting** - Debug common development issues

**Popular Topics:**
- React + TypeScript projects
- API integration and data fetching
- Modern CSS with Tailwind
- Node.js backend development
- Free deployment options

What would you like to explore? Just ask about any tech topic or project idea!`;
  }

  async getNewsContext() {
    try {
      // This would fetch recent news from your news service
      // For now, return a simple context
      return "Recent tech trends include AI integration, Web3 development, and sustainable technology solutions.";
    } catch (error) {
      console.error('Error fetching news context:', error);
      return '';
    }
  }
}