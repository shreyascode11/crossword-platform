#!/bin/sh
set -e

# Apply database migrations (the DB service is already healthy via compose depends_on)
python manage.py migrate --noinput

# Shared cache table for login throttling (idempotent)
python manage.py createcachetable

# Collect static files for the Django admin (served by WhiteNoise)
python manage.py collectstatic --noinput

# Launch the production WSGI server
exec gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 3
