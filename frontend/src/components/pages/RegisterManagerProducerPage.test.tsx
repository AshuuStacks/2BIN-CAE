import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import RegisterManagerProducerPage from './RegisterManagerProducerPage';
import { UserContext } from '../../contexts/UserContext';
import { UserContextType } from '../../types';

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock de fetch pour simuler les appels API
global.fetch = vi.fn();

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
  role: 'GESTIONNAIRE',
  nomEntreprise: 'Entreprise Test',
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
  if (formData.role) {
    fireEvent.mouseDown(screen.getByLabelText(/Rôle/i));
    const roleDisplayName =
      formData.role === 'GESTIONNAIRE' ? 'Gestionnaire' : 'Producteur';
    fireEvent.click(screen.getByRole('option', { name: roleDisplayName }));
  }
  if (formData.nomEntreprise !== undefined && formData.role === 'PRODUCTEUR')
    fireEvent.change(screen.getByLabelText(/Nom de l'entreprise/i), {
      target: { value: formData.nomEntreprise },
    });
};

const submitForm = () => {
  const submitButton = screen.getByRole('button', { name: /Créer un compte/i });
  fireEvent.click(submitButton);
};

const createMockContext = (
  overrides = {},
): { mockContextValue: UserContextType } => {
  return {
    mockContextValue: {
      authenticatedUser: {
        id: 1,
        email: 'manager@test.com',
        firstname: 'Manager',
        lastname: 'Test',
        phonenumber: '+32 499 99 99 99',
        role: 'GESTIONNAIRE',
        token: 'mock-token',
      },
      registerUser: vi.fn(),
      loginUser: vi.fn(),
      clearUser: vi.fn(),
      updateUser: vi.fn(),
      ...overrides,
    },
  };
};

const renderRegisterManagerProducerPage = (
  mockContextValue: UserContextType,
) => {
  render(
    <MemoryRouter>
      <UserContext.Provider value={mockContextValue}>
        <RegisterManagerProducerPage />
      </UserContext.Provider>
    </MemoryRouter>,
  );
};

describe('RegisterManagerProducerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Réinitialise tous les mocks avant chaque test
    (global.fetch as ReturnType<typeof vi.fn>).mockReset(); // Réinitialise fetch spécifiquement
  });

  test('renders a form with necessary inputs', () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

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
    expect(screen.getByLabelText(/Rôle/i)).toBeInTheDocument();
  });

  test('redirects to /login if no authenticated user', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const { mockContextValue } = createMockContext({ authenticatedUser: null });

    renderRegisterManagerProducerPage(mockContextValue);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  test('redirects to / if authenticated user is not GESTIONNAIRE', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const { mockContextValue } = createMockContext({
      authenticatedUser: { role: 'CLIENT', token: 'mock-token' },
    });

    renderRegisterManagerProducerPage(mockContextValue);

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });

  test('submits form successfully and navigates to /', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const { mockContextValue } = createMockContext();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve(''),
    });

    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm();
    submitForm();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auths/register-manager-producer',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          },
          body: JSON.stringify({
            email: 'testuser@test.com',
            firstname: 'John',
            lastname: 'Doe',
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
            role: 'GESTIONNAIRE',
            nomEntreprise: undefined,
          }),
        }),
      );
      expect(navigateMock).toHaveBeenCalledWith('/');
      expect(
        screen.getByText(/Utilisateur créé avec succès/i),
      ).toBeInTheDocument();
    });
  });

  test('displays error when fetch fails', async () => {
    const { mockContextValue } = createMockContext();
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('API Error'),
    );

    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm();
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/API Error/i)).toBeInTheDocument(); // Vérifie le message d'erreur réel
    });
  });

  test('displays error when civility is not selected', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ civility: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La civilité ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when firstname is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ firstname: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le prénom ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when lastname is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ lastname: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le nom ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when street is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ street: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La rue ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when number is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ number: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when postalcode is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ postalcode: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le code postal ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when city is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ city: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/La ville ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when phonenumber is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ phonenumber: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro de téléphone ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when phonenumber is invalid', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ phonenumber: 'invalid' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le numéro de téléphone n'est pas valide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when email is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ email: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/L'email ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when email is invalid', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ email: 'invalid-email' });
    submitForm();

    await waitFor(() => {
      expect(screen.getByText(/L'email n'est pas valide/i)).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when password is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ password: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le mot de passe ne peut pas être vide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('shows error if password is empty', async () => {
    renderRegisterManagerProducerPage(createMockContext().mockContextValue);

    fillRegisterForm({ password: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Le mot de passe ne peut pas être vide/i),
      ).toBeVisible();
    });

    expect(fetch).not.toHaveBeenCalled();
  });

  test('displays error when password is invalid', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ password: 'weak', confirmPassword: 'weak' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe doit contenir au moins 6 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial/i,
        ),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when confirmPassword is not provided', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ confirmPassword: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /La confirmation du mot de passe ne peut pas être vide/i,
        ),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when passwords do not match', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ confirmPassword: 'Different123!' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le mot de passe et la confirmation ne correspondent pas/i,
        ),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when role is not selected', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ role: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(/Vous devez choisir un rôle valide/i),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('displays error when nomEntreprise is not provided for PRODUCTEUR', async () => {
    const { mockContextValue } = createMockContext();
    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ role: 'PRODUCTEUR', nomEntreprise: '' });
    submitForm();

    await waitFor(() => {
      expect(
        screen.getByText(
          /Le nom de l'entreprise ne peut pas être vide pour un producteur/i,
        ),
      ).toBeInTheDocument();
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('submits form successfully with nomEntreprise for PRODUCTEUR', async () => {
    const navigateMock = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    const { mockContextValue } = createMockContext();
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
      text: () => Promise.resolve(''),
    });

    renderRegisterManagerProducerPage(mockContextValue);

    fillRegisterForm({ role: 'PRODUCTEUR', nomEntreprise: 'Entreprise Test' });
    submitForm();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        '/api/auths/register-manager-producer',
        expect.objectContaining({
          body: JSON.stringify({
            email: 'testuser@test.com',
            firstname: 'John',
            lastname: 'Doe',
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
            role: 'PRODUCTEUR',
            nomEntreprise: 'Entreprise Test',
          }),
        }),
      );
      expect(navigateMock).toHaveBeenCalledWith('/');
    });
  });
});
