import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddMissingFulfillmentTexts1757365760442 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'FULFILLMENT.NO_EVENT_FOUND', text: 'לא נמצא אירוע בעבר שטרם בוצע עבורו מילוי' },
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
                'FULFILLMENT.NO_EVENT_FOUND'
            ])
        });
    }

}
