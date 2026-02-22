from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from scraper.models import SearchRecord

class Command(BaseCommand):
    help = 'Delete search records older than 4 days'

    def handle(self, *args, **options):
        cutoff = timezone.now() - timedelta(days=4)
        deleted, _ = SearchRecord.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(f"Deleted {deleted} expired records.")