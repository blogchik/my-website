#!/bin/bash
# scripts/init-letsencrypt.sh
#
# Run ONCE on a fresh VPS to obtain the first Let's Encrypt certificate.
# After this, the certbot service in docker-compose.prod.yml handles renewals
# automatically every 12 hours.
#
# Prerequisites:
#   - DNS A records for api.DOMAIN and admin.DOMAIN pointing to this VPS
#   - Ports 80 and 443 open in the VPS firewall
#   - Docker and docker compose installed
#   - .env.prod exists at repo root with DOMAIN= and CERTBOT_EMAIL= set
#   - nginx/conf.d/app.conf updated with your actual domain
#
# Usage (from repo root):
#   chmod +x scripts/init-letsencrypt.sh
#   ./scripts/init-letsencrypt.sh
#   # or: make ssl-init

set -euo pipefail

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

# ── Load DOMAIN and CERTBOT_EMAIL from .env.prod ────────────────────────────
if [ ! -f ".env.prod" ]; then
    echo "ERROR: .env.prod not found. Run this script from the repo root."
    exit 1
fi

DOMAIN=$(grep -E '^DOMAIN=' .env.prod | cut -d '=' -f2- | tr -d '"' | tr -d "'")
EMAIL=$(grep -E '^CERTBOT_EMAIL=' .env.prod | cut -d '=' -f2- | tr -d '"' | tr -d "'")

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "ERROR: DOMAIN and CERTBOT_EMAIL must be set in .env.prod"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Let's Encrypt — First Certificate Setup"
echo "  Domain : $DOMAIN"
echo "  Email  : $EMAIL"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Build images ────────────────────────────────────────────────────────────
echo ">> Building production images..."
$COMPOSE build backend admin

# ── Start nginx (needed to serve the ACME HTTP challenge on port 80) ────────
# nginx will log an error about missing SSL cert for the HTTPS block,
# but the HTTP block still starts and handles the ACME challenge correctly.
echo ""
echo ">> Starting nginx (HTTP only for ACME challenge)..."
$COMPOSE up -d nginx

echo ">> Waiting for nginx to be ready..."
sleep 5

# ── Obtain the certificate via webroot challenge ─────────────────────────────
echo ""
echo ">> Requesting certificate from Let's Encrypt..."
$COMPOSE run --rm --no-deps certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "api.$DOMAIN" \
    -d "admin.$DOMAIN"

echo ""
echo ">> Certificate obtained! Reloading nginx with full HTTPS config..."
$COMPOSE exec nginx nginx -s reload

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  SSL setup complete!"
echo ""
echo "  Run the following to start all production services:"
echo ""
echo "    make prod"
echo ""
echo "  Or: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
