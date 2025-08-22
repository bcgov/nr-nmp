#!/usr/bin/env python
"""
Converts CSV files from database/db to Django fixtures and saves them as JSON files
in backend/apps/shared/fixtures/ (may need to be updated to handle some null values and floats)
"""

import csv
import glob
import json
import os
import re
from pathlib import Path

# Directory mappings of the file paths
CSV_DIR = "../../database/db"
FIXTURE_DIR = "../apps/shared/fixtures"

# Model mappings (directory name -> model)
MODEL_MAPPINGS = {
    "_Crops": "crops.crops",
    "_ConversionFactors": "crops.conversionfactors",
    "_CropTypes": "crops.croptypes",
    "_CropYields": "crops.cropyields",
    "_CropSoilTestPotassiumRegions": "crops.cropsoilpotassiumregions",
    "_CropSoilTestPhosphorousRegions": "crops.cropsoiltestphosphorousregions",
    "_DensityUnits": "fertilizers.densityunits",
    "_Regions": "shared.regions",
    "_SubRegion": "shared.subregion",
    "_Animals": "animals.animals",
    "_AnimalSubType": "animals.animalsubtype",
    "_Breed": "animals.breed",
    "_Manures": "manures.manures",
    "_LiquidMaterialsConversionFactors": "manures.liquidmaterialsconversionfactors",
    "_LiquidFertilizerDensities": "fertilizers.liquidfertilizerdensities",
    "_SolidMaterialsConversionFactors": "manures.solidmaterialsconversionfactors",
    "_Fertilizers": "fertilizers.fertilizers",
    "_FertilizerTypes": "fertilizers.fertilizertypes",
    "_FertilizerUnits": "fertilizers.fertilizerunits",
    "_NitrogenRecommendations": "crops.nitrogenrecommendation",
    "_SoilTestMethods": "crops.soiltestmethods",
    "_SoilTestPhosphorousKelownaRanges": "crops.soiltestphosphorouskelownaranges",
    "_SoilTestPhosphorousRecommendation": "crops.soiltestphosphorousrecommendation",
    "_SoilTestPotassiumKelownaRanges": "crops.soiltestpotassiumkelownaranges",
    "_SoilTestPotassiumRecommendation": "crops.soiltestpotassiumrecommendation",
    "_Previous_Crop_Types": "crops.previouscroptypes",
    "_Units": "manures.units",
    "_NitrogenMineralizations": "manures.nitrogenmineralization",
    "_PlantAge": "crops.plantage",
}


def clean_value(value, column_name):
    """Converts string values to appropriate Python types"""
    if value is None or value.strip() == '':
        return None

    # Try to detect types based on content and column name
    if column_name.lower().endswith(('id', 'count', 'order', 'sortorder')):
        try:
            return int(value)
        except ValueError:
            pass

    # Try float for likely numeric columns (this will need to be updated for crops workflow as a float may cause issues with endpoints)
    if re.match(r'^[\d.]+$', value):
        try:
            return float(value)
        except ValueError:
            pass

    # Boolean detection
    if value.lower() in ('true', 'yes', 't', 'y', '1'):
        return True
    if value.lower() in ('false', 'no', 'f', 'n', '0'):
        return False

    # Default to string
    return value


def convert_csv_to_fixture(csv_path, model_name):
    """Convert a CSV file to Django fixture format of JSON files"""
    fixture_data = []

    with open(csv_path, 'r') as csv_file:
        reader = csv.DictReader(csv_file)

        for row in reader:
            # Clean up the data and convert types
            fields = {}
            print(row)
            for field, value in row.items():
                if field.lower() == 'id':
                    pk = clean_value(value, field)
                    continue
                fields[field.lower()] = clean_value(value, field)

            fixture_entry = {
                "model": model_name.lower(),
                "pk": pk,
                "fields": fields
            }
            fixture_data.append(fixture_entry)

    return fixture_data


def main():
    # Create fixtures directory if it doesn't exist
    os.makedirs(FIXTURE_DIR, exist_ok=True)

    # Track all fixture data for combined file
    all_fixtures = []

    # Process each directory
    for dir_name, model_name in MODEL_MAPPINGS.items():
        dir_path = os.path.join(CSV_DIR, dir_name)

        if not os.path.exists(dir_path):
            print(f"Warning: Directory {dir_path} does not exist")
            continue

        # Find CSV files in the directory
        csv_files = glob.glob(os.path.join(dir_path, "*.csv"))

        if not csv_files:
            print(f"Warning: No CSV files found in {dir_path}")
            continue

        # Use the most recent CSV file if multiple exist
        csv_file = max(csv_files, key=os.path.getmtime)

        print(f"Processing {csv_file} for model {model_name}")

        # Convert to fixture data
        fixture_data = convert_csv_to_fixture(csv_file, model_name)

        if not fixture_data:
            print(f"Warning: No data converted from {csv_file}")
            continue

        # Save individual fixture file
        model_short_name = model_name.split('.')[-1]
        fixture_file = os.path.join(FIXTURE_DIR, f"{model_short_name}.json")

        with open(fixture_file, 'w') as f:
            json.dump(fixture_data, f, indent=2)

        print(f"Saved {len(fixture_data)} records to {fixture_file}")

        # Add to combined data
        all_fixtures.extend(fixture_data)

    # Save combined fixture file (this will be used to load the data into the database)
    combined_file = os.path.join(FIXTURE_DIR, "all_data.json")
    with open(combined_file, 'w') as f:
        json.dump(all_fixtures, f, indent=2)

    print(f"Saved combined fixture with {len(all_fixtures)} records to {combined_file}")


if __name__ == "__main__":
    main()
