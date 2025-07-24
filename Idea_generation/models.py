from django.db import models
from django.utils import timezone

class NewsArticle(models.Model):
    title = models.CharField(max_length=500)
    summary = models.TextField(blank=True)
    url = models.URLField(unique=True)
    source = models.CharField(max_length=100)
    published_date = models.DateTimeField(null=True, blank=True)
    scraped_date = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    image_url = models.URLField(blank=True, null=True)
    content = models.TextField(blank=True)  # Full article content for detail view
    keywords = models.JSONField(blank=True, null=True)  # Store extracted keywords for personalization
    
    class Meta:
        ordering = ['-published_date', '-scraped_date']
        
    def __str__(self):
        return self.title
    
    @property
    def short_title(self):
        return self.title[:100] + "..." if len(self.title) > 100 else self.title
