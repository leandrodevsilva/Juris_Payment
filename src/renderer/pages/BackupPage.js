import React, { useState } from 'react';
import { Paper, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';

const BackupPage = ({ showSnackbar }) => {
  const [loadingBackup, setLoadingBackup] = useState(false);
  const [loadingRestore, setLoadingRestore] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleBackup = async () => {
    setLoadingBackup(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const filePath = await window.electronAPI.backupData();
      if (filePath) {
        const message = `Backup realizado com sucesso em: ${filePath}`;
        setSuccessMessage(message);
        if (showSnackbar) showSnackbar(message, 'success');
      } else {
        // User cancelled the save dialog
        if (showSnackbar) showSnackbar('Operação de backup cancelada.', 'info');
      }
    } catch (err) {
      console.error("Erro ao realizar backup:", err);
      const message = `Falha ao realizar backup: ${err.message}`;
      setError(message);
      if (showSnackbar) showSnackbar(message, 'error');
    } finally {
      setLoadingBackup(false);
    }
  };

  const handleRestore = async () => {
    setLoadingRestore(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const filePath = await window.electronAPI.importData();
      if (filePath) {
        const message = `Dados importados com sucesso de: ${filePath}. A aplicação pode precisar ser recarregada ou os dados atualizados nas telas.`;
        setSuccessMessage(message);
        if (showSnackbar) showSnackbar(message, 'success');
        // Optionally, could send a message to main to notify other windows or trigger data refresh
        // window.electronAPI.sendMessage('data-imported-successfully'); // Example
      } else {
        // User cancelled the open dialog
        if (showSnackbar) showSnackbar('Operação de importação cancelada.', 'info');
      }
    } catch (err) {
      console.error("Erro ao importar dados:", err);
      const message = `Falha ao importar dados: ${err.message}`;
      setError(message);
      if (showSnackbar) showSnackbar(message, 'error');
    } finally {
      setLoadingRestore(false);
    }
  };

  return (
    <Paper sx={{ p: 3, flexGrow: 1 }}>
      <Typography variant="h1" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Backup e Restauração de Dados
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, mt: 4 }}>
        <Box sx={{ position: 'relative', width: 'fit-content' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackup}
            disabled={loadingBackup || loadingRestore}
            size="large"
          >
            Realizar Backup dos Dados
          </Button>
          {loadingBackup && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>

        <Typography variant="body1" color="text.primary" sx={{ textAlign: 'center', maxWidth: '600px', mt: 1, mb: 2 }}>
          Clique no botão acima para salvar um arquivo JSON contendo todos os dados de clientes e pagamentos. Guarde este arquivo em local seguro.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '80%', my: 3 }} />

        <Box sx={{ position: 'relative', width: 'fit-content' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleRestore}
            disabled={loadingBackup || loadingRestore}
            size="large"
          >
            Restaurar Dados de um Backup
          </Button>
          {loadingRestore && (
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
        </Box>
        <Alert
          severity="warning"
          sx={{ mt: 1, maxWidth: '600px', '& .MuiAlert-message': { width: '100%', textAlign: 'center' } }}
        >
          A restauração substituirá TODOS os dados existentes no sistema pelos dados do arquivo de backup. Esta ação não pode ser desfeita.
        </Alert>
      </Box>
    </Paper>
  );
};

export default BackupPage;
