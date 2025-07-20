const { app, BrowserWindow, globalShortcut, ipcMain, screen } = require('electron');
const path = require('path');
const express = require('express');

let mainWindow;
let overlayWindow;
let expressApp;
let server;

// Express server for serving the overlay UI
function createExpressServer() {
  expressApp = express();
  const PORT = 3000;

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
    width: 400,
    height: 300,
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
    width: 420,
    height: 180,
    x: width - 440,
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
  overlayWindow.setIgnoreMouseEvents(true);
  overlayWindow.setAlwaysOnTop(true, 'screen-saver'); // Force highest level

  overlayWindow.on('closed', () => {
    overlayWindow = null;
  });
}

function registerGlobalHotkeys() {
  // Register global hotkey to show factoid (Ctrl+Shift+F)
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    console.log('Global hotkey triggered: Show factoid');
    if (overlayWindow) {
      showRandomFactoid();
    }
  });

  // Register global hotkey to hide overlay (Ctrl+Shift+H)
  globalShortcut.register('CommandOrControl+Shift+H', () => {
    console.log('Global hotkey triggered: Hide overlay');
    if (overlayWindow) {
      overlayWindow.hide();
    }
  });
}

function showRandomFactoid() {
  // Detect current game (this is a simplified version - you can enhance this with actual process detection)
  const currentGame = detectCurrentGame();
  
  const gameFactoids = {
    minecraft: [
      "Did you know? Minecraft was originally called 'Cave Game' during development!",
      "Did you know? The Creeper was created by accident when Notch mixed up the height and length values!",
      "Did you know? Minecraft has sold over 300 million copies worldwide!",
      "Did you know? The first version of Minecraft was created in just 6 days!",
      "Did you know? Endermen are based on the internet urban legend 'Slender Man'!"
    ],
    valorant: [
      "Did you know? Valorant was codenamed 'Project A' during development!",
      "Did you know? Sage's healing ability was inspired by MMO healing mechanics!",
      "Did you know? Riot Games used anti-cheat technology from the kernel level!",
      "Did you know? Valorant's maps are designed to be perfectly balanced for both teams!",
      "Did you know? The game was designed to run on lower-end PCs to be accessible!"
    ],
    csgo: [
      "Did you know? CS:GO was initially received poorly but became one of the most popular FPS games!",
      "Did you know? The AK-47 in CS:GO can one-shot kill with a headshot even with a helmet!",
      "Did you know? Dust2 is the most played map in Counter-Strike history!",
      "Did you know? The bomb timer in competitive matches is exactly 40 seconds!",
      "Did you know? CS:GO's weapon skins market is worth millions of dollars!"
    ],
    cs2: [
      "Did you know? Counter-Strike 2 uses the Source 2 engine for better graphics!",
      "Did you know? CS2 features completely redesigned smoke grenades with volumetric effects!",
      "Did you know? All CS:GO items and progress carry over to Counter-Strike 2!",
      "Did you know? CS2 has improved netcode for more responsive gameplay!",
      "Did you know? The new sub-tick system makes shots more precise than ever!"
    ],
    overwatch: [
      "Did you know? Overwatch was built from the cancelled project 'Titan'!",
      "Did you know? Tracer was the first character designed for Overwatch!",
      "Did you know? Each Overwatch hero has over 20,000 lines of code!",
      "Did you know? The game's art style was inspired by Pixar animations!",
      "Did you know? Overwatch won Game of the Year at The Game Awards 2016!"
    ],
    default: [
      "Did you know? The first video game was created in 1958!",
      "Did you know? Pac-Man was originally called Puck-Man in Japan!",
      "Did you know? The highest-grossing arcade game of all time is Pac-Man!",
      "Did you know? Tetris was created by a Russian programmer in 1984!",
      "Did you know? The first gaming console was the Magnavox Odyssey in 1972!",
      "Did you know? The PlayStation was originally designed as a Nintendo console!",
      "Did you know? The longest gaming session ever recorded was 138 hours!",
      "Did you know? Super Mario's jump sound was created by accident!"
    ]
  };
  
  const factoids = gameFactoids[currentGame.id] || gameFactoids.default;
  const randomFactoid = factoids[Math.floor(Math.random() * factoids.length)];
  
  if (overlayWindow) {
    overlayWindow.webContents.send('show-factoid', { 
      text: randomFactoid,
      game: currentGame
    });
    overlayWindow.show();
    
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
  const games = [
    { id: 'minecraft', name: 'minecraft.exe', displayName: 'Minecraft' },
    { id: 'valorant', name: 'VALORANT.exe', displayName: 'Valorant' },
    { id: 'csgo', name: 'csgo.exe', displayName: 'CS:GO' },
    { id: 'cs2', name: 'cs2.exe', displayName: 'Counter-Strike 2' },
    { id: 'overwatch', name: 'Overwatch.exe', displayName: 'Overwatch 2' },
    { id: 'fortnite', name: 'FortniteClient-Win64-Shipping.exe', displayName: 'Fortnite' },
    { id: 'leagueoflegends', name: 'League of Legends.exe', displayName: 'League of Legends' },
    { id: 'dota2', name: 'dota2.exe', displayName: 'Dota 2' },
    { id: 'worldofwarcraft', name: 'Wow.exe', displayName: 'World of Warcraft' },
    { id: 'apex', name: 'r5apex.exe', displayName: 'Apex Legends' }
  ];
  
  // For demonstration, randomly select a game (you can replace this with actual process detection)
  if (Math.random() > 0.3) {
    const randomGame = games[Math.floor(Math.random() * games.length)];
    console.log(`Detected game: ${randomGame.displayName}`);
    return randomGame;
  }
  
  return { id: 'default', name: '', displayName: 'Gaming Facts' };
}

app.whenReady().then(() => {
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

// IPC handlers
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

// Function to show factoid for a specific game
function showGameSpecificFactoid(gameId) {
  const games = {
    minecraft: { id: 'minecraft', displayName: 'Minecraft' },
    valorant: { id: 'valorant', displayName: 'Valorant' },
    csgo: { id: 'csgo', displayName: 'CS:GO' },
    cs2: { id: 'cs2', displayName: 'Counter-Strike 2' },
    overwatch: { id: 'overwatch', displayName: 'Overwatch 2' },
    fortnite: { id: 'fortnite', displayName: 'Fortnite' },
    leagueoflegends: { id: 'leagueoflegends', displayName: 'League of Legends' },
    dota2: { id: 'dota2', displayName: 'Dota 2' },
    worldofwarcraft: { id: 'worldofwarcraft', displayName: 'World of Warcraft' },
    apex: { id: 'apex', displayName: 'Apex Legends' },
    default: { id: 'default', displayName: 'Gaming Facts' }
  };

  const game = games[gameId] || games.default;
  
  const gameFactoids = {
    minecraft: [
      "Did you know? Minecraft was originally called 'Cave Game' during development!",
      "Did you know? The Creeper was created by accident when Notch mixed up the height and length values!",
      "Did you know? Minecraft has sold over 300 million copies worldwide!",
      "Did you know? The first version of Minecraft was created in just 6 days!",
      "Did you know? Endermen are based on the internet urban legend 'Slender Man'!"
    ],
    valorant: [
      "Did you know? Valorant was codenamed 'Project A' during development!",
      "Did you know? Sage's healing ability was inspired by MMO healing mechanics!",
      "Did you know? Riot Games used anti-cheat technology from the kernel level!",
      "Did you know? Valorant's maps are designed to be perfectly balanced for both teams!",
      "Did you know? The game was designed to run on lower-end PCs to be accessible!"
    ],
    csgo: [
      "Did you know? CS:GO was initially received poorly but became one of the most popular FPS games!",
      "Did you know? The AK-47 in CS:GO can one-shot kill with a headshot even with a helmet!",
      "Did you know? Dust2 is the most played map in Counter-Strike history!",
      "Did you know? The bomb timer in competitive matches is exactly 40 seconds!",
      "Did you know? CS:GO's weapon skins market is worth millions of dollars!"
    ],
    cs2: [
      "Did you know? Counter-Strike 2 uses the Source 2 engine for better graphics!",
      "Did you know? CS2 features completely redesigned smoke grenades with volumetric effects!",
      "Did you know? All CS:GO items and progress carry over to Counter-Strike 2!",
      "Did you know? CS2 has improved netcode for more responsive gameplay!",
      "Did you know? The new sub-tick system makes shots more precise than ever!"
    ],
    overwatch: [
      "Did you know? Overwatch was built from the cancelled project 'Titan'!",
      "Did you know? Tracer was the first character designed for Overwatch!",
      "Did you know? Each Overwatch hero has over 20,000 lines of code!",
      "Did you know? The game's art style was inspired by Pixar animations!",
      "Did you know? Overwatch won Game of the Year at The Game Awards 2016!"
    ],
    default: [
      "Did you know? The first video game was created in 1958!",
      "Did you know? Pac-Man was originally called Puck-Man in Japan!",
      "Did you know? The highest-grossing arcade game of all time is Pac-Man!",
      "Did you know? Tetris was created by a Russian programmer in 1984!",
      "Did you know? The first gaming console was the Magnavox Odyssey in 1972!",
      "Did you know? The PlayStation was originally designed as a Nintendo console!",
      "Did you know? The longest gaming session ever recorded was 138 hours!",
      "Did you know? Super Mario's jump sound was created by accident!"
    ]
  };
  
  const factoids = gameFactoids[gameId] || gameFactoids.default;
  const randomFactoid = factoids[Math.floor(Math.random() * factoids.length)];
  
  if (overlayWindow) {
    overlayWindow.webContents.send('show-factoid', { 
      text: randomFactoid,
      game: game
    });
    overlayWindow.show();
    
    // Auto-hide after 6 seconds
    setTimeout(() => {
      if (overlayWindow) {
        overlayWindow.hide();
      }
    }, 6000);
  }
}
