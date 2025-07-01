import { useState, useEffect } from 'react';
import { Clock, ExternalLink, Tag, RefreshCw, Wifi, WifiOff, Filter, TrendingUp, Calendar, Star } from 'lucide-react';
import { NewsArticle } from '../types';
import { NewsScraperService } from '../services/apiService';

interface NewsTabProps {
  searchQuery: string;
}

const NewsTab: React.FC<NewsTabProps> = ({ searchQuery }) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFilter, setSelectedFilter] = useState<string>('recent');
  const [categories, setCategories] = useState<string[]>(['all']);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const filters = [
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'popular', label: 'Popular', icon: Star },
    { id: 'today', label: 'Today', icon: Calendar },
  ];

  useEffect(() => {
    fetchNews();
    fetchCategories();
    checkBackendHealth();
    
    const interval = setInterval(() => {
      fetchNews(false);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [selectedCategory]);

  const checkBackendHealth = async () => {
    const healthy = await NewsScraperService.checkHealth();
    setIsOnline(healthy);
  };

  const fetchNews = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    
    try {
      const newsData = await NewsScraperService.fetchLatestNews(selectedCategory, 50);
      setArticles(newsData);
      setLastUpdated(new Date());
      setIsOnline(true);
    } catch (error) {
      console.error('Error fetching news:', error);
      setIsOnline(false);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoryData = await NewsScraperService.fetchCategories();
      setCategories(['all', ...categoryData]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const success = await NewsScraperService.refreshNews();
      if (success) {
        await fetchNews(false);
      }
    } catch (error) {
      console.error('Error refreshing news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const getThumbnailGradient = (title: string) => {
    const gradients = [
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-green-400 to-green-600',
      'from-red-400 to-red-600',
      'from-yellow-400 to-yellow-600',
      'from-pink-400 to-pink-600',
      'from-indigo-400 to-indigo-600',
      'from-teal-400 to-teal-600'
    ];
    
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  // Filter articles based on search query and selected filter
  const filteredArticles = articles.filter(article => {
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  }).sort((a, b) => {
    switch (selectedFilter) {
      case 'recent':
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      case 'trending':
        return Math.random() - 0.5; // Random for demo
      case 'popular':
        return a.title.length - b.title.length; // Longer titles as "popular" for demo
      case 'today':
        const today = new Date().toDateString();
        const aIsToday = new Date(a.publishedAt).toDateString() === today;
        const bIsToday = new Date(b.publishedAt).toDateString() === today;
        if (aIsToday && !bIsToday) return -1;
        if (!aIsToday && bIsToday) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
        <p className="text-gray-600">Loading latest tech news...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Section Header */}
      <div className="flex-shrink-0 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">Latest</h2>
            <p className="text-gray-600 max-w-2xl leading-relaxed">
              Welcome to the latest section of our news, where we explore the latest trends and topics in technology, 
              AI, blockchain, and more. From groundbreaking innovations and emerging technologies to up-and-coming 
              startups and industry events, we aim to provide you with a diverse range of stories that showcase 
              the richness and diversity of our world's technological landscape.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi size={20} className="text-green-500" />
            ) : (
              <WifiOff size={20} className="text-red-500" />
            )}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300 ${
                refreshing ? 'animate-spin' : ''
              }`}
              title="Refresh news"
            >
              <RefreshCw size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-6 mb-6">
          {/* Time Filters */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <div className="flex gap-2">
              {filters.map((filter) => {
                const Icon = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setSelectedFilter(filter.id)}
                    className={`
                      flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                      ${selectedFilter === filter.id
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    <Icon size={14} />
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2">
            {categories.slice(0, 6).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                {category === 'all' ? 'All' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Status Banner */}
        {!isOnline && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">
              ⚠️ Backend service unavailable. Showing cached data.
            </p>
          </div>
        )}
      </div>

      {/* News Grid */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchQuery ? `No articles found for "${searchQuery}"` : 'No news articles available'}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {isOnline ? 'Try adjusting your search or filters' : 'Backend service is currently unavailable'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredArticles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group cursor-pointer transform transition-all duration-300 hover:scale-105 block"
              >
                {/* Article Thumbnail */}
                <div className={`aspect-video bg-gradient-to-br ${getThumbnailGradient(article.title)} rounded-lg mb-4 overflow-hidden relative`}>
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="text-center text-white">
                      <Tag size={32} className="mx-auto mb-2 opacity-80" />
                      <span className="text-xs font-bold uppercase tracking-wide opacity-90">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3">
                    <ExternalLink size={16} className="text-white/70" />
                  </div>
                </div>

                {/* Article Content */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-500 text-xs font-bold uppercase tracking-wide">
                      {article.category}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 leading-tight group-hover:text-red-600 transition-colors duration-300 line-clamp-2">
                    {article.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {article.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                    <span className="font-medium">{article.source}</span>
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{formatTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsTab;