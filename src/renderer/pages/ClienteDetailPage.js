import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, Grid, CircularProgress, Alert, IconButton,
  List, ListItem, ListItemText, Divider, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, InputAdornment, Card, CardContent, Chip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import GavelIcon from '@mui/icons-material/Gavel';

const ClienteDetailPage = ({ showSnackbar }) => {
  const navigate = useNavigate();
  const { id: clienteId } = useParams();
  const [cliente, setCliente] = useState(null);
  const [acoesJudiciais, setAcoesJudiciais] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // State for action status filter

  const [loadingCliente, setLoadingCliente] = useState(true);
  const [loadingAcoesJudiciais, setLoadingAcoesJudiciais] = useState(true);
  const [error, setError] = useState(null);

  // State for Add/Edit AcaoJudicial Dialog
  const [openAcaoDialog, setOpenAcaoDialog] = useState(false);
  const [currentAcao, setCurrentAcao] = useState(null);
  const [acaoFormData, setAcaoFormData] = useState({ tipoAcao: '', numeroProcesso: '', valorAcao: '', observacoes: '' });
  const [savingAcao, setSavingAcao] = useState(false);
  const [acaoDialogError, setAcaoDialogError] = useState(null);

  // State for Delete AcaoJudicial Dialog
  const [openDeleteAcaoDialog, setOpenDeleteAcaoDialog] = useState(false);
  const [acaoToDelete, setAcaoToDelete] = useState(null);
  const [deletingAcao, setDeletingAcao] = useState(false);
  const [deleteAcaoError, setDeleteAcaoError] = useState(null);

  // State for Payment Management
  const [openPaymentListDialog, setOpenPaymentListDialog] = useState(false);
  const [openPaymentFormDialog, setOpenPaymentFormDialog] = useState(false);
  const [selectedAcaoForPayments, setSelectedAcaoForPayments] = useState(null);
  const [pagamentosDaAcao, setPagamentosDaAcao] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);
  const [paymentFormData, setPaymentFormData] = useState({ dataPagamento: new Date().toISOString().slice(0,10), valorPago: '', observacao: '' });
  const [savingPayment, setSavingPayment] = useState(false);
  const [paymentDialogError, setPaymentDialogError] = useState(null);
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(false);

  const refreshAllData = useCallback(async () => {
    if (!clienteId) return;
    setLoadingCliente(true);
    setLoadingAcoesJudiciais(true);
    setError(null);
    try {
      const clienteData = await window.electronAPI.getClienteById(parseInt(clienteId, 10));
      if (!clienteData) throw new Error("Cliente não encontrado.");
      setCliente(clienteData);

      const acoesData = await window.electronAPI.getAcoesJudiciaisByClienteId(parseInt(clienteId, 10));
      setAcoesJudiciais(acoesData || []);
    } catch (err) {
      const errorMsg = `Falha ao carregar dados: ${err.message}`;
      setError(errorMsg);
      if (showSnackbar) showSnackbar(errorMsg, 'error');
    } finally {
      setLoadingCliente(false);
      setLoadingAcoesJudiciais(false);
    }
  }, [clienteId, showSnackbar]);

  useEffect(() => {
    refreshAllData();
    const unsubscribe = window.electronAPI.onMainMessage((message) => {
      if (message === 'cliente-updated' || message === 'pagamento-updated' || message === 'acao-judicial-updated') {
        if (showSnackbar) showSnackbar('Dados atualizados!', 'info');
        refreshAllData();
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [refreshAllData, showSnackbar]);

  const handleStatusFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setStatusFilter(newFilter);
    }
  };

  // --- Add/Edit AcaoJudicial Dialog Handlers ---
  const handleOpenAcaoDialog = (acao = null) => {
    setAcaoDialogError(null);
    setCurrentAcao(acao);
    if (acao) {
      setAcaoFormData({
        tipoAcao: acao.tipoAcao || '',
        numeroProcesso: acao.numeroProcesso || '',
        valorAcao: acao.valorAcao ? String(acao.valorAcao) : '',
        observacoes: acao.observacoes || ''
      });
    } else {
      setAcaoFormData({ tipoAcao: '', numeroProcesso: '', valorAcao: '', observacoes: '' });
    }
    setOpenAcaoDialog(true);
  };

  const handleCloseAcaoDialog = () => {
    setOpenAcaoDialog(false);
    setCurrentAcao(null);
    setAcaoDialogError(null);
    setSavingAcao(false);
  };

  const handleAcaoFormChange = (event) => {
    const { name, value } = event.target;
    if (name === "valorAcao") {
      if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        setAcaoFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setAcaoFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveAcao = async () => {
    setSavingAcao(true);
    setAcaoDialogError(null);

    if (!acaoFormData.tipoAcao.trim()) {
      const errMsg = "Tipo da Ação é obrigatório.";
      setAcaoDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'warning');
      setSavingAcao(false);
      return;
    }

    const valorAcaoNum = acaoFormData.valorAcao ? parseFloat(acaoFormData.valorAcao) : null;
    if (acaoFormData.valorAcao && (isNaN(valorAcaoNum) || valorAcaoNum < 0)) {
      const errMsg = "Valor da Ação deve ser um número positivo ou vazio.";
      setAcaoDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'warning');
      setSavingAcao(false);
      return;
    }

    const acaoDataPayload = {
      ...acaoFormData,
      valorAcao: valorAcaoNum,
      clienteId: parseInt(clienteId, 10),
    };

    try {
      if (currentAcao) {
        await window.electronAPI.updateAcaoJudicial({ ...acaoDataPayload, id: currentAcao.id });
        if (showSnackbar) showSnackbar('Ação Judicial atualizada com sucesso!', 'success');
      } else {
        await window.electronAPI.addAcaoJudicial(acaoDataPayload);
        if (showSnackbar) showSnackbar('Ação Judicial adicionada com sucesso!', 'success');
      }
      window.electronAPI.sendMessage('acao-judicial-updated');
      await refreshAllData();
      handleCloseAcaoDialog();
      setAcaoFormData({ tipoAcao: '', numeroProcesso: '', valorAcao: '', observacoes: '' });
    } catch (err) {
      const errMsg = `Falha ao salvar Ação Judicial: ${err.message}`;
      setAcaoDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'error');
    } finally {
      setSavingAcao(false);
    }
  };

  // --- Delete AcaoJudicial Dialog Handlers ---
  const handleOpenDeleteAcaoDialog = (acao) => {
    setAcaoToDelete(acao);
    setOpenDeleteAcaoDialog(true);
    setDeleteAcaoError(null);
  };

  const handleCloseDeleteAcaoDialog = () => {
    setOpenDeleteAcaoDialog(false);
    setAcaoToDelete(null);
    setDeletingAcao(false);
    setDeleteAcaoError(null);
  };

  const handleConfirmDeleteAcao = async () => {
    if (!acaoToDelete) return;
    setDeletingAcao(true);
    setDeleteAcaoError(null);
    try {
      await window.electronAPI.deleteAcaoJudicial(acaoToDelete.id);
      if (showSnackbar) showSnackbar('Ação Judicial excluída com sucesso!', 'success');
      window.electronAPI.sendMessage('acao-judicial-updated');
      await refreshAllData();
      handleCloseDeleteAcaoDialog();
    } catch (err) {
      const errMsg = `Falha ao excluir Ação Judicial: ${err.message}`;
      setDeleteAcaoError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'error');
    } finally {
      setDeletingAcao(false);
    }
  };

  // --- Payment Management Handlers ---
  const handleOpenPaymentListDialog = async (acao) => {
    setSelectedAcaoForPayments(acao);
    setPaymentDialogError(null);
    try {
      const pagamentos = await window.electronAPI.getPagamentosByAcaoId(acao.id);
      setPagamentosDaAcao(pagamentos || []);
      setOpenPaymentListDialog(true);
    } catch (err) {
      const errMsg = `Falha ao carregar pagamentos: ${err.message}`;
      setPaymentDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'error');
    }
  };

  const handleClosePaymentListDialog = () => {
    setOpenPaymentListDialog(false);
    setSelectedAcaoForPayments(null);
    setPagamentosDaAcao([]);
    setPaymentDialogError(null);
  };

  const handleOpenPaymentFormDialog = (payment = null) => {
    setPaymentDialogError(null);
    setCurrentPayment(payment);
    if (payment) {
      setPaymentFormData({
        dataPagamento: payment.dataPagamento.slice(0,10),
        valorPago: String(payment.valorPago),
        observacao: payment.observacao || ''
      });
    } else {
      setPaymentFormData({ dataPagamento: new Date().toISOString().slice(0,10), valorPago: '', observacao: '' });
    }
    setOpenPaymentFormDialog(true);
  };

  const handleClosePaymentFormDialog = () => {
    setOpenPaymentFormDialog(false);
    setCurrentPayment(null);
    setPaymentFormData({ dataPagamento: new Date().toISOString().slice(0,10), valorPago: '', observacao: '' });
    setSavingPayment(false);
    setPaymentDialogError(null);
  };

  const handlePaymentFormChange = (event) => {
    const { name, value } = event.target;
    if (name === "valorPago") {
      if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        setPaymentFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setPaymentFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSavePayment = async () => {
    setSavingPayment(true);
    setPaymentDialogError(null);

    if (!paymentFormData.dataPagamento || !paymentFormData.valorPago.trim()) {
      const errMsg = "Data do Pagamento e Valor Pago são obrigatórios.";
      setPaymentDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'warning');
      setSavingPayment(false);
      return;
    }

    const valorPagoNum = parseFloat(paymentFormData.valorPago.replace(',', '.'));
    if (isNaN(valorPagoNum) || valorPagoNum <= 0) {
      const errMsg = "Valor Pago deve ser um número positivo.";
      setPaymentDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'warning');
      setSavingPayment(false);
      return;
    }

    if (!selectedAcaoForPayments || !selectedAcaoForPayments.id) {
      const errMsg = "Ação Judicial não selecionada para o pagamento.";
      setPaymentDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'error');
      setSavingPayment(false);
      return;
    }

    const paymentDataPayload = {
      ...paymentFormData,
      valorPago: valorPagoNum,
      clienteId: parseInt(clienteId, 10),
      acaoId: selectedAcaoForPayments.id,
    };

    try {
      let successMsg = '';
      if (currentPayment) {
        await window.electronAPI.updatePagamento({ ...paymentDataPayload, id: currentPayment.id });
        successMsg = 'Pagamento atualizado com sucesso!';
      } else {
        await window.electronAPI.addPagamento(paymentDataPayload);
        successMsg = 'Pagamento adicionado com sucesso!';
      }
      if (showSnackbar) showSnackbar(successMsg, 'success');
      window.electronAPI.sendMessage('pagamento-updated');

      const updatedPagamentos = await window.electronAPI.getPagamentosByAcaoId(selectedAcaoForPayments.id);
      setPagamentosDaAcao(updatedPagamentos || []);
      await refreshAllData();

      handleClosePaymentFormDialog();
    } catch (err) {
      const errMsg = `Falha ao salvar pagamento: ${err.message}`;
      setPaymentDialogError(errMsg);
      if (showSnackbar) showSnackbar(errMsg, 'error');
    } finally {
      setSavingPayment(false);
    }
  };

  const handleDeletePaymentDialogOpen = (payment) => {
    setPaymentToDelete(payment);
    setDeletePaymentDialogOpen(true);
  };

  const handleDeletePaymentDialogClose = () => {
    setPaymentToDelete(null);
    setDeletePaymentDialogOpen(false);
  };

  const handleConfirmDeletePayment = async () => {
    if (!paymentToDelete || !selectedAcaoForPayments) return;
    setDeletingPayment(true);
    setPaymentDialogError(null);
    try {
      await window.electronAPI.deletePagamento(paymentToDelete.id);
      if (showSnackbar) showSnackbar('Pagamento excluído com sucesso!', 'success');
      window.electronAPI.sendMessage('pagamento-updated');

      const updatedPagamentos = await window.electronAPI.getPagamentosByAcaoId(selectedAcaoForPayments.id);
      setPagamentosDaAcao(updatedPagamentos || []);
      await refreshAllData();

      handleDeletePaymentDialogClose();
    } catch (err) {
      const errMsg = `Falha ao excluir pagamento: ${err.message}`;
      if (showSnackbar) showSnackbar(errMsg, 'error');
      setPaymentDialogError(errMsg);
    } finally {
      setDeletingPayment(false);
    }
  };

  const DetailItem = ({ primary, secondary, primaryVariant = "body2", secondaryVariant = "body1", sx = {} }) => (
    <ListItem sx={{ py: 0.5, ...sx }}>
      <ListItemText
        primary={<Typography variant={primaryVariant} color="text.secondary">{primary}</Typography>}
        secondary={<Typography variant={secondaryVariant} color="text.primary" sx={{ fontWeight: primary.toLowerCase().includes('restante') ? 500 : 'normal' }}>{secondary}</Typography>}
      />
    </ListItem>
  );

  if (loadingCliente) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 48px)', p:3 }}>
        <CircularProgress /> <Typography variant="body1" sx={{ ml: 2 }}>Carregando cliente...</Typography>
      </Box>
    );
  }

  if (error && !cliente) {
    return (
      <Paper sx={{ p:3, m:2, textAlign:'center' }}>
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" onClick={() => navigate('/clientes')} sx={{mt:2}}>Voltar para Lista</Button>
      </Paper>
    );
  }
  
  return (
    <Paper sx={{ p: {xs: 2, sm:3}, margin: 'auto', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" component="h1" sx={{ flexGrow: 1 }}>
          {cliente?.nomeCompleto || 'Detalhes do Cliente'}
        </Typography>
        <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            component={RouterLink}
            to={`/clientes/editar/${clienteId}`}
        >
            Editar Cliente
        </Button>
      </Box>

      {error && !openAcaoDialog && !openPaymentListDialog && !openPaymentFormDialog && !openDeleteAcaoDialog && 
        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} md={12}>
          <Card sx={{height: '100%'}}>
            <CardContent>
              <Typography variant="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 1, verticalAlign: 'bottom' }} /> Informações Pessoais
              </Typography>
              <List dense disablePadding>
                <DetailItem primary="CPF/CNPJ:" secondary={cliente?.cpfCnpj || 'N/A'} />
                <DetailItem primary="Telefone:" secondary={cliente?.telefone || 'N/A'} />
                <DetailItem primary="Email:" secondary={cliente?.email || 'N/A'} />
                <DetailItem primary="Endereço:" secondary={cliente?.endereco || 'N/A'} />
                <DetailItem primary="Data de Cadastro:" secondary={cliente?.dataCadastro ? new Date(cliente.dataCadastro).toLocaleDateString('pt-BR') : 'N/A'} />
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap:1 }}>
        <Typography variant="h2" component="h2" sx={{ display: 'flex', alignItems: 'center' }}>
            <GavelIcon sx={{mr:1, verticalAlign:'bottom'}}/>Ações Judiciais
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenAcaoDialog()}
        >
          Adicionar Nova Ação
        </Button>
      </Box>

      {/* Filter Toggle Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ToggleButtonGroup
          color="primary"
          value={statusFilter}
          exclusive
          onChange={handleStatusFilterChange}
          aria-label="Filtro de status da ação"
        >
          <ToggleButton value="all">Todas</ToggleButton>
          <ToggleButton value="pending">Pendentes</ToggleButton>
          <ToggleButton value="paid">Pagas</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loadingAcoesJudiciais ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress /></Box>
      ) : acoesJudiciais.length === 0 && statusFilter === 'all' ? ( // Show only if no actions at all and filter is 'all'
        <Typography variant="body1" sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
            Nenhuma ação judicial cadastrada para este cliente.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {acoesJudiciais
            .filter(acao => {
              if (statusFilter === 'pending') {
                return acao.valorRestanteNaAcao > 0;
              }
              if (statusFilter === 'paid') {
                return acao.valorRestanteNaAcao <= 0;
              }
              return true; // 'all' or any other case
            })
            .map((acao) => {
              const isPendente = acao.valorRestanteNaAcao > 0;
              const statusLabel = isPendente ? "Pendente" : "Pago";
              const statusColor = isPendente ? "warning" : "success";

            return (
              <Grid item xs={12} sm={6} md={4} key={acao.id}>
                <Card sx={{height: '100%', display: 'flex', flexDirection: 'column', position: 'relative'}}>
                  <Chip 
                    label={statusLabel} 
                    color={statusColor} 
                    size="small" 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8,
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      fontSize: '0.7rem',
                      height: '20px',
                      '& .MuiChip-label': {
                        paddingLeft: '8px',
                        paddingRight: '8px',
                      }
                    }} 
                  />
                  <CardContent sx={{flexGrow: 1}}>
                    <Typography variant="h3" component="h3" gutterBottom sx={{pr: statusLabel.length > 6 ? '70px' : '60px' }}>
                      {acao.tipoAcao || 'Ação Sem Tipo'}
                    </Typography>
                    <DetailItem primary="Nº Processo:" secondary={acao.numeroProcesso || 'N/A'} />
                    <DetailItem primary="Valor da Ação:" secondary={parseFloat(acao.valorAcao || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
                    <DetailItem primary="Total Pago:" secondary={parseFloat(acao.totalPagoNaAcao || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sx={{ '& .MuiListItemText-secondary': { color: 'success.main', fontWeight: 500 } }}/>
                    <DetailItem primary="Valor Restante:" secondary={parseFloat(acao.valorRestanteNaAcao || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sx={{ '& .MuiListItemText-secondary': { color: acao.valorRestanteNaAcao < 0 ? 'error.main' : (acao.valorRestanteNaAcao === 0 ? 'text.primary' : 'primary.main'), fontWeight: 500 }}}/>
                    <DetailItem primary="Data Cadastro:" secondary={new Date(acao.dataCadastro).toLocaleDateString('pt-BR')} />
                    {acao.observacoes && (
                      <DetailItem 
                        primary="Observações:" 
                        secondary={
                          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {acao.observacoes}
                          </Typography>
                        } 
                      />
                    )}
                  </CardContent>
                  <Box sx={{ p: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                     <Button size="small" variant="outlined" startIcon={<PaymentsIcon />} onClick={() => handleOpenPaymentListDialog(acao)}>
                      Pagamentos
                    </Button>
                    <Tooltip title="Editar Ação">
                      <IconButton size="small" onClick={() => handleOpenAcaoDialog(acao)} color="primary">
                        <EditIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir Ação">
                      <IconButton size="small" onClick={() => handleOpenDeleteAcaoDialog(acao)} color="error">
                        <DeleteIcon fontSize="small"/>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      {/* Message if filter results in no actions */}
      {acoesJudiciais.length > 0 && 
       acoesJudiciais.filter(acao => {
          if (statusFilter === 'pending') return acao.valorRestanteNaAcao > 0;
          if (statusFilter === 'paid') return acao.valorRestanteNaAcao <= 0;
          return true;
        }).length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 3, color: 'text.secondary' }}>
          Nenhuma ação judicial encontrada para o filtro "{statusFilter === 'pending' ? 'Pendentes' : (statusFilter === 'paid' ? 'Pagas' : 'Todas')}".
        </Typography>
      )}

      {/* Add/Edit AcaoJudicial Dialog */}
      <Dialog open={openAcaoDialog} onClose={handleCloseAcaoDialog} maxWidth="sm" fullWidth PaperProps={{component: 'form', onSubmit: (e) => { e.preventDefault(); handleSaveAcao(); }}}>
        <DialogTitle variant="h2">{currentAcao ? 'Editar Ação Judicial' : 'Adicionar Nova Ação Judicial'}</DialogTitle>
        <DialogContent>
          {acaoDialogError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setAcaoDialogError(null)}>{acaoDialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="tipoAcao"
            label="Tipo da Ação"
            type="text"
            fullWidth
            variant="outlined"
            value={acaoFormData.tipoAcao}
            onChange={handleAcaoFormChange}
            required
            sx={{mb: 2}}
          />
          <TextField
            margin="dense"
            name="numeroProcesso"
            label="Número do Processo (Opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={acaoFormData.numeroProcesso}
            onChange={handleAcaoFormChange}
            sx={{mb: 2}}
          />
          <TextField
            margin="dense"
            name="valorAcao"
            label="Valor da Ação (Opcional)"
            type="text"
            fullWidth
            variant="outlined"
            value={acaoFormData.valorAcao}
            onChange={handleAcaoFormChange}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            sx={{mb: 2}}
          />
          <TextField
            margin="dense"
            name="observacoes"
            label="Observações (Opcional)"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={acaoFormData.observacoes}
            onChange={handleAcaoFormChange}
          />
        </DialogContent>
        <DialogActions sx={{p:2, pt:0}}>
          <Button onClick={handleCloseAcaoDialog} disabled={savingAcao} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={savingAcao} startIcon={savingAcao ? <CircularProgress size={20} color="inherit"/> : <AddIcon/>}>
            {savingAcao ? (currentAcao ? 'Salvando...' : 'Adicionando...') : (currentAcao ? 'Salvar Alterações' : 'Adicionar Ação')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete AcaoJudicial Confirmation Dialog */}
      <Dialog open={openDeleteAcaoDialog} onClose={handleCloseDeleteAcaoDialog}>
        <DialogTitle variant="h2">Confirmar Exclusão da Ação Judicial</DialogTitle>
        <DialogContent>
          {deleteAcaoError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteAcaoError(null)}>{deleteAcaoError}</Alert>}
          <DialogContentText variant="body1">
            Tem certeza que deseja excluir a ação judicial "<strong>{acaoToDelete?.tipoAcao}</strong>" (Processo: {acaoToDelete?.numeroProcesso || 'N/A'})?
            Todos os pagamentos associados a esta ação também serão excluídos. Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p:2, pt:0}}>
          <Button onClick={handleCloseDeleteAcaoDialog} disabled={deletingAcao} variant="outlined">Cancelar</Button>
          <Button onClick={handleConfirmDeleteAcao} color="error" variant="contained" disabled={deletingAcao} startIcon={deletingAcao ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon/>}>
            {deletingAcao ? 'Excluindo...' : 'Excluir Ação'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Payment List Dialog */}
      <Dialog open={openPaymentListDialog} onClose={handleClosePaymentListDialog} maxWidth="md" fullWidth>
        <DialogTitle variant="h2">
          Pagamentos da Ação: {selectedAcaoForPayments?.tipoAcao || 'N/A'}
          {selectedAcaoForPayments?.numeroProcesso && ` (Proc: ${selectedAcaoForPayments.numeroProcesso})`}
        </DialogTitle>
        <DialogContent>
          {paymentDialogError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPaymentDialogError(null)}>{paymentDialogError}</Alert>}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenPaymentFormDialog()}
            sx={{ mb: 2 }}
          >
            Adicionar Novo Pagamento
          </Button>
          {pagamentosDaAcao.length === 0 ? (
            <Typography>Nenhum pagamento registrado para esta ação.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Valor Pago</TableCell>
                    <TableCell>Observação</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pagamentosDaAcao.map((pag) => (
                    <TableRow key={pag.id}>
                      <TableCell>{new Date(pag.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell align="right">{parseFloat(pag.valorPago).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                      <TableCell>{pag.observacao || '-'}</TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar Pagamento">
                          <IconButton size="small" onClick={() => handleOpenPaymentFormDialog(pag)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Excluir Pagamento">
                          <IconButton size="small" onClick={() => handleDeletePaymentDialogOpen(pag)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions sx={{p:2}}>
          <Button onClick={handleClosePaymentListDialog} variant="outlined">Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog open={openPaymentFormDialog} onClose={handleClosePaymentFormDialog} maxWidth="sm" fullWidth PaperProps={{component: 'form', onSubmit: (e) => { e.preventDefault(); handleSavePayment(); }}}>
        <DialogTitle variant="h2">{currentPayment ? 'Editar Pagamento' : 'Adicionar Novo Pagamento'}</DialogTitle>
        <DialogContent>
          {paymentDialogError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPaymentDialogError(null)}>{paymentDialogError}</Alert>}
          <TextField
            autoFocus
            margin="dense"
            name="dataPagamento"
            label="Data do Pagamento"
            type="date"
            fullWidth
            variant="outlined"
            value={paymentFormData.dataPagamento}
            onChange={handlePaymentFormChange}
            InputLabelProps={{ shrink: true }}
            required
            sx={{mb: 2}}
          />
          <TextField
            margin="dense"
            name="valorPago"
            label="Valor Pago"
            type="text"
            fullWidth
            variant="outlined"
            value={paymentFormData.valorPago}
            onChange={handlePaymentFormChange}
            InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            required
            sx={{mb: 2}}
          />
          <TextField
            margin="dense"
            name="observacao"
            label="Observação (Opcional)"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={paymentFormData.observacao}
            onChange={handlePaymentFormChange}
          />
        </DialogContent>
        <DialogActions sx={{p:2, pt:0}}>
          <Button onClick={handleClosePaymentFormDialog} disabled={savingPayment} variant="outlined">Cancelar</Button>
          <Button type="submit" variant="contained" color="primary" disabled={savingPayment} startIcon={savingPayment ? <CircularProgress size={20} color="inherit"/> : <AttachMoneyIcon/>}>
            {savingPayment ? (currentPayment ? 'Salvando...' : 'Adicionando...') : (currentPayment ? 'Salvar Alterações' : 'Adicionar Pagamento')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Payment Confirmation Dialog */}
      <Dialog open={deletePaymentDialogOpen} onClose={handleDeletePaymentDialogClose}>
        <DialogTitle variant="h2">Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText variant="body1">
            Tem certeza que deseja excluir este pagamento de {parseFloat(paymentToDelete?.valorPago || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} realizado em {paymentToDelete?.dataPagamento ? new Date(paymentToDelete.dataPagamento + 'T00:00:00').toLocaleDateString('pt-BR') : ''}? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{p:2, pt:0}}>
          <Button onClick={handleDeletePaymentDialogClose} disabled={deletingPayment} variant="outlined">Cancelar</Button>
          <Button onClick={handleConfirmDeletePayment} color="error" variant="contained" disabled={deletingPayment} startIcon={deletingPayment ? <CircularProgress size={20} color="inherit"/> : <DeleteIcon/>}>
            {deletingPayment ? 'Excluindo...' : 'Excluir Pagamento'}
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default ClienteDetailPage;
