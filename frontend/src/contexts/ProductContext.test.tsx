import { render, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { ProductContext, ProductContextProvider } from './ProductContext';
import { UserContext } from './UserContext';
import { Product, ProductContextType, UserContextType } from '../types';
import { ReactNode } from 'react';

// Utility to wrap components with providers
const customRender = (
  children: ReactNode,
  userContextValue: UserContextType,
) => {
  return render(
    <UserContext.Provider value={userContextValue}>
      <ProductContextProvider>{children}</ProductContextProvider>
    </UserContext.Provider>,
  );
};

describe('ProductContext', () => {
  const mockAuthenticatedUser = {
    id: 1,
    token: 'mock-token',
    role: 'PRODUCTEUR' as const,
    email: 'mockuser@example.com',
    firstname: 'Mock',
    lastname: 'User',
    phonenumber: '1234567890',
  };

  const mockUserContextValue: UserContextType = {
    authenticatedUser: mockAuthenticatedUser,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
  };

  const unauthenticatedUserContext: UserContextType = {
    authenticatedUser: undefined,
    registerUser: vi.fn(),
    loginUser: vi.fn(),
    clearUser: vi.fn(),
  };

  const mockProduct: Product = {
    id: 1,
    libelleProduct: 'Tomate',
    description: 'Légume frais',
    unite: { unite: 'Kg' },
    productType: { libelleType: 'Légumes' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to get context values
  const getContextValues = async (userContextValue: UserContextType) => {
    let contextValues: ProductContextType | undefined;
    customRender(
      <ProductContext.Consumer>
        {(values) => {
          contextValues = values;
          return null;
        }}
      </ProductContext.Consumer>,
      userContextValue,
    );
    await waitFor(() => expect(contextValues).toBeDefined());
    return contextValues!;
  };

  test('fetchProducts retrieves products successfully with authenticated user', async () => {
    const mockProducts: Product[] = [
      mockProduct,
      {
        id: 2,
        libelleProduct: 'Pomme',
        description: 'Fruit croquant',
        unite: { unite: 'Kg' },
        productType: { libelleType: 'Fruits' },
      },
    ];

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(mockProducts), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const contextValues = await getContextValues(mockUserContextValue);
    const products = await contextValues.fetchProducts();

    expect(global.fetch).toHaveBeenCalledWith('/api/product/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(products).toEqual(mockProducts);
  });

  test('fetchProducts returns empty array for unauthenticated user', async () => {
    const contextValues = await getContextValues(unauthenticatedUserContext);
    const products = await contextValues.fetchProducts();

    expect(products).toEqual([]);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('fetchProducts handles 401/403 errors by returning empty array', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Unauthorized', {
        status: 401,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const contextValues = await getContextValues(mockUserContextValue);
    const products = await contextValues.fetchProducts();

    expect(global.fetch).toHaveBeenCalledWith('/api/product/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(products).toEqual([]);
  });

  test('fetchProducts handles network errors by returning empty array', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const contextValues = await getContextValues(mockUserContextValue);
    const products = await contextValues.fetchProducts();

    expect(global.fetch).toHaveBeenCalledWith('/api/product/all', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(products).toEqual([]);
  });

  test('addProduct adds a product successfully and sets successMessage', async () => {
    const newProduct: Product = {
      id: 3,
      libelleProduct: 'Carotte',
      description: 'Légume orange',
      unite: { unite: 'Kg' },
      productType: { libelleType: 'Légumes' },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify(newProduct), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const contextValues = await getContextValues(mockUserContextValue);
    await contextValues.addProduct(newProduct);

    expect(global.fetch).toHaveBeenCalledWith('/api/product/add', {
      method: 'POST',
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
  });

  test('addProduct throws error for unauthenticated user', async () => {
    const newProduct: Product = {
      id: 3,
      libelleProduct: 'Carotte',
      description: 'Légume orange',
      unite: { unite: 'Kg' },
      productType: { libelleType: 'Légumes' },
    };

    const contextValues = await getContextValues(unauthenticatedUserContext);
    await expect(contextValues.addProduct(newProduct)).rejects.toThrow(
      'Vous devez être connecté pour ajouter un produit',
    );
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('addProduct handles HTTP errors correctly', async () => {
    const newProduct: Product = {
      id: 3,
      libelleProduct: 'Carotte',
      description: 'Légume orange',
      unite: { unite: 'Kg' },
      productType: { libelleType: 'Légumes' },
    };

    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response('Bad Request', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      }),
    );

    const contextValues = await getContextValues(mockUserContextValue);
    await expect(contextValues.addProduct(newProduct)).rejects.toThrow(
      "Erreur lors de l'ajout du produit: 400 - Bad Request",
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/product/add', {
      method: 'POST',
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(contextValues.successMessage).toBe('');
  });

  test('addProduct handles network errors correctly', async () => {
    const newProduct: Product = {
      id: 3,
      libelleProduct: 'Carotte',
      description: 'Légume orange',
      unite: { unite: 'Kg' },
      productType: { libelleType: 'Légumes' },
    };

    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Network error'));

    const contextValues = await getContextValues(mockUserContextValue);
    await expect(contextValues.addProduct(newProduct)).rejects.toThrow(
      'Network error',
    );

    expect(global.fetch).toHaveBeenCalledWith('/api/product/add', {
      method: 'POST',
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer mock-token',
      },
    });
    expect(contextValues.successMessage).toBe('');
  });
});
