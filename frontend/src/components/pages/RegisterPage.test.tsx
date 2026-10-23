import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import RegisterPage from './RegisterPage';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const defaultFormData = {
  civility: 'Monsieur',
  firstname: 'John',
  lastname: 'Doe',
  street: '123 Main St',
  number: '1',
  mailbox: 'Apt 1',
  postalcode: '12345',
  country: 'Belgique',
  city: 'Cito',
  phonenumber: '+32 499 11 22 33',
  email: 'testuser@test.com',
  password: 'Abc123!',
  confirmPassword: 'Abc123!',
};

const fillRegisterForm = (overrides = {}) => {
  const formData = { ...defaultFormData, ...overrides };

  if (formData.civility) {
    fireEvent.mouseDown(screen.getByLabelText(/Civilité/i));
    fireEvent.click(screen.getByRole('option', { name: formData.civility }));
  }

  if (formData.firstname !== undefined)
    fireEvent.change(screen.getByLabelText(/^Prénom$/i), {
      target: { value: formData.firstname },
    });

  if (formData.lastname !== undefined)
    fireEvent.change(screen.getByLabelText(/^Nom$/i), {
      target: { value: formData.lastname },
    });

  if (formData.street !== undefined)
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: formData.street },
    });

  if (formData.number !== undefined)
    fireEvent.change(screen.getByLabelText(/^Numéro$/i), {
      target: { value: formData.number },
    });

  if (formData.mailbox !== undefined)
    fireEvent.change(screen.getByLabelText(/Boîte/i), {
      target: { value: formData.mailbox },
    });

  if (formData.postalcode !== undefined)
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: formData.postalcode },
    });

  if (formData.country !== undefined)
    fireEvent.change(screen.getByLabelText(/Pays/i), {
      target: { value: formData.country },
    });

  if (formData.city !== undefined)
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: formData.city },
    });

  if (formData.phonenumber !== undefined)
    fireEvent.change(screen.getByLabelText(/^Numéro de téléphone$/i), {
      target: { value: formData.phonenumber },
    });

  if (formData.email !== undefined)
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: formData.email },
    });

  if (formData.password !== undefined)
    fireEvent.change(screen.getByLabelText(/^Mot de passe$/i), {
      target: { value: formData.password },
    });

  if (formData.confirmPassword !== undefined)
    fireEvent.change(screen.getByLabelText(/^Confirmer le mot de passe$/i), {
      target: { value: formData.confirmPassword },
    });
};

const submitForm = () => {
  const submitButton = screen.getByRole('button', {
    name: /Créer un compte/i,
  });
  fireEvent.click(submitButton);
};

const expectRegisterUserCalledWith = async (
  registerUserMock: ReturnType<typeof vi.fn>,
) => {
  await waitFor(() => {
    expect(registerUserMock).toHaveBeenCalledWith({
      email: 'testuser@test.com',
      lastname: 'Doe',
      firstname: 'John',
      password: 'Abc123!',
      phonenumber: '+32 499 11 22 33',
      address: {
        street: '123 Main St',
        postalcode: '12345',
        number: '1',
        country: 'Belgique',
        mailbox: 'Apt 1',
        city: 'Cito',
      },
      civility: 'Monsieur',
      role: 'CLIENT',
    });
  });
};

const createMockContext = (overrides = {}) => {
  const registerUserMock = vi.fn();
  return {
    mockContextValue: {
      authenticatedUser: undefined,
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateUser: vi.fn(), // Ajout
      ...overrides,
    },
    registerUserMock,
  };
};

const renderRegisterPage = (mockContextValue: UserContextType) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockContextValue}>
        <RegisterPage />
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('RegisterPage', () => {
  test('renders a form with necessary inputs', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText(/Civilité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Prénom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Nom$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rue/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Numéro$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Boîte/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Code Postal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Pays/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ville/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Numéro de téléphone$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Mot de passe$/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/^Confirmer le mot de passe$/i),
    ).toBeInTheDocument();
  });

  test('calls registerUser and navigates to LoginPage with success message when the form is submitted', async () => {
    const navigateMock = vi.fn();

    vi.mocked(useNavigate).mockReturnValue(navigateMock);

    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm();
    submitForm();

    await expectRegisterUserCalledWith(registerUserMock);

    expect(navigateMock).toHaveBeenCalledWith('/login?success=1');
  });

  test('calls console.error when registerUser throws an error', async () => {
    const registerUserMock = vi
      .fn()
      .mockRejectedValueOnce(new Error('Registration failed'));
    const consoleErrorMock = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const mockContextValue = {
      authenticatedUser: undefined,
      registerUser: registerUserMock,
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateUser: vi.fn(), // Ajout
    };

    renderRegisterPage(mockContextValue);

    fillRegisterForm();
    submitForm();

    await expectRegisterUserCalledWith(registerUserMock);

    expect(consoleErrorMock).toHaveBeenCalledWith(
      'RegisterPage::error: ',
      expect.any(Error),
    );
    // Restore the original console.error mock
    consoleErrorMock.mockRestore();
  });

  test('displays an error when civility is not selected', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fireEvent.change(screen.getByLabelText(/^Prénom$/i), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText(/^Nom$/i), {
      target: { value: 'Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Rue/i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/^Numéro$/i), {
      target: { value: '1' },
    });
    fireEvent.change(screen.getByLabelText(/Boîte/i), {
      target: { value: 'Apt 1' },
    });
    fireEvent.change(screen.getByLabelText(/Code Postal/i), {
      target: { value: '12345' },
    });
    fireEvent.change(screen.getByLabelText(/Pays/i), {
      target: { value: 'Belgique' },
    });
    fireEvent.change(screen.getByLabelText(/Ville/i), {
      target: { value: 'City' },
    });
    fireEvent.change(screen.getByLabelText(/^Numéro de téléphone$/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'testuser@test.com' },
    });
    fireEvent.change(screen.getByLabelText(/^Mot de passe$/i), {
      target: { value: 'password' },
    });
    fireEvent.change(screen.getByLabelText(/^Confirmer le mot de passe$/i), {
      target: { value: 'password' },
    });

    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La civilité ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when firstname is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ firstname: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le prénom ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when lastname is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ lastname: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le nom ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when street is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ street: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La rue ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when number is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ number: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when postalcode is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ postalcode: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le code postal ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when city is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ city: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La ville ne peut pas être vide/i),
      ).toBeInTheDocument(),
        expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when phone number is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ phonenumber: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro de téléphone ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when phone number is invalid', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ phonenumber: 'invalid-phone' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro de téléphone n'est pas valide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when email is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ email: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/L'email ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when email is invalid', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ email: 'invalid-email' });
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/L'email n'est pas valide/i)).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when password is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ password: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le mot de passe ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when password and confirmation do not match', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ confirmPassword: 'different' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe et la confirmation ne correspondent pas/i,
        ),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when password is invalid', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ password: 'inval', confirmPassword: 'inval' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial/i,
        ),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });

  test('displays an error when password confirmation is not provided', async () => {
    const { mockContextValue, registerUserMock } = createMockContext();

    renderRegisterPage(mockContextValue);

    fillRegisterForm({ confirmPassword: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /La confirmation du mot de passe ne peut pas être vide/i,
        ),
      ).toBeInTheDocument();
      expect(registerUserMock).not.toHaveBeenCalled();
    });
  });
});
