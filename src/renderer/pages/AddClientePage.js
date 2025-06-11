import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Paper, TextField, Grid, CircularProgress, Alert,
  InputAdornment, IconButton
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const AddClientePage = ({ showSnackbar }) => {
  const navigate = useNavigate();
  const [cliente, setCliente] = useState({
    nomeCompleto: '',
    cpfCnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    // tipoAcao: '', // Removed: Will be part of AcoesJudiciais
    // numeroProcesso: '', // Removed: Will be part of AcoesJudiciais
    // valorTotalAcao: '', // Removed: Will be part of AcoesJudiciais
    // numeroParcelas: '', // Removed: Will be part of AcoesJudiciais
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState(null); // Renamed for clarity

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleNumericChange = (event) => {
    const { name, value } = event.target;
    if (name === "valorTotalAcao") {
      // Allow numbers, one decimal point, and up to 2 decimal places
      if (/^\d*\.?\d{0,2}$/.test(value) || value === "") {
        setCliente(prev => ({ ...prev, [name]: value }));
      }
    } else if (name === "numeroParcelas") {
      // Allow only integers
      if (/^\d*$/.test(value) || value === "") {
        setCliente(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setCliente(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFormError(null);

    // if (!cliente.nomeCompleto.trim() || !cliente.tipoAcao.trim()) { // tipoAcao removed from this form's direct validation
    if (!cliente.nomeCompleto.trim()) { // Only check nomeCompleto for this basic client form
      const errorMsg = "Nome completo é obrigatório.";
      setFormError(errorMsg);
      if (showSnackbar) showSnackbar(errorMsg, 'error');
      setLoading(false);
      return;
    }

    const clienteData = {
      // ...cliente, // Spreading cliente might bring back removed fields if not careful
      nomeCompleto: cliente.nomeCompleto.trim(),
      // tipoAcao: cliente.tipoAcao.trim(), // Removed
      // Ensure numeric fields are correctly parsed or null
      // valorTotalAcao: cliente.valorTotalAcao ? parseFloat(cliente.valorTotalAcao) : null, // Removed
      // numeroParcelas: cliente.numeroParcelas ? parseInt(cliente.numeroParcelas, 10) : null, // Removed
      // Trim other string fields
      cpfCnpj: cliente.cpfCnpj ? cliente.cpfCnpj.trim() : '',
      telefone: cliente.telefone ? cliente.telefone.trim() : '',
      email: cliente.email ? cliente.email.trim() : '',
      endereco: cliente.endereco ? cliente.endereco.trim() : '',
      // numeroProcesso: cliente.numeroProcesso.trim(), // Removed
    };

    try {
      const novoCliente = await window.electronAPI.addCliente(clienteData);
      if (showSnackbar) showSnackbar(`Cliente "${novoCliente.nomeCompleto}" adicionado com sucesso!`, 'success');
      
      // Notify other components if necessary
      window.electronAPI.sendMessage('cliente-added');

      setTimeout(() => navigate('/clientes'), 1500); // Navigate after a short delay
    } catch (err) {
      console.error("Erro ao adicionar cliente:", err);
      const errorMsg = `Falha ao adicionar cliente: ${err.message}`;
      setFormError(errorMsg); // Show error near form as well
      if (showSnackbar) showSnackbar(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const commonTextFieldProps = (name, label, required = false) => ({
    fullWidth: true,
    label: label,
    name: name,
    value: cliente[name],
    onChange: handleChange,
    required: required,
    variant: "outlined", // Will inherit styles from theme MuiOutlinedInput
    sx: { mb: 0 } // Remove default bottom margin from TextField if Grid handles spacing
  });

  const numericTextFieldProps = (name, label, adornment = null) => ({
    fullWidth: true,
    label: label,
    name: name,
    type: "text", // Keep as text to manage custom numeric input
    value: cliente[name],
    onChange: handleNumericChange,
    variant: "outlined",
    InputProps: adornment ? { startAdornment: <InputAdornment position="start">{adornment}</InputAdornment> } : {},
    sx: { mb: 0 }
  });

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, margin: 'auto', flexGrow: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h1" component="h1"> {/* Use h1 from theme */}
          Cadastrar Novo Cliente
        </Typography>
      </Box>

      {formError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>{formError}</Alert>}
      {/* Success message is now handled by global snackbar via showSnackbar prop */}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2.5}> {/* Increased spacing slightly */}
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
              variant="outlined" // Secondary action style
              onClick={() => navigate('/clientes')}
              disabled={loading}
              // sx from theme MuiButton will apply
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary" // Primary action style
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              disabled={loading}
              // sx from theme MuiButton will apply
            >
              {loading ? 'Salvando...' : 'Salvar Cliente'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default AddClientePage;
