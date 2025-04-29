import { DEFAULT_PAGE_SIZE } from "@shared/config/settings";
import { useGetIdentity } from "react-admin";

export const useDefaultPageSize = () => {
    const { identity } = useGetIdentity();
    return getDefaultPageSize(identity);
}

export function getDefaultPageSize(identity) {
    return identity?.additionalData?.defaultPageSize || DEFAULT_PAGE_SIZE;
}

export function useLateValue() {
   const { identity } = useGetIdentity();
   return getLateValue(identity);
}

export function getLateValue(identity) {
    return identity?.additionalData?.lateValue || 0.3;
}

export const useDashboardItems = () => {
    const { identity } = useGetIdentity();
    return getDashboardItems(identity);
}

export function getDashboardItems(identity) {
    return identity?.additionalData?.dashboardItems || getDefaultDashboardItems();
}

export function getDefaultDashboardItems() {
    return [
        {
            resource: 'att_report_with_report_month',
            icon: 'List',
            yearFilterType: 'year',
            filter: {}
        },
        {
            resource: 'student_by_year',
            icon: 'List',
            yearFilterType: 'year:$cont',
            filter: {}
        }
    ];
}

export const useReportStyles = () => {
    const { identity } = useGetIdentity();
    return getReportStyles(identity);
}

export function getReportStyles(identity) {
    return identity?.additionalData?.reportStyles || [];
}

export const useReportCardSettings = () => {
    const { identity } = useGetIdentity();
    return getReportCardSettings(identity);
}

export function getReportCardSettings(identity) {
    return identity?.additionalData?.reportCardSettings || getDefaultReportCardSettings();
}

export function getDefaultReportCardSettings() {
    return {
        attendance: true,
        grades: true,
        showStudentTz: true,
        groupByKlass: false,
        hideAbsTotal: false,
        minimalReport: false,
        forceAtt: false,
        forceGrades: false,
        downComment: false,
        lastGrade: true,
        debug: true
    };
}