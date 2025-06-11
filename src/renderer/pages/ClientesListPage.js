import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, CircularProgress, Alert, Tooltip, Dialog,
  DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Pagination,
  Card, CardContent, FormControlLabel, Switch
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Icon for the card

const ClientesListPage = ({ showSnackbar }) => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyDebtors, setShowOnlyDebtors] = useState(false); // New state for debt filter
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // const [totalValorAReceber, setTotalValorAReceber] = useState(0); // Removed

  const navigate = useNavigate();

  // const fetchTotalValorAReceber = useCallback(async () => { // Removed
  //   try {
  //     const total = await window.electronAPI.getTotalValorAReceber();
  //     setTotalValorAReceber(total || 0);
  //   } catch (err) {
  //     console.error("Erro ao buscar total a receber:", err);
  //     if (showSnackbar) showSnackbar(`Falha ao carregar total a receber: ${err.message}`, 'error');
  //   }
  // }, [showSnackbar]);

  const fetchClientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await window.electronAPI.getClientes();
      setClientes(data || []);
    } catch (err) {
      console.error("Erro ao buscar clientes:", err);
      const errorMessage = `Falha ao carregar clientes: ${err.message}`;
      setError(errorMessage);
      if (showSnackbar) showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchClientes();
    // fetchTotalValorAReceber(); // Removed

    const relevantMessages = [
      'data-imported-successfully',
      'cliente-updated', 'cliente-added', 'cliente-deleted',
      'acao-judicial-added', 'acao-judicial-updated', 'acao-judicial-deleted',
      'pagamento-added', 'pagamento-updated', 'pagamento-deleted'
    ];

    const unsubscribe = window.electronAPI.onMainMessage((message) => {
      if (relevantMessages.includes(message)) {
        if (showSnackbar && message === 'data-imported-successfully') {
          showSnackbar('Dados importados! Atualizando lista...', 'success'); // Message updated
        }
        fetchClientes();
        // fetchTotalValorAReceber(); // Removed
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchClientes, showSnackbar]); // fetchTotalValorAReceber removed from dependencies

  const handleDeleteDialogOpen = (cliente) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setClienteToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;
    try {
      await window.electronAPI.deleteCliente(clienteToDelete.id);
      // No need to manually filter, useEffect will re-fetch
      if (showSnackbar) showSnackbar('Cliente excluído com sucesso!', 'success');
      window.electronAPI.sendMessage('cliente-deleted'); // This will trigger re-fetch via onMainMessage
    } catch (err) {
      console.error("Erro ao deletar cliente:", err);
      const errorMessage = `Falha ao deletar cliente: ${err.message}`;
      setError(errorMessage);
      if (showSnackbar) showSnackbar(errorMessage, 'error');
    } finally {
      handleDeleteDialogClose();
    }
  };

  const handleEditCliente = (id) => {
    navigate(`/clientes/editar/${id}`);
  };

  const handleViewCliente = (id) => {
    navigate(`/clientes/${id}`);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const filteredClientes = clientes
    .filter(cliente => { // Debt filter
      if (!showOnlyDebtors) {
        return true; // If not filtering by debtors, include all
      }
      const valorEmAberto = (cliente.valorTotalCliente || 0) - (cliente.valorPagoCliente || 0);
      return valorEmAberto > 0;
    })
    .filter(cliente => { // Existing search filter
      const searchLower = searchTerm.toLowerCase();
      if (!searchLower) return true; // if no search term, include all from previous filter
      return (
        cliente.nomeCompleto?.toLowerCase().includes(searchLower) ||
        cliente.cpfCnpj?.toLowerCase().includes(searchLower) ||
        cliente.numeroProcesso?.toLowerCase().includes(searchLower) 
      );
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClientes = filteredClientes.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  if (loading && clientes.length === 0) { // Show full page loader only if no clients are loaded yet
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 48px)', p: 3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Carregando dados...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, margin: 'auto', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, flexWrap: 'wrap' }}>
        <Typography variant="h1" component="h1" sx={{ mb: { xs: 2, md: 0 } }}>Lista de Clientes</Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Card removido */}
          <Button variant="contained" color="primary" startIcon={<AddIcon />} component={RouterLink} to="/clientes/novo">
            Novo Cliente
          </Button>
        </Box>
      </Box>

      {error && !loading && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar Cliente (Nome, CPF/CNPJ ou Nº Processo)"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} /> }}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: theme => theme.shape.borderRadius * 2 }, mb: 1 }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={showOnlyDebtors}
              onChange={(e) => {
                setShowOnlyDebtors(e.target.checked);
                setCurrentPage(1); // Reset page when filter changes
              }}
            />
          }
          label="Mostrar apenas clientes com débitos"
          sx={{mb:1}}
        />
      </Box>

      {currentClientes.length === 0 && !loading && !error && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          Nenhum cliente encontrado.
          {searchTerm && ` Para o termo: "${searchTerm}".`}
          {!searchTerm && " Que tal adicionar um novo?"}
        </Typography>
      )}

      {currentClientes.length > 0 && (
        <>
          <TableContainer component={Paper} elevation={0} sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
            <Table sx={{ minWidth: 650 }} aria-label="tabela de clientes">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>Nome Completo</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>CPF/CNPJ</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>Valor Total</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>Valor Pago</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>Valor em Aberto</TableCell>
                  <TableCell sx={{ py: 1.5, fontWeight: 'bold', textAlign: 'center' }}>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentClientes.map((cliente) => {
                  const valorEmAberto = (cliente.valorTotalCliente || 0) - (cliente.valorPagoCliente || 0);
                  return (
                    <TableRow
                      key={cliente.id}
                      hover
                      sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }, '&:last-child td, &:last-child th': { border: 0 } }}
                    >
                      <TableCell component="th" scope="row" sx={{ py: 1.5, textAlign: 'center' }}>{cliente.nomeCompleto}</TableCell>
                      <TableCell sx={{ py: 1.5, textAlign: 'center' }}>{cliente.cpfCnpj}</TableCell>
                      <TableCell align="center" sx={{ py: 1.5 }}>{formatCurrency(cliente.valorTotalCliente || 0)}</TableCell>
                      <TableCell align="center" sx={{ py: 1.5, color: 'success.main', fontWeight: 'medium' }}>{formatCurrency(cliente.valorPagoCliente || 0)}</TableCell>
                      <TableCell align="center" sx={{ py: 1.5, color: valorEmAberto > 0 ? 'error.main' : 'text.primary', fontWeight: 'medium' }}>
                        {formatCurrency(valorEmAberto)}
                      </TableCell>
                      <TableCell align="center" sx={{ py: 1, whiteSpace: 'nowrap' }}>
                        <Tooltip title="Ver Detalhes/Ações/Pagamentos">
                          <IconButton onClick={() => handleViewCliente(cliente.id)} color="info" size="small" sx={{ mx: 0.25 }}>
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar Cliente">
                          <IconButton onClick={() => handleEditCliente(cliente.id)} color="primary" size="small" sx={{ mx: 0.25 }}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir Cliente">
                          <IconButton onClick={() => handleDeleteDialogOpen(cliente)} color="error" size="small" sx={{ mx: 0.25 }}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, mb:1 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
        <DialogTitle id="alert-dialog-title" variant="h2">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" variant="body1">
            Tem certeza que deseja excluir o cliente "{clienteToDelete?.nomeCompleto}"?
            Esta ação não pode ser desfeita e todos os pagamentos associados também serão removidos.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt:0 }}>
          <Button onClick={handleDeleteDialogClose} color="primary" variant="outlined">Cancelar</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>Excluir</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ClientesListPage;
