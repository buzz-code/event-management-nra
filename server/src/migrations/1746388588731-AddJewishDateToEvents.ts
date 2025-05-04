import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJewishDateToEvents1746388588731 implements MigrationInterface {
    name = 'AddJewishDateToEvents1746388588731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP FOREIGN KEY \`FK_5767c90fe7d0c96789b4e0f848b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP FOREIGN KEY \`FK_839f8cfeea5757c419a69a7ea34\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_name_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_end_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`events_start_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`grade_level\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`first_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`last_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`father_contact\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`father_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`first_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`last_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`mother_contact\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`mother_name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`note_text\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`created_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`end_date\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`start_date\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`title\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`updated_at\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`gradeLevel\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`firstName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`lastName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`firstName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`lastName\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`motherName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`motherContact\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`fatherName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`fatherContact\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`noteText\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`eventDate\` datetime NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_name_idx\` ON \`teachers\` (\`firstName\`, \`lastName\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_name_idx\` ON \`students\` (\`firstName\`, \`lastName\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_event_date_idx\` ON \`events\` (\`eventDate\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`events_event_date_idx\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`students_name_idx\` ON \`students\`
        `);
        await queryRunner.query(`
            DROP INDEX \`teachers_name_idx\` ON \`teachers\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`eventDate\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\` DROP COLUMN \`name\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\` DROP COLUMN \`noteText\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`fatherContact\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`fatherName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`motherContact\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`motherName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`lastName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\` DROP COLUMN \`firstName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`lastName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\` DROP COLUMN \`firstName\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\` DROP COLUMN \`gradeLevel\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\` DROP COLUMN \`createdAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`title\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`start_date\` datetime NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`end_date\` datetime NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_gifts\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`gifts\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`note_text\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_notes\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`mother_name\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`mother_contact\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`last_name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`first_name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`father_name\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`father_contact\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`last_name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`first_name\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`teachers\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`event_types\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`grade_level\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`classes\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\`
            ADD \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`course_paths\`
            ADD \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_start_date_idx\` ON \`events\` (\`start_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`events_end_date_idx\` ON \`events\` (\`end_date\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`students_name_idx\` ON \`students\` (\`first_name\`, \`last_name\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`teachers_name_idx\` ON \`teachers\` (\`first_name\`, \`last_name\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`events\`
            ADD CONSTRAINT \`FK_839f8cfeea5757c419a69a7ea34\` FOREIGN KEY (\`studentReferenceId\`) REFERENCES \`students\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`students\`
            ADD CONSTRAINT \`FK_5767c90fe7d0c96789b4e0f848b\` FOREIGN KEY (\`classReferenceId\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
