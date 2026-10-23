import { createContext, useState, ReactNode, useEffect } from 'react';
import {
  MaybeAuthenticatedUser,
  UserContextType,
  User,
  AuthenticatedUser,
  Credentials,
} from '../types';
import {
  clearAuthenticatedUser,
  storeAuthenticatedUser,
  getAuthenticatedUser,
} from '../utils/session';

const defaultUserContext: UserContextType = {
  authenticatedUser: undefined,
  registerUser: async () => {},
  loginUser: async () => {},
  clearUser: () => {},
  updateUser: async () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);

const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [authenticatedUser, setAuthenticatedUser] =
    useState<MaybeAuthenticatedUser>(undefined);
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [tokenExpired, setTokenExpired] = useState<boolean>(false);

  useEffect(() => {
    const storedUser = getAuthenticatedUser();
    if (storedUser && !tokenExpired) {
      fetch('/api/auths/validate-token', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${storedUser.token}`, // Ajout de "Bearer "
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (!response.ok) {
            console.log(
              'Token expiré ou invalide, tentative de déconnexion...',
            );
            throw new Error('Token invalide');
          }
          return response.json();
        })
        .then((data) => {
          console.log('Utilisateur validé depuis token:', data);
          setAuthenticatedUser(data);
          if (rememberMe) storeAuthenticatedUser(data, true);
        })
        .catch((error) => {
          console.error('Échec de la validation du token:', error);
          clearAuthenticatedUser();
          setAuthenticatedUser(undefined);
          setTokenExpired(true);
        });
    }
  }, [rememberMe, tokenExpired]);

  const loginUser = async (credentials: Credentials, remember: boolean) => {
    try {
      const response = await fetch('/api/auths/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok)
        throw new Error(
          `Erreur lors du login: ${response.status} : ${response.statusText}`,
        );

      const authenticatedUser: AuthenticatedUser = await response.json();
      console.log('Utilisateur authentifié depuis login:', authenticatedUser);
      setAuthenticatedUser(authenticatedUser);
      setRememberMe(remember);

      if (remember) {
        storeAuthenticatedUser(authenticatedUser, true);
      }

      setTokenExpired(false);
      setTimeout(() => setTokenExpired(true), 24 * 60 * 60 * 1000); // Expire après 24h
    } catch (err) {
      console.error('Erreur lors du login:', err);
      throw err;
    }
  };

  const registerUser = async (newUser: User) => {
    try {
      const options = {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const response = await fetch('/api/auths/register', options);

      if (!response.ok) {
        throw new Error(
          `Fetch error: ${response.status} : ${response.statusText}`,
        );
      }

      const createdUser: AuthenticatedUser = await response.json();
      console.log('Created user:', createdUser);
    } catch (err) {
      console.error('registerUser::error:', err);
      throw err;
    }
  };

  const clearUser = () => {
    clearAuthenticatedUser();
    setAuthenticatedUser(undefined);
    setTokenExpired(true);
  };

  const updateUser = async (updatedUser: AuthenticatedUser) => {
    setAuthenticatedUser(updatedUser);
    if (rememberMe) {
      storeAuthenticatedUser(updatedUser, true);
    }
    setTokenExpired(false); // Réinitialiser l'expiration après mise à jour
  };

  const myContext: UserContextType = {
    authenticatedUser,
    registerUser,
    loginUser,
    clearUser,
    updateUser,
  };

  return (
    <UserContext.Provider value={myContext}>{children}</UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
