import React from 'react';
import { Paper, Typography, Box, Link, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoIcon from '@mui/icons-material/Info'; // Placeholder for functionalities icon

const HelpPage = ({ showSnackbar }) => {
  // showSnackbar might not be used here but kept for consistency if needed later
  return (
    <Paper sx={{ p: 3, flexGrow: 1, backgroundColor: 'background.default' }}>
      <Typography variant="h1" component="h1" gutterBottom sx={{ mb: 3 }}>
        Ajuda e Suporte
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Funcionalidades do Programa
        </Typography>
        <Typography variant="body1" paragraph>
          Juris Payment é um sistema de gerenciamento de pagamentos projetado para simplificar o controle financeiro de seus clientes e processos.
        </Typography>
        <Typography variant="body1" paragraph>
          Principais funcionalidades:
        </Typography>
        <List dense>
          <ListItem>
            <ListItemIcon sx={{minWidth: '32px'}}><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Dashboard com visão geral das finanças." />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{minWidth: '32px'}}><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Gerenciamento de Clientes: cadastro, edição, detalhes e histórico de pagamentos." />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{minWidth: '32px'}}><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Registro de Pagamentos: acompanhamento de valores pagos e pendentes." />
          </ListItem>
          <ListItem>
            <ListItemIcon sx={{minWidth: '32px'}}><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Backup e Restauração de Dados: para segurança das suas informações." />
          </ListItem>
           <ListItem>
            <ListItemIcon sx={{minWidth: '32px'}}><InfoIcon fontSize="small" color="primary" /></ListItemIcon>
            <ListItemText primary="Modo Claro e Escuro: para melhor adaptação visual." />
          </ListItem>
        </List>
        <Typography variant="body1" paragraph sx={{mt: 2}}>
          Esta seção será atualizada com explicações mais detalhadas sobre cada funcionalidade do Juris Payment.
        </Typography>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Box>
        <Typography variant="h2" gutterBottom>
          Informações de Contato para Suporte
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <EmailIcon color="primary"/>
            </ListItemIcon>
            <ListItemText 
              primary="E-mail" 
              secondary={<Link href="mailto:lasmg93@outlook.com" target="_blank" rel="noopener noreferrer">lasmg93@outlook.com</Link>} 
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon color="primary"/>
            </ListItemIcon>
            <ListItemText primary="Telefone" secondary="(35) 99262-3852" />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <GitHubIcon color="primary"/>
            </ListItemIcon>
            <ListItemText 
              primary="GitHub" 
              secondary={<Link href="https://github.com/leandrodevsilva" target="_blank" rel="noopener noreferrer">@leandrodevsilva</Link>}
            />
          </ListItem>
        </List>
      </Box>
    </Paper>
  );
};

export default HelpPage;
