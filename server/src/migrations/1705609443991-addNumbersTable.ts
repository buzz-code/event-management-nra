import { MigrationInterface, QueryRunner } from "typeorm"

export class addNumbersTable1705609443991 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE numbers (
                id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                number VARCHAR(255) NOT NULL,
                created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
            );
        `)
        for (let i = 1; i <= 100; i++) {
            await queryRunner.query(`
                INSERT INTO numbers (number) VALUES ('${i}');
            `)
        }
        await queryRunner.query(`
            INSERT INTO numbers (number) VALUES ('0');
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE numbers;
        `)
    }

}
