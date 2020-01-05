
--  ##### INFO
-- DO NOT USE SCRIPT TO GENERATE DB - THIS IS OUT OF SYNC OF WHAT TYPEORM GENERATES
-- IT IS JUST AN OVERSIMPLIFIED EXAMPLE SCRIPT GEN'D FROM THE ./MODEL.DBML FILE
-- EX. Of what TypeORM generates: 

-- Table: public."user"

DROP TABLE public."user";
CREATE TABLE public."user"
(
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "passwordHash" character varying COLLATE pg_catalog."default" NOT NULL,
    username character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id)
)
TABLESPACE pg_default;
ALTER TABLE public."user"
    OWNER to "synk-db-user";

--  #####END INFO







--  ##### ###### ###### ######## #####
--  ##### START GENERATED SCRIPT #####
--  ##### ###### ###### ######## #####

CREATE TABLE "UserConfigs" (
  "id" int PRIMARY KEY,
  "userId" int NOT NULL,
  "isLocked" bit DEFAULT 0
);

CREATE TABLE "Users" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "dateCreated" timestamp,
  "password" varchar,
  "isAdmin" bit DEFAULT 0,
  "lastSeen" date,
  "avatarUrl" varchar
);

CREATE TABLE "Session" (
  "id" int PRIMARY KEY,
  "expiresAt" int,
  "data" varchar
);

CREATE TABLE "Videos" (
  "url" varchar,
  "playlistId" int NOT NULL,
  "addedBy" int NOT NULL,
  "positionInList" int,
  "dateAdded" date
);

CREATE TABLE "Playlists" (
  "id" int PRIMARY KEY,
  "createdBy" int NOT NULL,
  "isLocked" bit DEFAULT 0
);

CREATE TABLE "ChannelPlaylists" (
  "channelId" int NOT NULL,
  "playlistId" int NOT NULL,
  "addedBy" int NOT NULL
);

CREATE TABLE "Channels" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "description" varchar,
  "owner" int NOT NULL,
  "isLocked" bit DEFAULT 0,
  "isPublic" bit DEFAULT 1,
  "password" varchar,
  "dateCreated" date
);

CREATE TABLE "ChannelConfigs" (
  "id" int PRIMARY KEY,
  "channelId" int NOT NULL,
  "name" varchar,
  "isActivated" bit DEFAULT 1,
  "logFileUrl" varchar,
  "customValue" JSON,
  "MOTD" varchar,
  "bannerUrl" varchar,
  "coverUrl" varchar,
  "logoUrl" varchar,
  "emojiListUrl" varchar
);

CREATE TABLE "Roles" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "level" int
);

CREATE TABLE "ChannelRoles" (
  "channelId" int NOT NULL,
  "userId" int NOT NULL,
  "roleID" int NOT NULL
);

CREATE TABLE "ChannelPermissions" (
  "permissionId" int NOT NULL,
  "channelId" int NOT NULL,
  "userId" int,
  "roleID" int,
  "requiredLevel" int,
  "isActive" bit DEFAULT 1
);

CREATE TABLE "Permssion" (
  "id" int PRIMARY KEY,
  "name" varchar,
  "value" varchar
);

CREATE TABLE "Bans" (
  "id" int PRIMARY KEY,
  "userId" int,
  "channelId" int,
  "IP" varchar,
  "isGlobal" bit DEFAULT 0,
  "reason" varchar
);

ALTER TABLE "UserConfigs" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id");

ALTER TABLE "Videos" ADD FOREIGN KEY ("playlistId") REFERENCES "Playlists" ("id");

ALTER TABLE "Videos" ADD FOREIGN KEY ("addedBy") REFERENCES "Users" ("id");

ALTER TABLE "Playlists" ADD FOREIGN KEY ("createdBy") REFERENCES "Users" ("id");

ALTER TABLE "ChannelPlaylists" ADD FOREIGN KEY ("channelId") REFERENCES "Channels" ("id");

ALTER TABLE "ChannelPlaylists" ADD FOREIGN KEY ("playlistId") REFERENCES "Playlists" ("id");

ALTER TABLE "ChannelPlaylists" ADD FOREIGN KEY ("addedBy") REFERENCES "Users" ("id");

ALTER TABLE "Channels" ADD FOREIGN KEY ("owner") REFERENCES "Users" ("id");

ALTER TABLE "ChannelConfigs" ADD FOREIGN KEY ("channelId") REFERENCES "Channels" ("id");

ALTER TABLE "ChannelRoles" ADD FOREIGN KEY ("channelId") REFERENCES "Channels" ("id");

ALTER TABLE "ChannelRoles" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id");

ALTER TABLE "ChannelRoles" ADD FOREIGN KEY ("roleID") REFERENCES "Roles" ("id");

ALTER TABLE "ChannelPermissions" ADD FOREIGN KEY ("permissionId") REFERENCES "Permssion" ("id");

ALTER TABLE "ChannelPermissions" ADD FOREIGN KEY ("channelId") REFERENCES "Channels" ("id");

ALTER TABLE "ChannelPermissions" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id");

ALTER TABLE "ChannelPermissions" ADD FOREIGN KEY ("roleID") REFERENCES "Roles" ("id");

ALTER TABLE "Bans" ADD FOREIGN KEY ("userId") REFERENCES "Users" ("id");

ALTER TABLE "Bans" ADD FOREIGN KEY ("channelId") REFERENCES "Channels" ("id");
