PROD_COMPOSE := docker compose -f docker-compose.yml -f docker-compose.prod.yml

.PHONY: dev dev-build dev-down dev-logs \
        prod prod-build prod-down prod-logs prod-restart \
        ssl-init ssl-renew \
        help

# ── Development ─────────────────────────────────────────────────────────────

dev:           ## Start dev environment (hot reload on :3000)
	docker compose up

dev-build:     ## Rebuild dev image and start
	docker compose up --build

dev-down:      ## Stop dev environment
	docker compose down

dev-logs:      ## Tail dev logs
	docker compose logs -f

# ── Production ──────────────────────────────────────────────────────────────

prod:          ## Start production environment (detached)
	$(PROD_COMPOSE) up -d

prod-build:    ## Rebuild prod images and start (detached)
	$(PROD_COMPOSE) up -d --build

prod-down:     ## Stop production environment
	$(PROD_COMPOSE) down

prod-logs:     ## Tail production logs
	$(PROD_COMPOSE) logs -f

prod-restart:  ## Restart a single service: make prod-restart s=frontend
	$(PROD_COMPOSE) restart $(s)

# ── SSL ─────────────────────────────────────────────────────────────────────

ssl-init:      ## Obtain first Let's Encrypt certificate (run once on new VPS)
	chmod +x scripts/init-letsencrypt.sh
	./scripts/init-letsencrypt.sh

ssl-renew:     ## Force immediate certificate renewal (normally automatic)
	$(PROD_COMPOSE) exec certbot certbot renew --force-renewal

# ── Help ────────────────────────────────────────────────────────────────────

help:          ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'
