from django.contrib import admin
from .models import NewsArticle

@admin.register(NewsArticle)
class NewsArticleAdmin(admin.ModelAdmin):
    list_display = ('short_title', 'source', 'published_date', 'scraped_date', 'is_active')
    list_filter = ('source', 'is_active', 'published_date', 'scraped_date')
    search_fields = ('title', 'summary')
    readonly_fields = ('scraped_date',)
    date_hierarchy = 'published_date'
    
    def short_title(self, obj):
        return obj.short_title
    short_title.short_description = 'Title'
    
    actions = ['mark_as_active', 'mark_as_inactive']
    
    def mark_as_active(self, request, queryset):
        queryset.update(is_active=True)
        self.message_user(request, f'{queryset.count()} articles marked as active.')
    mark_as_active.short_description = "Mark selected articles as active"
    
    def mark_as_inactive(self, request, queryset):
        queryset.update(is_active=False)
        self.message_user(request, f'{queryset.count()} articles marked as inactive.')
    mark_as_inactive.short_description = "Mark selected articles as inactive"
