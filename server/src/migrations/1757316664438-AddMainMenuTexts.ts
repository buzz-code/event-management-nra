import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddMainMenuTexts1757316664438 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'GENERAL.MAIN_MENU', text: 'לדיווח אירוע חדש הקישי 1, לבירור הזמנת מתנות הקישי 2' },
            { name: 'EVENT.FULFILLMENT_UNAVAILABLE', text: 'אפשרות בירור הזמנת מתנות אינה זמינה כרגע. אנא פנה למנהל המערכת.' },
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
                'GENERAL.MAIN_MENU',
                'EVENT.FULFILLMENT_UNAVAILABLE'
            ])
        });
    }

}
