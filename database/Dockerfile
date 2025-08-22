FROM postgres:17

# User, port and Healthcheck
USER postgres
EXPOSE 5432
HEALTHCHECK --interval=5s --timeout=5s --retries=5 CMD [ "pg_isready", "-U", "postgres"]
