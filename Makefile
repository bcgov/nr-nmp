.PHONY: test test-crops test-manures test-animals test-fertilizers

#BAKCEND TESTING

test:
	docker compose exec backend python manage.py test apps.crops.tests.test_models apps.manures.tests.test_models apps.animals.tests.test_models apps.fertilizers.tests.test_models

test-crops:
	docker compose exec backend python manage.py test apps.crops.tests.test_models

test-manures:
	docker compose exec backend python manage.py test apps.manures.tests.test_models

test-animals:
	docker compose exec backend python manage.py test apps.animals.tests.test_models

test-fertilizers:
	docker compose exec backend python manage.py test apps.fertilizers.tests.test_models

#BACKEND LINTING

lint:
	docker compose exec backend sh -c "cd /app && python -m flake8 && python -m pylint --recursive=y --django-settings-module=config.settings apps"

lint-flake8:
	docker compose exec backend sh -c "cd /app && python -m flake8"

lint-pylint:
	docker compose exec backend sh -c "cd /app && python -m pylint --recursive=y --django-settings-module=config.settings apps"

lint-check:
	@echo "Checking if services are running..."
	@if [ "$$(docker compose ps | grep backend | grep -c Up)" -eq 0 ]; then \
		echo "Backend service is not running. Starting services..."; \
		docker compose up -d; \
	fi
	@echo "Running linting checks..."
	@docker compose exec backend sh -c "cd /app && python -m flake8" && \
	docker compose exec backend sh -c "cd /app && python -m pylint --recursive=y --django-settings-module=config.settings apps"

# Run linting with detailed reports
lint-verbose:
	docker compose exec backend sh -c "cd /app && python -m flake8 --statistics && python -m pylint --recursive=y --django-settings-module=config.settings --reports=y apps"

# Fix some flake8 issues automatically (with autoflake if installed)
lint-fix:
	docker compose exec backend sh -c "cd /app && pip install autoflake && autoflake --in-place --remove-unused-variables --remove-all-unused-imports --recursive apps"

# Fix all flake8 issues automatically
lint-fix-all:
	docker compose exec backend sh -c "cd /app && \
		autoflake --in-place --remove-unused-variables --remove-all-unused-imports --recursive apps && \
		autopep8 --in-place --aggressive --aggressive --recursive apps && \
		isort apps"
