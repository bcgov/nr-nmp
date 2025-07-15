FROM python:3.13-slim

WORKDIR /app

RUN apt update && \
    apt install -y curl

RUN python3 -m pip install --upgrade pip

COPY . /app
COPY ./requirements.txt /requirements.txt

RUN python3 -m pip install -r requirements.txt

CMD sh -c "python3 manage.py migrate --fake-initial || python3 manage.py migrate && \
    python3 manage.py loaddata all_data && \
    python3 manage.py runserver 0.0.0.0:3000"

# Boilerplate, not used in OpenShift/Kubernetes
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:3000 || exit 1

# Nonroot user
USER 1001