import { NewsArticle, LearningResource, ProjectTemplate } from '../types';

// Mock news data - in production, this would come from a news API
export const mockNewsArticles: NewsArticle[] = [
  {
    id: '1',
    title: 'AI-Powered Code Generation Reaches New Milestone',
    description: 'Latest advancements in AI-assisted programming tools are revolutionizing how developers write code, with new models achieving 90% accuracy in code completion.',
    url: '#',
    source: 'TechCrunch',
    publishedAt: '2025-01-09T10:30:00Z',
    category: 'AI/ML'
  },
  {
    id: '2',
    title: 'Quantum Computing Breakthrough: 1000-Qubit Processor Unveiled',
    description: 'Scientists have successfully demonstrated a 1000-qubit quantum processor, bringing us closer to practical quantum computing applications.',
    url: '#',
    source: 'MIT Technology Review',
    publishedAt: '2025-01-09T08:15:00Z',
    category: 'Quantum Computing'
  },
  {
    id: '3',
    title: 'Web3 Gaming Ecosystem Sees 300% Growth',
    description: 'Blockchain-based gaming platforms report unprecedented user growth as traditional gamers embrace NFT-integrated experiences.',
    url: '#',
    source: 'VentureBeat',
    publishedAt: '2025-01-09T06:45:00Z',
    category: 'Web3/Gaming'
  },
  {
    id: '4',
    title: 'Edge Computing Infrastructure Revolutionizes IoT',
    description: 'New edge computing frameworks enable real-time processing for IoT devices with 99.9% uptime and sub-millisecond latency.',
    url: '#',
    source: 'IEEE Spectrum',
    publishedAt: '2025-01-08T16:20:00Z',
    category: 'IoT/Edge Computing'
  },
  {
    id: '5',
    title: 'Sustainable Tech: Solar-Powered Data Centers Go Mainstream',
    description: 'Major cloud providers announce transition to 100% solar-powered data centers, reducing carbon footprint by 80%.',
    url: '#',
    source: 'Green Tech Media',
    publishedAt: '2025-01-08T14:10:00Z',
    category: 'Green Tech'
  }
];

// Mock learning resources
export const mockLearningResources: LearningResource[] = [
  {
    id: '1',
    title: 'Building AI Applications with React and OpenAI',
    description: 'Learn how to integrate OpenAI\'s API into React applications to build intelligent user interfaces.',
    type: 'tutorial',
    duration: '2 hours',
    difficulty: 'intermediate',
    url: '#',
    tags: ['React', 'AI', 'OpenAI', 'JavaScript']
  },
  {
    id: '2',
    title: 'Quantum Computing Fundamentals',
    description: 'A comprehensive introduction to quantum computing concepts and practical applications.',
    type: 'course',
    duration: '6 weeks',
    difficulty: 'beginner',
    url: '#',
    tags: ['Quantum Computing', 'Physics', 'Mathematics']
  },
  {
    id: '3',
    title: 'Web3 Development Masterclass',
    description: 'Master blockchain development with hands-on projects in Solidity and Web3.js.',
    type: 'course',
    duration: '4 weeks',
    difficulty: 'advanced',
    url: '#',
    tags: ['Blockchain', 'Solidity', 'Web3', 'Smart Contracts']
  },
  {
    id: '4',
    title: 'IoT System Architecture Design',
    description: 'Design scalable IoT systems using modern edge computing and cloud technologies.',
    type: 'video',
    duration: '45 minutes',
    difficulty: 'intermediate',
    url: '#',
    tags: ['IoT', 'Edge Computing', 'System Design', 'Cloud']
  }
];

// Mock project templates
export const mockProjectTemplates: ProjectTemplate[] = [
  {
    id: '1',
    name: 'AI Chatbot with React',
    description: 'Build an intelligent chatbot using React and OpenAI API with conversation memory.',
    technologies: ['React', 'TypeScript', 'OpenAI API', 'Tailwind CSS'],
    difficulty: 'intermediate',
    estimatedTime: '4-6 hours',
    dependencies: ['react', 'openai', 'tailwindcss', 'typescript'],
    structure: [
      'src/components/Chatbot.tsx',
      'src/services/openai.ts',
      'src/hooks/useChat.ts',
      'src/types/chat.ts'
    ],
    codeSnippet: `// Basic OpenAI integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

export const generateResponse = async (message: string) => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  return response.choices[0].message.content;
};`
  },
  {
    id: '2',
    name: 'News Aggregator Dashboard',
    description: 'Create a real-time news aggregator with multiple sources and filtering capabilities.',
    technologies: ['React', 'Node.js', 'News API', 'Chart.js'],
    difficulty: 'beginner',
    estimatedTime: '2-3 hours',
    dependencies: ['react', 'axios', 'chart.js', 'moment'],
    structure: [
      'src/components/NewsCard.tsx',
      'src/services/newsApi.ts',
      'src/hooks/useNews.ts',
      'src/components/NewsFilter.tsx'
    ]
  },
  {
    id: '3',
    name: 'Blockchain Voting System',
    description: 'Develop a decentralized voting application using Ethereum smart contracts.',
    technologies: ['Solidity', 'Web3.js', 'React', 'MetaMask'],
    difficulty: 'advanced',
    estimatedTime: '8-12 hours',
    dependencies: ['web3', 'truffle', 'react', 'metamask'],
    structure: [
      'contracts/Voting.sol',
      'src/components/VotingInterface.tsx',
      'src/services/web3.ts',
      'migrations/deploy_contracts.js'
    ]
  }
];