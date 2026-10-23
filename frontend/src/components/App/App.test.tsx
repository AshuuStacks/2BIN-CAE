import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import App from './index.tsx';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock the logo import for Header
vi.mock('../../assets/images/logoGreenbox.png', () => ({
  default: 'mocked-logo.png',
}));

// Mock Header component
vi.mock('../Header', () => ({
  default: ({
    title,
    version,
    handleHeaderClick,
  }: {
    title: string;
    version: number;
    handleHeaderClick: () => void;
  }) => (
    <header data-testid="header">
      {title} - Version: {version}
      <button onClick={handleHeaderClick}>Click Header</button>
    </header>
  ),
}));

// Mock NavBar component
vi.mock('../Navbar', () => ({
  default: () => <nav data-testid="navbar">Mocked NavBar</nav>,
}));

// Mock Footer component
vi.mock('../Footer', () => ({
  default: () => <footer data-testid="footer">Mocked Footer</footer>,
}));

// Mock Outlet from react-router-dom while preserving other exports
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Mocked Outlet</div>,
  };
});

// Create a default MUI theme for testing
const theme = createTheme();

describe('App', () => {
  // Helper to render App with ThemeProvider and MemoryRouter
  const renderApp = () => {
    return render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </ThemeProvider>,
    );
  };

  // Test for rendering all sub-components
  it('renders Header, NavBar, Outlet, and Footer', () => {
    renderApp();
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  // Test for Header props
  it('passes correct props to Header', () => {
    renderApp();
    expect(screen.getByText('Welcome - Version: 1')).toBeInTheDocument();
    const headerButton = screen.getByText('Click Header');
    expect(headerButton).toBeInTheDocument();
  });

  // Test for flexbox layout
  it('uses flexbox to structure the layout', () => {
    renderApp();
    const rootBox = screen.getByTestId('header').closest('div');
    expect(rootBox).toHaveStyle({
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    });
  });

  // Test for Container with main content
  it('renders Outlet inside a Container with flex: 1', () => {
    renderApp();
    const container = screen.getByTestId('outlet').closest('main');
    expect(container).toHaveStyle({ flex: '1' });
    expect(container).toHaveAttribute(
      'class',
      expect.stringContaining('MuiContainer'),
    );
  });

  // Test for handleHeaderClick
  it('calls handleHeaderClick when Header button is clicked', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    renderApp();
    const headerButton = screen.getByText('Click Header');
    fireEvent.click(headerButton);
    expect(consoleSpy).toHaveBeenCalledWith('Header clicked');
    consoleSpy.mockRestore();
  });
});
