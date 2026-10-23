import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import ProposerLotPage from './ProposeLotPage';
import { ProductContext } from '../../contexts/ProductContext';
import { UserContext } from '../../contexts/UserContext';
import { LotContext } from '../../contexts/LotContext';
import '@testing-library/jest-dom';
import { Role } from '../../types';

// Mock de react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

// Mock des contextes nécessaires
const mockFetchProducts = vi.fn();
const mockSetSuccessMessage = vi.fn();
const mockAddProduct = vi.fn();
const mockRefetchLots = vi.fn();

const mockAuthenticatedUser = {
  id: 1,
  email: 'test@test.com',
  firstname: 'Test',
  lastname: 'User',
  phonenumber: '1234567890',
  token: 'mock-token',
  role: 'PRODUCTEUR' as Role,
};

const mockContextValue = {
  fetchProducts: mockFetchProducts,
  setSuccessMessage: mockSetSuccessMessage,
  successMessage: '',
  addProduct: mockAddProduct,
};

const mockUserContextValue = {
  authenticatedUser: mockAuthenticatedUser,
  registerUser: vi.fn(),
  loginUser: vi.fn(),
  clearUser: vi.fn(),
};

const mockLotContextValue = {
  availableLots: [],
  pendingLots: [],
  error: null,
  loading: false,
  getLotById: vi.fn(),
  refetchLots: mockRefetchLots,
  fetchPendingLots: vi.fn(),
  receiveLot: vi.fn(),
  acceptLot: vi.fn(),
  refuseLot: vi.fn(),
};

// Mock des produits pour les tests
const mockProducts = [
  {
    id: 1,
    libelleProduct: 'Fraise',
    productType: { libelleType: 'Fruits' },
    unite: { unite: 'Kg' },
    description: 'Fraises fraîches et savoureuses.',
  },
  {
    id: 2,
    libelleProduct: 'Tomate',
    productType: { libelleType: 'Légumes' },
    unite: { unite: 'Kg' },
    description: 'Tomates bio.',
  },
];

describe('ProposerLotPage', () => {
  beforeEach(() => {
    // Réinitialisation des mocks avant chaque test
    vi.clearAllMocks();
    mockFetchProducts.mockResolvedValue(mockProducts);
  });

  // Test 1 : Vérifie que le formulaire est rendu correctement
  test('affiche correctement le formulaire avec tous les champs', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <UserContext.Provider value={mockUserContextValue}>
            <LotContext.Provider value={mockLotContextValue}>
              <ProposerLotPage />
            </LotContext.Provider>
          </UserContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    // Vérifie la présence des champs du formulaire
    expect(await screen.findByLabelText(/Nom du produit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Quantité initiale/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prix par unité/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date de disponibilité/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Uploader une nouvelle image/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Choisir une image existante/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Proposer le lot/i }),
    ).toBeInTheDocument();
  });

  // Test 3 : Vérifie que les produits sont chargés et affichés dans l'Autocomplete
  test('charge et affiche les produits dans le champ Autocomplete', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <UserContext.Provider value={mockUserContextValue}>
            <LotContext.Provider value={mockLotContextValue}>
              <ProposerLotPage />
            </LotContext.Provider>
          </UserContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    // Vérifier que fetchProducts a été appelé
    await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());

    // Ouvrir la liste déroulante de l'Autocomplete
    const productField = screen.getByRole('combobox', {
      name: /Nom du produit/i,
    });
    fireEvent.mouseDown(productField);

    // Vérifier que les options des produits sont affichées
    expect(await screen.findByText('Fraise')).toBeInTheDocument();
    expect(screen.getByText('Tomate')).toBeInTheDocument();
  });

  // Test 7 : Vérifie le changement d'option pour les photos (upload/existing)
  test('permet de basculer entre les options de photo (upload/existing)', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <UserContext.Provider value={mockUserContextValue}>
            <LotContext.Provider value={mockLotContextValue}>
              <ProposerLotPage />
            </LotContext.Provider>
          </UserContext.Provider>
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    // Par défaut, l'option "upload" est sélectionnée
    expect(screen.getByLabelText(/Uploader une nouvelle image/i)).toBeChecked();

    // Basculer vers l'option "existing"
    const existingPhotoOption = screen.getByLabelText(
      /Choisir une image existante/i,
    );
    fireEvent.click(existingPhotoOption);

    // Vérifier que l'option "existing" est sélectionnée
    expect(existingPhotoOption).toBeChecked();
    expect(
      screen.getByLabelText(/Choisir une photo existante/i),
    ).toBeInTheDocument();
  });
});
