# Synk API

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file and other confg in `.env`
    - The .env file overwrites the ormconfig.json for db settings
3. Run `npm start` command

If DB complains about UUID, run:

`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

>(shouldn't happen if you build db the from the synk-db/Dockerfile)

## Migrations with TypeORM

Run `ts-node ./node_modules/typeorm/cli.js migration:generate -n <name of migration>` to generate a migration

Run `ts-node ./node_modules/typeorm/cli.js migration:run` to migrate

## Minification/Compilation/Packaging

See the prod.Dockerfile for the commands to compile the source

## Tech

- ExpressJS
- PassportJS
- TypeORM
- SocketIO
- Docker
- NGINX
