import {MigrationInterface, QueryRunner} from 'typeorm';

// tslint:disable-next-line: class-name
export class introducePlaylist1578178377656 implements MigrationInterface {
    name = 'introducePlaylist1578178377656';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "channel_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying NOT NULL, "isActivated" boolean NOT NULL, "isPublic" boolean NOT NULL, "logFileUrl" character varying NOT NULL, "customValue" character varying NOT NULL, "MOTD" character varying NOT NULL, "bannerUrl" character varying NOT NULL, "coverUrl" character varying NOT NULL, "logoUrl" character varying NOT NULL, "emojiListUrl" character varying NOT NULL, "channelId" uuid, CONSTRAINT "PK_0c88e8516bc12cd86a9efc7c64c" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "video" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "positionInList" integer NOT NULL, "dateAdded" TIMESTAMP NOT NULL, CONSTRAINT "PK_1a2f3856250765d72e7e1636c8e" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "playlist" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isLocked" boolean NOT NULL, "createdById" uuid, CONSTRAINT "PK_538c2893e2024fabc7ae65ad142" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "global_settings" ("name" character varying NOT NULL, "logoUrl" character varying NOT NULL, "maxUsersInRoom" integer NOT NULL, "maxRooms" integer NOT NULL, "maxRoomsPerUser" integer NOT NULL, "allowedMediaHostingProviders" character varying NOT NULL, "homepageAnnouncement" character varying NOT NULL, "isRegistrationLocked" boolean NOT NULL, "isChannelCreationLocked" boolean NOT NULL, "currentTheme" character varying NOT NULL, CONSTRAINT "PK_fd6a23c6683883d3a4e6f11a909" PRIMARY KEY ("name"))`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "visibility"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "dateCreated" TIMESTAMP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "isAdmin" boolean NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastSeen" TIMESTAMP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "avatarUrl" TIMESTAMP NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "description" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "isLocked" boolean NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "isPublic" boolean NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "password" character varying NOT NULL`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_config" ADD CONSTRAINT "FK_01b1b15e040ba8819bf2e914788" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "playlist" ADD CONSTRAINT "FK_f564b97261a8c81bb8c0c083ab0" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "playlist" DROP CONSTRAINT "FK_f564b97261a8c81bb8c0c083ab0"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_config" DROP CONSTRAINT "FK_01b1b15e040ba8819bf2e914788"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "password"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isPublic"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "isLocked"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "description"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatarUrl"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastSeen"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isAdmin"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "dateCreated"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "visibility" character varying NOT NULL`, undefined);
        await queryRunner.query(`DROP TABLE "global_settings"`, undefined);
        await queryRunner.query(`DROP TABLE "playlist"`, undefined);
        await queryRunner.query(`DROP TABLE "video"`, undefined);
        await queryRunner.query(`DROP TABLE "channel_config"`, undefined);
    }

}
