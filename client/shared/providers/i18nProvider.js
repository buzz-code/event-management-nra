import polyglotI18nProvider from 'ra-i18n-polyglot';
import en from 'ra-language-english';
import he from 'ra-language-hebrew-il';
import { deepMerge } from '@shared/utils/deepMerge';

export const generalResourceFieldsTranslation = {
    id: 'מזהה',
    key: 'מפתח',
    name: 'שם',
    userId: 'משתמש',
    createdAt: 'תאריך יצירה',
    updatedAt: 'תאריך עדכון',
    'name:$cont': 'שם',
    'createdAt:$gte': 'נוצר אחרי',
    'createdAt:$lte': 'נוצר לפני',
    'updatedAt:$gte': 'עודכן אחרי',
    'updatedAt:$lte': 'עודכן לפני',
    year: 'שנה',
}

const extendedTranslation = {
    ra: {
        action: {
            clear_array_input: 'נקה רשימה',
            create_item: 'צור %{item}',
            remove_all_filters: 'איפוס כל הפילטרים',
            select_all: 'בחירת הכל',
            select_row: 'בחירת רשומה',
            update: 'עדכון',
            move_up: 'העברה מעלה',
            move_down: 'העברה מטה',
            open: 'פתיחה',
            toggle_theme: 'החלפת ערכת נושא',
            select_columns: 'עמודות',
            update_application: 'טען מחדש את האפליקציה',
            import: 'ייבא',
            import_again: 'ייבא שוב',
            export_excel: 'אקסל',
            export_pdf: 'pdf',
            export_json: 'json',
            hangup: 'נתק שיחה',
            show_matching_records: 'הצג רשומות קשורות',
            save_and_add: 'שמור והוסף',
            impersonate: 'התחזות למשתמש',
        },
        page: {
            access_denied: 'הגישה נדחתה',
            authentication_error: 'שגיאת אימות',
        },
        message: {
            auth_error: 'אירעה שגיאה בעת אימות הטוקן.',
            bulk_update_content: 'האם אתה בטוח שברצונך לעדכן %{name}? |||| האם אתה בטוח שברצונך לעדכן רשומות %{smart_count}?',
            bulk_update_title: 'עדכון %{name} |||| עדכון %{smart_count} %{name}',
            clear_array_input: 'האם אתה בטוח שברצונך למחוק את כל הרשימה?',
            access_denied: "אין לך את ההרשאות המתאימות לגשת לדף זה",
            authentication_error: 'שרת האימות החזיר שגיאה ולא ניתן היה לבדוק את האישורים שלך.',
            import_title: 'ייבוא רשומות',
            import_success: 'הייבוא הסתיים בהצלחה',
            import_partial_error: 'הייבוא הסתיים עם שגיאות',
            import_error: 'הייבוא נכשל',
            report_generation_success: 'הקובץ הופק בהצלחה',
            action_success: 'בוצע בהצלחה',
            no_options: 'לא נמצאו פריטים',
            pending: 'בתהליך',
            lesson_not_found: 'השיעור לא נמצא, או שאין תלמידות משוייכות לשיעור',
        },
        navigation: {
            clear_filters: 'נקה מסננים',
            no_filtered_results: 'לא נמצאו %{name} עם המסננים הנוכחיים.',
            partial_page_range_info: '%{offsetBegin}-%{offsetEnd} מתוך יותר מ %{offsetEnd}',
            current_page: 'עמוד %{page}',
            page: 'לעמוד %{page}',
            first: 'לעמוד הראשון',
            last: 'לעמוד האחרון',
            page_rows_per_page: 'מספר רשומות בעמוד:',
            skip_nav: 'דלג לתוכן',
        },
        auth: {
            not_authorized: 'אינך מורשה לגשת למשאב זה.',
            application_update_available: 'גרסה חדשה זמינה.',
            sign_in_invitation: 'כבר יש לך חשבון? התחברות',
            sign_up_invitation: 'עדיין אין לך חשבון? הרשמה',
            sign_up: 'רישום',
            password_confirm: 'אימות סיסמא',
            user_info_header: 'מידע עליך',
            name: 'שם',
            role: 'תפקידך במוסד',
            phone: 'טלפון',
            email: 'כתובת מייל',
            organization_name: 'שם המוסד',
            organization_address: 'כתובת המוסד',
            organization_phone: 'טלפון',
            user_organization_info_header: 'מידע על המוסד שלך',
        },
        notification: {
            not_authorized: "אין לך הרשאה לצפות בנתונים אלו.",
            application_update_available: 'גרסה חדשה זמינה.',
        },
        validation: {
            valueConfirm: 'ערך לא תואם',
            unique: 'ערך קיים כבר',
            minValue: 'ערך לא יכול להיות קטן מ-%{min}',
        },
        saved_queries: {
            label: 'שאילתות שנשמרו',
            query_name: 'שם שאילתה',
            new_label: 'שמור שאילתא נוכחית...',
            new_dialog_title: 'שמור שאילתא נוכחית בשם',
            remove_label: 'הסרת שאילתא',
            remove_label_with_name: 'הסרת שאילתא "%{name}"',
            remove_dialog_title: 'להסיר שאילתא שמורה?',
            remove_message: 'האם אתה בטוח שברצונך להסיר את השאילתה השמורה?',
            help: 'סנן את הרשימה ושמור את השאילתא',
        },
        configurable: {
            customize: 'התאמה אישית',
            configureMode: 'התאמה אישית של העמוד',
            inspector: {
                title: 'בחר',
                content: 'רחף על אלמנט כדי לבחור',
                reset: 'איפוס הגדרות',
                hideAll: 'הסתר הכל',
                showAll: 'הצג הכל',
            },
            Datagrid: {
                title: 'טבלת נתונים',
                unlabeled: 'עמודה ללא תווית #%{column}',
            },
            SimpleForm: {
                title: 'טופס',
                unlabeled: 'שדה ללא תווית #%{input}',
            },
            SimpleList: {
                title: 'רשימה',
                primaryText: 'טקסט ראשי',
                secondaryText: 'טקסט משני',
                tertiaryText: 'טקסט שלישי',
            },
        },
        page: {
            empty: 'אין %{name} עדיין.',
            invite: 'האם ברצונך להוסיף?',
        },
        bulk_request: {
            params_dialog_title: 'פרמטרים נוספים',
        },
        yemot_simulator: {
            step_success: 'התקבל בהצלחה, אפשר להמשיך בתהליך',
        }
    }
}

export const getI18nProvider = (domainTranslations, isDummy = false) => {
    if (isDummy) {
        return {
            translate: key => key,
            changeLocale: locale => Promise.resolve(),
            getLocale: () => 'en',
        };
    }

    const translations = { en, he: deepMerge(he, deepMerge(extendedTranslation, domainTranslations)) };

    const i18nProvider = polyglotI18nProvider(
        locale => translations[locale],
        'he', // default locale
        [{ locale: 'en', name: 'English' }, { locale: 'he', name: 'עברית' }],
    );

    return i18nProvider;
}
