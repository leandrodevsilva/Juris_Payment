const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Cliente operations
  getClientes: () => ipcRenderer.invoke('get-clientes'),
  getClienteById: (id) => ipcRenderer.invoke('get-cliente-by-id', id),
  addCliente: (cliente) => ipcRenderer.invoke('add-cliente', cliente),
  updateCliente: (cliente) => ipcRenderer.invoke('update-cliente', cliente),
  deleteCliente: (id) => ipcRenderer.invoke('delete-cliente', id),

  // AcaoJudicial operations
  addAcaoJudicial: (acao) => ipcRenderer.invoke('add-acao-judicial', acao),
  getAcoesJudiciaisByClienteId: (clienteId) => ipcRenderer.invoke('get-acoes-judiciais-by-cliente-id', clienteId),
  updateAcaoJudicial: (acao) => ipcRenderer.invoke('update-acao-judicial', acao),
  deleteAcaoJudicial: (acaoId) => ipcRenderer.invoke('delete-acao-judicial', acaoId),
  getAcaoJudicialById: (acaoId) => ipcRenderer.invoke('get-acao-judicial-by-id', acaoId),

  // Pagamento operations
  getPagamentosByClienteId: (clienteId) => ipcRenderer.invoke('get-pagamentos-by-cliente-id', clienteId), // General fetch for all client payments
  getPagamentosByAcaoId: (acaoId) => ipcRenderer.invoke('get-pagamentos-by-acao-id', acaoId), // Specific fetch for an action's payments
  addPagamento: (pagamento) => ipcRenderer.invoke('add-pagamento', pagamento),
  updatePagamento: (pagamento) => ipcRenderer.invoke('update-pagamento', pagamento),
  deletePagamento: (id) => ipcRenderer.invoke('delete-pagamento', id),
  getAllPagamentos: () => ipcRenderer.invoke('get-all-pagamentos'), // Added to fetch all payments
  getTotalValorAReceber: () => ipcRenderer.invoke('get-total-valor-a-receber'), // Added to fetch total receivable amount

  // Backup/Restore operations
  backupData: () => ipcRenderer.invoke('backup-data'),

  importData: () => ipcRenderer.invoke('import-data'),

  // Utility to receive messages from main process (e.g., for notifications)
  onMainMessage: (callback) => {
    const listener = (event, ...args) => callback(...args);
    ipcRenderer.on('main-message', listener);
    // Return a function to remove the listener
    return () => {
      ipcRenderer.removeListener('main-message', listener);
    };
  },
  sendMessage: (messageContent) => ipcRenderer.send('message-from-renderer', messageContent),
  // Example: Send a message to main process
  // sendMessageToMain: (channel, data) => ipcRenderer.send(channel, data),
});



console.log('preload.js loaded');
