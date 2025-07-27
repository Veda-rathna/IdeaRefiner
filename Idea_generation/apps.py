from django.apps import AppConfig
from django.conf import settings


class IdeaGenerationConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Idea_generation'

    def ready(self):
        """Register background tasks when the app is ready"""
        if settings.DEBUG:  # Only schedule in debug mode to avoid duplicate tasks
            try:
                from .services.news_scraper import scheduled_news_scraping
                # Clear existing tasks first
                from background_task.models import Task
                Task.objects.all().delete()
                # Schedule new task
                scheduled_news_scraping(repeat=10800, verbose_name='news_scraping')
            except Exception as e:
                print(f"Error scheduling background task: {e}")
