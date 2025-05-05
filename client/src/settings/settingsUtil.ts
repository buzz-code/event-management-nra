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
          yearFilterType: 'none',
          filter: { 'eventDate:$gte': new Date().toISOString().split('T')[0] }
      },
      {
          resource: 'student',
          icon: 'Person',
          title: 'משתתפים',
          yearFilterType: 'none',
          filter: {}
      },
      {
          resource: 'event_gift',
          icon: 'List',
          title: 'מתנות באירועים',
          yearFilterType: 'none',
          filter: {}
      },
      {
          resource: 'event_note',
          icon: 'List',
          title: 'הערות לאירועים',
          yearFilterType: 'none',
          filter: {}
      }
  ];
}
