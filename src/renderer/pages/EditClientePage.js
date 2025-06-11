import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, Grid, CircularProgress, Alert,
  InputAdornment, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditClientePage = ({ showSnackbar }) => {
  const navigate = useNavigate();
  const { id: clienteId } = useParams(); // Corrected: gets 'id' and aliases as clienteId
  const [cliente, setCliente] = useState({
    nomeCompleto: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    // tipoAcao: '', // Removed
    // numeroProcesso: '', // Removed
    // valorTotalAcao: '', // Removed
    // numeroParcelas: '', // Removed
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const fetchClienteData = useCallback(async () => {
    console.log(`[EditClientePage] fetchClienteData: Iniciando para clienteId: ${clienteId}`);
    setLoading(true);
    setFormError(null);
    try {
      console.log(`[EditClientePage] fetchClienteData: Chamando window.electronAPI.getClienteById(${clienteId})...`);
      const data = await window.electronAPI.getClienteById(parseInt(clienteId, 10));
      console.log("[EditClientePage] fetchClienteData: window.electronAPI.getClienteById retornou:", data);
      if (data) {
        // The 'data' object from getClienteById will now only contain Clientes table fields.
        // Action-specific fields (tipoAcao, numeroProcesso, valorTotalAcao, numeroParcelas)
        // are no longer part of the main client object from the backend for this call.
        // They will be fetched and managed separately (e.g., in ClienteDetailPage).
        setCliente({
          id: data.id, // Ensure id is preserved
          nomeCompleto: data.nomeCompleto || '',
          cpfCnpj: data.cpfCnpj || '',
          telefone: data.telefone || '',
          email: data.email || '',
          endereco: data.endereco || '',
          dataCadastro: data.dataCadastro || '', // Keep dataCadastro if it's part of the fetched data
          // Do not spread ...data directly if it might contain old action fields from a stale cache or similar
          // valorTotalAcao and numeroParcelas are removed from here as they belong to AcoesJudiciais
        });
      } else {
        console.error(`[EditClientePage] fetchClienteData: Cliente com ID ${clienteId} não encontrado (dados retornados: ${data}).`);
        const errorMsg = "Cliente não encontrado.";
        setFormError(errorMsg);
        if (showSnackbar) showSnackbar(errorMsg, 'error');
      }
    } catch (err) {
      console.error("[EditClientePage] fetchClienteData: Erro no bloco try/catch:", err);
      const errorMsg = `Falha ao carregar dados do cliente: ${err.message}`;
      setFormError(errorMsg);
      if (showSnackbar) showSnackbar(errorMsg, 'error');
    } finally {
      console.log("[EditClientePage] fetchClienteData: Bloco finally - setLoading(false)");
      setLoading(false);
    }
  }, [clienteId, showSnackbar]);

  useEffect(() => {
    console.log(`[EditClientePage] useEffect: Verificando clienteId: ${clienteId}`);
    if (clienteId) {
      console.log("[EditClientePage] useEffect: clienteId presente, chamando fetchClienteData.");
      fetchClienteData();
    } else {
      console.log("[EditClientePage] useEffect: clienteId ausente, não chamando fetchClienteData.");
      setLoading(false); // Ensure loading is false if no ID to fetch
    }
  }, [clienteId, fetchClienteData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (event) => {
    const { name, value } = event.target;
    if (name === "valorTotalAcao") {
      if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        setCliente(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "numeroParcelas") {
      if (/^\d*$/.test(value) || value === "") {
        setCliente(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setCliente(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError(null);

    // if (!cliente.nomeCompleto.trim() || !cliente.tipoAcao.trim()) { // tipoAcao removed from this form's direct validation
    if (!cliente.nomeCompleto.trim()) { // Only check nomeCompleto
      const errorMsg = "Nome completo é obrigatório.";
      setFormError(errorMsg);
      if (showSnackbar) showSnackbar(errorMsg, 'error');
      setSaving(false);
      return;
    }

    const clienteDataToUpdate = {
      // ...cliente, // Avoid spreading the whole state if it contains fields not part of the Clientes table
      id: parseInt(clienteId, 10),
      nomeCompleto: cliente.nomeCompleto.trim(),
      // tipoAcao: cliente.tipoAcao.trim(), // Removed
      // valorTotalAcao: cliente.valorTotalAcao ? parseFloat(cliente.valorTotalAcao) : null, // Removed
      // numeroParcelas: cliente.numeroParcelas ? parseInt(cliente.numeroParcelas, 10) : null, // Removed
      cpfCnpj: cliente.cpfCnpj ? cliente.cpfCnpj.trim() : '',
      telefone: cliente.telefone ? cliente.telefone.trim() : '',
      email: cliente.email ? cliente.email.trim() : '',
      endereco: cliente.endereco ? cliente.endereco.trim() : '',
      // numeroProcesso: cliente.numeroProcesso.trim(), // Removed
      // dataCadastro will be handled by the backend or preserved if already set
    };

    try {
      await window.electronAPI.updateCliente(clienteDataToUpdate);
      if (showSnackbar) showSnackbar(`Cliente "${cliente.nomeCompleto}" atualizado com sucesso!`, 'success');
      window.electronAPI.sendMessage('cliente-updated');
      setTimeout(() => navigate('/clientes'), 1500);
    } catch (err) {
      console.error("Erro ao atualizar cliente:", err);
      const errorMsg = `Falha ao atualizar cliente: ${err.message}`;
      setFormError(errorMsg);
      if (showSnackbar) showSnackbar(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const commonTextFieldProps = (name, label, required = false) => ({
    fullWidth: true,
    label: label,
    name: name,
    value: cliente[name] || '',
    onChange: handleChange,
    required: required,
    variant: "outlined",
    sx: { mb: 0 }
  });

  const numericTextFieldProps = (name, label, adornment = null) => ({
    fullWidth: true,
    label: label,
    name: name,
    type: "text",
    value: cliente[name] || '',
    onChange: handleNumericChange,
    variant: "outlined",
    InputProps: adornment ? {
      startAdornment: <InputAdornment position="start">{adornment}</InputAdornment>
    } : {},
    sx: { mb: 0 }
  });

  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 'calc(100vh - 64px - 48px)',
        p: 3
      }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Carregando dados do cliente...
        </Typography>
      </Box>
    );
  }
  
  if (!loading && formError && formError.includes("Cliente não encontrado")) {
     return (
      <Paper sx={{ p: { xs: 2, sm: 3 }, margin: 'auto', flexGrow: 1, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
          Erro ao Carregar Cliente
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>{formError}</Alert>
        <Button variant="contained" onClick={() => navigate('/clientes')}>
          Voltar para Lista de Clientes
        </Button>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, margin: 'auto', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{ mr: 1 }}
          aria-label="Voltar"
        >
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" component="h1">
          Editar Cliente: {cliente.nomeCompleto || ''}
        </Typography>
      </Box>

      {formError && !formError.includes("Cliente não encontrado") && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <TextField {...commonTextFieldProps('nomeCompleto', 'Nome Completo*', true)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...commonTextFieldProps('cpfCnpj', 'CPF/CNPJ')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...commonTextFieldProps('telefone', 'Telefone')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              {...commonTextFieldProps('email', 'Email')}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              {...commonTextFieldProps('endereco', 'Endereço Completo')}
              multiline
              rows={2}
            />
          </Grid>
          {/* Action-specific fields are removed from this form. They will be managed in ClienteDetailPage or a dedicated AcaoJudicial form. */}
          {/*
          <Grid item xs={12} sm={6}>
            <TextField {...commonTextFieldProps('tipoAcao', 'Tipo da Ação Judicial*', true)} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...commonTextFieldProps('numeroProcesso', 'Número do Processo (Opcional)')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...numericTextFieldProps('valorTotalAcao', 'Valor Total da Ação', 'R$')} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField {...numericTextFieldProps('numeroParcelas', 'Número de Parcelas')} />
          </Grid>
          */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/clientes')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={saving || loading}
            >
              {saving ? 'Salvando Alterações...' : 'Salvar Alterações'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default EditClientePage;
