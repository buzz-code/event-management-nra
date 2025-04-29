import theme from '../themeProvider';
import { defaultTheme } from 'react-admin';

jest.mock('react-admin', () => ({
  defaultTheme: {
    palette: {
      mode: 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#9c27b0' },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  },
}));

describe('themeProvider', () => {
  it('spreads the default theme as base', () => {
    // Theme should include the spread defaultTheme
    const themeKeys = Object.keys(theme);
    const defaultThemeKeys = Object.keys(defaultTheme);
    
    // All default theme keys should exist in our theme
    defaultThemeKeys.forEach(key => {
      expect(themeKeys).toContain(key);
    });
  });

  it('sets RTL direction', () => {
    expect(theme.direction).toBe('rtl');
    expect(theme.isRtl).toBe(true);
  });

  it('sets light palette type', () => {
    expect(theme.palette.type).toBe('light');
  });

  it('maintains theme object structure', () => {
    // Theme should be a plain object
    expect(typeof theme).toBe('object');
    expect(theme).not.toBeNull();
    
    // Should have palette configuration
    expect(theme).toHaveProperty('palette');
    expect(typeof theme.palette).toBe('object');
    
    // Should have RTL configuration
    expect(theme).toHaveProperty('direction');
    expect(theme).toHaveProperty('isRtl');
  });
});