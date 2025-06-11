const { app, BrowserWindow, ipcMain, dialog, crashReporter } = require('electron');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Disable crash reporter
app.commandLine.appendSwitch('disable-crash-reporter');
app.disableHardwareAcceleration();

// Additional startup configuration
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let db;

// Handle any uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  dialog.showErrorBox('Error', `An error occurred: ${error.message}`);
});

const createWindow = async () => {
  try {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      show: false, // Don't show the window until it's ready
      icon: path.join(__dirname, '../../public/icon.png'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false // Disable sandbox for better compatibility
      },
    });

    // Handle window ready-to-show
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
    });

    // Add error handler for window loading
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription);
      dialog.showErrorBox('Loading Error', `Failed to load the application: ${errorDescription}`);
    });

    // Load the app
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Loading development URL...');
        await mainWindow.loadURL('http://localhost:8080');
        mainWindow.webContents.openDevTools();
      } else {
        const indexPath = path.join(app.getAppPath(), 'dist/renderer/index.html');
        console.log('Loading production file:', indexPath);
        await mainWindow.loadFile(indexPath);
      }
    } catch (loadError) {
      console.error('Failed to load application:', loadError);
      // Fallback to development URL if production load fails
      if (process.env.NODE_ENV !== 'development') {
        try {
          console.log('Attempting to load development URL as fallback...');
          await mainWindow.loadURL('http://localhost:8080');
        } catch (fallbackError) {
          console.error('Fallback load also failed:', fallbackError);
          dialog.showErrorBox('Loading Error', `Failed to load the application: ${fallbackError.message}`);
        }
      }
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });

  } catch (error) {
    console.error('Error creating window:', error);
    dialog.showErrorBox('Window Error', `Failed to create window: ${error.message}`);
  }
};

const initializeDB = () => {
  try {
    const dbPath = path.join(app.getPath('userData'), 'juris_payment.db');
    console.log('Database path:', dbPath);
    
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        dialog.showErrorBox('Database Error', `Failed to open database: ${err.message}`);
        return;
      }
      
      console.log('Connected to SQLite database.');
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS Clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nomeCompleto TEXT NOT NULL,
            cpfCnpj TEXT UNIQUE,
            telefone TEXT,
            email TEXT,
            endereco TEXT,
            -- tipoAcao TEXT, -- Removed
            -- numeroProcesso TEXT, -- Removed
            -- valorTotalAcao REAL, -- Removed
            -- numeroParcelas INTEGER, -- Removed
            dataCadastro TEXT DEFAULT (datetime('now','localtime'))
          )
        `, (err) => {
          if (err) {
            console.error("Error creating/modifying Clientes table:", err);
            dialog.showErrorBox('Database Error', `Failed to create/modify Clientes table: ${err.message}`);
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS AcoesJudiciais (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clienteId INTEGER NOT NULL,
            tipoAcao TEXT,
            numeroProcesso TEXT,
            valorAcao REAL,
            observacoes TEXT, -- Added observacoes field
            dataCadastro TEXT DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (clienteId) REFERENCES Clientes(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error("Error creating AcoesJudiciais table:", err);
            dialog.showErrorBox('Database Error', `Failed to create AcoesJudiciais table: ${err.message}`);
          } else {
            // Migration: Add 'observacoes' column to AcoesJudiciais if it doesn't exist
            db.all("PRAGMA table_info(AcoesJudiciais)", [], (pragmaErr, columns) => {
              if (pragmaErr) {
                console.error("Error fetching AcoesJudiciais schema for migration:", pragmaErr);
                // Optionally, show an error dialog or handle more gracefully
                return;
              }
              const observacoesColumnExists = columns.some(col => col.name === 'observacoes');
              if (!observacoesColumnExists) {
                db.run("ALTER TABLE AcoesJudiciais ADD COLUMN observacoes TEXT", (alterErr) => {
                  if (alterErr) {
                    console.error("Error adding 'observacoes' column to AcoesJudiciais:", alterErr);
                    dialog.showErrorBox('Database Migration Error', `Failed to add 'observacoes' column: ${alterErr.message}`);
                  } else {
                    console.log("Column 'observacoes' successfully added to AcoesJudiciais table.");
                  }
                });
              } else {
                console.log("'observacoes' column already exists in AcoesJudiciais table.");
              }
            });
          }
        });

        db.run(`
          CREATE TABLE IF NOT EXISTS Pagamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            clienteId INTEGER NOT NULL, -- Kept for potential direct client-level queries, but acaoId is primary for linking
            acaoId INTEGER NOT NULL,
            dataPagamento TEXT NOT NULL,
            valorPago REAL NOT NULL,
            observacao TEXT,
            FOREIGN KEY (clienteId) REFERENCES Clientes(id) ON DELETE CASCADE,
            FOREIGN KEY (acaoId) REFERENCES AcoesJudiciais(id) ON DELETE CASCADE
          )
        `, (err) => {
          if (err) {
            console.error("Error creating/modifying Pagamentos table:", err);
            dialog.showErrorBox('Database Error', `Failed to create/modifying Pagamentos table: ${err.message}`);
    }
  });
});

// Get Total Valor a Receber
ipcMain.handle('get-total-valor-a-receber', async () => {
  return new Promise((resolve, reject) => {
    try {
      // This query calculates the total sum of all 'valorAcao' from AcoesJudiciais
      // and subtracts the total sum of all 'valorPago' from Pagamentos.
      // COALESCE is used to handle cases where tables might be empty or sums might be NULL, defaulting to 0.
      const query = `
        SELECT
          ( (SELECT COALESCE(SUM(valorAcao), 0) FROM AcoesJudiciais) -
            (SELECT COALESCE(SUM(valorPago), 0) FROM Pagamentos)
          ) as totalValorAReceber;
      `;
      
      db.get(query, [], (err, row) => {
        if (err) {
          console.error('Error fetching total valor a receber:', err);
          reject(err);
        } else {
          resolve(row ? row.totalValorAReceber : 0);
        }
      });
    } catch (error) {
      console.error('Error in get-total-valor-a-receber handler:', error);
      reject(error);
    }
  });
});
    });
  } catch (error) {
    console.error('Error in initializeDB:', error);
    dialog.showErrorBox('Database Error', `Failed to initialize database: ${error.message}`);
  }
};

// Wait for app to be ready before creating window
app.whenReady().then(async () => {
  try {
    console.log('Application ready, creating window...');
    await createWindow();
    console.log('Initializing database...');
    initializeDB();
  } catch (error) {
    console.error('Error during app initialization:', error);
    dialog.showErrorBox('Initialization Error', `Failed to initialize application: ${error.message}`);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed.');
      }
    });
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers for database operations
// Cliente CRUD operations
ipcMain.handle('get-cliente-by-id', async (event, id) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT
          c.*
          -- Aggregated payment details (totalPago, valorRestante) will be handled differently,
          -- likely on the frontend or through more specific queries per action.
        FROM Clientes c
        WHERE c.id = ?
      `;
      // Note: The original query aggregated payments. This will be removed as payments are now per-action.
      // The frontend will need to fetch actions and their respective payments separately.
      db.get(query, [id], (err, row) => {
        if (err) {
          console.error('Error fetching cliente by id:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    } catch (error) {
      console.error('Error in get-cliente-by-id handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('get-clientes', async () => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT
          c.id,
          c.nomeCompleto,
          c.cpfCnpj,
          c.telefone,
          c.email,
          c.endereco,
          c.dataCadastro,
          COALESCE(SUM(aj.valorAcao), 0) as valorTotalCliente,
          COALESCE(SUM(p_sum.totalPagoPorAcao), 0) as valorPagoCliente
        FROM Clientes c
        LEFT JOIN AcoesJudiciais aj ON c.id = aj.clienteId
        LEFT JOIN (
            SELECT acaoId, SUM(valorPago) as totalPagoPorAcao
            FROM Pagamentos
            GROUP BY acaoId
        ) p_sum ON aj.id = p_sum.acaoId
        GROUP BY c.id, c.nomeCompleto, c.cpfCnpj, c.telefone, c.email, c.endereco, c.dataCadastro
        ORDER BY c.dataCadastro DESC
      `;
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching clientes:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error in get-clientes handler:', error);
      reject(error);
    }
  });
});

// Add Cliente
ipcMain.handle('add-cliente', async (event, cliente) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO Clientes (
          nomeCompleto, cpfCnpj, telefone, email, endereco, dataCadastro
        ) VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      `;
      const params = [
        cliente.nomeCompleto,
        cliente.cpfCnpj,
        cliente.telefone,
        cliente.email,
        cliente.endereco
      ];
      // Note: dataCadastro is handled by DEFAULT in table schema, but can be explicit if needed.
      // For simplicity, relying on DEFAULT for new entries. If explicit control is needed, add to params.

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error adding cliente:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, ...cliente });
        }
      });
    } catch (error) {
      console.error('Error in add-cliente handler:', error);
      reject(error);
    }
  });
});

// Update Cliente
ipcMain.handle('update-cliente', async (event, cliente) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        UPDATE Clientes SET
          nomeCompleto = ?,
          cpfCnpj = ?,
          telefone = ?,
          email = ?,
          endereco = ?
        WHERE id = ?
      `;
      const params = [
        cliente.nomeCompleto,
        cliente.cpfCnpj,
        cliente.telefone,
        cliente.email,
        cliente.endereco,
        cliente.id
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error updating cliente:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes, ...cliente });
        }
      });
    } catch (error) {
      console.error('Error in update-cliente handler:', error);
      reject(error);
    }
  });
});

// Delete Cliente
ipcMain.handle('delete-cliente', async (event, id) => {
  return new Promise((resolve, reject) => {
    try {
      db.run('DELETE FROM Clientes WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting cliente:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    } catch (error) {
      console.error('Error in delete-cliente handler:', error);
      reject(error);
    }
  });
});

// AcoesJudiciais CRUD operations
ipcMain.handle('add-acao-judicial', async (event, acao) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO AcoesJudiciais (
          clienteId, tipoAcao, numeroProcesso, valorAcao, observacoes, dataCadastro
        ) VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
      `;
      const params = [
        acao.clienteId,
        acao.tipoAcao,
        acao.numeroProcesso,
        acao.valorAcao,
        acao.observacoes // Added observacoes
      ];
      db.run(query, params, function(err) {
        if (err) {
          console.error('Error adding acao judicial:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, ...acao });
        }
      });
    } catch (error) {
      console.error('Error in add-acao-judicial handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('get-acoes-judiciais-by-cliente-id', async (event, clienteId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          aj.*,
          COALESCE(SUM(p.valorPago), 0) as totalPagoNaAcao,
          aj.valorAcao - COALESCE(SUM(p.valorPago), 0) as valorRestanteNaAcao
        FROM AcoesJudiciais aj
        LEFT JOIN Pagamentos p ON aj.id = p.acaoId
        WHERE aj.clienteId = ?
        GROUP BY aj.id
        ORDER BY aj.dataCadastro DESC
      `;
      db.all(query, [clienteId], (err, rows) => {
        if (err) {
          console.error('Error fetching acoes judiciais by cliente id:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error in get-acoes-judiciais-by-cliente-id handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('update-acao-judicial', async (event, acao) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        UPDATE AcoesJudiciais SET
          tipoAcao = ?,
          numeroProcesso = ?,
          valorAcao = ?,
          observacoes = ? -- Added observacoes
        WHERE id = ? AND clienteId = ?
      `;
      const params = [
        acao.tipoAcao,
        acao.numeroProcesso,
        acao.valorAcao,
        acao.observacoes, // Added observacoes
        acao.id,
        acao.clienteId
      ];
      db.run(query, params, function(err) {
        if (err) {
          console.error('Error updating acao judicial:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes, ...acao });
        }
      });
    } catch (error) {
      console.error('Error in update-acao-judicial handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('delete-acao-judicial', async (event, acaoId) => {
  return new Promise((resolve, reject) => {
    try {
      // Note: Pagamentos associated with this acaoId will be deleted due to ON DELETE CASCADE
      db.run('DELETE FROM AcoesJudiciais WHERE id = ?', [acaoId], function(err) {
        if (err) {
          console.error('Error deleting acao judicial:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    } catch (error) {
      console.error('Error in delete-acao-judicial handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('get-acao-judicial-by-id', async (event, acaoId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          aj.*,
          COALESCE(SUM(p.valorPago), 0) as totalPagoNaAcao,
          aj.valorAcao - COALESCE(SUM(p.valorPago), 0) as valorRestanteNaAcao
        FROM AcoesJudiciais aj
        LEFT JOIN Pagamentos p ON aj.id = p.acaoId
        WHERE aj.id = ?
        GROUP BY aj.id
      `;
      db.get(query, [acaoId], (err, row) => {
        if (err) {
          console.error('Error fetching acao judicial by id:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    } catch (error) {
      console.error('Error in get-acao-judicial-by-id handler:', error);
      reject(error);
    }
  });
});


// Pagamento CRUD operations
ipcMain.handle('get-pagamentos-by-cliente-id', async (event, clienteId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT p.*, c.nomeCompleto as clienteNome, aj.tipoAcao as acaoTipo
        FROM Pagamentos p
        JOIN Clientes c ON p.clienteId = c.id
        JOIN AcoesJudiciais aj ON p.acaoId = aj.id
        WHERE p.clienteId = ? 
        ORDER BY p.dataPagamento DESC
      `;
      db.all(query, [clienteId], (err, rows) => {
        if (err) {
          console.error('Error fetching pagamentos by cliente id:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error in get-pagamentos-by-cliente-id handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('get-pagamentos-by-acao-id', async (event, acaoId) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT p.* 
        FROM Pagamentos p
        WHERE p.acaoId = ?
        ORDER BY p.dataPagamento DESC
      `;
      db.all(query, [acaoId], (err, rows) => {
        if (err) {
          console.error('Error fetching pagamentos by acao id:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error in get-pagamentos-by-acao-id handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('add-pagamento', async (event, pagamento) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        INSERT INTO Pagamentos (
          clienteId, acaoId, dataPagamento, valorPago, observacao
        ) VALUES (?, ?, ?, ?, ?)
      `;
      const params = [
        pagamento.clienteId, // Assuming this is passed from frontend, derived from the action's client
        pagamento.acaoId,
        pagamento.dataPagamento, // Ensure this is 'YYYY-MM-DD'
        pagamento.valorPago,
        pagamento.observacao
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error adding pagamento:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID, ...pagamento });
        }
      });
    } catch (error) {
      console.error('Error in add-pagamento handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('update-pagamento', async (event, pagamento) => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        UPDATE Pagamentos SET
          dataPagamento = ?,
          valorPago = ?,
          observacao = ?,
          acaoId = ? -- Allow changing the action a payment is linked to, if necessary
        WHERE id = ? AND clienteId = ? -- clienteId check remains for safety
      `;
      const params = [
        pagamento.dataPagamento, // Ensure this is 'YYYY-MM-DD'
        pagamento.valorPago,
        pagamento.observacao,
        pagamento.acaoId,
        pagamento.id,
        pagamento.clienteId
      ];

      db.run(query, params, function(err) {
        if (err) {
          console.error('Error updating pagamento:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes, ...pagamento });
        }
      });
    } catch (error) {
      console.error('Error in update-pagamento handler:', error);
      reject(error);
    }
  });
});

ipcMain.handle('delete-pagamento', async (event, id) => {
  return new Promise((resolve, reject) => {
    try {
      db.run('DELETE FROM Pagamentos WHERE id = ?', [id], function(err) {
        if (err) {
          console.error('Error deleting pagamento:', err);
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    } catch (error) {
      console.error('Error in delete-pagamento handler:', error);
      reject(error);
    }
  });
});

// Backup and Restore operations
ipcMain.handle('backup-data', async () => {
  try {
    const saveDialog = await dialog.showSaveDialog(mainWindow, {
      title: 'Salvar Backup',
      defaultPath: path.join(app.getPath('downloads'), `juris-payment-backup-${new Date().toISOString().split('T')[0]}.json`),
      filters: [{ name: 'JSON', extensions: ['json'] }]
    });

    if (saveDialog.canceled) {
      return { canceled: true };
    }

    const filePath = saveDialog.filePath;

    const backupData = {};

    backupData.clientes = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Clientes', [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    backupData.acoesJudiciais = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM AcoesJudiciais', [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    backupData.pagamentos = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Pagamentos', [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));
    return { success: true, filePath };

  } catch (error) {
    console.error('Error in backup-data handler:', error);
    dialog.showErrorBox('Backup Error', `Failed to backup data: ${error.message}`);
    throw error; // Re-throw to be caught by frontend if it handles promise rejection
  }
});

ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Selecionar Arquivo de Backup',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (result.canceled) {
      return { canceled: true };
    }

    const filePath = result.filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const backup = JSON.parse(fileContent);

    // Validate data structure
    if (typeof backup !== 'object' || backup === null ||
        !Array.isArray(backup.clientes) ||
        !Array.isArray(backup.acoesJudiciais) ||
        !Array.isArray(backup.pagamentos)) {
      throw new Error('Invalid backup file format: Expected an object with clientes, acoesJudiciais, and pagamentos arrays.');
    }

    // Optional: Validate first item of each array for required fields if needed
    // For Clientes:
    if (backup.clientes.length > 0) {
        const requiredClienteFields = ['id', 'nomeCompleto', 'dataCadastro']; // cpfCnpj is unique but can be null
        const firstCliente = backup.clientes[0];
        const missingClienteFields = requiredClienteFields.filter(field => !(field in firstCliente));
        if (missingClienteFields.length > 0) {
            throw new Error(`Invalid backup file: Clientes data missing fields: ${missingClienteFields.join(', ')}`);
        }
    }
    // For AcoesJudiciais:
    if (backup.acoesJudiciais.length > 0) {
        // observacoes is optional, so not adding to requiredAcaoFields for now
        const requiredAcaoFields = ['id', 'clienteId', 'tipoAcao', 'dataCadastro']; // numeroProcesso, valorAcao can be null
        const firstAcao = backup.acoesJudiciais[0];
        const missingAcaoFields = requiredAcaoFields.filter(field => !(field in firstAcao));
        if (missingAcaoFields.length > 0) {
            throw new Error(`Invalid backup file: AcoesJudiciais data missing fields: ${missingAcaoFields.join(', ')}`);
        }
    }
    // For Pagamentos:
     if (backup.pagamentos.length > 0) {
        const requiredPagamentoFields = ['id', 'clienteId', 'acaoId', 'dataPagamento', 'valorPago'];
        const firstPagamento = backup.pagamentos[0];
        const missingPagamentoFields = requiredPagamentoFields.filter(field => !(field in firstPagamento));
        if (missingPagamentoFields.length > 0) {
            throw new Error(`Invalid backup file: Pagamentos data missing fields: ${missingPagamentoFields.join(', ')}`);
        }
    }


    return await new Promise((resolve, reject) => {
      console.log('Starting data import...');
      
      const handleError = (error) => {
        console.error('Error in import operation:', error);
        db.run('ROLLBACK', (rollbackErr) => {
          if (rollbackErr) console.error('Error rolling back transaction:', rollbackErr);
          reject(error); // Reject with the original error
        });
      };

      db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        try {
          // Clear existing data in reverse order of dependency or rely on ON DELETE CASCADE if set up for all relations
          db.run('DELETE FROM Pagamentos');
          db.run('DELETE FROM AcoesJudiciais');
          db.run('DELETE FROM Clientes');
          db.run('DELETE FROM sqlite_sequence WHERE name IN (?, ?, ?)', ['Clientes', 'AcoesJudiciais', 'Pagamentos']);

          // Prepare statements
          const clienteStmt = db.prepare(`
            INSERT INTO Clientes (
              id, nomeCompleto, cpfCnpj, telefone, email, endereco, dataCadastro
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          const acaoStmt = db.prepare(`
            INSERT INTO AcoesJudiciais (
              id, clienteId, tipoAcao, numeroProcesso, valorAcao, observacoes, dataCadastro
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `);

          const pagamentoStmt = db.prepare(`
            INSERT INTO Pagamentos (
              id, clienteId, acaoId, dataPagamento, valorPago, observacao
            ) VALUES (?, ?, ?, ?, ?, ?)
          `);

          // Insert data for Clientes
          backup.clientes.forEach(cliente => {
            clienteStmt.run(
              cliente.id,
              cliente.nomeCompleto,
              cliente.cpfCnpj,
              cliente.telefone,
              cliente.email,
              cliente.endereco,
              cliente.dataCadastro
            );
          });
          clienteStmt.finalize();

          // Insert data for AcoesJudiciais
          backup.acoesJudiciais.forEach(acao => {
            acaoStmt.run(
              acao.id,
              acao.clienteId,
              acao.tipoAcao,
              acao.numeroProcesso,
              acao.valorAcao,
              acao.observacoes, // Added observacoes
              acao.dataCadastro
            );
          });
          acaoStmt.finalize();

          // Insert data for Pagamentos
          backup.pagamentos.forEach(pagamento => {
            pagamentoStmt.run(
              pagamento.id,
              pagamento.clienteId,
              pagamento.acaoId,
              pagamento.dataPagamento,
              pagamento.valorPago,
              pagamento.observacao
            );
          });
          pagamentoStmt.finalize();

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('Error committing transaction:', commitErr);
              db.run('ROLLBACK', (rbErr) => { // Attempt to rollback
                if (rbErr) console.error('Error rolling back after commit error:', rbErr);
                handleError(commitErr); // Use the centralized error handler
              });
            } else {
              console.log('Data import successful.');
              resolve({ success: true });
            }
          });

        } catch (dbOperationError) { // Catch errors during DB operations within the transaction
          handleError(dbOperationError);
        }
      }); // End db.serialize
    }); // End new Promise
  } catch (error) { // Catch errors from dialog, file reading, JSON parsing, or initial validation
    console.error('Error in import-data handler (outer scope):', error);
    // dialog.showErrorBox is good, but the promise should also reject for the frontend
    // No need to call dialog.showErrorBox here if it's already called or if frontend handles it
    throw error; // Re-throw to ensure the promise from ipcMain.handle rejects
  }
});

ipcMain.handle('get-all-pagamentos', async () => {
  return new Promise((resolve, reject) => {
    try {
      const query = `
        SELECT 
          p.*,
          c.nomeCompleto as clienteNome,
          c.cpfCnpj as clienteCpfCnpj
        FROM Pagamentos p
        JOIN Clientes c ON p.clienteId = c.id
        ORDER BY p.dataPagamento DESC
      `;
      
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error('Error fetching pagamentos:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    } catch (error) {
      console.error('Error in get-all-pagamentos handler:', error);
      reject(error);
    }
  });
});
