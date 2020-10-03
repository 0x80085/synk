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

Need to know all tables in the synk db?
`SELECT table_name  FROM information_schema.tables WHERE table_schema='public';`

Combined with scripts:
`SELECT CONCAT('DROP TABLE ', table_name, ' ;')  FROM information_schema.tables WHERE table_schema='public';`

## Minification/Compilation/Packaging

See the prod.Dockerfile for the commands to compile the source

## Tech

- ExpressJS
- PassportJS
- TypeORM
- SocketIO
- Docker
- NGINX

## Common dev issues

bcrypt complains about binaries? Try:

> `npm rebuild bcrypt --update-binary`

nodegyp complains about... anything

> Find and install the C build (like windows-build-tools or whatever your OS is)

> Make sure to have Python 2.7 installed

> Follow the instructions to build node-gyp from source step by step
