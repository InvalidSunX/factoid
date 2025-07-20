# Factoid Overlay 🎮

A desktop overlay application for streamers to display "Did You Know?" factoids during gameplay. Built with Node.js and Electron, featuring global hotkey support for seamless integration with any streaming setup.

## Features

- **Desktop Overlay**: Transparent, always-on-top overlay that appears over any application
- **Global Hotkeys**: 
  - `Ctrl + Shift + F` - Show random factoid
  - `Ctrl + Shift + H` - Hide overlay  
  - `Ctrl + Shift + G` - Show game-specific factoid
- **Configurable Hotkeys**: Customize hotkey combinations via .env file
- **Scalable UI**: Automatically adjusts size based on content and screen resolution
- **Movable Overlay**: Click and drag to position anywhere on screen
- **Color Customization**: Full color and style configuration panel
- **Ordered Factoids**: Sequential display with trigger timing cues
- **Game-Specific Facts**: Tailored factoids for different games
- **Streaming Ready**: Designed for use with OBS, Streamlabs, and other streaming software
- **Port Configuration**: Customizable server port via environment variables

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment (Optional)**
   ```bash
   cp .env.example .env
   # Edit .env to customize ports and hotkeys
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

4. **Use Global Hotkeys**
   - `Ctrl + Shift + F` - Show random factoid
   - `Ctrl + Shift + H` - Hide overlay
   - `Ctrl + Shift + G` - Show game-specific factoid

## How It Works

The application consists of:
- **Main Control Panel**: A control window to manage the overlay
- **Transparent Overlay**: The actual factoid display that appears over your desktop
- **Express Server**: Local API server for external integrations
- **Global Hotkey System**: System-wide keyboard shortcuts

## Project Structure

```
factoid/
├── src/
│   └── main.js           # Main Electron application
├── public/
│   ├── overlay.html      # Overlay UI
│   └── control.html      # Control panel UI
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Configuration

### Environment Variables (.env file)

Create a `.env` file in the root directory to customize settings:

```bash
# Server port (default: 3000)
PORT=3000

# Global hotkeys - customize these combinations
SHOW_FACTOID_HOTKEY=CommandOrControl+Shift+F
HIDE_OVERLAY_HOTKEY=CommandOrControl+Shift+H
SHOW_GAME_SPECIFIC_HOTKEY=CommandOrControl+Shift+G

# Default game for game-specific hotkey
DEFAULT_GAME=default

# Overlay dimensions
DEFAULT_OVERLAY_WIDTH=420
DEFAULT_OVERLAY_HEIGHT=180
```

### Hotkey Modifiers
Available modifiers for hotkeys:
- `CommandOrControl` - Ctrl on Windows/Linux, Cmd on Mac
- `Alt` - Alt key
- `Shift` - Shift key
- `Super` - Windows key

### Game-Specific Hotkey
The `Ctrl + Shift + G` hotkey (or your custom combination) shows factoids for a specific game:
1. Select the game in the "Game for Ctrl+Shift+G" dropdown
2. Use the hotkey to show factoids only for that game
3. Perfect for when you're playing a specific game and want targeted facts

## Customization

### Adding New Factoids
Edit the `factoids` array in `src/main.js`:

```javascript
const factoids = [
    "Did you know? Your custom fact here!",
    // Add more facts...
];
```

### Changing Hotkeys
Modify the hotkey registration in `src/main.js`:

```javascript
globalShortcut.register('YourHotkey', () => {
    // Your action here
});
```

### Styling the Overlay
Edit the CSS in `public/overlay.html` to customize appearance, colors, animations, and positioning.

## For Streamers

This overlay is designed to work with streaming software:

1. **OBS Studio**: Add a "Browser Source" pointing to the overlay window
2. **Streamlabs**: Use "Browser Source" with the local overlay URL
3. **XSplit**: Add "Webpage" source for the overlay

The overlay is transparent and will only show the factoid box when triggered.

## Development

- `npm start` - Run the application
- `npm run dev` - Run with auto-restart (requires nodemon)

## License

MIT License - feel free to modify and use for your streaming needs!
