import { useGetIdentity } from "react-admin";

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
          resource: 'event',
          icon: 'List',
          title: 'אירועים מתוכננים',
          yearFilterType: 'year',
          filter: { 'eventDate:$gte': new Date().toISOString().split('T')[0] }
      },
      {
          resource: 'student_by_year',
          icon: 'Person',
          title: 'משתתפים',
          yearFilterType: 'year',
          filter: {}
      },
      {
          resource: 'event_gift',
          icon: 'List',
          title: 'מתנות באירועים',
          yearFilterType: 'year',
          filter: {}
      },
      {
          resource: 'event_note',
          icon: 'List',
          title: 'הערות לאירועים',
          yearFilterType: 'year',
          filter: {}
      }
  ];
}

export const useMaintainanceMessage = () => {
  const { identity } = useGetIdentity();
  return getMaintainanceMessage(identity);
}

export function getMaintainanceMessage(identity) {
  return identity?.additionalData?.maintainanceMessage || '';
}
