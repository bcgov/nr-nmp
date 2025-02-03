#!/bin/bash

set -o errexit
set -o pipefail
set -o nounset

echo 'migrating'
python manage.py migrate
