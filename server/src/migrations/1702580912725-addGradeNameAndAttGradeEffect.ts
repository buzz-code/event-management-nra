import { MigrationInterface, QueryRunner } from "typeorm";

export class addGradeNameAndAttGradeEffect1702580912725 implements MigrationInterface {
    name = 'addGradeNameAndAttGradeEffect1702580912725'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`att_grade_effect\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`percents\` int NULL,
                \`count\` int NULL,
                \`effect\` int NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_3a2dccf671e4550e3b4f64fd0d\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`grade_names\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`user_id\` int NOT NULL,
                \`key\` int NOT NULL,
                \`name\` varchar(500) NOT NULL,
                \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_3969f5c06a11e499582a2ad109\` (\`user_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_3969f5c06a11e499582a2ad109\` ON \`grade_names\`
        `);
        await queryRunner.query(`
            DROP TABLE \`grade_names\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3a2dccf671e4550e3b4f64fd0d\` ON \`att_grade_effect\`
        `);
        await queryRunner.query(`
            DROP TABLE \`att_grade_effect\`
        `);
    }

}
