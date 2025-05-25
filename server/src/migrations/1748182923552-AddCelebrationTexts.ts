import { Text } from "@shared/entities/Text.entity";
import { In, MigrationInterface, QueryRunner } from "typeorm"

export class AddCelebrationTexts1748182923552 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const textRepo = queryRunner.manager.getRepository(Text);
        const texts = [
            { name: 'CELEBRATIONS.WELCOME', text: 'ברוכות הבאות למערכת שמיעת שמחות הכיתה' },
            { name: 'CELEBRATIONS.GRADE_PROMPT', text: 'נא להקיש את מספר השכבה: ט 9, י 10, יא 11, יב 12' },
            { name: 'CELEBRATIONS.INVALID_GRADE', text: 'שכבה לא חוקית, נא לנסות שוב' },
            { name: 'CELEBRATIONS.CLASS_PROMPT', text: 'נא להקיש את מספר הכיתה' },
            { name: 'CELEBRATIONS.INVALID_CLASS', text: 'מספר כיתה לא חוקי, נא לנסות שוב' },
            { name: 'CELEBRATIONS.MONTH_PROMPT', text: 'נא להקיש את מספר החודש מ-1 עד 12' },
            { name: 'CELEBRATIONS.INVALID_MONTH', text: 'חודש לא חוקי, נא לנסות שוב' },
            { name: 'CELEBRATIONS.CLASS_NOT_FOUND', text: 'לא נמצאה כיתה זו במערכת' },
            { name: 'CELEBRATIONS.NO_CELEBRATIONS_FOUND', text: 'לא נמצאו שמחות עבור כיתה {className} בחודש {month}' },
            { name: 'CELEBRATIONS.READING_START', text: 'שמחות כיתה {className} לחודש {month}, סה״כ {count} שמחות' },
            { name: 'CELEBRATIONS.STUDENT_NAME', text: 'התלמידה {name}' },
            { name: 'CELEBRATIONS.EVENT_DETAIL', text: '{eventType} בתאריך {date}' },
            { name: 'CELEBRATIONS.READING_COMPLETE', text: 'סיום שמיעת השמחות' },
            { name: 'CELEBRATIONS.GOODBYE', text: 'תודה על השימוש במערכת, יום טוב' }
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
                'CELEBRATIONS.WELCOME',
                'CELEBRATIONS.GRADE_PROMPT',
                'CELEBRATIONS.INVALID_GRADE',
                'CELEBRATIONS.CLASS_PROMPT',
                'CELEBRATIONS.INVALID_CLASS',
                'CELEBRATIONS.MONTH_PROMPT',
                'CELEBRATIONS.INVALID_MONTH',
                'CELEBRATIONS.CLASS_NOT_FOUND',
                'CELEBRATIONS.NO_CELEBRATIONS_FOUND',
                'CELEBRATIONS.READING_START',
                'CELEBRATIONS.STUDENT_NAME',
                'CELEBRATIONS.EVENT_DETAIL',
                'CELEBRATIONS.READING_COMPLETE',
                'CELEBRATIONS.GOODBYE'
            ])
        });
    }

}
