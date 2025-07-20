# Development Notes

## Architecture

This application uses Electron to create:
1. A main control window for managing the overlay
2. A transparent overlay window that sits on top of all applications
3. An Express server for potential web API integrations

## Key Dependencies

- **Electron**: For creating desktop applications with web technologies
- **Express**: For the local API server
- **GlobalKey**: For system-wide hotkey registration (alternative: Electron's globalShortcut)

## Global Hotkey Implementation

The application uses Electron's built-in `globalShortcut` module to register system-wide hotkeys that work even when the application doesn't have focus.

## Overlay Positioning

The overlay is positioned in the top-right corner by default but can be easily modified. It's designed to be:
- Always on top of other windows
- Transparent background
- Mouse events ignored (so it doesn't interfere with other applications)

## Future Enhancements

Potential features to add:
- Configuration file for custom factoids
- Multiple overlay themes
- Game-specific factoid databases
- Integration with game APIs for context-aware facts
- Custom positioning options
- Sound effects
- Timer-based auto-display
