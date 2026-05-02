APP_NAME=DnD-CombatPlus
APP_URL=http://localhost:8080
HEALTH_URL=$(APP_URL)/health

.PHONY: run stop restart logs build test debug help

run:
	@echo "Starting $(APP_NAME) in the background..."
	docker compose up -d --build
	@echo "App started in background."
	@echo "Logs: make logs"

debug:
	@echo "Starting $(APP_NAME) in DEBUG mode (Hot Reload)..."
	docker compose -f docker-compose.debug.yml up

stop:
	@echo "Stopping $(APP_NAME)..."
	docker compose down

restart:
	@echo "Restarting $(APP_NAME)..."
	docker compose restart

logs:
	@echo "Showing live logs. Press Ctrl+C to exit."
	docker compose logs -f

build:
	@echo "Building Docker images..."
	docker compose build

test:
	@echo "Running tests in Docker..."
	docker compose up -d --build
	@echo "Waiting for backend to be healthy..."
	@docker compose ps backend | grep -q "(healthy)" || (echo "Waiting..." && sleep 5)
	@curl -f $(HEALTH_URL) || (echo "Health check failed" && docker compose down && exit 1)
	@echo "App is healthy."
	@docker compose down

help:
	@echo "Available commands:"
	@echo "  make run      - Build and start all services in the background"
	@echo "  make debug    - Start all services in DEBUG mode (Hot Reload enabled)"
	@echo "  make stop     - Stop and remove all containers"
	@echo "  make restart  - Restart all containers"
	@echo "  make logs     - Show live logs from all services"
	@echo "  make build    - Build Docker images"
	@echo "  make test     - Start services, check health, and stop"