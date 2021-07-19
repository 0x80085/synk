import {MigrationInterface, QueryRunner} from "typeorm";

export class all1608108513180 implements MigrationInterface {
    name = 'all1608108513180'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "isActivated" boolean NOT NULL, "isPublic" boolean NOT NULL, "logFileUrl" character varying NOT NULL, "customValue" character varying NOT NULL, "MOTD" character varying NOT NULL, "bannerUrl" character varying NOT NULL, "coverUrl" character varying NOT NULL, "logoUrl" character varying NOT NULL, "emojiListUrl" character varying NOT NULL, "maxUsers" integer NOT NULL, "channelId" uuid, CONSTRAINT "PK_0c88e8516bc12cd86a9efc7c64c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "positionInList" integer NOT NULL, "dateAdded" TIMESTAMP NOT NULL, CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "isLocked" boolean NOT NULL DEFAULT false, "createdById" uuid, CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "dateCreated" TIMESTAMP NOT NULL, "level" integer NOT NULL, "memberId" uuid, "channelId" uuid, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "member" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "passwordHash" character varying NOT NULL, "username" character varying NOT NULL, "dateCreated" TIMESTAMP NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, "lastSeen" TIMESTAMP DEFAULT null, "avatarUrl" character varying DEFAULT null, CONSTRAINT "PK_97cbbe986ce9d14ca5894fdc072" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "isLocked" boolean NOT NULL DEFAULT false, "isPublic" boolean NOT NULL DEFAULT false, "password" character varying DEFAULT null, "dateCreated" TIMESTAMP NOT NULL, "ownerId" uuid, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "global_settings" ("name" character varying NOT NULL, "logoUrl" character varying DEFAULT null, "maxUsersInRoom" integer NOT NULL DEFAULT '108', "maxRooms" integer NOT NULL DEFAULT '108', "maxRoomsPerUser" integer NOT NULL DEFAULT '5', "allowedMediaHostingProviders" character varying DEFAULT null, "homepageAnnouncement" character varying DEFAULT null, "isRegistrationLocked" boolean NOT NULL DEFAULT false, "isChannelCreationLocked" boolean NOT NULL DEFAULT false, "currentTheme" character varying DEFAULT null, CONSTRAINT "PK_fd6a23c6683883d3a4e6f11a909" PRIMARY KEY ("name"))`);
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying NOT NULL, "expiresAt" integer NOT NULL, "data" character varying NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "playlist_videos_video" ("playlistId" uuid NOT NULL, "videoId" uuid NOT NULL, CONSTRAINT "PK_62bc6e50989c314565c889c33e4" PRIMARY KEY ("playlistId", "videoId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_11e8c80b5f80bd98bf2c7aebff" ON "playlist_videos_video" ("playlistId") `);
        await queryRunner.query(`CREATE INDEX "IDX_2cde01185b6ded06342b412c86" ON "playlist_videos_video" ("videoId") `);
        await queryRunner.query(`ALTER TABLE "channel_config" ADD CONSTRAINT "FK_01b1b15e040ba8819bf2e914788" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist" ADD CONSTRAINT "FK_f564b97261a8c81bb8c0c083ab0" FOREIGN KEY ("createdById") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_a7bf6e7f14ea2506100c547ea5c" FOREIGN KEY ("memberId") REFERENCES "member"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role" ADD CONSTRAINT "FK_913fd9b73d0cfd76796a98201f4" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_bdfef605fedc02f3f9d60f1bc07" FOREIGN KEY ("ownerId") REFERENCES "member"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_videos_video" ADD CONSTRAINT "FK_11e8c80b5f80bd98bf2c7aebffc" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "playlist_videos_video" ADD CONSTRAINT "FK_2cde01185b6ded06342b412c869" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "playlist_videos_video" DROP CONSTRAINT "FK_2cde01185b6ded06342b412c869"`);
        await queryRunner.query(`ALTER TABLE "playlist_videos_video" DROP CONSTRAINT "FK_11e8c80b5f80bd98bf2c7aebffc"`);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_bdfef605fedc02f3f9d60f1bc07"`);
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_913fd9b73d0cfd76796a98201f4"`);
        await queryRunner.query(`ALTER TABLE "role" DROP CONSTRAINT "FK_a7bf6e7f14ea2506100c547ea5c"`);
        await queryRunner.query(`ALTER TABLE "playlist" DROP CONSTRAINT "FK_f564b97261a8c81bb8c0c083ab0"`);
        await queryRunner.query(`ALTER TABLE "channel_config" DROP CONSTRAINT "FK_01b1b15e040ba8819bf2e914788"`);
        await queryRunner.query(`DROP INDEX "IDX_2cde01185b6ded06342b412c86"`);
        await queryRunner.query(`DROP INDEX "IDX_11e8c80b5f80bd98bf2c7aebff"`);
        await queryRunner.query(`DROP TABLE "playlist_videos_video"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "global_settings"`);
        await queryRunner.query(`DROP TABLE "channel"`);
        await queryRunner.query(`DROP TABLE "member"`);
        await queryRunner.query(`DROP TABLE "role"`);
        await queryRunner.query(`DROP TABLE "playlist"`);
        await queryRunner.query(`DROP TABLE "video"`);
        await queryRunner.query(`DROP TABLE "channel_config"`);
    }

}
