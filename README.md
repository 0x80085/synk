# Synk Project

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/0x80085/synk//graphs/commit-activity)

> Watch youtube vids in sync and chat with friends

## Install 

Run `npm i` in all folders that contain a package.json

## Prerequisites

- Node installed
- Postgres DB (see ormconfig for DB user + execute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` on the DB server)
- Angular cli
- Typescript

## Running 

Run `npm start` in the top level folder to start the Server and Client.

Getting the YT namespace error? Execute `npm i @types/youtube`.

## Built with 

- Angular
- ANT Design
- Express
- TypeORM
- SocketIO
- Node
- Typescript

## Todo 

- Docker support
- Config script for DB
- More docs
- YT support 
- actually syncing the vids
- authentication/authorization
- DB model
    - Roles
    - channels
    - etc.
- moderation 
- custom emoji support
- general styling
- deploy steps/script
- channel customization support
- API call validation
- Middleware for API and Sockets
