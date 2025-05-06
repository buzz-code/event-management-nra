import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeacherOwnUserId1746555644776 implements MigrationInterface {
    name = 'AddTeacherOwnUserId1746555644776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`own_user_id\` int NULL
        `);
        await queryRunner.query(`
            UPDATE \`teachers\` SET \`own_user_id\` = \`userReferenceId\` WHERE \`userReferenceId\` IS NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_33bfc593b368cc8550fc901824b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`userReferenceId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`user_id\` \`user_id\` int NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_own_user_id_idx\` ON \`teachers\` (\`own_user_id\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD CONSTRAINT \`FK_4668d4752e6766682d1be0b346f\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD CONSTRAINT \`FK_bb43097cf3a5ba9d6cead7354e4\` FOREIGN KEY (\`own_user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_bb43097cf3a5ba9d6cead7354e4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP FOREIGN KEY \`FK_4668d4752e6766682d1be0b346f\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_own_user_id_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`user_id\` \`user_id\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`own_user_id\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`userReferenceId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD CONSTRAINT \`FK_33bfc593b368cc8550fc901824b\` FOREIGN KEY (\`userReferenceId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
