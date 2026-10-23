import { createContext, ReactNode, useState, useContext } from 'react';
import { ProductContextType, Product } from '../types';
import { UserContext } from './UserContext';

const defaultProductContext: ProductContextType = {
  addProduct: async () => {},
  fetchProducts: async () => [],
  successMessage: '',
  setSuccessMessage: () => {},
};

const ProductContext = createContext<ProductContextType>(defaultProductContext);

const ProductContextProvider = ({ children }: { children: ReactNode }) => {
  const [successMessage, setSuccessMessage] = useState<string>('');
  const { authenticatedUser } = useContext(UserContext);

  // Fonction pour ajouter un produit
  const addProduct = async (newProduct: Product) => {
    console.log('addProduct called with:', newProduct);
    try {
      if (!authenticatedUser || !authenticatedUser.token) {
        throw new Error('Vous devez être connecté pour ajouter un produit');
      }
      const token = authenticatedUser.token;
      console.log('Token envoyé dans la requête :', token);

      const options = {
        method: 'POST',
        body: JSON.stringify(newProduct),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await fetch('/api/product/add', options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur lors de l'ajout du produit: ${response.status} - ${errorText}`,
        );
      }

      const createdProduct: Product = await response.json();
      console.log('Produit créé:', createdProduct);
      setSuccessMessage('Le produit a été ajouté avec succès !');
    } catch (err) {
      console.error('addProduct::error:', err);
      throw err;
    }
  };

  // Fonction pour récupérer les produits
  const fetchProducts = async (): Promise<Product[]> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (authenticatedUser && authenticatedUser.token) {
        headers['Authorization'] = `Bearer ${authenticatedUser.token}`;
        console.log(
          'Envoi du token pour fetchProducts:',
          authenticatedUser.token,
        );
      } else {
        console.warn('Aucun utilisateur authentifié pour fetchProducts');
        return []; // Retourner une liste vide si pas d'utilisateur
      }

      const response = await fetch('/api/product/all', {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401 || response.status === 403) {
          console.warn(`Accès refusé: ${response.status} - ${errorText}`);
          return [];
        }
        throw new Error(
          `Erreur lors de la récupération des produits: ${response.status} - ${errorText}`,
        );
      }
      const products: Product[] = await response.json();
      console.log('Produits récupérés:', products);
      return products;
    } catch (err) {
      console.error('fetchProducts::error:', err);
      return []; // Retourner une liste vide en cas d'erreur
    }
  };

  const myContext: ProductContextType = {
    addProduct,
    fetchProducts,
    successMessage,
    setSuccessMessage,
  };

  return (
    <ProductContext.Provider value={myContext}>
      {children}
    </ProductContext.Provider>
  );
};

export { ProductContext, ProductContextProvider };
