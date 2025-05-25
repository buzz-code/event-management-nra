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
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                teacherTz: 'מורה אחראית',
                teacherReferenceId: 'מורה אחראית',
                eventTypeReferenceId: 'סוג האירוע',
                eventTypeId: 'סוג האירוע',
                levelTypeReferenceId: 'סוג רמה',
                levelTypeId: 'סוג רמה',
                studentClassReferenceId: 'כיתה',
                description: 'תיאור',
                eventDate: 'תאריך האירוע',
                'eventDate:$gte': 'תאריך האירוע מ-',
                'eventDate:$lte': 'תאריך האירוע עד-',
                eventHebrewDate: 'תאריך עברי',
                eventHebrewMonth: 'חודש עברי',
                'eventHebrewMonth:$cont': 'חודש עברי',
                completed: 'הושלם?',
                grade: 'ציון',
                newNote: 'הערה חדשה',
            }
        },
        event_type: {
            name: 'סוג אירוע |||| סוגי אירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
            }
        },
        level_type: {
            name: 'סוג רמה |||| סוגי רמה',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
                'description:$cont': 'חיפוש בתיאור',
            }
        },
        event_note: {
            name: 'הערה לאירוע |||| הערות לאירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                eventReferenceId: 'אירוע',
                noteText: 'הערה',
                'noteText:$cont': 'חיפוש בהערה',
            }
        },
        gift: {
            name: 'מתנה |||| מתנות',
            fields: {
                ...generalResourceFieldsTranslation,
                description: 'תיאור',
            }
        },
        event_gift: {
            name: 'מתנה לאירוע |||| מתנות לאירועים',
            fields: {
                ...generalResourceFieldsTranslation,
                eventReferenceId: 'אירוע',
                giftReferenceId: 'מתנה',
                giftKey: 'מפתח מתנה',
            }
        },
        class: {
            name: 'כיתה |||| כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                gradeLevel: 'שכבה',
                'gradeLevel:$cont': 'חיפוש בשכבה',
            }
        },
        student_class: {
            name: 'שיוך תלמיד לכיתה |||| שיוכי תלמידים לכיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentReferenceId: 'תלמיד',
                studentTz: 'תלמיד',
                classReferenceId: 'כיתה',
                classKey: 'כיתה',
            }
        },
        student_by_year: {
            name: 'תלמידה לפי שנה |||| תלמידות לפי שנים',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'ת.ז. תלמיד',
                studentName: 'שם תלמיד',
                'studentName:$cont': 'שם תלמיד',
                year: 'שנה',
                classNames: 'שמות כיתות',
                classReferenceIds: 'מזהי כיתות',
            }
        },
        student: {
            name: 'תלמידה |||| תלמידות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תעודת זהות',
                address: 'כתובת',
                'address:$cont': 'חיפוש בכתובת',
                motherName: 'שם האם',
                'motherName:$cont': 'חיפוש בשם האם',
                motherContact: 'יצירת קשר עם האם',
                'motherContact:$cont': 'חיפוש ביצירת קשר עם האם',
                fatherName: 'שם האב',
                'fatherName:$cont': 'חיפוש בשם האב',
                fatherContact: 'יצירת קשר עם האב',
                'fatherContact:$cont': 'חיפוש ביצירת קשר עם האב',
                motherPreviousName: 'שם משפחה קודם של האם',
                'motherPreviousName:$cont': 'חיפוש בשם משפחה קודם של האם',
            }
        },
        teacher: {
            name: 'מורה |||| מורות',
            fields: {
                ...generalResourceFieldsTranslation,
                ownUserId: 'משתמש משויך',
                tz: 'תעודת זהות',
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
                maintainanceMessage: 'הודעה לסגירת המערכת הטלפונית',
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
                effective_id: 'משויך למשתמש',
                permissions: 'הרשאות',
                additionalData: 'נתונים נוספים',
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
