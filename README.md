# Ai Writer - Chrome Extension

A Chrome Extension (Manifest V3) that lets you rewrite, correct, and enhance text using AI. Select any text on any webpage, then use the context menu or extension popup to improve it with AI.

## Features

- **Right-click context menu** - Quick access to rewrite options
- **Extension popup** - Full-featured interface with multiple modes
- **Inline replacement** - Replace text directly in editable fields (textarea, input, contenteditable)
- **Multiple modes**:
  - Professional rewrite
  - Fix grammar & spelling
  - Make it friendly
  - Shorten
  - Expand
  - Translate
- **Configurable AI provider** - Works with OpenAI or any compatible API

## Installation

### 1. Load the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in the top right)
3. Click **Load unpacked**
4. Select the `Ai Writer` folder
5. The extension should now appear in your extensions list

### 2. Configure API Settings

1. Click the extension icon in Chrome toolbar
2. Click the settings (⚙️) button, or right-click the extension icon and select "Options"
3. Enter your API configuration:
   - **API Key**: Your OpenAI API key (or compatible API key)
   - **API Endpoint**: Default is `https://api.openai.com/v1/chat/completions`
   - **Model**: Default is `gpt-4o-mini`
4. Click **Save Settings**
5. (Optional) Click **Test Connection** to verify your settings work

### 3. Create Icons (Optional)

If you don't have icon files yet:

1. Open `create-icons.html` in your browser
2. Click the download buttons to generate `icon16.png`, `icon48.png`, and `icon128.png`
3. Save them in the `icons/` directory

Or create your own icons (16x16, 48x48, 128x128 PNG files) and place them in the `icons/` directory.

## Usage

### Method 1: Context Menu (Right-click)

1. Select any text on a webpage
2. Right-click to open the context menu
3. Choose an option:
   - **Rewrite (Professional)**
   - **Fix grammar & spelling**
   - **Shorten**
   - **Expand**
   - **Make it friendly**
   - **Translate**
4. A modal will appear with the AI result
5. Click **Copy** to copy the result, or **Replace** to replace the selected text (if in an editable field)

### Method 2: Extension Popup

1. Select text on a webpage
2. Click the Ai Writer extension icon
3. The selected text will appear in the input field (or paste your own text)
4. Choose a mode from the dropdown
5. Click **Rewrite**
6. Use the result:
   - **Copy** - Copy to clipboard
   - **Replace** - Replace text in the page (if editable)
   - **Swap** - Swap input and output text

## API Configuration

### OpenAI

- **API Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Model**: `gpt-4o-mini`, `gpt-4`, `gpt-3.5-turbo`, etc.
- **API Key**: Get one at [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Azure OpenAI

- **API Endpoint**: `https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT/chat/completions?api-version=2023-05-15`
- **Model**: Your deployment name
- **API Key**: Your Azure API key

### Other Compatible APIs

Any API that follows the OpenAI chat completions format should work. Just set the endpoint and model accordingly.

## File Structure

```
Ai Writer/
├── manifest.json          # Extension manifest
├── background.js          # Service worker (context menus, API calls)
├── content.js            # Content script (selection, replacement, overlay)
├── popup.html            # Popup UI
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── options.html          # Settings page
├── options.js            # Settings logic
├── options.css           # Settings styles
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── create-icons.html     # Icon generator tool
└── README.md             # This file
```

## Permissions

- **contextMenus**: To show rewrite options in the right-click menu
- **activeTab**: To access the current tab when the user clicks the extension
- **scripting**: To inject content scripts and interact with pages
- **storage**: To save API settings locally
- **<all_urls>**: To work on any website

## Privacy & Security

- **API keys are stored locally** using Chrome's storage API
- **No data is collected** or sent to any server except your configured AI API
- **All processing happens** through your configured API endpoint
- The extension only accesses pages when you explicitly use it

## Troubleshooting

### "API key not configured" error

- Go to extension options and enter your API key
- Make sure to click "Save Settings"

### "Failed to connect to API" error

- Check your API key is correct
- Verify the API endpoint URL is correct
- Test the connection using the "Test Connection" button in options
- Check your internet connection

### Replace button doesn't appear

- The replace feature only works in editable fields (textarea, input, contenteditable)
- Some sites (like Google Docs) may have restrictions
- Use the Copy button instead

### Context menu doesn't appear

- Make sure text is selected before right-clicking
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

### Extension icon is missing

- Create icon files using `create-icons.html`
- Or add your own 16x16, 48x48, and 128x128 PNG files to the `icons/` directory

## Development

### Making Changes

1. Edit the relevant files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Test your changes

### Testing

- Test on various websites (Gmail, Google Docs, plain text pages)
- Test with different text lengths
- Test all modes (Professional, Grammar, Friendly, etc.)
- Test both context menu and popup methods

## License

This project is provided as-is for personal or commercial use.

## Support

For issues or questions, please check:
- Chrome extension documentation
- OpenAI API documentation (if using OpenAI)
- Your API provider's documentation

---

**Note**: This extension requires an API key from an AI provider. You are responsible for any API costs incurred through usage.
