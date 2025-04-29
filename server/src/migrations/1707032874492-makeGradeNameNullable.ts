import { MigrationInterface, QueryRunner } from "typeorm";

export class makeGradeNameNullable1707032874492 implements MigrationInterface {
    name = 'makeGradeNameNullable1707032874492'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grade_names\` CHANGE \`name\` \`name\` varchar(500) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`grade_names\` CHANGE \`name\` \`name\` varchar(500) NOT NULL
        `);
    }

}
