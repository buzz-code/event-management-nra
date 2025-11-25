import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddTatnikiotTexts1764064662253 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'TATNIKIT.WELCOME', text: 'שלום {name}, זוהית כתתניקית.' },
            { name: 'TATNIKIT.MENU', text: 'לדיווח עבור עצמך הקישי 1, לדיווח על שמחות הכיתה הקישי 2' },
            { name: 'TATNIKIT.ENTER_STUDENT_TZ', text: 'הקישי את מספר הזהות של התלמידה' },
            { name: 'TATNIKIT.STUDENT_NOT_IN_CLASS', text: 'התלמידה לא נמצאת בכיתה שלך' },
            { name: 'TATNIKIT.EVENT_EXISTS', text: 'ל{name} יש {eventType} בתאריך {date}. לאישור הקישי 1, לדיווח אחר הקישי 2' },
            { name: 'TATNIKIT.EVENT_CONFIRMED', text: 'האירוע אושר בהצלחה' },
            { name: 'TATNIKIT.EVENT_SAVED', text: 'האירוע נשמר בהצלחה' },
            { name: 'TATNIKIT.ANOTHER_STUDENT', text: 'לדיווח על תלמידה נוספת הקישי 1, לסיום הקישי 2' },
            { name: 'TATNIKIT.GOODBYE', text: 'תודה על הדיווח, להתראות' },
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
                'TATNIKIT.WELCOME',
                'TATNIKIT.MENU',
                'TATNIKIT.ENTER_STUDENT_TZ',
                'TATNIKIT.STUDENT_NOT_IN_CLASS',
                'TATNIKIT.EVENT_EXISTS',
                'TATNIKIT.EVENT_CONFIRMED',
                'TATNIKIT.EVENT_SAVED',
                'TATNIKIT.ANOTHER_STUDENT',
                'TATNIKIT.GOODBYE',
            ])
        });
    }

}
