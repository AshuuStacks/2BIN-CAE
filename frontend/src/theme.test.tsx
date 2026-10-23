// theme.test.js
import theme from './themes'; // Assure-toi que le chemin est correct

describe('Material-UI Theme', () => {
  it('should create a theme with correct primary color', () => {
    expect(theme.palette.primary.main).toBe('#f0483b');
  });

  it('should create a theme with correct secondary color', () => {
    expect(theme.palette.secondary.main).toBe('#3bf048');
  });

  it('should have the default breakpoints', () => {
    expect(theme.breakpoints.values).toEqual({
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    });
  });

  it('should have the default spacing unit', () => {
    expect(theme.spacing(2)).toBe('16px'); // 8px * 2
  });
});
