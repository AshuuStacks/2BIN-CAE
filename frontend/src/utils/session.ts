import { AuthenticatedUser, MaybeAuthenticatedUser } from '../types';

// Function to store the authenticated user in localStorage or sessionStorage
const storeAuthenticatedUser = (
  authenticatedUser: AuthenticatedUser,
  rememberMe: boolean,
) => {
  // Determine the storage type based on the rememberMe flag
  const storage = rememberMe ? localStorage : sessionStorage;
  console.log('Remember me:', rememberMe);
  console.log(
    'Storage used:',
    storage === localStorage ? 'localStorage' : 'sessionStorage',
  );
  // Store the authenticated user as a JSON string
  storage.setItem('authenticatedUser', JSON.stringify(authenticatedUser));
  console.log('Store User in Storage: ', storage);
};

// Function to recover the authenticated user from localStorage or sessionStorage
const getAuthenticatedUser = (): MaybeAuthenticatedUser => {
  // Retrieve the authenticated user from localStorage or sessionStorage
  const authenticatedUser =
    localStorage.getItem('authenticatedUser') ||
    sessionStorage.getItem('authenticatedUser');
  if (!authenticatedUser) return undefined;
  // Parse the JSON string to an object
  return JSON.parse(authenticatedUser);
};

// Function to clear the authenticated user from both localStorage and sessionStorage
const clearAuthenticatedUser = () => {
  localStorage.removeItem('authenticatedUser');
  sessionStorage.removeItem('authenticatedUser');
};

export { storeAuthenticatedUser, getAuthenticatedUser, clearAuthenticatedUser };
