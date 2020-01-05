import { MigrationInterface, QueryRunner } from 'typeorm';

// tslint:disable-next-line: class-name
export class alterNullable1578184950151 implements MigrationInterface {
  name = 'alterNullable1578184950151';

  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "playlist" ALTER COLUMN "isLocked" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isAdmin" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "isLocked" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "isPublic" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxUsersInRoom" SET DEFAULT 108`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxRooms" SET DEFAULT 108`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxRoomsPerUser" SET DEFAULT 5`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" SET DEFAULT null`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "isRegistrationLocked" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "isChannelCreationLocked" SET DEFAULT false`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" SET DEFAULT null`, undefined);
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "isChannelCreationLocked" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "isRegistrationLocked" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxRoomsPerUser" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxRooms" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "maxUsersInRoom" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "isPublic" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "isLocked" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" SET NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "isAdmin" DROP DEFAULT`, undefined);
    await queryRunner.query(`ALTER TABLE "playlist" ALTER COLUMN "isLocked" DROP DEFAULT`, undefined);
  }

}
