import { createContext } from 'react';

export const ReportContext = createContext({});

export const defaultContextValue = {
    gradeMode: false,
    isShowLate: false,
    lesson: null,
    students: [],
    formData: {},
    resource: '',
    Datagrid: null,
    data: null,
    saveData: () => {},
    handleSuccess: () => {},
    handleCancel: () => {},
};
