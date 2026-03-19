from django.contrib import admin
from .models import Puzzle, Clue, Attempt

class ClueInline(admin.TabularInline):
    model = Clue
    extra = 1

class PuzzleAdmin(admin.ModelAdmin):
    inlines = [ClueInline]

admin.site.register(Puzzle, PuzzleAdmin)
admin.site.register(Attempt)