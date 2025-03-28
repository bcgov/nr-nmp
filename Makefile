.PHONY: test test-crops test-manures test-animals test-fertilizers

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