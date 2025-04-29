import authProvider from '../authProvider';
import { fetchJson } from '@shared/utils/httpUtil';
import { apiUrl } from '@shared/providers/constantsProvider';

// Mock dependencies
jest.mock('@shared/utils/httpUtil', () => ({
  fetchJson: jest.fn(),
}));

describe('authProvider', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };

  // Save original location
  const originalLocation = window.location;

  beforeEach(() => {
    // Setup localStorage mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Setup location mock
    delete window.location;
    window.location = new URL('http://localhost');

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  describe('login', () => {
    const loginData = { username: 'test', password: 'password' };

    it('successfully logs in and gets identity', async () => {
      const identityData = { id: 1, fullName: 'Test User', permissions: ['admin'] };

      fetchJson
        .mockResolvedValueOnce({ status: 200 }) // login response
        .mockResolvedValueOnce({ json: { name: identityData.fullName, ...identityData } }); // getIdentity response

      await authProvider.login(loginData);

      expect(fetchJson).toHaveBeenNthCalledWith(1, `${apiUrl}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginData),
        headers: expect.any(Headers),
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth',
        expect.stringContaining('Test User')
      );
    });

    it('throws error on failed login', async () => {
      const errorMessage = 'Invalid credentials';
      fetchJson.mockRejectedValueOnce({ body: { message: errorMessage } });

      await expect(authProvider.login(loginData)).rejects.toThrow(errorMessage);
    });

    it('throws generic error on network failure', async () => {
      fetchJson.mockRejectedValueOnce({});

      await expect(authProvider.login(loginData)).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    const registerData = {
      username: 'newuser',
      password: 'password',
      userInfo: { name: 'New User' },
    };

    it('successfully registers and gets identity', async () => {
      const identityData = { id: 1, fullName: 'New User', permissions: ['user'] };

      fetchJson
        .mockResolvedValueOnce({ status: 200 }) // register response
        .mockResolvedValueOnce({ json: { name: identityData.fullName, ...identityData } }); // getIdentity response

      await authProvider.register(registerData);

      expect(fetchJson).toHaveBeenNthCalledWith(1, `${apiUrl}/auth/register`, {
        method: 'POST',
        body: JSON.stringify(registerData),
        headers: expect.any(Headers),
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(
        'auth',
        expect.stringContaining('New User')
      );
    });

    it('throws error on failed registration', async () => {
      const errorMessage = 'Username already exists';
      fetchJson.mockRejectedValueOnce({ body: { message: errorMessage } });

      await expect(authProvider.register(registerData)).rejects.toThrow(errorMessage);
    });
  });

  describe('logout', () => {
    it('handles normal logout', async () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ impersonated: false }));
      fetchJson.mockResolvedValueOnce({});

      await authProvider.logout();

      expect(fetchJson).toHaveBeenCalledWith(`${apiUrl}/auth/logout`, { method: 'POST' });
      expect(localStorage.removeItem).toHaveBeenCalledWith('auth');
    });

    it('handles impersonated user logout', async () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ impersonated: true }));

      fetchJson
        .mockResolvedValueOnce({}) // unimpersonate response
        .mockResolvedValueOnce({ json: { name: 'Original User' } }); // getIdentity response

      await authProvider.logout();

      expect(fetchJson).toHaveBeenCalledWith(`${apiUrl}/auth/unimpersonate`, { method: 'POST' });
      expect(localStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('returns guest for public routes', async () => {
      window.location.pathname = '/register';
      await expect(authProvider.checkAuth({})).resolves.toBe('guest');
    });

    it('resolves when auth exists', async () => {
      window.location.pathname = '/admin';
      localStorageMock.getItem.mockReturnValueOnce('{"token":"xyz"}');
      await expect(authProvider.checkAuth({})).resolves.toBeUndefined();
    });

    it('rejects when no auth exists', async () => {
      window.location.pathname = '/admin';
      localStorageMock.getItem.mockReturnValueOnce(null);
      await expect(authProvider.checkAuth({})).rejects.toBeUndefined();
    });
  });

  describe('checkError', () => {
    it('logs out on authentication error', async () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify({ impersonated: false }));
      fetchJson.mockResolvedValueOnce({}); // logout request
      await expect(authProvider.checkError({ status: 401 })).rejects.toBeUndefined();
      expect(fetchJson).toHaveBeenCalledWith(`${apiUrl}/auth/logout`, { method: 'POST' });
    });

    it('ignores non-auth errors', async () => {
      await expect(authProvider.checkError({ status: 404 })).resolves.toBeUndefined();
      expect(fetchJson).not.toHaveBeenCalled();
    });
  });

  describe('getIdentity', () => {
    const identityData = { fullName: 'Test User', permissions: ['admin'] };

    it('returns cached identity when not forced', async () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(identityData));
      const result = await authProvider.getIdentity(false);
      expect(result).toEqual(identityData);
      expect(fetchJson).not.toHaveBeenCalled();
    });

    it('fetches fresh identity when forced', async () => {
      fetchJson.mockResolvedValueOnce({
        json: { name: identityData.fullName, ...identityData },
      });

      const result = await authProvider.getIdentity(true);
      expect(result).toEqual(identityData);
      expect(fetchJson).toHaveBeenCalledWith(`${apiUrl}/profile`, { method: 'GET' });
    });

    it('fetches fresh identity when cache is invalid', async () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');
      fetchJson.mockResolvedValueOnce({
        json: { name: identityData.fullName, ...identityData },
      });

      const result = await authProvider.getIdentity(false);
      expect(result).toEqual(identityData);
      expect(fetchJson).toHaveBeenCalledWith(`${apiUrl}/profile`, { method: 'GET' });
    });
  });

  describe('getPermissions', () => {
    it('returns guest permissions for public routes', async () => {
      window.location.pathname = '/register';
      const permissions = await authProvider.getPermissions();
      expect(permissions).toEqual({ guest: true });
    });

    it('returns user permissions for authenticated routes', async () => {
      window.location.pathname = '/admin';
      const identityData = { permissions: ['admin', 'user'] };
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(identityData));

      const permissions = await authProvider.getPermissions();
      expect(permissions).toEqual(identityData.permissions);
    });
  });
});