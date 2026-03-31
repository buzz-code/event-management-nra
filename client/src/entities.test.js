// Smoke-tests every React Admin resource page. Add a <Resource> to App.jsx and it's auto-tested.
import { createResourceTests } from '@shared/utils/testing/createResourceTests';
import App from './App';

createResourceTests(App);
