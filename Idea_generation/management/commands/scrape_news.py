from django.core.management.base import BaseCommand
from Idea_generation.services.news_scraper import TechNewsScraper

class Command(BaseCommand):
    help = 'Scrape tech news from various sources'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--limit',
            type=int,
            default=10,
            help='Number of articles to scrape per source (default: 10)'
        )
        parser.add_argument(
            '--source',
            type=str,
            help='Specific source to scrape (techcrunch, hackernews, dev_to, verge)'
        )
        parser.add_argument(
            '--clean',
            action='store_true',
            help='Clean old articles before scraping'
        )
    
    def handle(self, *args, **options):
        scraper = TechNewsScraper()
        
        # Clean old articles if requested
        if options['clean']:
            deleted_count = scraper.clean_old_articles()
            self.stdout.write(
                self.style.SUCCESS(f'Deleted {deleted_count} old articles')
            )
        
        # Scrape news
        if options['source']:
            # Scrape specific source
            source_config = scraper.sources.get(options['source'])
            if not source_config:
                self.stdout.write(
                    self.style.ERROR(f'Unknown source: {options["source"]}')
                )
                return
                
            articles_count = scraper.scrape_rss_feed(
                source_config['rss_url'],
                source_config['name'],
                limit=options['limit']
            )
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully scraped {articles_count} articles from {source_config["name"]}'
                )
            )
        else:
            # Scrape all sources
            total_articles = scraper.scrape_all_sources(limit_per_source=options['limit'])
            self.stdout.write(
                self.style.SUCCESS(
                    f'Successfully scraped {total_articles} total articles from all sources'
                )
            )
