FROM postgres:17

# Copy startup scripts
COPY db/seed_tables/*/* /docker-entrypoint-initdb.d/

# User, port and Healthcheck
USER postgres
EXPOSE 5432
HEALTHCHECK --interval=5s --timeout=5s --retries=5 CMD [ "pg_isready", "-U", "postgres"]
