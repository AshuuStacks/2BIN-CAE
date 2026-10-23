import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, test, expect, vi } from 'vitest';
import AddProductPage from './AddProductPage';
import { ProductContext } from '../../contexts/ProductContext';
import '@testing-library/jest-dom';

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

const mockAddProduct = vi.fn();
const mockSetSuccessMessage = vi.fn();

const mockContextValue = {
  addProduct: mockAddProduct,
  setSuccessMessage: mockSetSuccessMessage,
  fetchProducts: vi.fn(), // Mock fetchProducts function
  successMessage: '', // Provide a default value for successMessage
};

describe('AddProduct', () => {
  test('renders a form with product name, type, unit, and description', () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <AddProductPage />
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    const productName = screen.getByLabelText(/Nom du produit/i);
    const typeProduct = screen.getByLabelText(/Type de produit/i);
    const unity = screen.getByLabelText(/Unité choisie/i);
    const description = screen.getByLabelText(
      /Description \(120 caractères\)/i,
    );

    expect(productName).toBeInTheDocument();
    expect(typeProduct).toBeInTheDocument();
    expect(unity).toBeInTheDocument();
    expect(description).toBeInTheDocument();
  });

  test('handles form submission correctly when all fields are filled', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <AddProductPage />
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    const productName = screen.getByLabelText(/Nom du produit/i);
    const typeProduct = screen.getByLabelText(/Type de produit/i);
    const unity = screen.getByLabelText(/Unité choisie/i);
    const description = screen.getByLabelText(
      /Description \(120 caractères\)/i,
    );
    const submitButton = screen.getByRole('button', {
      name: /Ajouter le produit/i,
    });

    // Remplir les champs
    fireEvent.change(productName, { target: { value: 'Tomate' } });

    // Sélectionner un type de produit
    fireEvent.mouseDown(typeProduct); // Ouvre la liste déroulante
    const typeOption = await screen.findByText('Légumes');
    fireEvent.click(typeOption); // Sélectionne l'option "Légumes"

    // Sélectionner une unité
    fireEvent.mouseDown(unity); // Ouvre la liste déroulante
    const unitOption = await screen.findByText('Kg');
    fireEvent.click(unitOption); // Sélectionne l'option "Kg"

    // Remplir la description
    fireEvent.change(description, {
      target: { value: 'Des tomates fraîches et savoureuses.' },
    });

    // Soumettre le formulaire
    fireEvent.click(submitButton);

    // Attendre que la fonction addProduct soit appelée
    await waitFor(() => expect(mockAddProduct).toHaveBeenCalledTimes(1));

    // Vérifier que le message de succès a été appelé
    expect(mockSetSuccessMessage).toHaveBeenCalledWith(
      'Le produit a été ajouté avec succès !',
    );
  });

  test('displays an error message when fields are missing', async () => {
    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <AddProductPage />
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', {
      name: /Ajouter le produit/i,
    });

    // Soumettre le formulaire sans remplir les champs
    fireEvent.click(submitButton);

    // Vérifier l'affichage du message d'erreur
    const errorMessage = screen.getByText(
      /Tous les champs doivent être remplis/i,
    );
    expect(errorMessage).toBeInTheDocument();
  });

  test('handles error when product already exists', async () => {
    mockAddProduct.mockRejectedValueOnce(new Error('409'));

    render(
      <MemoryRouter>
        <ProductContext.Provider value={mockContextValue}>
          <AddProductPage />
        </ProductContext.Provider>
      </MemoryRouter>,
    );

    const productName = screen.getByLabelText(/Nom du produit/i);
    const typeProduct = screen.getByLabelText(/Type de produit/i);
    const unity = screen.getByLabelText(/Unité/i); // Mise à jour pour correspondre au label actuel
    const description = screen.getByLabelText(
      /Description \(120 caractères\)/i,
    );
    const submitButton = screen.getByRole('button', {
      name: /Ajouter le produit/i,
    });

    // Remplir le champ "Nom du produit"
    fireEvent.change(productName, { target: { value: 'Fraise' } });

    // Sélectionner un type de produit
    fireEvent.mouseDown(typeProduct); // Ouvre la liste déroulante
    const typeOption = await screen.findByText('Légumes');
    fireEvent.click(typeOption); // Sélectionne l'option "Légumes"

    // Sélectionner une unité
    fireEvent.mouseDown(unity); // Ouvre la liste déroulante
    const unitOption = await screen.findByText('Kg');
    fireEvent.click(unitOption); // Sélectionne l'option "Kg"

    // Remplir la description
    fireEvent.change(description, {
      target: { value: 'Des tomates fraîches et savoureuses.' },
    });

    // Soumettre le formulaire
    fireEvent.click(submitButton);

    // Attendre que l'erreur soit affichée
    await waitFor(() =>
      expect(
        screen.getByText(
          'Ce produit existe déjà. Veuillez en ajouter un autre.',
        ),
      ).toBeInTheDocument(),
    );
  });
});
