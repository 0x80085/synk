FROM postgres

# https://stackoverflow.com/questions/26598738/how-to-create-user-database-in-script-for-docker-postgres
# https://hub.docker.com/_/postgres/
# Without sql initdb script, using ENV vars should auto create

ENV POSTGRES_USER synk-db-user
ENV POSTGRES_PASSWORD synk-db-user-pass
ENV POSTGRES_DB synk

# Expose the default PostgreSQL port
EXPOSE 5432

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]