import { MigrationInterface, QueryRunner } from 'typeorm';

// tslint:disable-next-line: class-name
export class manytomanyplaylist1601225725337 implements MigrationInterface {
  name = 'manytomanyplaylist1601225725337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "playlist_videos_video" ("playlistId" uuid NOT NULL, "videoId" uuid NOT NULL, CONSTRAINT "PK_62bc6e50989c314565c889c33e4" PRIMARY KEY ("playlistId", "videoId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_11e8c80b5f80bd98bf2c7aebff" ON "playlist_videos_video" ("playlistId") `);
    await queryRunner.query(`CREATE INDEX "IDX_2cde01185b6ded06342b412c86" ON "playlist_videos_video" ("videoId") `);
    await queryRunner.query(`ALTER TABLE "playlist" ADD "name" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" SET DEFAULT null`);
    await queryRunner.query(`ALTER TABLE "playlist_videos_video" ADD CONSTRAINT "FK_11e8c80b5f80bd98bf2c7aebffc" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "playlist_videos_video" ADD CONSTRAINT "FK_2cde01185b6ded06342b412c869" FOREIGN KEY ("videoId") REFERENCES "video"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "playlist_videos_video" DROP CONSTRAINT "FK_2cde01185b6ded06342b412c869"`);
    await queryRunner.query(`ALTER TABLE "playlist_videos_video" DROP CONSTRAINT "FK_11e8c80b5f80bd98bf2c7aebffc"`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "currentTheme" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "homepageAnnouncement" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "allowedMediaHostingProviders" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "global_settings" ALTER COLUMN "logoUrl" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "channel" ALTER COLUMN "password" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "avatarUrl" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "lastSeen" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "playlist" DROP COLUMN "name"`);
    await queryRunner.query(`DROP INDEX "IDX_2cde01185b6ded06342b412c86"`);
    await queryRunner.query(`DROP INDEX "IDX_11e8c80b5f80bd98bf2c7aebff"`);
    await queryRunner.query(`DROP TABLE "playlist_videos_video"`);
  }

}
