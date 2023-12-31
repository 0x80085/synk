# Synk Project ~~(Stopped development due to no interest - abandoned)~~ REOPENED 

Watch videos in sync and chat with friends

[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/0x80085/synk/graphs/commit-activity) [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://tldrlegal.com/license/mit-license) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)](http://makeapullrequest.com) [![GitHub contributors](https://img.shields.io/github/contributors/0x80085/synk)](https://github.com/0x80085/synk/graphs/contributors/)  [![Open Source Love svg2](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://www.gnu.org/philosophy/floss-and-foss.en.html)


[![Build client & API](https://github.com/0x80085/synk/actions/workflows/github-actions-ci.yml/badge.svg)](https://github.com/0x80085/synk/actions/workflows/github-actions-ci.yml)
[![CodeQL](https://github.com/0x80085/synk/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/0x80085/synk/actions/workflows/github-code-scanning/codeql)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/e3a653afaf754e4c98911e1ca16fcc82)](https://www.codacy.com/gh/0x80085/synk/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=0x80085/synk&amp;utm_campaign=Badge_Grade)


![Website preview](preview.png)

## Live Demo

[![Website synk.moe](https://img.shields.io/website-up-down-green-red/https/synk.moe.svg?style=for-the-badge&label=synk.moe)](https://synk.moe/)

## Install

Prerequisites: 
- Have `yarn` installed
- node >= v12 installed  

Run `yarn` in all folders that contain a package.json

## Prerequisites

- NodeJS
- Postgres DB (see API .env file for DB user + execute `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";` on the DB server)
- Angular cli
- Typescript

## Running

### Run from command line

Run `npm start` in the top level folder to start the Server and Client with concurrently.

**...Or** to start the client and server seperately, cd into synk-api and synk-client folders and run `npm start` 

Getting the YT namespace error in the client? Execute `npm i @types/youtube` in the synk-client folder.

### Run with Docker

> **Warning**: Running with Docker is not actively maintained/tested. These steps might work locally but haven't been used/run recently by the maintainer. 

>No need to have postgres installed when using Docker, the compose file will spin up a PostGres DB  container

Install docker and also docker-compose.

Then, in this directory, run:

`docker-compose -f "docker-compose.yml" up -d --build`

Or use the shortcut in package.json:

 `npm run docker:run`

## Powered by

### Shared tech

[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io)

### Frontend

[![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io)
[![Ant-Design](https://img.shields.io/badge/-AntDesign-%230170FE?style=for-the-badge&logo=ant-design&logoColor=white)](https://ng.ant.design)
[![made-with-Plyr](https://img.shields.io/badge/Plyr-1f425f.svg?style=for-the-badge)](https://plyr.io/)

### Backend

[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com)
[![made-with-TypeORM](https://img.shields.io/badge/TypeORM-1f425f.svg?style=for-the-badge)](https://github.com/typeorm/typeorm)
[![made-with-Passport](https://img.shields.io/badge/Passport-1f425f.svg?style=for-the-badge)](http://www.passportjs.org/)


### Contributing

