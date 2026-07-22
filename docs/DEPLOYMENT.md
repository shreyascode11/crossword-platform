# Deployment Guide

How to run CrossWord Platform on a real server rather than a local machine.

---

## 1 · Prerequisites

- A server with Docker and Docker Compose installed
- A hostname or static IP for the server
- A Groq API key from [console.groq.com](https://console.groq.com)

---

## 2 · Clone and configure

```bash
git clone https://github.com/shreyascode11/crossword-platform.git
cd crossword-platform
cp .env.example .env
```

Edit `.env`. At minimum, change these from their defaults:

```ini
# Secrets
POSTGRES_PASSWORD=<a long random password>
DJANGO_SECRET_KEY=<see command below>
GROQ_API_KEY=<your Groq key>

# Point these at the server, not localhost
NEXT_PUBLIC_API_URL=https://crossword.example.edu/api/
ALLOWED_HOSTS=crossword.example.edu
CORS_ALLOWED_ORIGINS=https://crossword.example.edu
CSRF_TRUSTED_ORIGINS=https://crossword.example.edu
```

Generate a secret key:

```bash
python -c "import secrets; print(secrets.token_hex(50))"
```

> The application refuses to start with `DJANGO_DEBUG=False` unless
> `DJANGO_SECRET_KEY` is set to a unique value of 32+ characters. This is
> deliberate — it prevents shipping the development key to production.

---

## 3 · The API URL is baked in at build time

`NEXT_PUBLIC_API_URL` is compiled into the JavaScript bundle, so it must be the
URL **a student's browser** can reach — not an internal Docker service name.

After changing it, the frontend image must be rebuilt:

```bash
docker compose up -d --build frontend
```

Changing it in `.env` and only restarting will have no effect.

---

## 4 · Start the stack

```bash
docker compose up --build -d
docker compose ps          # all three services should be running, db healthy
```

On first start the backend automatically applies database migrations, creates
the cache table used for login throttling, and collects static files.

Create the first administrator:

```bash
docker compose exec backend python manage.py createsuperuser
```

That account signs in through the **Admin** tab, and is used to create teacher
accounts. Each teacher then imports their own students from CSV.

---

## 5 · Enable HTTPS

Once TLS is terminated in front of the application (nginx, Caddy, or a load
balancer), turn on the security features:

```ini
DJANGO_SECURE=True
```

```bash
docker compose up -d backend
```

This enables the HTTPS redirect, HSTS, and secure session/CSRF cookies.

> Leave `DJANGO_SECURE=False` while the site is still served over plain HTTP.
> Enabling it without TLS causes a redirect loop and locks you out.

The application honours `X-Forwarded-Proto`, so it correctly detects HTTPS when
running behind a reverse proxy.

---

## 6 · Post-deployment checks

| Check | Expected |
|---|---|
| `docker compose ps` | three services up, `db` healthy |
| `docker compose logs backend` | migrations applied, gunicorn listening |
| Visit the site | login page loads |
| Sign in as admin | dashboard loads, no console errors |
| Browser dev tools → Network | API calls go to your public URL, not `localhost` |

---

## Operations

**Update to the latest code**

```bash
git pull
docker compose up -d --build
```

**Back up the database**

```bash
docker compose exec db pg_dump -U postgres crossword > backup-$(date +%F).sql
```

**Restore**

```bash
cat backup.sql | docker compose exec -T db psql -U postgres crossword
```

**View logs**

```bash
docker compose logs -f backend
```

**Stop**

```bash
docker compose down        # keeps data
docker compose down -v     # also deletes the database volume
```

---

## Tuning

| Variable | Default | Notes |
|---|---|---|
| `AUTH_TOKEN_TTL_HOURS` | `12` | Lower for shorter sessions; users re-authenticate after this |
| `LOGIN_MAX_ATTEMPTS` | `8` | Failed logins per user + IP before a temporary lockout |
| `LOGIN_LOCKOUT_SECONDS` | `900` | How long the lockout lasts |
| `GROQ_API_KEY_2`, `GROQ_API_KEY_3` | — | Extra keys for AI generation; requests rotate across the pool and fail over when one is rate-limited. Recommended for institution-wide load |

---

## Troubleshooting

**Frontend loads but every request fails**
`NEXT_PUBLIC_API_URL` is wrong, or the frontend was not rebuilt after changing
it. Check the Network tab — requests pointing at `localhost` on a remote server
confirm this. Fix the value and run `docker compose up -d --build frontend`.

**`DisallowedHost` errors in the backend logs**
Add the server's hostname to `ALLOWED_HOSTS`.

**CORS errors in the browser console**
`CORS_ALLOWED_ORIGINS` must contain the frontend's public origin, including the
scheme (`https://`).

**Backend exits immediately on start**
Usually a weak or missing `DJANGO_SECRET_KEY` while `DJANGO_DEBUG=False`. The
log line states this explicitly.

**Redirect loop after enabling `DJANGO_SECURE`**
TLS is not actually terminating in front of the app, or the proxy is not
forwarding `X-Forwarded-Proto`. Set `DJANGO_SECURE=False` to recover.
