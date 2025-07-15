import { createTestApp, TestAppHelper } from './helpers/test-app.helper';
import { HttpTestUtils } from './helpers/test-utils';

describe('AppController (e2e)', () => {
  let testApp: TestAppHelper;
  let httpUtils: HttpTestUtils;

  beforeAll(async () => {
    testApp = createTestApp();
    const app = await testApp.initializeApp();
    httpUtils = new HttpTestUtils(app);
  });

  afterAll(async () => {
    await testApp.cleanup();
  });

  describe('Health Check', () => {
    it('/ (GET) should return Hello World!', async () => {
      return httpUtils
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
});
