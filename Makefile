APP_NAME=DnDCombatPlus
APP_URL=http://localhost:8080
HEALTH_URL=$(APP_URL)/health
PID_FILE=.app.pid
LOG_FILE=app.log

.PHONY: run start stop restart logs test test-health test-home wait help

run:
	@echo "Starting $(APP_NAME) in the foreground..."
	go run ./cmd/web

start:
	@echo "Starting $(APP_NAME) in the background..."
	@rm -f $(LOG_FILE)
	@go run ./cmd/web > $(LOG_FILE) 2>&1 & echo $$! > $(PID_FILE)
	@echo "App started with PID $$(cat $(PID_FILE))"
	@echo "Logs: make logs"

stop:
	@if [ -f $(PID_FILE) ]; then \
		echo "Stopping $(APP_NAME)..."; \
		kill $$(cat $(PID_FILE)) 2>/dev/null || true; \
		rm -f $(PID_FILE); \
	else \
		echo "No PID file found. App may not be running from make start."; \
	fi

restart: stop start

logs:
	@if [ -f $(LOG_FILE) ]; then \
		echo "Showing live logs from $(LOG_FILE). Press Ctrl+C to exit."; \
		tail -f $(LOG_FILE); \
	else \
		echo "No log file found. Run 'make start' first."; \
	fi

wait:
	@echo "Waiting for app to respond..."
	@for i in 1 2 3 4 5; do \
		if curl -fs $(HEALTH_URL) > /dev/null; then \
			echo "App is ready."; \
			exit 0; \
		fi; \
		echo "Attempt $$i failed. Retrying..."; \
		sleep 1; \
	done; \
	echo "App did not respond in time."; \
	echo "Check logs with: make logs"; \
	exit 1

test-health:
	@echo "Testing health endpoint..."
	@curl -i $(HEALTH_URL)

test-home:
	@echo "Testing home endpoint..."
	@curl -i $(APP_URL)

test:
	@echo "Running Go tests..."
	go test ./...
	@$(MAKE) start
	@$(MAKE) wait
	@echo "Testing app health with curl..."
	@curl -f $(HEALTH_URL)
	@echo "\nApp is running correctly."
	@$(MAKE) stop

help:
	@echo "Available commands:"
	@echo "  make run          - Run the Go app in the foreground"
	@echo "  make start        - Run the Go app in the background"
	@echo "  make stop         - Stop the background app"
	@echo "  make restart      - Restart the background app"
	@echo "  make logs         - Show live app logs"
	@echo "  make test-health  - Test /health with curl"
	@echo "  make test-home    - Test / with curl"
	@echo "  make test         - Run tests, start app, curl health, stop app"
	@echo "  make wait         - Wait until the app responds"