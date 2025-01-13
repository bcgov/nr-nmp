FROM python:3.13-slim

WORKDIR /app

RUN python3 -m pip install --upgrade pip

COPY . /app
COPY ./requirements.txt /requirements.txt

RUN python3 -m pip install -r requirements.txt

CMD sh -c "python3 manage.py migrate && \
    python3 manage.py runserver 0.0.0.0:3000"
