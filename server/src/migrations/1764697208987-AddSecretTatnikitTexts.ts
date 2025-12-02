import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddSecretTatnikitTexts1764697208987 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'TATNIKIT.ENTER_YOUR_TZ', text: 'נא להקיש את מספר הזהות שלך' },
            { name: 'TATNIKIT.NO_CLASS_FOUND', text: 'לא נמצאה כיתה עבורך בשנה הנוכחית' },
            { name: 'GENERAL.GOODBYE', text: 'להתראות' },
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
                'TATNIKIT.ENTER_YOUR_TZ',
                'TATNIKIT.NO_CLASS_FOUND',
                'GENERAL.GOODBYE',
            ])
        });
    }

}
