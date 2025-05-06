import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStudentNameField1746560456655 implements MigrationInterface {
    name = 'AddStudentNameField1746560456655'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`teachers_name_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`firstName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`lastName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`name\` varchar(510) NULL
        `);
        await queryRunner.query(`
            UPDATE \`students\` SET \`name\` = CONCAT(\`firstName\`, ' ', \`lastName\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`name\` \`name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_name_idx\` ON \`teachers\` (\`name\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_name_idx\` ON \`students\` (\`name\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_full_name_idx\` ON \`students\` (\`firstName\`, \`lastName\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`students_full_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_name_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` CHANGE \`name\` \`name\` varchar(255) NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`lastName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`firstName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_name_idx\` ON \`students\` (\`firstName\`, \`lastName\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_name_idx\` ON \`teachers\` (\`firstName\`, \`lastName\`)
        `);
    }

}
