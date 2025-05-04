import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { EventNote } from "src/db/entities/EventNote.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: EventNote,
        query: {
            join: {
                event: { eager: false },
                author: { eager: false }
            }
        },
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'note_text', label: 'טקסט הערה' },
                    { value: 'event.title', label: 'כותרת אירוע' },
                    { value: 'author.username', label: 'מחבר' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        }
    }
}

export default getConfig();