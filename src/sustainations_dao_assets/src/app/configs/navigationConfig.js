import i18next from 'i18next';
import ar from './navigation-i18n/ar';
import en from './navigation-i18n/en';
import tr from './navigation-i18n/tr';
import authRoles from '../auth/authRoles';

i18next.addResourceBundle("en", "navigation", en);
i18next.addResourceBundle("tr", "navigation", tr);
i18next.addResourceBundle("ar", "navigation", ar);

const navigationConfig = [
  // {
  //   id: 'workspac3',
  //   title: 'Workspac3',
  //   type: 'collapse',
  //   icon: 'workspaces_outlined',
  //   children: [
  //     {
  //       id: 'workspac3-scrumboard',
  //       title: 'Scrumboard',
  //       type: 'item',
  //       icon: 'view_column_outlined',
  //       url: '/workspac3/scrumboard/boards'
  //     },
  //     {
  //       id: 'workspac3-note',
  //       title: 'Notes',
  //       type: 'item',
  //       icon: 'event_note_outlined',
  //       url: '/workspac3/notes'
  //     }
  //   ]
  // },
  {
    id: 'kyc',
    title: 'KYC',
    type: 'item',
    icon: 'security',
    url: '/kyc',
  },
  {
    id: "admin",
    title: "Admin",
    type: "group",
    icon: "heroicons-outline:home",
    auth: authRoles.admin,
    children: [
      {
        id: "admin-kycs",
        title: "KYCs",
        type: "item",
        icon: "admin_panel_settings",
        url: "admin/kycs"
      },
    ]
  },
];

export default navigationConfig;
