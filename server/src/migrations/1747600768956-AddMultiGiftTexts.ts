import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddMultiGiftTexts1747600768956 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'EVENT.ADDITIONAL_GIFT_SELECTION', text: 'נא לבחור מתנה נוספת {options}' },
            { name: 'EVENT.SELECT_ANOTHER_GIFT', text: 'האם ברצונך לבחור מתנה נוספת? {yes} {no}' },
            { name: 'EVENT.CONFIRM_GIFTS', text: 'המתנות שבחרת הן: {gifts}, סה״כ {count} מתנות, לאישור {yes} לשינוי {no}' },
            { name: 'EVENT.GIFTS_ADDED', text: 'נוספו {count} מתנות בהצלחה' },
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
                'EVENT.ADDITIONAL_GIFT_SELECTION',
                'EVENT.SELECT_ANOTHER_GIFT',
                'EVENT.CONFIRM_GIFTS',
                'EVENT.GIFTS_ADDED'
            ])
        });
    }

}
