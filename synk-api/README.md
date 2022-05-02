<p align="center">
  <img src="https://synk.moe/favicon-32x32.png" width="32" alt="Nest Logo" />
</p>

Synk Backend (API) project, built with <a href="http://nestjs.com/" target="blank">Nestjs</a>


[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)](https://socket.io)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com)
[![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)](https://expressjs.com)
[![made-with-TypeORM](https://img.shields.io/badge/TypeORM-1f425f.svg?style=for-the-badge)](https://github.com/typeorm/typeorm)
[![made-with-Passport](https://img.shields.io/badge/Passport-1f425f.svg?style=for-the-badge)](http://www.passportjs.org/)

## Installation

```bash
$ npm install
```

## Running the app

Make sure you have setup the  `.env` for your local system, check the `.env.example` for inspiration.

Make sure there's a postgres DB running and accessible with the credentials found in `.env`.

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```

## Database Migrations

Nestjs/TypeORM has built-in migration features, they're similar to dotnet's Entity Framework migration commands. [Find more info about the features in Nest's docs](https://docs.nestjs.com/techniques/database#migrations)

This project exposes some shortcuts for the add migration and run migration commands: 

`db:migrate:run` : Runs all migrations in an attempt to update the DB to latest migration. **Best to run this before starting the Synk API**

`db:migrate:gen yourMigrationName` : Adds a migration with given   `yourMigrationName`

## Test (not implemented, yet)

> This project does not currently have tests, ignore this section

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker (unmaintained)

While there are docker-related files in this project, it hasn't been used/tested for ages. It may work but isn't actively used by the maintainer.

## Nest resources

Website - [https://nestjs.com](https://nestjs.com/)

## License

  Synk is [MIT licensed](LICENSE).
