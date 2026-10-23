import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import App from './components/App/index.tsx';
import HomePage from './components/pages/HomePage.tsx';
import RegisterPage from './components/pages/RegisterPage.tsx';
import LoginPage from './components/pages/LoginPage.tsx';
import ProposeLotPage from './components/pages/ProposeLotPage.tsx';
import AddProductPage from './components/pages/AddProductPage.tsx';
import LotDetailsPage from './components/pages/LotDetailsPage.tsx'; // Ajusté à LotDetailsPage
import MyReservationsPage from './components/pages/MyReservationsPage.tsx';
import ManagePendingLotsPage from './components/pages/ManagePendingLotsPage.tsx';
import ReserveLotPage from './components/pages/ReserveLotPage.tsx';
import ReservationDetailPage from './components/pages/ReservationDetailsPage.tsx';
import MesLotsPage from './components/pages/MesLotsPage.tsx';
import AccountPage from './components/pages/AccountPage.tsx';
import RegisterManagerProducerPage from './components/pages/RegisterManagerProducerPage.tsx';
import { ProductContextProvider } from './contexts/ProductContext';
import { UserContextProvider } from './contexts/UserContext.tsx';
import { LotContextProvider } from './contexts/LotContext';
import { ReservationProvider } from './contexts/ReservationContext';
import { ThemeProvider } from '@mui/material/styles';
import theme from './themes.ts';

import '@fontsource/roboto/700.css';
import CssBaseline from '@mui/material/CssBaseline';
import MyCartPage from './components/pages/MyCartPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'addProduct', element: <AddProductPage /> },
      { path: 'propose-lot', element: <ProposeLotPage /> },
      { path: 'my-lots', element: <MesLotsPage /> },
      { path: 'account', element: <AccountPage /> },
      {
        path: 'reservation-details/:idReservation',
        element: <ReservationDetailPage />,
      },

      {
        path: 'register-manager-producer',
        element: <RegisterManagerProducerPage />,
      },
      { path: 'cart', element: <MyCartPage /> }, // Supprimez la duplication

      { path: 'my-reservations', element: <MyReservationsPage /> },
      { path: 'reserve-lot', element: <ReserveLotPage /> },
      { path: 'lot-details/:idLot', element: <LotDetailsPage /> }, // Ajusté à LotDetailsPage
      { path: 'manage-pending-lots', element: <ManagePendingLotsPage /> }, // Ajouté
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <UserContextProvider>
        <ProductContextProvider>
          <LotContextProvider>
            <ReservationProvider>
              <RouterProvider router={router} />
            </ReservationProvider>
          </LotContextProvider>
        </ProductContextProvider>
      </UserContextProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
