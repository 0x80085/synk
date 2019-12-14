# Synk Database

> PostgreSQL DB that runs in Docker

## Links

[Tricks for Postgres and Docker](https://martinheinz.dev/blog/3)

[Docker Hub psql image](https://hub.docker.com/_/postgres/)

[SO: How to create User/Database in script for Docker Postgres](https://stackoverflow.com/questions/26598738/how-to-create-user-database-in-script-for-docker-postgres)

## Todo

- Test it
- Test creation
- Create network for API to be able to talk to DB
- Test migration against DB
- Backup strategy (volume?)
- Check logs stategy (volume?)
- pgAdmin connection
- Change default postgres user for security
- Investigate and implement best practice security measures
- Should prob have 3 users:
    - synk-user for API _(read, write for synk db only)_
    - janitor-user for maintenance _(read, write synk db and metadata db)_
    - super-user for when sh*t hits the fan _(god mode)_