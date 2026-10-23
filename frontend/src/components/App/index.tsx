import { Outlet } from 'react-router-dom';
import Footer from '../Footer';
import Header from '../Header';
import NavBar from '../Navbar';
import Box from '@mui/material/Box';
import { Container } from '@mui/material';

// Define the App component
const App = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header
        title="Welcome"
        version={0 + 1}
        handleHeaderClick={() => {
          console.log('Header clicked');
        }} // Remplace la fonction non implémentée
      />
      <NavBar /> {/* Déplacé hors du Container */}
      <Container
        component="main"
        sx={{
          flex: '1',
        }}
      >
        <Outlet context={{}} />
      </Container>
      <Footer />
    </Box>
  );
};

// Export the App component as the default export
export default App;
