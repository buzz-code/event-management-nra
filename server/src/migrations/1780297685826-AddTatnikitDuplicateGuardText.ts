import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm";

export class AddTatnikitDuplicateGuardText1780297685826 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            {
                name: 'TATNIKIT.EVENT_ALREADY_EXISTS',
                text: 'ל{name} יש כבר {eventType} בתאריך {date}. לא נוצר אירוע חדש.',
            },
        ];

        await textRepo.save(texts.map(text => ({
            name: text.name,
            value: text.text,
            description: text.text,
            userId: 0,
        })));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        await textRepo.delete({
            name: In([
                'TATNIKIT.EVENT_ALREADY_EXISTS',
            ]),
        });
    }
}
