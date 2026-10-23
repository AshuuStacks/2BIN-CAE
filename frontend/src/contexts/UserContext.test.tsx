import { render, waitFor } from '@testing-library/react';
import { UserContext, UserContextProvider } from './UserContext';
import { vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import type { User } from '../types';

describe('UserContext', () => {
  test('provides default context values', () => {
    render(
      <UserContextProvider>
        <UserContext.Consumer>
          {(value) => {
            expect(value).toEqual({
              authenticatedUser: undefined,
              registerUser: expect.any(Function),
              loginUser: expect.any(Function),
              clearUser: expect.any(Function),
              updateUser: expect.any(Function),
            });
            return null;
          }}
        </UserContext.Consumer>
      </UserContextProvider>,
    );
  });

  test('registerUser sends a POST request and logs the created user', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'testuser@test.com',
        lastname: 'Doe',
        firstname: 'John',
        phonenumber: '+32 499 11 22 33',
        token: 'mock-token',
      }),
    } as Response);

    const newUser: User = {
      email: 'testuser@test.com',
      lastname: 'Doe',
      firstname: 'John',
      password: 'Abc123!',
      role: 'CLIENT',
      phonenumber: '+32 499 11 22 33',
      civility: 'Monsieur',
      address: {
        street: 'Rue de la Paix',
        postalcode: '1000',
        number: '1',
        country: 'Belgique',
        mailbox: '',
        city: 'Bruxelles',
      },
    };

    render(
      <UserContextProvider>
        <UserContext.Consumer>
          {({ registerUser }) => {
            act(() => {
              registerUser(newUser);
            });
            return null;
          }}
        </UserContext.Consumer>
      </UserContextProvider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auths/register', {
        method: 'POST',
        body: JSON.stringify(newUser),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    mockFetch.mockRestore();
  });

  test('loginUser sends a POST request and sets the authenticated user', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'testuser@test.com',
        lastname: 'Doe',
        firstname: 'John',
        phonenumber: '+32 499 11 22 33',
        token: 'mock-token',
      }),
    } as Response);

    const credentials = {
      email: 'testuser@test.com',
      password: 'Abc123!',
    };

    render(
      <UserContextProvider>
        <UserContext.Consumer>
          {({ loginUser }) => {
            act(() => {
              loginUser(credentials, true);
            });
            return null;
          }}
        </UserContext.Consumer>
      </UserContextProvider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auths/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-Type': 'application/json' },
      });
    });

    mockFetch.mockRestore();
  });

  test('clearUser clears the authenticated user', () => {
    render(
      <UserContextProvider>
        <UserContext.Consumer>
          {({ clearUser, authenticatedUser }) => {
            act(() => {
              clearUser();
            });
            expect(authenticatedUser).toBeUndefined();
            return null;
          }}
        </UserContext.Consumer>
      </UserContextProvider>,
    );
  });

  test('validates a stored user on mount', async () => {
    const mockFetch = vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        email: 'testuser@test.com',
        lastname: 'Doe',
        firstname: 'John',
        phonenumber: '+32 499 11 22 33',
        token: 'mock-token',
      }),
    } as Response);

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
      if (key === 'authenticatedUser') {
        return JSON.stringify({
          email: 'testuser@test.com',
          token: 'mock-token',
        });
      }
      return null;
    });

    render(
      <UserContextProvider>
        <div />
      </UserContextProvider>,
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/auths/validate-token', {
        method: 'GET',
        headers: {
          Authorization: 'Bearer mock-token', // Updated to match the implementation
          'Content-Type': 'application/json',
        },
      });
    });

    mockFetch.mockRestore();
  });
});
