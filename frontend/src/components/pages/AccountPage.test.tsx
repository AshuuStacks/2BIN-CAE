import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import AccountPage from './AccountPage';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType, AuthenticatedUser } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
  };
});

const mockUser: AuthenticatedUser = {
  id: 1,
  token: 'mock-token',
  firstname: 'John',
  lastname: 'Doe',
  address: {
    street: '123 Main St',
    number: '1',
    mailbox: 'Apt 1',
    postalcode: '12345',
    city: 'City',
    country: 'Belgique',
  },
  phonenumber: '+32 499 11 22 33',
  email: 'john.doe@test.com',
  creationDate: '2023-01-15T00:00:00Z',
  role: 'GESTIONNAIRE',
};

const createMockContext = (overrides = {}): UserContextType => ({
  authenticatedUser: mockUser,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
  updateUser: vi.fn(),
  ...overrides,
});

const renderAccountPage = (mockContextValue: UserContextType) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockContextValue}>
        <AccountPage />
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('AccountPage', () => {
  test('renders user information when authenticated', () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    expect(screen.getByText('Mon profil')).toBeInTheDocument();
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('Doe')).toBeInTheDocument();
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Apt 1')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Belgique')).toBeInTheDocument();
    expect(screen.getByText('+32 499 11 22 33')).toBeInTheDocument();
    expect(screen.getByText('john.doe@test.com')).toBeInTheDocument();
    expect(screen.getByText('Mot de passe : ****')).toBeInTheDocument();
    expect(screen.getByText('Crée le 15/01/23')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Modifier/i }),
    ).toBeInTheDocument();
  });

  test('displays no user info message when not authenticated', () => {
    const mockContextValue = createMockContext({ authenticatedUser: null });
    renderAccountPage(mockContextValue);

    expect(screen.getByText('Mon profil')).toBeInTheDocument();
    expect(
      screen.getByText('Aucune information utilisateur disponible.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('John')).not.toBeInTheDocument();
  });

  test('switches to password edit mode when "Modifier" is clicked', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    const modifyButton = screen.getByRole('button', { name: /Modifier/i });
    fireEvent.click(modifyButton);

    await waitFor(() => {
      expect(screen.getByLabelText('Ancien mot de passe')).toBeInTheDocument();
      expect(screen.getByLabelText('Nouveau mot de passe')).toBeInTheDocument();
      expect(
        screen.getByLabelText('Confirmer le mot de passe'),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Confirmer/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Annuler/i }),
      ).toBeInTheDocument();
    });
  });

  test('displays error when new password is empty', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Le nouveau mot de passe ne peut pas être vide/i),
      ).toBeInTheDocument();
    });
  });

  test('displays error when old password is empty', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/L'ancien mot de passe ne peut pas être vide/i),
      ).toBeInTheDocument();
    });
  });

  test('displays error when password does not meet requirements', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'weak' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'weak' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe doit contenir au moins 6 caractères/i,
        ),
      ).toBeInTheDocument();
    });
  });

  test('displays error when passwords do not match', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'Strong123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'Different123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe et la confirmation ne correspondent pas/i,
        ),
      ).toBeInTheDocument();
    });
  });

  test('successfully updates password and displays success message', async () => {
    const updateUserMock = vi.fn().mockResolvedValue(undefined);
    const mockContextValue = createMockContext({ updateUser: updateUserMock });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ...mockUser, password: 'NewPass123!' }),
      text: () => Promise.resolve(''),
    });

    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Ancien mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auths/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockUser.token}`,
        },
        body: JSON.stringify({
          oldPassword: 'OldPass123!',
          password: 'NewPass123!',
        }),
      });
      expect(updateUserMock).toHaveBeenCalled();
      expect(
        screen.getByText(/Mot de passe mis à jour avec succès/i),
      ).toBeInTheDocument();
      expect(screen.getByText('Mot de passe : ****')).toBeInTheDocument();
    });
  });

  test('displays error when API call fails', async () => {
    const mockContextValue = createMockContext();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Erreur serveur'),
    });

    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Ancien mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Erreur 400: Erreur serveur/i),
      ).toBeInTheDocument();
    });
  });

  test('displays error when old password is incorrect', async () => {
    const mockContextValue = createMockContext();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Incorrect old password'),
    });

    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Ancien mot de passe'), {
      target: { value: 'WrongPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/L'ancien mot de passe est incorrect/i),
      ).toBeInTheDocument();
    });
  });

  test('displays error when new password is same as old', async () => {
    const mockContextValue = createMockContext();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('New password cannot be the same'),
    });

    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Ancien mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le nouveau mot de passe ne peut pas être identique à l'ancien/i,
        ),
      ).toBeInTheDocument();
    });
  });

  test('displays error when session is expired', async () => {
    const mockContextValue = createMockContext();
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    });

    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.change(screen.getByLabelText('Ancien mot de passe'), {
      target: { value: 'OldPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Nouveau mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirmer le mot de passe'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Session expirée. Veuillez vous reconnecter/i),
      ).toBeInTheDocument();
    });
  });

  test('displays no edit options when user is not authenticated', () => {
    const mockContextValue = createMockContext({ authenticatedUser: null });
    renderAccountPage(mockContextValue);

    expect(
      screen.queryByRole('button', { name: /Modifier/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Ancien mot de passe'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Nouveau mot de passe'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Confirmer le mot de passe'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Aucune information utilisateur disponible.'),
    ).toBeInTheDocument();
  });

  test('toggles password visibility for all password fields', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));

    await waitFor(() => {
      const oldPasswordField = screen.getByLabelText('Ancien mot de passe');
      const newPasswordField = screen.getByLabelText('Nouveau mot de passe');
      const confirmPasswordField = screen.getByLabelText(
        'Confirmer le mot de passe',
      );

      expect(oldPasswordField).toHaveAttribute('type', 'password');
      expect(newPasswordField).toHaveAttribute('type', 'password');
      expect(confirmPasswordField).toHaveAttribute('type', 'password');

      const oldPasswordToggle = screen.getByRole('button', {
        name: /Show old password/i,
      });
      const newPasswordToggle = screen.getByRole('button', {
        name: /Show new password/i,
      });
      const confirmPasswordToggle = screen.getByRole('button', {
        name: /Show confirm password/i,
      });

      fireEvent.click(oldPasswordToggle);
      fireEvent.click(newPasswordToggle);
      fireEvent.click(confirmPasswordToggle);

      expect(oldPasswordField).toHaveAttribute('type', 'text');
      expect(newPasswordField).toHaveAttribute('type', 'text');
      expect(confirmPasswordField).toHaveAttribute('type', 'text');
    });
  });

  test('resets fields and messages when cancelling edit mode', async () => {
    const mockContextValue = createMockContext();
    renderAccountPage(mockContextValue);

    fireEvent.click(screen.getByRole('button', { name: /Modifier/i }));
    fireEvent.click(screen.getByRole('button', { name: /Confirmer/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Le nouveau mot de passe ne peut pas être vide/i),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Annuler/i }));

    await waitFor(() => {
      expect(screen.getByText('Mot de passe : ****')).toBeInTheDocument();
      expect(
        screen.queryByLabelText('Ancien mot de passe'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Nouveau mot de passe'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText('Confirmer le mot de passe'),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Le nouveau mot de passe ne peut pas être vide/i),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Modifier/i }),
      ).toBeInTheDocument();
    });
  });
});
