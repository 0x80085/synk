import {MigrationInterface, QueryRunner} from "typeorm";

export class channelPlaylists1637531096443 implements MigrationInterface {
    name = 'channelPlaylists1637531096443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."playlist" ADD "channelId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."channel" ADD "isAutomated" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "public"."channel" ADD "activePlaylistId" uuid`);
        await queryRunner.query(`ALTER TABLE "public"."channel" ADD CONSTRAINT "UQ_b90e2117536cf2622382f2d388b" UNIQUE ("activePlaylistId")`);
        await queryRunner.query(`ALTER TABLE "public"."playlist" ADD CONSTRAINT "FK_eecd2a0f0ec3e80829c98fa5949" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."channel" ADD CONSTRAINT "FK_b90e2117536cf2622382f2d388b" FOREIGN KEY ("activePlaylistId") REFERENCES "playlist"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."channel" DROP CONSTRAINT "FK_b90e2117536cf2622382f2d388b"`);
        await queryRunner.query(`ALTER TABLE "public"."playlist" DROP CONSTRAINT "FK_eecd2a0f0ec3e80829c98fa5949"`);
        await queryRunner.query(`ALTER TABLE "public"."channel" DROP CONSTRAINT "UQ_b90e2117536cf2622382f2d388b"`);
        await queryRunner.query(`ALTER TABLE "public"."channel" DROP COLUMN "activePlaylistId"`);
        await queryRunner.query(`ALTER TABLE "public"."channel" DROP COLUMN "isAutomated"`);
        await queryRunner.query(`ALTER TABLE "public"."playlist" DROP COLUMN "channelId"`);
    }

}
