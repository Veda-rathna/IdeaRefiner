// Type definitions for the Idea Generator app

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'tutorial';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  url: string;
  tags: string[];
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  codeSnippet?: string;
  dependencies: string[];
  structure: string[];
}