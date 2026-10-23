import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NavBar from './index.tsx';
import { UserContext } from '../../contexts/UserContext';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { MaybeAuthenticatedUser, Role } from '../../types';

// Mock useNavigate
const mockedNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

// Helper to render NavBar with user context
const renderWithUser = (user: MaybeAuthenticatedUser, clearUser = vi.fn()) => {
  return render(
    <BrowserRouter>
      <UserContext.Provider
        value={{
          authenticatedUser: user,
          clearUser,
          registerUser: vi.fn(),
          loginUser: vi.fn(),
        }}
      >
        <NavBar />
      </UserContext.Provider>
    </BrowserRouter>,
  );
};

// Helper function to create a valid AuthenticatedUser object
const createUser = (role: Role, firstname: string, lastname: string) => ({
  role,
  firstname,
  lastname,
  email: `${firstname.toLowerCase()}.${lastname.toLowerCase()}@example.com`,
  phonenumber: '1234567890',
  token: 'mock-token',
});

describe('NavBar', () => {
  beforeEach(() => {
    mockedNavigate.mockClear();
  });

  // Test for PRODUCER role
  it('displays correct links for a PRODUCER', () => {
    const user = createUser('PRODUCTEUR', 'Alice', 'Martin');
    renderWithUser(user);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mes lots')).toBeInTheDocument();
    expect(screen.getByText('Proposer un lot')).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  // Test for MANAGER role
  it('displays correct links for a MANAGER', () => {
    const user = createUser('GESTIONNAIRE', 'Jean', 'Dupont');
    renderWithUser(user);
    expect(screen.getByText('Tableau de bord')).toBeInTheDocument();
    expect(screen.getByText('Réservations')).toBeInTheDocument();
    expect(screen.getByText('Propositions de lots')).toBeInTheDocument();
    expect(
      screen.getByText('Inscrire Gestionnaire/Producteur'),
    ).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  // Test for CLIENT role
  it('displays correct links for a CLIENT', () => {
    const user = createUser('CLIENT', 'Léo', 'Perez');
    renderWithUser(user);
    expect(screen.getByText('Accueil')).toBeInTheDocument();
    expect(screen.getByText('Mes réservations')).toBeInTheDocument();
    expect(screen.getByText('Panier')).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  // Test for VOLUNTEER role
  it('displays correct links for a VOLUNTEER', () => {
    const user = createUser('BÉNÉVOLE', 'Marie', 'Curie');
    renderWithUser(user);
    expect(screen.getByText('Produits')).toBeInTheDocument();
    expect(screen.getByText('Réservations')).toBeInTheDocument();
    expect(screen.getByText('Compte')).toBeInTheDocument();
  });

  // Test for unauthenticated user
  it('displays "S\'inscrire" and "Se connecter" for an unauthenticated user', () => {
    renderWithUser(undefined);
    expect(screen.getByText("S'inscrire")).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.queryByText('Compte')).not.toBeInTheDocument();
    expect(screen.queryByText(/Bienvenue/i)).not.toBeInTheDocument();
  });

  // Test for welcome message
  it('displays the first name and last name of the authenticated user', () => {
    const user = createUser('CLIENT', 'Léo', 'Perez');
    renderWithUser(user);
    expect(screen.getByText(/Bienvenue Léo Perez/i)).toBeInTheDocument();
  });

  // Test for navigation on a link
  it('navigates to the correct path when clicking a link (e.g., Mes lots)', () => {
    const user = createUser('PRODUCTEUR', 'Alice', 'Martin');
    renderWithUser(user);
    fireEvent.click(screen.getByText('Mes lots'));
    expect(mockedNavigate).toHaveBeenCalledWith('/my-lots');
  });

  // Test for navigation to Home (CLIENT)
  it('navigates to "/" when a CLIENT clicks "Accueil"', () => {
    const user = createUser('CLIENT', 'Léo', 'Perez');
    renderWithUser(user);
    fireEvent.click(screen.getByText('Accueil'));
    expect(mockedNavigate).toHaveBeenCalledWith('/');
  });

  // Test for Account menu
  it('displays Account menu options after clicking', () => {
    const user = createUser('CLIENT', 'Léo', 'Perez');
    renderWithUser(user);
    fireEvent.click(screen.getByText('Compte'));
    expect(screen.getByText('Voir mon profil')).toBeInTheDocument();
    expect(screen.getByText('Déconnexion')).toBeInTheDocument();
  });

  // Test for logout
  it('calls clearUser and navigates to /login on logout', () => {
    const clearUser = vi.fn();
    const user = createUser('CLIENT', 'Zoe', 'Z');
    renderWithUser(user, clearUser);
    fireEvent.click(screen.getByText('Compte'));
    fireEvent.click(screen.getByText('Déconnexion'));
    expect(clearUser).toHaveBeenCalled();
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });

  // Test for profile navigation
  it('navigates to /account when clicking "Voir mon profil"', () => {
    const user = createUser('CLIENT', 'Léo', 'Perez');
    renderWithUser(user);
    fireEvent.click(screen.getByText('Compte'));
    fireEvent.click(screen.getByText('Voir mon profil'));
    expect(mockedNavigate).toHaveBeenCalledWith('/account');
  });

  // Test for buttons for unauthenticated user
  it('navigates to /register when clicking "S\'inscrire"', () => {
    renderWithUser(undefined);
    fireEvent.click(screen.getByText("S'inscrire"));
    expect(mockedNavigate).toHaveBeenCalledWith('/register');
  });

  it('navigates to /login when clicking "Se connecter"', () => {
    renderWithUser(undefined);
    fireEvent.click(screen.getByText('Se connecter'));
    expect(mockedNavigate).toHaveBeenCalledWith('/login');
  });
});
