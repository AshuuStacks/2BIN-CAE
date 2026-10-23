import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Header from './index.tsx';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the logo import
vi.mock('../../assets/images/logoGreenbox.png', () => ({
  default: 'mocked-logo.png',
}));

// Create a default MUI theme for testing
const theme = createTheme();

describe('Header', () => {
  // Helper to render Header with ThemeProvider
  const renderHeader = (
    props = { title: 'Test Title', version: 1, handleHeaderClick: vi.fn() },
  ) => {
    return render(
      <ThemeProvider theme={theme}>
        <Header {...props} />
      </ThemeProvider>,
    );
  };

  // Test for rendering the header with correct title
  it('renders the header with the correct title', () => {
    renderHeader({
      title:
        'Coopérative de Produits Locaux - Réservez et Achetez des Produits Frais !',
      version: 1,
      handleHeaderClick: vi.fn(),
    });
    expect(
      screen.getByText(
        'Coopérative de Produits Locaux - Réservez et Achetez des Produits Frais !',
      ),
    ).toBeInTheDocument();
  });

  // Test for rendering the logo
  it('renders the logo with correct attributes', () => {
    renderHeader();
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', 'mocked-logo.png');
    expect(logo).toHaveAttribute('width', '100');
  });

  // Test for header background color
  it('applies the correct background color to the header', () => {
    renderHeader();
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({ backgroundColor: 'rgb(41, 86, 55)' });
  });

  // Test for typography variant and font size
  it('renders the title with correct typography variant and font size', () => {
    renderHeader();
    const title = screen.getByText(
      'Coopérative de Produits Locaux - Réservez et Achetez des Produits Frais !',
    );
    expect(title).toHaveStyle({ fontSize: '1.5rem' });
    expect(title.tagName).toBe('H6'); // h6 variant for Typography
  });

  // Test for flexbox layout
  it('uses flexbox to align header content', () => {
    renderHeader();
    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      display: 'flex',
      alignItems: 'center',
    });
  });

  // Test for container maxWidth
  it('renders the title inside a container with maxWidth sm', () => {
    renderHeader();
    const container = screen
      .getByText(
        'Coopérative de Produits Locaux - Réservez et Achetez des Produits Frais !',
      )
      .closest('div');
    expect(container).toHaveAttribute(
      'class',
      expect.stringContaining('maxWidthSm'),
    );
  });
});
