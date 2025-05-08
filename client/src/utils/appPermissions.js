import { useHasPermission, hasPermissionLogic } from '@shared/utils/permissionsUtil';

export const appPermissions = {
  teacher: 'teacher',
};

export const isTeacher = (permissions) => hasPermissionLogic(permissions, appPermissions.teacher);
export const useIsTeacher = () => useHasPermission(appPermissions.teacher);
