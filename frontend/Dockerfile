# ─── Build stage ───────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars are inlined at build time. The browser (not the
# container) calls the backend, so this points at the host-published port.
ARG NEXT_PUBLIC_API_URL=http://localhost:8000/api/
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ─── Runtime stage ─────────────────────────────────────────
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000

# Copy the self-contained standalone server + static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node
EXPOSE 3000

CMD ["node", "server.js"]
