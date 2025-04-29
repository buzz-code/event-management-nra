import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { EventGift } from "src/db/entities/EventGift.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: EventGift,
        query: {
            join: {
                event: {},
                gift: {}
            }
        },
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'event.title', label: 'כותרת אירוע' },
                    { value: 'gift.name', label: 'שם מתנה' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        }
    }
}

export default getConfig();