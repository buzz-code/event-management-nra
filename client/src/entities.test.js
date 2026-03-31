// entities.test.js
// Smoke-tests every React Admin resource page in this app.
// Adding a new <Resource> to App.jsx automatically gets tested — no edits needed here.

// These mocks MUST be in this file (not in createResourceTests) because
// jest.mock() calls are hoisted to the top of the file by Babel.

jest.mock('@shared/providers/dataProvider', () => ({
  getList: () => Promise.resolve({ data: [], total: 0 }),
  getOne: () => Promise.resolve({ data: {} }),
  getMany: () => Promise.resolve({ data: [] }),
  getManyReference: () => Promise.resolve({ data: [], total: 0 }),
  create: () => Promise.resolve({ data: {} }),
  update: () => Promise.resolve({ data: {} }),
  updateMany: () => Promise.resolve({ data: [] }),
  delete: () => Promise.resolve({ data: {} }),
  deleteMany: () => Promise.resolve({ data: [] }),
}));

jest.mock('@shared/providers/authProvider', () => ({
  checkAuth: () => Promise.resolve(),
  // Return { admin: true } so permissionsUtil.isAdmin() returns true,
  // which gates the admin view and shows all resources in the sidebar.
  getPermissions: () => Promise.resolve({ admin: true }),
  getIdentity: () => Promise.resolve({ id: 1, fullName: 'Test User' }),
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  checkError: () => Promise.resolve(),
}));

import App from './App';
import { createResourceTests } from '@shared/utils/testing/createResourceTests';

createResourceTests(App);
