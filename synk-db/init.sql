/*
    https://stackoverflow.com/questions/26598738/how-to-create-user-database-in-script-for-docker-postgres
*/

CREATE USER 'synk-db-user'
WITH PASSWORD 'synk-db-user-pass';

CREATE DATABASE synk;
GRANT ALL PRIVILEGES ON DATABASE synk TO 'synk-db-user';
