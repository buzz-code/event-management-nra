import { MigrationInterface, QueryRunner } from "typeorm";

export class fixKlassType1682613070027 implements MigrationInterface {
    name = 'fixKlassType1682613070027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\` DROP FOREIGN KEY \`FK_9a2642196187f93e9fd8d20529e\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`klasses\`
            ADD CONSTRAINT \`FK_9a2642196187f93e9fd8d20529e\` FOREIGN KEY (\`klassTypeReferenceId\`) REFERENCES \`klass_types\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
