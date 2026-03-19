from datetime import timedelta
import re

from django.core.management.base import BaseCommand
from django.db.models import Count
from django.utils import timezone

from api.models import Puzzle

TEST_KEYWORDS = [
    "test",
    "sample",
    "demo",
    "seed",
    "audit",
    "verify",
    "runtime",
    "qa",
    "example",
    "practice",
]


class Command(BaseCommand):
    help = "Cleanup seed/test puzzles while preserving published puzzles with real clues."

    def add_arguments(self, parser):
        parser.add_argument(
            "--days",
            type=int,
            default=7,
            help="Delete test puzzles older than this many days (default: 7).",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without removing records.",
        )

    def handle(self, *args, **options):
        days = options["days"]
        dry_run = options["dry_run"]
        threshold = timezone.now() - timedelta(days=days)

        keyword_pattern = "|".join(re.escape(k) for k in TEST_KEYWORDS)

        puzzles = Puzzle.objects.annotate(clue_count=Count("clues"))

        zero_clues = puzzles.filter(clue_count=0)

        archived_test = puzzles.filter(status="archived", title__iregex=keyword_pattern)

        old_test = puzzles.filter(title__iregex=keyword_pattern, created_at__lt=threshold).exclude(
            status="published"
        )

        # Never delete published puzzles that have real clues.
        published_with_clues = puzzles.filter(status="published", clue_count__gt=0)

        delete_ids = set(zero_clues.values_list("id", flat=True))
        delete_ids.update(archived_test.values_list("id", flat=True))
        delete_ids.update(old_test.values_list("id", flat=True))
        delete_ids.difference_update(published_with_clues.values_list("id", flat=True))

        delete_qs = Puzzle.objects.filter(id__in=delete_ids)

        self.stdout.write("Cleanup summary:")
        self.stdout.write(f"- zero clues: {zero_clues.count()}")
        self.stdout.write(f"- archived test: {archived_test.count()}")
        self.stdout.write(f"- old test (>{days} days): {old_test.count()}")
        self.stdout.write(f"- protected published with clues: {published_with_clues.count()}")
        self.stdout.write(f"- total to delete: {delete_qs.count()}")

        if dry_run:
            self.stdout.write("Dry run: no puzzles deleted.")
            return

        deleted_count, _ = delete_qs.delete()
        self.stdout.write(self.style.SUCCESS(f"Deleted {deleted_count} puzzle records."))
