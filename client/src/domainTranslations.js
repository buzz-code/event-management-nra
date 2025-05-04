import { generalResourceFieldsTranslation } from "@shared/providers/i18nProvider"

export default {
    menu_groups: {
        events: 'אירועים',
        data: 'נתונים',
        settings: 'הגדרות',
        admin: 'ניהול',
    },
    resources: {
        // Event Management System Entities
        event: {
            name: 'אירוע |||| אירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                eventTypeReferenceId: 'סוג האירוע',
                eventDate: 'תאריך האירוע',
                'eventDate:$gte': 'תאריך האירוע מ-',
                'eventDate:$lte': 'תאריך האירוע עד-',
                location: 'מיקום',
                maxParticipants: 'מספר משתתפים מקסימלי',
                description: 'תיאור',
            }
        },
        event_type: {
            name: 'סוג אירוע |||| סוגי אירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
            }
        },
        event_note: {
            name: 'הערה לאירוע |||| הערות לאירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                eventReferenceId: 'אירוע',
                note: 'הערה',
                'note:$cont': 'חיפוש בהערה',
            }
        },
        gift: {
            name: 'מתנה |||| מתנות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                value: 'ערך',
                stock: 'מלאי',
            }
        },
        event_gift: {
            name: 'מתנה לאירוע |||| מתנות לאירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                eventReferenceId: 'אירוע',
                giftReferenceId: 'מתנה',
                quantity: 'כמות',
            }
        },
        class: {
            name: 'כיתה |||| כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                'description:$cont': 'חיפוש בתיאור',
                maxCapacity: 'קיבולת מקסימלית',
            }
        },
        student: {
            name: 'משתתף |||| משתתפים',
            fields: {
                ...generalResourceFieldsTranslation,
                first_name: 'שם פרטי',
                'first_name:$cont': 'חיפוש בשם פרטי',
                last_name: 'שם משפחה',
                'last_name:$cont': 'חיפוש בשם משפחה',
                classReferenceId: 'כיתה',
                address: 'כתובת',
                'address:$cont': 'חיפוש בכתובת',
                mother_name: 'שם האם',
                'mother_name:$cont': 'חיפוש בשם האם',
                mother_contact: 'יצירת קשר עם האם',
                'mother_contact:$cont': 'חיפוש ביצירת קשר עם האם',
                father_name: 'שם האב',
                'father_name:$cont': 'חיפוש בשם האב',
                father_contact: 'יצירת קשר עם האב',
                'father_contact:$cont': 'חיפוש ביצירת קשר עם האב',
                created_at: 'נוצר',
                updated_at: 'עודכן',
            }
        },
        teacher: {
            name: 'מארגן |||| מארגנים',
            fields: {
                ...generalResourceFieldsTranslation,
                first_name: 'שם פרטי',
                'first_name:$cont': 'חיפוש בשם פרטי',
                last_name: 'שם משפחה',
                'last_name:$cont': 'חיפוש בשם משפחה',
                created_at: 'נוצר',
                updated_at: 'עודכן',
            }
        },
        
        // Common Settings and Utilities - to keep as requested
        settings: {
            name: 'הגדרות',
            fields: {
                defaultPageSize: 'מספר שורות בטבלה',
                dashboardItems: 'הגדרות לוח מחוונים',
                'dashboardItems.resource': 'מקור נתונים',
                'dashboardItems.resourceHelperText': 'בחר את מקור הנתונים שברצונך להציג',
                'dashboardItems.yearFilterType': 'סוג סינון שנה',
                'dashboardItems.filter': 'פילטר נוסף בפורמט JSON (אופציונלי, ללא שנה)',
                'dashboardItems.title': 'כותרת',
            }
        },

        // Entities from shared/components/common-entities
        text: {
            name: 'הודעה |||| הודעות - טבלת אדמין',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                value: 'ערך',
            }
        },
        text_by_user: {
            name: 'הודעה |||| הודעות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                value: 'ערך',
            }
        },
        page: {
            name: 'הסבר למשתמשים',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'כותרת',
                value: 'תוכן',
            }
        },
        user: {
            name: 'משתמש |||| משתמשים',
            fields: {
                ...generalResourceFieldsTranslation,
                email: 'כתובת מייל',
                password: 'סיסמא',
                phoneNumber: 'מספר טלפון',
                userInfo: 'מידע על המשתמש',
                isPaid: 'האם שילם?',
                paymentMethod: 'אופן התשלום',
                mailAddressAlias: 'כתובת המייל ממנה יישלחו מיילים',
                mailAddressTitle: 'שם כתובת המייל',
                bccAddress: 'כתובת מייל לשליחת עותק',
                paymentTrackId: 'תוכנית',
                'additionalData.trialEndDate': 'תאריך חובת תשלום',
                'additionalData.customTrialMessage': 'הודעה מקדימה חובת תשלום',
                'additionalData.customTrialEndedMessage': 'הודעת סיום חובת תשלום',
            }
        },
        import_file: {
            name: 'קבצים שהועלו',
            fields: {
                ...generalResourceFieldsTranslation,
                fileName: 'שם הקובץ',
                fileSource: 'מקור הקובץ',
                entityIds: 'רשומות',
                entityName: 'סוג טבלה',
                fullSuccess: 'הצלחה',
                response: 'תגובה',
            }
        },
        mail_address: {
            name: 'כתובת מייל |||| כתובות מייל',
            fields: {
                ...generalResourceFieldsTranslation,
                alias: 'כתובת המייל',
                entity: 'טבלת יעד',
            }
        },
        audit_log: {
            name: 'נתונים שהשתנו',
            fields: {
                ...generalResourceFieldsTranslation,
                entityId: 'מזהה שורה',
                entityName: 'טבלה',
                operation: 'פעולה',
                entityData: 'המידע שהשתנה',
                isReverted: 'שוחזר',
            }
        },
        recieved_mail: {
            name: 'מיילים שהתקבלו',
            fields: {
                ...generalResourceFieldsTranslation,
                from: 'מאת',
                to: 'אל',
                subject: 'כותרת',
                body: 'תוכן',
                entityName: 'טבלת יעד',
                importFileIds: 'קבצים מצורפים',
            }
        },
        image: {
            name: 'תמונה |||| תמונות',
            fields: {
                ...generalResourceFieldsTranslation,
                fileData: 'תמונה',
                'fileData.src': 'תמונה',
                imageTarget: 'יעד',
            }
        },
        payment_track: {
            name: 'מסלול תשלום |||| מסלולי תשלום',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                monthlyPrice: 'מחיר חודשי',
                annualPrice: 'מחיר שנתי',
                studentNumberLimit: 'מספר משתתפים',
            }
        },
        yemot_call: {
            name: 'שיחה |||| שיחות',
            fields: {
                ...generalResourceFieldsTranslation,
                phone: 'מאת',
                'phone:$cont': 'מאת',
                currentStep: 'שלב נוכחי',
                hasError: 'שגיאה?',
                errorMessage: 'הודעת שגיאה',
                'errorMessage:$cont': 'הודעת שגיאה',
                history: 'שלבים',
                data: 'נתונים',
                isOpen: 'פעיל?',
                apiCallId: 'מזהה שיחה (ימות)',
            },
        }
    }
};
