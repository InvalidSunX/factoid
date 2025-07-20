const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const express = require('express');
const fs = require('fs');
require('dotenv').config();

let mainWindow;
let overlayWindow;
let gameManagerWindow;
let expressApp;
let server;

// Data file path
const dataPath = path.join(__dirname, '../data/games.json');

// Get configuration from environment variables with defaults
const config = {
  port: process.env.PORT || 3000,
  showFactoidHotkey: process.env.SHOW_FACTOID_HOTKEY || 'CommandOrControl+Shift+F',
  hideOverlayHotkey: process.env.HIDE_OVERLAY_HOTKEY || 'CommandOrControl+Shift+H',
  showGameSpecificHotkey: process.env.SHOW_GAME_SPECIFIC_HOTKEY || 'CommandOrControl+Shift+G',
  defaultGame: process.env.DEFAULT_GAME || 'default',
  overlayWidth: parseInt(process.env.DEFAULT_OVERLAY_WIDTH) || 420,
  overlayHeight: parseInt(process.env.DEFAULT_OVERLAY_HEIGHT) || 180
};

// Factoid tracking system
let gameFactoidIndexes = {};
let currentTriggerCue = "Ready for factoid";
let selectedGameForHotkey = config.defaultGame; // Track selected game for hotkey

// Configuration settings
let overlayConfig = {
  backgroundColor: 'rgba(0, 0, 0, 0.9)',
  borderColor: '#00ff00',
  textColor: '#ffffff',
  titleBackgroundColor: 'linear-gradient(135deg, #00ff00, #00cc00)',
  titleTextColor: '#000000',
  borderRadius: '15px',
  fontSize: '16px',
  clickThrough: false,
  position: { x: null, y: null }, // Will be set on first load
  shadowColor: '#00ff00',
  shadowOpacity: 0.6
};

// Game factoids data - loaded from JSON file
let gameFactoidsData = {};

// Load games data from JSON file
function loadGamesData() {
  try {
    if (fs.existsSync(dataPath)) {
      const data = fs.readFileSync(dataPath, 'utf8');
      gameFactoidsData = JSON.parse(data);
      console.log('Games data loaded successfully');
    } else {
      console.log('Games data file not found, using defaults');
      // Create default data file
      gameFactoidsData = getDefaultGamesData();
      saveGamesData();
    }
  } catch (error) {
    console.error('Error loading games data:', error);
    gameFactoidsData = getDefaultGamesData();
  }
}

// Save games data to JSON file
function saveGamesData() {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(dataPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(dataPath, JSON.stringify(gameFactoidsData, null, 2));
    console.log('Games data saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving games data:', error);
    return false;
  }
}

// Default games data (fallback)
function getDefaultGamesData() {
  return {
    default: {
      displayName: "Gaming Facts",
      facts: [
        "Did you know? The first video game was created in 1958!",
        "Did you know? Pac-Man was originally called Puck-Man in Japan!",
        "Did you know? The highest-grossing arcade game of all time is Pac-Man!",
        "Did you know? Tetris was created by a Russian programmer in 1984!",
        "Did you know? The first gaming console was the Magnavox Odyssey in 1972!"
      ],
      triggers: [
        "During general gaming",
        "When discussing retro games",
        "During arcade discussion",
        "When talking about puzzle games",
        "During console discussion"
      ]
    }
  };
}

// Create game manager window
function createGameManagerWindow() {
  if (gameManagerWindow) {
    gameManagerWindow.focus();
    return;
  }

  gameManagerWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    title: 'Game & Factoid Manager'
  });

  gameManagerWindow.loadFile(path.join(__dirname, '../public/game-manager.html'));

  gameManagerWindow.on('closed', () => {
    gameManagerWindow = null;
  });
}

// Express server for serving the overlay UI
function createExpressServer() {
  expressApp = express();
  const PORT = config.port;

  // Serve static files from public directory
  expressApp.use(express.static(path.join(__dirname, '../public')));

  // API endpoint to trigger factoid display
  expressApp.post('/api/show-factoid', (req, res) => {
    if (overlayWindow) {
      overlayWindow.webContents.send('show-factoid', req.body);
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Overlay window not available' });
    }
  });

  server = expressApp.listen(PORT, () => {
    console.log(`Factoid server running on http://localhost:${PORT}`);
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, '../assets/icon.png'),
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, '../public/control.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createOverlayWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  overlayWindow = new BrowserWindow({
    width: config.overlayWidth,
    height: config.overlayHeight,
    x: width - (config.overlayWidth + 20),
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false // Initially hidden
  });

  overlayWindow.loadFile(path.join(__dirname, '../public/overlay.html'));
  // Don't ignore mouse events initially so it can be moved
  overlayWindow.setIgnoreMouseEvents(false);
  overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // Force highest level

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function registerGlobalHotkeys() {
  // Register global hotkey to show factoid
  globalShortcut.register(config.showFactoidHotkey, () => {
    console.log(`Global hotkey triggered (${config.showFactoidHotkey}): Show factoid`);
    if (overlayWindow) {
      showRandomFactoid();
    }
  });

  // Register global hotkey to hide overlay
  globalShortcut.register(config.hideOverlayHotkey, () => {
    console.log(`Global hotkey triggered (${config.hideOverlayHotkey}): Hide overlay`);
    if (overlayWindow) {
      overlayWindow.hide();
    }
  });

  // Register global hotkey to show game-specific factoid
  globalShortcut.register(config.showGameSpecificHotkey, () => {
    console.log(`Global hotkey triggered (${config.showGameSpecificHotkey}): Show game-specific factoid`);
    if (overlayWindow) {
      showGameSpecificFactoid(selectedGameForHotkey);
    }
  });

  console.log('Global hotkeys registered:');
  console.log(`- Show factoid: ${config.showFactoidHotkey}`);
  console.log(`- Hide overlay: ${config.hideOverlayHotkey}`);
  console.log(`- Show game-specific factoid: ${config.showGameSpecificHotkey}`);
}

function showRandomFactoid() {
  // Detect current game (this is a simplified version - you can enhance this with actual process detection)
  const currentGame = detectCurrentGame();
  
  // Get or initialize the factoid index for this game
  if (!gameFactoidIndexes[currentGame.id]) {
    gameFactoidIndexes[currentGame.id] = 0;
  }
  
  const gameData = gameFactoidsData[currentGame.id] || gameFactoidsData.default;
  const currentIndex = gameFactoidIndexes[currentGame.id];
  
  // Get the current factoid and trigger cue
  const factoid = gameData.facts[currentIndex];
  const triggerCue = gameData.triggers[currentIndex];
  
  // Update the trigger cue for the main window
  currentTriggerCue = triggerCue;
  if (mainWindow) {
    mainWindow.webContents.send('update-trigger-cue', {
      cue: triggerCue,
      gameTitle: currentGame.displayName,
      factoidNumber: currentIndex + 1,
      totalFactoids: gameData.facts.length
    });
  }
  
  // Advance to next factoid (loop back to start if at end)
  gameFactoidIndexes[currentGame.id] = (currentIndex + 1) % gameData.facts.length;
  
  if (overlayWindow) {
    overlayWindow.webContents.send('show-factoid', { 
      text: factoid,
      game: currentGame
    });
    overlayWindow.show();
    overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // Ensure it stays on top
    
    // Auto-hide after 6 seconds (slightly longer for more content)
    setTimeout(() => {
      if (overlayWindow) {
        overlayWindow.hide();
      }
    }, 6000);
  }
}

// Simple game detection function - you can enhance this with actual process detection
function detectCurrentGame() {
  // This is a placeholder - in a real implementation, you would detect running processes
  // For now, we'll cycle through games for demonstration
  const availableGames = Object.keys(gameFactoidsData).filter(id => id !== 'default');
  
  if (availableGames.length > 0 && Math.random() > 0.3) {
    const randomGameId = availableGames[Math.floor(Math.random() * availableGames.length)];
    const gameData = gameFactoidsData[randomGameId];
    const game = { 
      id: randomGameId, 
      name: `${randomGameId}.exe`, 
      displayName: gameData.displayName || randomGameId 
    };
    console.log(`Detected game: ${game.displayName}`);
    return game;
  }
  
  return { id: 'default', name: '', displayName: 'Gaming Facts' };
}

// Update game list in main window
function updateMainWindowGameList() {
  if (mainWindow) {
    const gamesList = Object.keys(gameFactoidsData).map(id => ({
      id: id,
      displayName: gameFactoidsData[id].displayName || id
    }));
    mainWindow.webContents.send('update-games-list', gamesList);
  }
}

app.whenReady().then(() => {
  // Load games data first
  loadGamesData();
  
  createMainWindow();
  createOverlayWindow();
  createExpressServer();
  registerGlobalHotkeys();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Unregister all global shortcuts
  globalShortcut.unregisterAll();
  
  // Close express server
  if (server) {
    server.close();
  }
});

// IPC handlers for main functionality
ipcMain.on('show-factoid', () => {
  showRandomFactoid();
});

ipcMain.on('show-game-factoid', (event, gameId) => {
  showGameSpecificFactoid(gameId);
});

ipcMain.on('hide-overlay', () => {
  if (overlayWindow) {
    overlayWindow.hide();
  }
});

ipcMain.on('reset-factoid-order', () => {
  gameFactoidIndexes = {};
  currentTriggerCue = "Ready for factoid";
  if (mainWindow) {
    mainWindow.webContents.send('update-trigger-cue', {
      cue: "Ready for factoid",
      gameTitle: "All Games Reset",
      factoidNumber: 1,
      totalFactoids: "?"
    });
  }
  console.log('Factoid order reset for all games');
});

ipcMain.on('toggle-click-through', () => {
  if (overlayWindow) {
    overlayConfig.clickThrough = !overlayConfig.clickThrough;
    overlayWindow.setIgnoreMouseEvents(overlayConfig.clickThrough);
    console.log(`Click-through ${overlayConfig.clickThrough ? 'enabled' : 'disabled'}`);
    
    // Send status to main window
    if (mainWindow) {
      mainWindow.webContents.send('click-through-status', overlayConfig.clickThrough);
    }
  }
});

ipcMain.on('update-overlay-config', (event, config) => {
  overlayConfig = { ...overlayConfig, ...config };
  if (overlayWindow) {
    overlayWindow.webContents.send('apply-config', overlayConfig);
  }
  console.log('Overlay configuration updated');
});

ipcMain.on('get-overlay-config', (event) => {
  event.reply('overlay-config', overlayConfig);
});

ipcMain.on('save-overlay-position', (event, position) => {
  overlayConfig.position = position;
  console.log('Overlay position saved:', position);
});

ipcMain.on('move-overlay-window', (event, position) => {
  if (overlayWindow) {
    overlayWindow.setPosition(position.x, position.y);
  }
});

ipcMain.on('set-hotkey-game', (event, gameId) => {
  selectedGameForHotkey = gameId;
  console.log(`Game-specific hotkey now set to: ${gameId}`);
  
  // Send confirmation to main window
  if (mainWindow) {
    mainWindow.webContents.send('hotkey-game-updated', gameId);
  }
});

ipcMain.on('get-config', (event) => {
  event.reply('config-data', {
    ...config,
    selectedGameForHotkey
  });
});

ipcMain.on('update-port', (event, newPort) => {
  // Close the current server
  if (server) {
    server.close(() => {
      // Update port in config
      config.port = newPort;
      
      // Restart server with new port
      expressApp = express();
      
      // Serve static files from public directory
      expressApp.use(express.static(path.join(__dirname, '../public')));

      // API endpoint to trigger factoid display
      expressApp.post('/api/show-factoid', (req, res) => {
        if (overlayWindow) {
          overlayWindow.webContents.send('show-factoid', req.body);
          res.json({ success: true });
        } else {
          res.status(500).json({ error: 'Overlay window not available' });
        }
      });

      server = expressApp.listen(config.port, () => {
        console.log(`Factoid server restarted on http://localhost:${config.port}`);
        // Send confirmation to main window
        if (mainWindow) {
          mainWindow.webContents.send('port-updated', config.port);
        }
      });
    });
  }
});

ipcMain.on('update-hotkeys', (event, hotkeys) => {
  // Unregister all current hotkeys
  globalShortcut.unregisterAll();
  
  // Update hotkeys in config
  config.showFactoidHotkey = hotkeys.showFactoid;
  config.hideOverlayHotkey = hotkeys.hideOverlay;
  config.showGameSpecificHotkey = hotkeys.showGameSpecific;
  
  // Re-register hotkeys with new combinations
  try {
    // Register global hotkey to show factoid
    globalShortcut.register(config.showFactoidHotkey, () => {
      console.log(`Global hotkey triggered (${config.showFactoidHotkey}): Show factoid`);
      if (overlayWindow) {
        showRandomFactoid();
      }
    });

    // Register global hotkey to hide overlay
    globalShortcut.register(config.hideOverlayHotkey, () => {
      console.log(`Global hotkey triggered (${config.hideOverlayHotkey}): Hide overlay`);
      if (overlayWindow) {
        overlayWindow.hide();
      }
    });

    // Register global hotkey to show game-specific factoid
    globalShortcut.register(config.showGameSpecificHotkey, () => {
      console.log(`Global hotkey triggered (${config.showGameSpecificHotkey}): Show game-specific factoid`);
      if (overlayWindow) {
        showGameSpecificFactoid(selectedGameForHotkey);
      }
    });

    console.log('Hotkeys updated:');
    console.log(`- Show factoid: ${config.showFactoidHotkey}`);
    console.log(`- Hide overlay: ${config.hideOverlayHotkey}`);
    console.log(`- Show game-specific factoid: ${config.showGameSpecificHotkey}`);
    
    // Send confirmation to main window
    if (mainWindow) {
      mainWindow.webContents.send('hotkeys-updated', {
        success: true,
        hotkeys: {
          showFactoid: config.showFactoidHotkey,
          hideOverlay: config.hideOverlayHotkey,
          showGameSpecific: config.showGameSpecificHotkey
        }
      });
    }
  } catch (error) {
    console.error('Error registering hotkeys:', error);
    // Send error to main window
    if (mainWindow) {
      mainWindow.webContents.send('hotkeys-updated', {
        success: false,
        error: error.message
      });
    }
  }
});

// IPC handlers for game management
ipcMain.on('open-game-manager', () => {
  createGameManagerWindow();
});

ipcMain.on('get-games-data', (event) => {
  event.reply('games-data', gameFactoidsData);
});

ipcMain.on('add-game', (event, { gameId, gameData }) => {
  if (gameFactoidsData[gameId]) {
    event.reply('game-operation-result', {
      success: false,
      message: 'Game ID already exists'
    });
    return;
  }

  gameFactoidsData[gameId] = gameData;
  if (saveGamesData()) {
    updateMainWindowGameList();
    event.reply('game-operation-result', {
      success: true,
      message: `Game "${gameData.displayName}" added successfully`
    });
  } else {
    event.reply('game-operation-result', {
      success: false,
      message: 'Failed to save game data'
    });
  }
});

ipcMain.on('update-game', (event, { gameId, gameData }) => {
  if (!gameFactoidsData[gameId]) {
    event.reply('game-operation-result', {
      success: false,
      message: 'Game not found'
    });
    return;
  }

  gameFactoidsData[gameId] = { ...gameFactoidsData[gameId], ...gameData };
  if (saveGamesData()) {
    updateMainWindowGameList();
    event.reply('game-operation-result', {
      success: true,
      message: `Game "${gameData.displayName}" updated successfully`
    });
  } else {
    event.reply('game-operation-result', {
      success: false,
      message: 'Failed to save game data'
    });
  }
});

ipcMain.on('delete-game', (event, gameId) => {
  if (!gameFactoidsData[gameId]) {
    event.reply('game-operation-result', {
      success: false,
      message: 'Game not found'
    });
    return;
  }

  if (gameId === 'default') {
    event.reply('game-operation-result', {
      success: false,
      message: 'Cannot delete the default game'
    });
    return;
  }

  const gameName = gameFactoidsData[gameId].displayName;
  delete gameFactoidsData[gameId];
  
  if (saveGamesData()) {
    updateMainWindowGameList();
    event.reply('game-operation-result', {
      success: true,
      message: `Game "${gameName}" deleted successfully`
    });
  } else {
    event.reply('game-operation-result', {
      success: false,
      message: 'Failed to save game data'
    });
  }
});

ipcMain.on('add-factoid', (event, { gameId, factoid, trigger }) => {
  if (!gameFactoidsData[gameId]) {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Game not found'
    });
    return;
  }

  if (!gameFactoidsData[gameId].facts) {
    gameFactoidsData[gameId].facts = [];
  }
  if (!gameFactoidsData[gameId].triggers) {
    gameFactoidsData[gameId].triggers = [];
  }

  gameFactoidsData[gameId].facts.push(factoid);
  gameFactoidsData[gameId].triggers.push(trigger);

  if (saveGamesData()) {
    event.reply('factoid-operation-result', {
      success: true,
      message: 'Factoid added successfully'
    });
  } else {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Failed to save factoid data'
    });
  }
});

ipcMain.on('update-factoid', (event, { gameId, index, factoid, trigger }) => {
  if (!gameFactoidsData[gameId] || !gameFactoidsData[gameId].facts || !gameFactoidsData[gameId].facts[index]) {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Factoid not found'
    });
    return;
  }

  gameFactoidsData[gameId].facts[index] = factoid;
  if (gameFactoidsData[gameId].triggers) {
    gameFactoidsData[gameId].triggers[index] = trigger;
  }

  if (saveGamesData()) {
    event.reply('factoid-operation-result', {
      success: true,
      message: 'Factoid updated successfully'
    });
  } else {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Failed to save factoid data'
    });
  }
});

ipcMain.on('delete-factoid', (event, { gameId, index }) => {
  if (!gameFactoidsData[gameId] || !gameFactoidsData[gameId].facts || !gameFactoidsData[gameId].facts[index]) {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Factoid not found'
    });
    return;
  }

  gameFactoidsData[gameId].facts.splice(index, 1);
  if (gameFactoidsData[gameId].triggers) {
    gameFactoidsData[gameId].triggers.splice(index, 1);
  }

  if (saveGamesData()) {
    event.reply('factoid-operation-result', {
      success: true,
      message: 'Factoid deleted successfully'
    });
  } else {
    event.reply('factoid-operation-result', {
      success: false,
      message: 'Failed to save factoid data'
    });
  }
});

ipcMain.on('close-game-manager', () => {
  if (gameManagerWindow) {
    gameManagerWindow.close();
  }
});

// Function to show factoid for a specific game
function showGameSpecificFactoid(gameId) {
  const game = gameFactoidsData[gameId] ? {
    id: gameId,
    displayName: gameFactoidsData[gameId].displayName || gameId
  } : { id: 'default', displayName: 'Gaming Facts' };
  
  // Get or initialize the factoid index for this game
  if (!gameFactoidIndexes[gameId]) {
    gameFactoidIndexes[gameId] = 0;
  }
  
  const gameData = gameFactoidsData[gameId] || gameFactoidsData.default;
  const currentIndex = gameFactoidIndexes[gameId];
  
  // Get the current factoid and trigger cue
  const factoid = gameData.facts[currentIndex];
  const triggerCue = gameData.triggers[currentIndex];
  
  // Update the trigger cue for the main window
  currentTriggerCue = triggerCue;
  if (mainWindow) {
    mainWindow.webContents.send('update-trigger-cue', {
      cue: triggerCue,
      gameTitle: game.displayName,
      factoidNumber: currentIndex + 1,
      totalFactoids: gameData.facts.length
    });
  }
  
  // Advance to next factoid (loop back to start if at end)
  gameFactoidIndexes[gameId] = (currentIndex + 1) % gameData.facts.length;
  
  if (overlayWindow) {
    overlayWindow.webContents.send('show-factoid', { 
      text: factoid,
      game: game
    });
    overlayWindow.show();
    overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // Ensure it stays on top
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      if (overlayWindow) {
        overlayWindow.hide();
      }
    }, 6000);
  }
}
