# Synk Project

> Watch videos in sync and chat with friends

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/0x80085/synk/graphs/commit-activity) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://tldrlegal.com/license/mit-license) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![GitHub contributors](https://img.shields.io/github/contributors/0x80085/synk)](https://github.com/0x80085/synk/graphs/contributors/)  [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://www.gnu.org/philosophy/floss-and-foss.en.html)

## Live Demo

[![Website synk.moe](https://img.shields.io/website-up-down-green-red/https/synk.moe.svg?style=for-the-badge&label=synk.moe)](https://synk.moe/)

## Install

Run `npm i` in all folders that contain a package.json

## Prerequisites

- NodeJS
- Postgres DB (see ormconfig for DB user + execute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` on the DB server)
- Angular cli
- Typescript

## Running

### Run from command line

Run `npm start` in the top level folder to start the Server and Client with concurrently.

**...Or** to start the client and server seperately, cd into synk-api and synk-client folders and run `npm start` 

Getting the YT namespace error in the client? Execute `npm i @types/youtube` in the synk-client folder.

### Run with Docker

>No need to have postgres installed when using Docker, the compose file will spin up a PostGres DB  container

Install docker and also docker-compose.

Then, in this directory, run:

`docker-compose -f "docker-compose.yml" up -d --build`

Or use the shortcut in package.json:

 `npm run docker:run`

## Powered by

### Shared tech

[![made-with-Typescript](https://img.shields.io/badge/Typescript-1f425f.svg)](https://www.typescriptlang.org/)
[![made-with-SocketIO](https://img.shields.io/badge/SocketIO-1f425f.svg)](https://socket.io/)

### Front end

[![made-with-Angular](https://img.shields.io/badge/Angular-1f425f.svg)](https://angular.io/)
[![made-with-Ant-Design](https://img.shields.io/badge/Ant%20Design-1f425f.svg)](https://ng.ant.design/)
[![made-with-Plyr](https://img.shields.io/badge/Plyr-1f425f.svg)](https://plyr.io/)

### Back end

[![made-with-TypeORM](https://img.shields.io/badge/TypeORM-1f425f.svg)](https://github.com/typeorm/typeorm)
[![made-with-ExpressJS](https://img.shields.io/badge/ExpressJS-1f425f.svg)](https://expressjs.com/)
[![made-with-Passport](https://img.shields.io/badge/Passport-1f425f.svg)](http://www.passportjs.org/)
[![made-with-NestJS](https://img.shields.io/badge/NestJS-1f425f.svg)](https://nestjs.com/)


### Contributing

Join the discord channel and help with testing or developing this project

[![Discord](https://img.shields.io/discord/732990730355867678.svg?style=for-the-badge&label=Synk&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/EaYUq7Ws8m)
