# Synk API

Steps to run this project:

1. Run `npm i` command
2. Setup database settings inside `ormconfig.json` file and other confog in `.env`
3. Run `npm start` command

If DB complains about UUID, run:

`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

## DB Migrations

Are still a problem - issue with TS to JS

## Minification/Compilation/Packaging

Also under construction - tsc succeeds but it bails on a typeorm error when trying to run

## Tech

- ExpressJS
- PassportJS
- TypeORM
- SocketIO
