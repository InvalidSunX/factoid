# Factoid Overlay 🎮

A powerful desktop overlay application that displays "Did You Know?" factoids during gameplay or streaming. Built with Node.js and Electron, featuring a complete management system with persistent storage, global hotkeys, and real-time customization.

## ✨ Key Features

### 🎯 Core Functionality
- **Desktop Overlay**: Transparent, always-on-top overlay that appears over any application
- **Global Hotkeys**: System-wide keyboard shortcuts (fully customizable)
- **Game & Factoid Management**: Complete CRUD interface for games and factoids
- **Persistent Storage**: JSON-based data storage that survives restarts
- **Real-time Updates**: Changes appear immediately without restarting

### 🎮 Game Management System
- **Dynamic Game Library**: Add unlimited games with custom factoids
- **Organized Content**: Each game has its own factoid collection
- **Game-Specific Display**: Target factoids to specific games
- **Bulk Management**: Easy overview and editing of all content
- **Data Persistence**: Automatic saving to `data/games.json`

### ⚙️ Full Customization
- **Visual Styling**: Colors, fonts, shadows, borders, transparency
- **Positioning**: Configurable default overlay position via .env
- **Hotkey Mapping**: Custom keyboard shortcuts for all functions
- **Server Configuration**: Adjustable port and API settings
- **Click-through Mode**: Make overlay non-interactive when needed

### 🎥 Streaming Ready
- **OBS Compatible**: Works with OBS Studio, Streamlabs, XSplit
- **Transparent Background**: Only factoid content is visible
- **Scalable UI**: Adapts to different screen resolutions
- **Professional Appearance**: Clean, modern design

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment (Optional)**
   ```bash
   cp .env.example .env
   # Edit .env to customize settings
   ```

3. **Run the Application**
   ```bash
   npm start
   ```

4. **Global Hotkeys (Default)**
   - `Ctrl + Shift + F` - Show random factoid
   - `Ctrl + Shift + H` - Hide overlay
   - `Ctrl + Shift + G` - Show game-specific factoid

5. **Add Your Content**
   - Click "🎮 Manage Games & Factoids" in control panel
   - Add your games and factoids
   - Start using!

## 🏗️ How It Works

The application consists of four main components:

1. **Main Control Panel (400x550)**: Compact interface for managing the overlay, games, and settings
2. **Game Manager Window**: Full-featured interface for adding/editing games and factoids  
3. **Transparent Overlay**: The actual factoid display that appears over your desktop
4. **Express Server**: Local API server for external integrations and web-based controls

## 📁 Project Structure

```
factoid/
├── src/
│   └── main.js              # Main Electron application
├── public/
│   ├── overlay.html         # Overlay UI
│   ├── control.html         # Control panel UI  
│   └── game-manager.html    # Game management interface
├── data/
│   └── games.json           # Persistent game and factoid storage
├── .env                     # Environment configuration
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## ⚙️ Configuration

### Environment Variables (.env file)

Create a `.env` file in the root directory to customize default settings:

```bash
# Server Configuration
PORT=3000

# Global Hotkeys (customize these combinations)
SHOW_FACTOID_HOTKEY=CommandOrControl+Shift+F
HIDE_OVERLAY_HOTKEY=CommandOrControl+Shift+H
SHOW_GAME_SPECIFIC_HOTKEY=CommandOrControl+Shift+G

# Default Game
DEFAULT_GAME=default

# Overlay Dimensions
DEFAULT_OVERLAY_WIDTH=420
DEFAULT_OVERLAY_HEIGHT=180

# Default Overlay Position (leave empty for auto-positioning to top-right corner)
# Set specific pixel coordinates for a fixed position
# Example: DEFAULT_OVERLAY_X=100 DEFAULT_OVERLAY_Y=50
DEFAULT_OVERLAY_X=
DEFAULT_OVERLAY_Y=
```

### Hotkey Format
Use these modifiers in your hotkey combinations:
- `CommandOrControl` - Ctrl on Windows/Linux, Cmd on Mac
- `Alt` - Alt key
- `Shift` - Shift key  
- `Super` - Windows key (Linux only)

Examples: `CommandOrControl+Shift+F`, `Alt+F1`, `Ctrl+Alt+G`
## 🎮 Game & Factoid Management

### Complete Management System
The application includes a powerful management interface accessible via "🎮 Manage Games & Factoids":

**Game Management:**
- **Add Games**: Create new games with unique IDs and display names
- **Edit Games**: Update game information and display names
- **Delete Games**: Remove games and all associated factoids
- **Game Overview**: See all games with factoid counts

**Factoid Management:**  
- **Add Factoids**: Create new facts with trigger cues for any game
- **Edit Factoids**: Modify existing factoid text and triggers
- **Delete Factoids**: Remove individual factoids from games
- **Bulk View**: See all factoids for each game in an organized list

### Adding Content (Step-by-Step)

1. **Add a New Game**:
   ```
   Game ID: halo_infinite (lowercase, no spaces)
   Display Name: Halo Infinite
   ```

2. **Add Factoids to Your Game**:
   ```
   Factoid: "Did you know? Master Chief's armor weighs 880 pounds!"
   Trigger: "During combat sequences"
   ```

3. **Use Your Content**:
   - Select your game in the main control panel dropdown
   - Use hotkeys or buttons to display your custom factoids

### Data Storage
- **File Location**: `data/games.json`
- **Auto-Save**: Changes save immediately  
- **Persistence**: Survives application restarts
- **Backup Recommended**: Keep copies of your `games.json` file

### Game Selection
The main control panel features a single dropdown that controls:
- Which game the "🎮 Game Factoid" button displays
- Which game the `Ctrl+Shift+G` hotkey targets
- The current factoid sequence and trigger cues

## 🎨 Customization & Configuration

### Built-in Control Panel
Access comprehensive settings via "⚙️ Configure" in the main control panel:

**Visual Customization:**
- **Colors**: Background, border, text, title, and shadow colors
- **Typography**: Font size and text styling  
- **Effects**: Border radius, shadow opacity, transparency
- **Layout**: Overlay dimensions and positioning

**Functional Settings:**
- **Server Port**: Change the local API server port
- **Global Hotkeys**: Customize all keyboard shortcuts
- **Click-through Mode**: Make overlay non-interactive
- **Game Selection**: Choose default games for hotkeys

### Advanced Configuration (.env)
Environment variables override default settings:

```bash
# Server Configuration  
PORT=3000

# Global Hotkey Configuration
SHOW_FACTOID_HOTKEY=CommandOrControl+Shift+F
HIDE_OVERLAY_HOTKEY=CommandOrControl+Shift+H
SHOW_GAME_SPECIFIC_HOTKEY=CommandOrControl+Shift+G

# Default Settings
DEFAULT_GAME=default

# Overlay Appearance
DEFAULT_OVERLAY_WIDTH=420
DEFAULT_OVERLAY_HEIGHT=180

# Overlay Positioning
DEFAULT_OVERLAY_X=        # Leave empty for auto-positioning
DEFAULT_OVERLAY_Y=        # Set numbers for fixed position (e.g., 100, 50)
```

### Position Examples
```bash
# Auto-position to top-right (default)
DEFAULT_OVERLAY_X=
DEFAULT_OVERLAY_Y=

# Fixed top-left corner
DEFAULT_OVERLAY_X=20
DEFAULT_OVERLAY_Y=20

# Custom position
DEFAULT_OVERLAY_X=500
DEFAULT_OVERLAY_Y=100
```

## 🎥 For Streamers & Content Creators

### Streaming Software Integration
This overlay works seamlessly with all major streaming platforms:

**OBS Studio:**
1. Add "Browser Source" 
2. Set URL to local overlay endpoint
3. Configure transparency and positioning
4. The overlay will appear only when factoids are triggered

**Streamlabs OBS:**
1. Add "Browser Source" widget
2. Use local overlay URL  
3. Configure as transparent overlay
4. Integrate with alerts and scenes

**XSplit:**
1. Add "Webpage" source
2. Point to overlay endpoint
3. Set as transparent layer
4. Position over game capture

### Content Creation Features
- **Professional Appearance**: Clean, modern design that complements any stream
- **Transparent Background**: Only factoid content is visible to viewers
- **Customizable Timing**: Control when and how long factoids appear  
- **Game-Specific Content**: Targeted facts that enhance specific gameplay
- **Sequential Display**: Factoids appear in order with timing cues
- **Non-Intrusive**: Overlay doesn't interfere with gameplay

### Integration Options
- **Manual Control**: Use hotkeys during stream for perfect timing
- **API Integration**: Build custom triggers with the local Express server
- **Scene Integration**: Combine with OBS scenes for automated display
- **External Control**: Use web interface for remote factoid management

## 🔧 Development & API

### Local Development
```bash
# Development mode with auto-restart
npm run dev

# Standard mode  
npm start

# Debug mode
npm run debug
```

### API Endpoints
The application runs a local Express server with these endpoints:

```javascript
// Trigger factoid display
POST http://localhost:3000/api/show-factoid
{
  "text": "Your custom factoid",
  "game": { "displayName": "Game Name" }
}

// Static file serving
GET http://localhost:3000/
```

### File Structure Details
```
├── src/main.js          # Electron main process, IPC handlers, data management
├── public/
│   ├── control.html     # Main control panel (400x550)
│   ├── game-manager.html # Game/factoid management interface  
│   └── overlay.html     # Transparent overlay display
├── data/games.json      # Persistent game and factoid storage
└── .env                 # Environment configuration
```

## 📝 License

MIT License - Feel free to modify and use for your streaming and content creation needs!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests to improve the application.
