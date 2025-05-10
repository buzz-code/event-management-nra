import { BaseEntityModuleOptions } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { EventGift } from "src/db/entities/EventGift.entity";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: EventGift,
        query: {
            join: {
                event: { eager: false },
                gift: { eager: true }
            }
        },
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'event.title', label: 'כותרת אירוע' },
                    { value: 'gift.name', label: 'שם מתנה' },
                ];
            }
        }
    }
}

export default getConfig();