import {MigrationInterface, QueryRunner} from 'typeorm';

// tslint:disable-next-line: class-name
export class ini1578174431965 implements MigrationInterface {
    name = 'ini1578174431965';

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "passwordHash" character varying NOT NULL, "username" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "channel" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "dateCreated" TIMESTAMP NOT NULL, "visibility" character varying NOT NULL, "ownerId" uuid, CONSTRAINT "PK_590f33ee6ee7d76437acf362e39" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`CREATE TABLE "session" ("id" character varying NOT NULL, "expiresAt" integer NOT NULL, "data" character varying NOT NULL, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_bdfef605fedc02f3f9d60f1bc07" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_bdfef605fedc02f3f9d60f1bc07"`, undefined);
        await queryRunner.query(`DROP TABLE "session"`, undefined);
        await queryRunner.query(`DROP TABLE "channel"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }

}
