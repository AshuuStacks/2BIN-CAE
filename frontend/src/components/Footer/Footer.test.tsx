import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Footer from './index.tsx';
import '@testing-library/jest-dom';

// Create a default MUI theme for testing
const theme = createTheme();

describe('Footer', () => {
  // Helper to render Footer with ThemeProvider
  const renderFooter = () => {
    return render(
      <ThemeProvider theme={theme}>
        <Footer />
      </ThemeProvider>,
    );
  };

  // Test for rendering the footer with correct content
  it('renders the footer with correct text content', () => {
    renderFooter();
    expect(
      screen.getByText(
        'Terroir & Cie - Rue du Bon Terroir, 7, 6980 Valtontaine, Belgique',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Téléphone : +32 84 987 654 - Email : contact@terroiretcie.be',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Heures d'ouverture : Mardi 16h-20h | Jeudi 18h-21h"),
    ).toBeInTheDocument();
    expect(screen.getByText('GreenBox')).toBeInTheDocument();
  });

  // Test for rendering the Copyright icon
  it('renders the Copyright icon', () => {
    renderFooter();
    const copyrightIcon = screen.getByTestId('copyright-icon');
    expect(copyrightIcon).toBeInTheDocument();
  });

  // Test for footer background color
  it('applies the correct background color to the footer', () => {
    renderFooter();
    const footer = screen.getByRole('contentinfo');
    expect(footer).toHaveStyle({ backgroundColor: 'rgb(41, 86, 55)' });
  });

  // Test for typography variant and color
  it('renders text with correct typography variant and color', () => {
    renderFooter();
    const address = screen.getByText(
      'Terroir & Cie - Rue du Bon Terroir, 7, 6980 Valtontaine, Belgique',
    );
    expect(address).toHaveStyle({ color: 'rgb(255, 255, 255)' }); // White color
    expect(address.tagName).toBe('P'); // body1 variant for Typography
  });

  // Test for container maxWidth
  it('renders content inside a container with maxWidth sm', () => {
    renderFooter();
    const container = screen
      .getByText(
        'Terroir & Cie - Rue du Bon Terroir, 7, 6980 Valtontaine, Belgique',
      )
      .closest('[class*="maxWidthSm"]');
    expect(container).toBeInTheDocument();
    expect(container).toHaveAttribute(
      'class',
      expect.stringContaining('maxWidthSm'),
    );
  });

  // Test for flexbox centering of Copyright and GreenBox
  it('centers the Copyright and GreenBox text using flexbox', () => {
    renderFooter();
    const copyrightTypography = screen.getByText('GreenBox').closest('p');
    expect(copyrightTypography).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
    });
  });
});
