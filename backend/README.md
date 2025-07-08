# How to Debug

The backend can be easily debugged in VSCode with the following:

1. Ensure you have the Python and Python Debugger extensions installed in VSCode.
2. Add `breakpoint()` into the code wherever you'd like the debugger to pause.
3. In one terminal tab, run `docker compose up database`.
4. In a new terminal tab, run `docker compose -d up backend`. This will compose the backend in the background.
5. In the same terminal tab, run `docker attach {container id}`. You can find the container id in Docker Desktop. This command attaches stdin, stdout, and stderr to this terminal.
6. In VSCode, go to the "Run and Debug" tab. In the top bar, click the green triangle next to "Attach (remote debug)".
7. If debugging the API, run `docker compose up frontend` in a new terminal tab. Otherwise proceed to step 8.
8. Open the localhost website and initiate whatever flow you're debugging. The website should pause at the breakpoint, and in the attached terminal tab you'll see the Pdb (Python debugger) interface.
9. Debug away! (Pdb command guide at: https://docs.python.org/3/library/pdb.html#debugger-commands)

Note that this method of debugging relies on the `stdin_open` and `tty` being set to true in the docker-compose file.

# Database Migrations and Data Seeding

## Overview

This project uses Django migrations for database schema changes and JSON fixtures for data seeding. Data is converted from CSV files to JSON fixtures and loaded into PostgreSQL.

## Creating New Migrations

### 1. Create/Update Django Model
Add or modify models in the appropriate app (e.g., `apps/crops/models.py`).

### 2. Generate Migration
```bash
docker compose exec backend python manage.py makemigrations
```

### 3. Apply Migration
```bash
docker compose exec backend python manage.py migrate
```

## Data Seeding Process

## 1. CSV to JSON Conversion

**Note**: You may need to remove the `staticVersionID` column from the original CSV files, either with SQL or manually, before conversion.

If you have new CSV data, convert it to JSON fixtures:

```bash
# Run on your local machine (not in container)
cd backend/scripts
python3 convert_csv_to_fixtures.py
```

This script:
- Reads CSV files from `database/db/trimmed_tables/`
- Converts them to JSON fixtures in `backend/apps/shared/fixtures/`
- Creates both individual model fixtures and a combined `all_data.json`
- May need to be modified to use integers instead of floating point numbers

### 2. Load All Data
To load all fixture data:
```bash
docker compose exec backend python manage.py loaddata all_data
```

**Important**: Always use `all_data` fixture for loading. Individual model fixtures are not recommended as they may have dependency issues.

## Adding New Tables with Data

### 1. Create the Model
Add your model to the appropriate Django app.

### 2. Update CSV Conversion Script
Edit `backend/scripts/convert_csv_to_fixtures.py` and add your model to `MODEL_MAPPINGS`:

```python
MODEL_MAPPINGS = {
    # ... existing mappings ...
    "_YourNewTable": "your_app.yournewmodel",
}
```

### 3. Add CSV Data
Place your CSV file in `database/db/trimmed_tables/_YourNewTable/`

### 4. Generate Migration and Fixtures
```bash
# Generate Django migration
docker compose exec backend python manage.py makemigrations

# Convert CSV to JSON fixtures (on your machine)
cd backend/scripts
python3 convert_csv_to_fixtures.py

# Apply migration
docker compose exec backend python manage.py migrate

# Load the new data
docker compose exec backend python manage.py loaddata all_data
```

## Troubleshooting

### OpenShift Deployment Issues
In some cases, you may need to delete the deployment in OpenShift to allow migrations to run properly. This forces a fresh deployment with the new migration changes.

### Reset Database (Development Only)
```bash
# Delete all data and start fresh
docker compose down -v
docker compose up -d
```

### Check Migration Status
```bash
docker compose exec backend python manage.py showmigrations
```

## File Structure
```
backend/
├── apps/shared/fixtures/          # JSON fixtures for data seeding
│   ├── all_data.json             # Combined fixture file
│   └── *.json                    # Individual model fixtures
├── scripts/
│   └── convert_csv_to_fixtures.py # CSV to JSON conversion script
└── database/db/trimmed_tables/    # Source CSV files
```
