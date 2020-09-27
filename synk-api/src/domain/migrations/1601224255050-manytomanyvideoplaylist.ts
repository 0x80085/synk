import {MigrationInterface, QueryRunner} from 'typeorm';

// tslint:disable-next-line: class-name
export class manytomanyvideoplaylist1601224255050 implements MigrationInterface {
    name = 'manytomanyvideoplaylist1601224255050';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" SET DEFAULT null`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" SET DEFAULT null`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" DROP DEFAULT`);
    }

}
