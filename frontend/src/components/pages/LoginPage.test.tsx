import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import LoginPage from './LoginPage';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const createMockContext = (overrides = {}) => {
  const loginUserMock = vi.fn();
  return {
    mockContextValue: {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      updateUser: vi.fn(), // Ajout
      ...overrides,
    },
    loginUserMock,
  };
};

const renderLoginPage = (mockContextValue: UserContextType) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockContextValue}>
        <LoginPage />
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('LoginPage', () => {
  test('renders a form with email and password inputs', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  test('calls console.error when loginUser throws an error', async () => {
    const loginUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Login failed'));
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      updateUser: vi.fn(), // Ajout
    };

    renderLoginPage(mockContextValue);

    const usernameInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', {
      name: /Connexion/i,
    });

    fireEvent.change(usernameInput, { target: { value: 'testuser@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(consoleErrorMock).toHaveBeenCalledWith(
        'LoginPage::error: ',
        expect.any(Error),
      );
    });

    consoleErrorMock.mockRestore();
  });

  test('displays an error when email is invalid', async () => {
    const { mockContextValue, loginUserMock } = createMockContext();

    renderLoginPage(mockContextValue);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password' },
    });

    const submitButton = screen.getByRole('button', {
      name: /Connexion/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/L'email n'est pas valide/i)).to.exist;
      expect(loginUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when password is less than 8 characters', async () => {
    const { mockContextValue, loginUserMock } = createMockContext();

    renderLoginPage(mockContextValue);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'testuser@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'short' },
    });

    const submitButton = screen.getByRole('button', {
      name: /Connexion/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe doit contenir au moins 8 caractères/i,
        ),
      ).to.exist;
      expect(loginUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when email or password is incorrect', async () => {
    const loginUserMock = vi.fn().mockRejectedValueOnce(new Error('401'));
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: vi.fn(),
      loginUser: loginUserMock,
      clearUser: vi.fn(),
      updateUser: vi.fn(), // Ajout
    };

    renderLoginPage(mockContextValue);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'testuser@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/Mot de passe/i), {
      target: { value: 'password' },
    });

    const submitButton = screen.getByRole('button', {
      name: /Connexion/i,
    });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou mot de passe incorrect/i)).to.exist;
      expect(loginUserMock).toHaveBeenCalled();
    });
  });
});
