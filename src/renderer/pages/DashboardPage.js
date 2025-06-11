import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Typography, Grid, Card, CardContent, Box, CircularProgress, Alert, useTheme } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SettingsBackupRestoreIcon from '@mui/icons-material/SettingsBackupRestore';
import { Link as RouterLink } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardPage = ({ showSnackbar }) => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    totalPago: 0, // Represents total received in the current month for the StatCard
    totalRestante: 0,
    dailyRevenueCurrentMonth: [], // For the daily revenue chart
    dailyRevenueCurrentMonthLabels: [], // Labels for the daily revenue chart (days of the month)
    revenueHistory: Array(12).fill(0), // For the 12-month revenue history chart
    revenueHistoryLabels: [] // Labels for the 12-month revenue history chart
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [clientesData, allPagamentosData, apiTotalValorAReceber] = await Promise.all([
        window.electronAPI.getClientes(),
        window.electronAPI.getAllPagamentos(),
        window.electronAPI.getTotalValorAReceber() // Fetch the specific total a receber
      ]);

      // let totalValorAcaoGlobal = 0; // No longer needed for stats.totalRestante
      // let overallTotalPaidFromClientes = 0; // No longer needed for stats.totalRestante
      let currentMonthReceivedSum = 0; // Sum of payments in the current month

      let processedStats = {
        totalClientes: 0,
        totalPago: 0,
        totalRestante: 0,
        dailyRevenueCurrentMonth: [],
        dailyRevenueCurrentMonthLabels: [],
        revenueHistory: Array(12).fill(0),
        revenueHistoryLabels: [],
      };

      if (clientesData) {
        // clientesData.forEach(cliente => { // These sums are not directly used for totalRestante anymore
          // totalValorAcaoGlobal += parseFloat(cliente.valorTotalAcao) || 0;
          // overallTotalPaidFromClientes += parseFloat(cliente.totalPago) || 0;
        // });
        processedStats.totalClientes = clientesData.length;
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-11 (January-December)
      const monthShortNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      // Initialize for daily revenue chart (current month)
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      processedStats.dailyRevenueCurrentMonth = Array(daysInCurrentMonth).fill(0);
      processedStats.dailyRevenueCurrentMonthLabels = Array.from({ length: daysInCurrentMonth }, (_, i) => String(i + 1));

      if (allPagamentosData && allPagamentosData.length > 0) {
        allPagamentosData.forEach(pagamento => {
          const paymentDate = new Date(pagamento.dataPagamento);
          const paymentYear = paymentDate.getFullYear();
          const paymentMonth = paymentDate.getMonth();
          const paymentDay = paymentDate.getDate();
          const valor = parseFloat(pagamento.valorPago) || 0;

          // Populate daily revenue for the current month's chart
          if (paymentYear === currentYear && paymentMonth === currentMonth) {
            processedStats.dailyRevenueCurrentMonth[paymentDay - 1] += valor;
          }

          // Sum payments for the current month (for the "Total Recebido (Mês)" StatCard)
          if (paymentYear === currentYear && paymentMonth === currentMonth) {
            currentMonthReceivedSum += valor;
          }
        });

        // Populate revenue history for the last 12 months chart
        const tempRevenueHistory = Array(12).fill(0);
        const tempRevenueHistoryLabels = Array(12).fill('');
        for (let i = 0; i < 12; i++) {
          const dateCursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const targetYear = dateCursor.getFullYear();
          const targetMonth = dateCursor.getMonth();
          let monthSum = 0;
          allPagamentosData.forEach(pagamento => {
            const paymentDate = new Date(pagamento.dataPagamento);
            if (paymentDate.getFullYear() === targetYear && paymentDate.getMonth() === targetMonth) {
              monthSum += parseFloat(pagamento.valorPago) || 0;
            }
          });
          tempRevenueHistory[11 - i] = monthSum;
          tempRevenueHistoryLabels[11 - i] = `${monthShortNames[targetMonth]}/${String(targetYear).slice(-2)}`;
        }
        processedStats.revenueHistory = tempRevenueHistory;
        processedStats.revenueHistoryLabels = tempRevenueHistoryLabels;
      } else {
        // Still generate labels for empty history chart if no payments
        for (let i = 0; i < 12; i++) {
          const dateCursor = new Date(now.getFullYear(), now.getMonth() - i, 1);
          processedStats.revenueHistoryLabels[11 - i] = `${monthShortNames[dateCursor.getMonth()]}/${String(dateCursor.getFullYear()).slice(-2)}`;
        }
      }
      
      
      processedStats.totalPago = currentMonthReceivedSum; // Update StatCard value for "Total Recebido (Mês)"
      processedStats.totalRestante = apiTotalValorAReceber || 0; // Use the direct value from API

      setStats(processedStats);

    } catch (err) {
      console.error("[DashboardPage] fetchDashboardStats: Erro:", err);
      const errorMessage = `Falha ao carregar estatísticas: ${err.message}`;
      setError(errorMessage);
      if (showSnackbar) showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchDashboardStats();
    
    const relevantMessages = [
      'data-imported-successfully',
      'cliente-updated', 'cliente-added', 'cliente-deleted', // These might not directly change total a receber, but good to refresh all stats
      'acao-judicial-added', 'acao-judicial-updated', 'acao-judicial-deleted',
      'pagamento-added', 'pagamento-updated', 'pagamento-deleted'
    ];

    const unsubscribe = window.electronAPI.onMainMessage((message) => {
      if (relevantMessages.includes(message)) {
        if (showSnackbar && message === 'data-imported-successfully') {
          showSnackbar('Dados importados com sucesso! Atualizando dashboard...', 'success');
        } else if (showSnackbar && message !== 'data-imported-successfully') {
          // Optionally, show a generic update message for other events
           if (showSnackbar) showSnackbar('Dados atualizados, atualizando dashboard...', 'info');
        }
        fetchDashboardStats();
      }
    });
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchDashboardStats, showSnackbar]);

  const StatCard = ({ title, value, icon, color, to, ariaLabel }) => {
    const theme = useTheme();
    const [colorFamily, colorShade = 'main'] = color.split('.');

    let cardBgColor;
    let cardTextColor;

    if (theme.palette[colorFamily] && theme.palette[colorFamily][colorShade]) {
      cardBgColor = theme.palette[colorFamily][colorShade];
      cardTextColor = theme.palette[colorFamily].contrastText;
    } else {
      cardBgColor = color; 
      cardTextColor = theme.palette.getContrastText(cardBgColor);
    }
    
    if (color === 'error.dark' && theme.palette.error) {
        cardBgColor = theme.palette.error.dark;
        cardTextColor = theme.palette.error.contrastText || theme.palette.getContrastText(theme.palette.error.dark);
    }

    const isLightText = cardTextColor.toLowerCase().includes('#fff') || cardTextColor.toLowerCase().startsWith('rgba(255');
    const textShadowValue = isLightText 
      ? '0px 1px 2px rgba(0,0,0,0.25)'
      : '0px 1px 1px rgba(255,255,255,0.7)';

    return (
      <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
        <Card
          component={to ? RouterLink : 'div'}
          to={to || undefined}
          sx={{ textDecoration: 'none', width: '100%' }}
          aria-label={ariaLabel}
        >
          <CardContent
            sx={{
              textAlign: 'center',
              backgroundColor: cardBgColor,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box sx={{ fontSize: '2.5rem', mb: 1, color: cardTextColor }}>{icon}</Box>
            <Typography variant="h2" component="div" gutterBottom sx={{ color: cardTextColor, textShadow: textShadowValue }}>
              {title}
            </Typography>
            {value !== "" && (
              <Typography variant="h1" sx={{ color: cardTextColor, textShadow: textShadowValue }}>
                {(typeof value === 'number' && (title.toLowerCase().includes('valor') || title.toLowerCase().includes('recebido') || title.toLowerCase().includes('receber')))
                  ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : value}
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    );
  };

  const nowForChartTitle = new Date();
  const currentMonthNameForTitle = nowForChartTitle.toLocaleString('pt-BR', { month: 'long' });
  const currentYearForTitle = nowForChartTitle.getFullYear();

  const dailyRevenueChartData = {
    labels: stats.dailyRevenueCurrentMonthLabels,
    datasets: [
      {
        label: `Receita Diária (${currentMonthNameForTitle.charAt(0).toUpperCase() + currentMonthNameForTitle.slice(1)}/${currentYearForTitle}) (R$)`,
        data: stats.dailyRevenueCurrentMonth,
        backgroundColor: 'rgba(107, 142, 158, 0.7)', 
        borderColor: 'rgba(107, 142, 158, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const revenueHistoryChartData = {
    labels: stats.revenueHistoryLabels,
    datasets: [
      {
        label: 'Histórico de Receita (R$)',
        data: stats.revenueHistory,
        backgroundColor: 'rgba(158, 142, 107, 0.7)', 
        borderColor: 'rgba(158, 142, 107, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, 
    plugins: {
      legend: { position: 'top', labels: { font: { size: 14 }, color: '#333' }},
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
          font: { size: 12 }, color: '#333'
        },
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      },
      x: {
        ticks: { font: { size: 12 }, color: '#333' },
        grid: { display: false }
      }
    },
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 64px - 48px)', p:3 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>Carregando dashboard...</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 3, flexGrow: 1, backgroundColor: 'background.default' }}>
      <Typography variant="h1" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        Visão Geral
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="stretch">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClientes}
          icon={<PeopleAltIcon fontSize="inherit" />}
          color="primary.main"
          to="/clientes"
          ariaLabel={`Total de clientes: ${stats.totalClientes}`}
        />
        <StatCard
          title="Total Recebido (Mês)"
          value={stats.totalPago}
          icon={<AccountBalanceWalletIcon fontSize="inherit" />}
          color="success.main"
          ariaLabel={`Total recebido este mês: ${stats.totalPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        />
        <StatCard
          title="Valor à Receber"
          value={stats.totalRestante}
          icon={<MonetizationOnIcon fontSize="inherit" />}
          color={stats.totalRestante < 0 ? "error.dark" : "warning.main"}
          ariaLabel={`Valor total a receber: ${stats.totalRestante.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}
        />
        <StatCard
          title="Backup / Restore"
          value=""
          icon={<SettingsBackupRestoreIcon fontSize="inherit" />}
          color="info.main" 
          to="/backup"
          ariaLabel="Acessar página de backup e restauração de dados"
        />
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: { xs: 300, md: 400 }, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.background.paper
          }}>
            <Typography variant="h2" gutterBottom sx={{
              textAlign: 'center',
              color: (theme) => theme.palette.mode === 'dark' ? '#263238' : theme.palette.text.primary
            }}>
              {`Receita de ${currentMonthNameForTitle.charAt(0).toUpperCase() + currentMonthNameForTitle.slice(1)}`}
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <Bar data={dailyRevenueChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            height: { xs: 300, md: 400 }, 
            display: 'flex', 
            flexDirection: 'column',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : theme.palette.background.paper
          }}>
            <Typography variant="h2" gutterBottom sx={{
              textAlign: 'center',
              color: (theme) => theme.palette.mode === 'dark' ? '#263238' : theme.palette.text.primary
            }}>
              Histórico de Receita (Últimos 12 Meses)
            </Typography>
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
              <Bar data={revenueHistoryChartData} options={chartOptions} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default DashboardPage;
