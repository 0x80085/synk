FROM postgres

# https://stackoverflow.com/questions/26598738/how-to-create-user-database-in-script-for-docker-postgres
# With sql initdb script

COPY init.sql /docker-entrypoint-initdb.d/

# Expose the default PostgreSQL port
EXPOSE 5432

# Add VOLUMEs to allow backup of config, logs and databases
VOLUME  ["/etc/postgresql", "/var/log/postgresql", "/var/lib/postgresql"]