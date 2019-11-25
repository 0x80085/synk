# Synk Project

> Watch youtube vids in sync and chat with friends

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/0x80085/synk/graphs/commit-activity) [![Website synkd.tv](https://img.shields.io/website-up-down-green-red/http/synkd.tv.svg)](https://synkd.tv/) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges/) [![GitHub contributors](https://img.shields.io/github/contributors/0x80085/synk)](https://github.com/0x80085/synk/graphs/contributors/)


[![made-with-Angular](https://img.shields.io/badge/Made%20with-Angular-1f425f.svg)](https://angular.io/) [![made-with-TypeORM](https://img.shields.io/badge/Made%20with-TypeORM-1f425f.svg)](https://github.com/typeorm/typeorm) [![made-with-ExpressJS](https://img.shields.io/badge/Made%20with-ExpressJS-1f425f.svg)](https://expressjs.com/) [![made-with-Passport](https://img.shields.io/badge/Made%20with-Passport-1f425f.svg)](http://www.passportjs.org/) [![made-with-SocketIO](https://img.shields.io/badge/Made%20with-SocketIO-1f425f.svg)](https://socket.io/) [![made-with-Ant-Design](https://img.shields.io/badge/Made%20with-Ant%20Design-1f425f.svg)](https://ng.ant.design/) [![made-with-Typescript](https://img.shields.io/badge/Made%20with-Typescript-1f425f.svg)](https://www.typescriptlang.org/)

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

## Todo 

- Docker support
- Config script for DB
- More docs
- DB model
    - Users
    - Channels
    - Bans
    - Mods
    - ...
- DB Migration scripts
- Moderation 
- Custom emoji support
- General styling
- Deploy steps/script
- Channel customization support
- Rate limiting
- Bans
- Load Balancing/Testing
- Refactor Middleware Sockets to make it more readable
- Add Scrape.Tv Channel and scraoe vids periodically
- Playlist control
- exitGroup when user disconnects
