# Time Tracker PWA

A Progressive Web App for tracking work hours by project. Built with HTML, CSS, and vanilla JavaScript.

## Features

- ⏱️ Track time entries with date, start time, end time, and description
- 📊 View time summary by project
- 🔍 Filter entries by date range and project
- 💾 Data stored locally in browser (localStorage)
- 📱 Installable as a Progressive Web App
- 🔌 Works offline after initial load

## Getting Started

### Serve the App

The app needs to be served over HTTPS (or localhost) for PWA features to work.

**Option 1: Using Python (if installed)**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Using Node.js (if installed)**
```bash
# Install http-server globally
npm install -g http-server

# Run server
http-server -p 8000
```

**Option 3: Using VS Code**
- Install "Live Server" extension
- Right-click on index.html and select "Open with Live Server"

### Open the App

Navigate to `http://localhost:8000` in your browser.

### Install as PWA

- **Chrome/Edge**: Click the install icon in the address bar or use the menu to install
- **Safari (iOS)**: Tap the share button and select "Add to Home Screen"
- **Firefox**: Click the install icon in the address bar

## Usage

### Adding a Time Entry

1. Select the date of work
2. Enter start and end times
3. Enter or select a project name (autocomplete will suggest existing projects)
4. Describe what you worked on
5. Click "Add Entry"

### Filtering Entries

1. Set a date range using the "From Date" and "To Date" fields
2. Optionally select a specific project from the dropdown
3. Click "Apply Filter"
4. Click "Clear Filter" to remove all filters

### Summary

The summary section shows:
- Time spent on each project (filtered by current filters)
- Total time across all projects

### Data Storage

All data is stored in your browser's localStorage. This means:
- ✅ Your data is private and stays on your device
- ✅ No internet connection required (after initial download)
- ⚠️ Clearing browser data will delete your entries
- ⚠️ Data is not synced across devices

## File Structure

```
Time Tracker/
├── index.html           # Main HTML structure
├── styles.css          # Styling
├── app.js             # Application logic
├── manifest.json      # PWA manifest
├── service-worker.js  # Service worker for offline support
├── icon-192.png       # App icon (192x192)
├── icon-512.png       # App icon (512x512)
└── README.md         # This file
```

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 11.3+)
- Opera: Full support

## Development

### Making Changes

After making changes to the service worker:
1. Update the `CACHE_NAME` version in `service-worker.js`
2. Reload the page
3. The service worker will update automatically

### Clearing Cache

If you need to clear the service worker cache:
1. Open Developer Tools (F12)
2. Go to Application tab (Chrome/Edge) or Storage tab (Firefox)
3. Click "Clear Storage" or "Clear Site Data"