import React, { useState } from 'react';
import { ThemeModeProvider } from './context/ThemeModeContext';
import { HashRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Alert, Snackbar, CssBaseline } from '@mui/material'; // Added CssBaseline
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useContext } from 'react';
import { ThemeModeContext } from './context/ThemeModeContext';

import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import DashboardPage from './pages/DashboardPage';
import ClientesListPage from './pages/ClientesListPage';
import AddClientePage from './pages/AddClientePage';
import EditClientePage from './pages/EditClientePage';
import ClienteDetailPage from './pages/ClienteDetailPage';
import BackupPage from './pages/BackupPage';
import HelpPage from './pages/HelpPage';

const drawerWidth = 240;

function AppContent() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const themeModeContext = useContext(ThemeModeContext);

  let appLogo = null;
  try {
    // eslint-disable-next-line global-require, import/no-unresolved, @typescript-eslint/no-var-requires
    appLogo = require('./assets/logo.png');
  } catch (e) {
    // appLogo remains null
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const drawer = (
    <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }}>
      <Toolbar sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {appLogo && (
            <Box
              component="img"
              src={appLogo}
              alt="Juris Payment Logo"
              sx={{
                height: '96px',
                width: 'auto',
                mb: 1,
                display: 'block',
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                console.error("App logo image failed to load in browser, even though it was required.");
              }}
            />
          )}
          <Typography variant="h1" noWrap component="div" sx={{ color: 'primary.main' }}>
            Juris Payment
          </Typography>
        </Box>
      </Toolbar>
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
        <ListItem button component={RouterLink} to="/clientes">
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Clientes" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
        <ListItem button component={RouterLink} to="/backup">
          <ListItemIcon><SettingsBackupRestoreIcon /></ListItemIcon>
          <ListItemText primary="Backup / Restore" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
        <ListItem button component={RouterLink} to="/ajuda">
          <ListItemIcon><HelpOutlineIcon /></ListItemIcon>
          <ListItemText primary="Ajuda" primaryTypographyProps={{ variant: 'body1' }} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Router>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <AppBar
          position="fixed"
          sx={{
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            ml: { sm: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton sx={{ ml: 1 }} onClick={themeModeContext.toggleThemeMode} color="inherit">
              {themeModeContext.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          component="nav"
          sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          aria-label="mailbox folders"
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, overflowX: 'hidden' },
            }}
          >
            {drawer}
          </Drawer>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, overflowX: 'hidden' },
            }}
            open
          >
            {drawer}
          </Drawer>
        </Box>

        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, mt: '64px' }}
        >
          <Routes>
            <Route path="/" element={<DashboardPage showSnackbar={showSnackbar} />} />
            <Route path="/clientes" element={<ClientesListPage showSnackbar={showSnackbar} />} />
            <Route path="/clientes/novo" element={<AddClientePage showSnackbar={showSnackbar} />} />
            <Route path="/clientes/editar/:id" element={<EditClientePage showSnackbar={showSnackbar} />} />
            <Route path="/clientes/:id" element={<ClienteDetailPage showSnackbar={showSnackbar} />} />
            <Route path="/backup" element={<BackupPage showSnackbar={showSnackbar} />} />
            <Route path="/ajuda" element={<HelpPage showSnackbar={showSnackbar} />} />
          </Routes>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Router>
  );
}

const App = () => (
  <ThemeModeProvider>
    <CssBaseline /> {/* Added CssBaseline here */}
    <AppContent />
  </ThemeModeProvider>
);

export default App;
