PROD_COMPOSE := docker compose -f docker-compose.yml -f docker-compose.prod.yml

.PHONY: dev dev-build dev-down dev-logs \
        prod prod-build prod-down prod-logs prod-restart \
        ssl-init ssl-renew \
        db-migrate db-revision db-shell frontend-logs backend-logs \
        help

# ── Development ─────────────────────────────────────────────────────────────

dev:           ## Start dev environment
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

prod-restart:  ## Restart a single service: make prod-restart s=backend
	$(PROD_COMPOSE) restart $(s)

# ── SSL ─────────────────────────────────────────────────────────────────────

ssl-init:      ## Obtain first Let's Encrypt certificate (run once on new VPS)
	chmod +x scripts/init-letsencrypt.sh
	./scripts/init-letsencrypt.sh

ssl-renew:     ## Force immediate certificate renewal (normally automatic)
	$(PROD_COMPOSE) exec certbot certbot renew --force-renewal

# ── Database / Backend ──────────────────────────────────────────────────────

db-migrate:    ## Run all pending Alembic migrations
	docker compose exec backend uv run alembic upgrade head

db-revision:   ## Create new migration: make db-revision m="add users table"
	docker compose exec backend uv run alembic revision --autogenerate -m "$(m)"

db-shell:      ## Open PostgreSQL shell
	docker compose exec db psql -U dev -d mywebsite

frontend-logs: ## Tail frontend logs
	docker compose logs -f frontend

backend-logs:  ## Tail backend logs
	docker compose logs -f backend

# ── Help ────────────────────────────────────────────────────────────────────

help:          ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-18s\033[0m %s\n", $$1, $$2}'
