import schedule
import time
import threading
from django.core.management import call_command
import logging

logger = logging.getLogger(__name__)

class NewsScrapingScheduler:
    """
    A simple scheduler for automated news scraping
    """
    
    def __init__(self):
        self.running = False
        self.thread = None
        
    def scrape_job(self):
        """
        Job function that runs the scraping
        """
        try:
            logger.info("Starting scheduled news scraping...")
            call_command('scrape_news', '--limit=15', '--clean')
            logger.info("Scheduled news scraping completed successfully")
        except Exception as e:
            logger.error(f"Error in scheduled news scraping: {str(e)}")
    
    def start_scheduler(self):
        """
        Start the background scheduler
        """
        if self.running:
            logger.warning("Scheduler is already running")
            return
            
        # Schedule jobs
        schedule.every(2).hours.do(self.scrape_job)  # Run every 2 hours
        schedule.every().day.at("06:00").do(self.scrape_job)  # Run daily at 6 AM
        schedule.every().day.at("18:00").do(self.scrape_job)  # Run daily at 6 PM
        
        self.running = True
        self.thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.thread.start()
        logger.info("News scraping scheduler started")
    
    def stop_scheduler(self):
        """
        Stop the background scheduler
        """
        self.running = False
        schedule.clear()
        logger.info("News scraping scheduler stopped")
    
    def _run_scheduler(self):
        """
        Internal method to run the scheduler loop
        """
        while self.running:
            schedule.run_pending()
            time.sleep(60)  # Check every minute

# Global scheduler instance
news_scheduler = NewsScrapingScheduler()
