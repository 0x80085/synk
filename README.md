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

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

### Frontend

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![Ant-Design](https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white)
[![made-with-Plyr](https://img.shields.io/badge/Plyr-1f425f.svg?style=for-the-badge)](https://plyr.io/)

### Backend

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
[![made-with-TypeORM](https://img.shields.io/badge/TypeORM-1f425f.svg?style=for-the-badge)](https://github.com/typeorm/typeorm)
[![made-with-Passport](https://img.shields.io/badge/Passport-1f425f.svg?style=for-the-badge)](http://www.passportjs.org/)


### Contributing

Join the discord channel and help with testing or developing this project

[![Discord](https://img.shields.io/discord/732990730355867678.svg?style=for-the-badge&label=Synk&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/EaYUq7Ws8m)
