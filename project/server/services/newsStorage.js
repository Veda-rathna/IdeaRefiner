export class NewsStorage {
  constructor() {
    this.articles = new Map();
    this.categories = new Set();
  }

  async addArticle(article) {
    // Avoid duplicates by checking title similarity
    const existingArticle = Array.from(this.articles.values())
      .find(existing => this.isSimilar(existing.title, article.title));
    
    if (!existingArticle) {
      this.articles.set(article.id, {
        ...article,
        createdAt: new Date().toISOString()
      });
      this.categories.add(article.category);
      
      // Keep only the latest 100 articles to prevent memory issues
      if (this.articles.size > 100) {
        const oldestKey = Array.from(this.articles.keys())[0];
        this.articles.delete(oldestKey);
      }
    }
  }

  async getNews(category = null, limit = 20) {
    let articles = Array.from(this.articles.values());
    
    if (category && category !== 'all') {
      articles = articles.filter(article => 
        article.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Sort by published date (newest first)
    articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    
    return articles.slice(0, limit);
  }

  async getCategories() {
    return Array.from(this.categories);
  }

  async getArticleCount() {
    return this.articles.size;
  }

  isSimilar(title1, title2) {
    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const norm1 = normalize(title1);
    const norm2 = normalize(title2);
    
    // Check if titles are very similar (80% match)
    const similarity = this.calculateSimilarity(norm1, norm2);
    return similarity > 0.8;
  }

  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}