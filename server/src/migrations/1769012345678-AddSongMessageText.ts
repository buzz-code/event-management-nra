import { Text } from "@shared/entities/Text.entity";
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddSongMessageText1769012345678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        
        await textRepo.save({
            name: 'GENERAL.SONG_MESSAGE',
            value: 'מיד נשמע שיר בנוגע לשמחות',
            description: 'הודעה לפני השמעת שיר השמחות',
            userId: 0,
        });
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        await textRepo.delete({
            name: 'GENERAL.SONG_MESSAGE'
        });
    }

}
