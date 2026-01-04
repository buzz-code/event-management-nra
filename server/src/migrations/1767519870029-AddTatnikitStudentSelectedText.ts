import { Text } from "@shared/entities/Text.entity";
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddTatnikitStudentSelectedText1767519870029 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        await textRepo.save({
            name: 'TATNIKIT.STUDENT_SELECTED',
            value: 'בחרת את החברה {name}',
            description: 'הודעת אישור על בחירת תלמידה ע"י תתניקית',
            userId: 0,
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        await textRepo.delete({ name: 'TATNIKIT.STUDENT_SELECTED' });
    }

}
