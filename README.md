# Factoid Overlay 🎮

A desktop overlay application for streamers to display "Did You Know?" factoids during gameplay. Built with Node.js and Electron, featuring global hotkey support for seamless integration with any streaming setup.

## Features

- **Desktop Overlay**: Transparent, always-on-top overlay that appears over any application
- **Global Hotkeys**: Control the overlay from anywhere with keyboard shortcuts
- **Scalable UI**: Automatically adjusts size based on content and screen resolution
- **Streaming Ready**: Designed for use with OBS, Streamlabs, and other streaming software
- **Customizable**: Easy to modify factoids and styling

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```

3. **Use Global Hotkeys**
   - `Ctrl + Shift + F` - Show random factoid
   - `Ctrl + Shift + H` - Hide overlay

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
