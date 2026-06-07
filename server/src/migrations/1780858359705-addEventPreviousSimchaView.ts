import { MigrationInterface, QueryRunner } from "typeorm";

export class addEventPreviousSimchaView1780858359705 implements MigrationInterface {
    name = 'addEventPreviousSimchaView1780858359705'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`image\` CHANGE \`fileDataSrc\` \`fileDataSrc\` mediumtext NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`image\` CHANGE \`fileDataTitle\` \`fileDataTitle\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`uploaded_files\` CHANGE \`fileDataSrc\` \`fileDataSrc\` mediumtext NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`uploaded_files\` CHANGE \`fileDataTitle\` \`fileDataTitle\` text NULL
        `);
        await queryRunner.query(`
            CREATE VIEW \`event_previous_simcha\` AS
            SELECT e.id AS id,
                e.user_id AS userId,
                LAG(et.name) OVER (
                    PARTITION BY e.studentReferenceId,
                    e.user_id
                    ORDER BY e.eventDate,
                        e.id
                ) AS previousSimchaDescription,
                LAG(t.name) OVER (
                    PARTITION BY e.studentReferenceId,
                    e.user_id
                    ORDER BY e.eventDate,
                        e.id
                ) AS previousTeacherName
            FROM events e
                LEFT JOIN event_types et ON et.id = e.eventTypeReferenceId
                LEFT JOIN teachers t ON t.id = e.teacherReferenceId
        `);
        await queryRunner.query(`
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `, ["event_management_nra","VIEW","event_previous_simcha","SELECT\n      e.id AS id,\n      e.user_id AS userId,\n      LAG(et.name) OVER (PARTITION BY e.studentReferenceId, e.user_id ORDER BY e.eventDate, e.id) AS previousSimchaDescription,\n      LAG(t.name) OVER (PARTITION BY e.studentReferenceId, e.user_id ORDER BY e.eventDate, e.id) AS previousTeacherName\n    FROM events e\n    LEFT JOIN event_types et ON et.id = e.eventTypeReferenceId\n    LEFT JOIN teachers t ON t.id = e.teacherReferenceId"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM \`event_management_nra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `, ["VIEW","event_previous_simcha","event_management_nra"]);
        await queryRunner.query(`
            DROP VIEW \`event_previous_simcha\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`uploaded_files\` CHANGE \`fileDataTitle\` \`fileDataTitle\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`uploaded_files\` CHANGE \`fileDataSrc\` \`fileDataSrc\` mediumtext NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`image\` CHANGE \`fileDataTitle\` \`fileDataTitle\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`image\` CHANGE \`fileDataSrc\` \`fileDataSrc\` mediumtext NOT NULL
        `);
    }

}
