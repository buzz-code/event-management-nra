import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveClassFromStudent1747034605961 implements MigrationInterface {
  name = 'RemoveClassFromStudent1747034605961';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX \`students_class_id_idx\` ON \`students\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`class_id\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`classReferenceId\`
        `);
    await queryRunner.query(`
            CREATE VIEW \`student_by_year\` AS
            SELECT \`student_class\`.\`year\` AS \`year\`,
                \`student_class\`.\`studentReferenceId\` AS \`studentReferenceId\`,
                \`student\`.\`tz\` AS \`studentTz\`,
                \`student\`.\`name\` AS \`studentName\`,
                CONCAT(
                    \`student_class\`.\`studentReferenceId\`,
                    '_',
                    \`student_class\`.\`year\`
                ) AS \`id\`,
                GROUP_CONCAT(DISTINCT \`class\`.\`name\` SEPARATOR ', ') AS \`class_names\`,
                GROUP_CONCAT(DISTINCT \`class\`.\`id\` SEPARATOR ', ') AS \`class_reference_ids\`
            FROM \`student_classes\` \`student_class\`
                LEFT JOIN \`classes\` \`class\` ON \`class\`.\`id\` = \`student_class\`.\`classReferenceId\`
                LEFT JOIN \`students\` \`student\` ON \`student\`.\`id\` = \`student_class\`.\`studentReferenceId\`
            GROUP BY \`student_class\`.\`studentReferenceId\`,
                \`student_class\`.\`year\`
        `);
    await queryRunner.query(
      `
            INSERT INTO \`event_management_nra\`.\`typeorm_metadata\`(
                    \`database\`,
                    \`schema\`,
                    \`table\`,
                    \`type\`,
                    \`name\`,
                    \`value\`
                )
            VALUES (DEFAULT, ?, DEFAULT, ?, ?, ?)
        `,
      [
        'event_management_nra',
        'VIEW',
        'student_by_year',
        "SELECT `student_class`.`year` AS `year`, `student_class`.`studentReferenceId` AS `studentReferenceId`, `student`.`tz` AS `studentTz`, `student`.`name` AS `studentName`, CONCAT(`student_class`.`studentReferenceId`, '_', `student_class`.`year`) AS `id`, GROUP_CONCAT(DISTINCT `class`.`name` SEPARATOR ', ') AS `class_names`, GROUP_CONCAT(DISTINCT `class`.`id` SEPARATOR ', ') AS `class_reference_ids` FROM `student_classes` `student_class` LEFT JOIN `classes` `class` ON `class`.`id` = `student_class`.`classReferenceId`  LEFT JOIN `students` `student` ON `student`.`id` = `student_class`.`studentReferenceId` GROUP BY `student_class`.`studentReferenceId`, `student_class`.`year`",
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
            DELETE FROM \`event_management_nra\`.\`typeorm_metadata\`
            WHERE \`type\` = ?
                AND \`name\` = ?
                AND \`schema\` = ?
        `,
      ['VIEW', 'student_by_year', 'event_management_nra'],
    );
    await queryRunner.query(`
            DROP VIEW \`student_by_year\`
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`classReferenceId\` int NULL
        `);
    await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`class_id\` int NULL
        `);
    await queryRunner.query(`
            CREATE INDEX \`students_class_id_idx\` ON \`students\` (\`classReferenceId\`)
        `);
  }
}
