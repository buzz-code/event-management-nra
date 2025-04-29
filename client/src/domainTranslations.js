import { generalResourceFieldsTranslation } from "@shared/providers/i18nProvider"

export default {
    menu_groups: {
        data: 'נתונים',
        report: 'דוחות',
        settings: 'הגדרות',
        admin: 'ניהול',
    },
    resources: {
        settings: {
            name: 'הגדרות',
            fields: {
                defaultPageSize: 'מספר שורות בטבלה',
                lateValue: 'שווי איחור',
                dashboardItems: 'הגדרות לוח מחוונים',
                'dashboardItems.resource': 'מקור נתונים',
                'dashboardItems.resourceHelperText': 'בחר את מקור הנתונים שברצונך להציג',
                'dashboardItems.yearFilterType': 'סוג סינון שנה',
                'dashboardItems.filter': 'פילטר נוסף בפורמט JSON (אופציונלי, ללא שנה)',
                'dashboardItems.title': 'כותרת',
                reportStyles: 'הגדרות עיצוב תעודה',
                'reportStyles.type': 'סוג טקסט',
                'reportStyles.fontFamily': 'גופן',
                'reportStyles.fontSize': 'גודל גופן',
                'reportStyles.isBold': 'מודגש',
                'reportStyles.isItalic': 'נטוי',
                reportCardSettings: 'הגדרות ברירת מחדל לתעודה',
                'reportCardSettings.attendance': 'הצג נוכחות',
                'reportCardSettings.grades': 'הצג ציונים',
                'reportCardSettings.showStudentTz': 'הצג תעודת זהות',
                'reportCardSettings.groupByKlass': 'קבץ לפי כיתה',
                'reportCardSettings.hideAbsTotal': 'הסתר סיכום כללי',
                'reportCardSettings.minimalReport': 'הצג רק סיכום כללי',
                'reportCardSettings.forceAtt': 'הצג רק שורות שכוללות נוכחות',
                'reportCardSettings.forceGrades': 'הצג רק שורות שכוללות ציונים',
                'reportCardSettings.downComment': 'הצג הערה מתחת שם תלמידה',
                'reportCardSettings.lastGrade': 'חשב ציון אחרון',
                'reportCardSettings.debug': 'הצג פירוט',
            }
        },
        att_report: {
            name: 'רשומת נוכחות |||| נוכחות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                'studentBaseKlass.klassName': 'כיתת בסיס',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
                'klass.klassTypeReferenceId': 'שיוך כיתה',
                lessonId: 'שיעור',
                lessonReferenceId: 'שיעור',
                reportDate: 'תאריך דיווח',
                howManyLessons: 'מספר שיעורים',
                absCount: 'חיסורים',
                approvedAbsCount: 'חיסורים מאושרים',
                comments: 'הערה',
                sheetName: 'חודש דיווח',
            }
        },
        att_report_with_report_month: {
            name: 'רשומת נוכחות |||| נוכחות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                'studentBaseKlass.klassName': 'כיתת בסיס',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
                'klass.klassTypeReferenceId': 'שיוך כיתה',
                lessonId: 'שיעור',
                lessonReferenceId: 'שיעור',
                reportMonthReferenceId: 'חודש דיווח',
                reportDate: 'תאריך דיווח',
                howManyLessons: 'מספר שיעורים',
                absCount: 'חיסורים',
                approvedAbsCount: 'חיסורים מאושרים',
                comments: 'הערה',
                sheetName: 'חודש דיווח',
            }
        },
        grade: {
            name: 'רשומת ציונים |||| ציונים',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                'studentBaseKlass.klassName': 'כיתת בסיס',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
                lessonId: 'שיעור',
                lessonReferenceId: 'שיעור',
                reportDate: 'תאריך דיווח',
                howManyLessons: 'מספר שיעורים',
                grade: 'ציון',
                estimation: 'הערכה',
                comments: 'הערה',
            }
        },
        klass: {
            name: 'כיתה |||| כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                displayName: 'שם לתעודה',
                klassTypeId: 'שיוך כיתה',
                klassTypeReferenceId: 'שיוך כיתה',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
            }
        },
        klass_type: {
            name: 'שיוך כיתה |||| שיוך כיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                klassTypeEnum: 'סוג כיתה בדו"ח',
                teacherId: 'מורה אחראית',
                teacherReferenceId: 'מורה אחראית',
            }
        },
        known_absence: {
            name: 'חיסור מאושר |||| חיסורים מאושרים',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
                lessonId: 'שיעור',
                lessonReferenceId: 'שיעור',
                reportDate: 'תאריך דיווח',
                absnceCount: 'מספר חיסורים',
                absnceCode: 'קוד חיסור',
                senderName: 'שולחת',
                reason: 'סיבה',
                comment: 'הערה',
                isApproved: 'מאושר',
            }
        },
        lesson: {
            name: 'שיעור |||| שיעורים',
            fields: {
                ...generalResourceFieldsTranslation,
                klasses: 'כיתות',
                klassReferenceIds: 'כיתות',
                teacherId: 'מורה',
                teacherReferenceId: 'מורה',
                startDate: 'תאריך התחלה',
                endDate: 'תאריך סיום',
                comment: 'הערה',
                howManyLessons: 'מספר שיעורים',
                displayName: 'שם לתעודה',
                order: 'סדר',
            }
        },
        student_klass: {
            name: 'רשומת שיוך תלמידות לכיתות |||| שיוך תלמידות לכיתות',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                klassId: 'כיתה',
                klassReferenceId: 'כיתה',
            }
        },
        student: {
            name: 'תלמידה |||| תלמידות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                comment: 'הערה',
                phone: 'טלפון',
                address: 'כתובת',
            }
        },
        student_by_year: {
            name: 'תלמידה |||| תלמידות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                year: 'שנה',
            }
        },
        teacher: {
            name: 'מורה |||| מורות',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                phone: 'טלפון',
                phone2: 'טלפון 2',
                email: 'כתובת מייל',
                displayName: 'שם לתעודה'
            }
        },
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
        },
        student_klass_report: {
            name: 'דוח שיוך תלמידה',
            fields: {
                ...generalResourceFieldsTranslation,
                studentTz: 'תלמידה',
                studentReferenceId: 'תלמידה',
                klassReferenceId1: 'כיתת אם',
                'klassReferenceId1:$cont': 'כיתת אם',
                klassReferenceId2: 'מסלול',
                'klassReferenceId2:$cont': 'מסלול',
                klassReferenceId3: 'התמחות',
                'klassReferenceId3:$cont': 'התמחות',
                klassReferenceIdNull: 'אחר',
                'klassReferenceIdNull:$cont': 'אחר',
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
        'student_by_year/pivot?extra.pivot=StudentAttendance': {
            name: 'דוח נוכחות (פיבוט)',
            fields: {
                ...generalResourceFieldsTranslation,
                tz: 'תז',
                'extra.klassId': 'כיתה',
                'extra.lessonId': 'שיעור',
                'year:$cont': 'שנה',
                'klassReferenceIds:$cont': 'כיתה',
                'klassTypeReferenceIds:$cont': 'שיוך כיתה',
            }
        },
        report_month: {
            name: 'תקופות דיווח',
            fields: {
                ...generalResourceFieldsTranslation,
                startDate: 'תאריך התחלה',
                endDate: 'תאריך סיום',
                semester: 'מחצית',
            }
        },
        teacher_report_status: {
            name: 'דיווחים למורה',
            fields: {
                ...generalResourceFieldsTranslation,
                teacherReferenceId: 'מורה',
                teacherComment: 'הערת מורה',
                reportMonthReferenceId: 'תקופת דיווח',
                reportedLessons: 'שיעורים שדווחו',
                notReportedLessons: 'שיעורים שלא דווחו',
            }
        },
        teacher_grade_report_status: {
            name: 'ציונים למורה',
            fields: {
                ...generalResourceFieldsTranslation,
                teacherReferenceId: 'מורה',
                teacherComment: 'הערת מורה',
                reportMonthReferenceId: 'תקופת דיווח',
                reportedLessons: 'שיעורים שדווחו',
                notReportedLessons: 'שיעורים שלא דווחו',
            }
        },
        student_percent_report: {
            name: 'דוח אחוזים כללי',
            fields: {
                ...generalResourceFieldsTranslation,
                studentReferenceId: 'תלמידה',
                teacherReferenceId: 'מורה',
                klassReferenceId: 'כיתה',
                lessonReferenceId: 'שיעור',
                lessonsCount: 'סיכום מספר שיעורים',
                absCount: 'סיכום מספר חיסורים',
                absPercents: 'אחוז חיסור',
                attPercents: 'אחוז נוכחות',
                gradeAvg: 'ציון ממוצע',
            }
        },
        'student_percent_report/pivot?extra.pivot=PercentReportWithDates': {
            name: 'דוח אחוזים לתלמידה',
            fields: {
                ...generalResourceFieldsTranslation,
                studentReferenceId: 'תלמידה',
                teacherReferenceId: 'מורה',
                klassReferenceId: 'כיתה',
                'klass.klassTypeReferenceId': 'שיוך כיתה',
                'studentBaseKlass.klassName': 'כיתת בסיס',
                lessonReferenceId: 'שיעור',
                lessonsCount: 'סיכום מספר שיעורים',
                absCount: 'סיכום מספר חיסורים',
                approvedAbsCount: 'מספר חיסורים מאושרים',
                absPercents: 'אחוז חיסור',
                attPercents: 'אחוז נוכחות',
                gradeAvg: 'ציון ממוצע',
                attGradeEffect: 'קשר נוכחות ציון',
                finalGrade: 'ציון סופי',
                estimation: 'הערכה',
                comments: 'הערה',
                estimatedAbsPercents: 'אחוז חיסור משוער',
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
                studentNumberLimit: 'מספר תלמידות',
            }
        },
        teacher_salary_report: {
            name: 'דוח שכר למורה',
            fields: {
                ...generalResourceFieldsTranslation,
                teacherReferenceId: 'מורה',
                lessonReferenceId: 'שיעור',
                klassReferenceId: 'כיתה',
                'klass.klassTypeReferenceId': 'שיוך כיתה',
                reportMonthReferenceId: 'תקופת דיווח',
                howManyLessons: 'מספר שיעורים',
            }
        },
        grade_name: {
            name: 'שם ציון |||| שמות ציונים',
            fields: {
                ...generalResourceFieldsTranslation,
            }
        },
        att_grade_effect: {
            name: 'קשר נוכחות ציון',
            fields: {
                ...generalResourceFieldsTranslation,
                percents: 'אחוז נוכחות',
                count: 'מספר חיסורים',
                effect: 'השפעה',
            }
        },
        grade_effect_by_user: {
            name: 'קשר נוכחות ציון מורחב',
            fields: {
                ...generalResourceFieldsTranslation,
                number: 'אחוז חיסור',
                effect: 'השפעה',
            }
        },
        abs_count_effect_by_user: {
            name: 'קשר נוכחות חיסור מורחב',
            fields: {
                ...generalResourceFieldsTranslation,
                number: 'מספר חיסורים',
                effect: 'השפעה',
            }
        },
    }
};
