Project description for Cursor (Chrome Extension)

Project title: TextPolish AI — Chrome Extension (AI writer & enhancer)

Goal

Build a Chrome Extension (Manifest V3) that lets a user select any text on any webpage, then right-click (context menu) or click the extension icon to:

send the selected text to an AI endpoint (OpenAI / ChatGPT-style API),

receive a rewritten / corrected version,

let the user copy the improved text or replace the text in the active input/textarea/contenteditable when possible.

Core user flows

Rewrite from right-click

User highlights text anywhere on a page.

Right-click → context menu shows:

“Rewrite (Professional)”

“Fix grammar & spelling”

“Shorten”

“Expand”

“Make it friendly”

“Translate” (optional)

Clicking an item sends the selected text to the AI and returns the result in a small UI.

Rewrite from extension popup

User selects text, clicks extension icon.

Popup shows:

detected selected text (editable textarea)

dropdown “Mode” (Professional, Friendly, Shorter, Longer, Fix grammar)

“Rewrite” button

output area

buttons: Copy, Replace in page (if supported), Swap input/output

Inline replacement (when possible)

If the selection is inside:

<textarea>, <input type="text">, or a contenteditable element (Gmail editor, chat boxes, etc.)

allow “Replace” to insert AI result into the same element at the selection/caret.

If replacement is not possible (plain text on webpage), show Copy only.

AI integration

Use a configurable AI provider:

Default: OpenAI-compatible REST endpoint (e.g. https://api.openai.com/v1/chat/completions).

Provide a Settings page where the user can enter:

API key (stored locally using chrome.storage.sync or chrome.storage.local)

Model name (default: gpt-4o-mini or any text field)

Optional custom endpoint URL (so user can use Azure OpenAI / other providers)

NEVER hardcode the API key in code.

Support streaming is optional; non-streaming is fine for v1.

Prompting behavior

Create a prompt builder based on selected “Mode”:

Fix grammar & spelling: correct mistakes, keep meaning, keep language.

Professional rewrite: clearer, professional tone, same meaning.

Friendly rewrite: warmer and more casual.

Shorten: reduce length, preserve key points.

Expand: add clarity and detail without changing meaning.

Rules:

Keep the same language as the input unless user chooses Translate mode.

Preserve names, URLs, product names.

Return only rewritten text (no explanations).

UI requirements

Provide two UI options:

Popup UI (extension icon)

Result overlay on the page after context-menu action (small floating modal near selection or centered)

Overlay should show:

title: “AI Result”

output textarea

buttons: Copy, Replace (if possible), Close

loading spinner while waiting

Technical requirements (Manifest V3)

Use:

service worker background (background.js)

content script to read selection and replace text

popup (popup.html, popup.js)

options/settings (options.html, options.js)

Permissions:

contextMenus

activeTab

scripting

storage

Host permissions: only if needed; prefer using activeTab + scripting to reduce scope.

Architecture / messaging

Background service worker:

creates context menu items

handles context menu clicks

calls AI API

sends result to content script or popup

Content script:

gets selected text

detects if selection is inside editable field

can replace selected text safely

can show overlay UI

Popup:

requests selected text from content script

sends rewrite request to background

displays result

Edge cases

No selection → show message “Select text first”.

Very long text:

warn the user and/or limit length (e.g. 6,000–10,000 chars) and show a message.

Sites with restricted scripts:

if injection fails, show fallback: copy result only.

Avoid breaking formatting:

For contenteditable, insert plain text result (or optionally preserve line breaks).

Deliverables (files)

Generate a complete working extension with these files:

manifest.json

background.js (service worker: context menus + API calls)

content.js (selection + replacement + overlay UI)

popup.html, popup.js, popup.css

options.html, options.js, options.css

icons/ (placeholder icons)

README.md (how to install unpacked extension, how to set API key, how to use)

Acceptance checklist

Context menu appears when text is selected.

Popup can pull selection and rewrite it.

Options page stores API key and settings.

Output is shown and can be copied.

Replace works in textarea/input/contenteditable on common sites (Google Docs may be limited; Gmail should work in many cases).

No secrets stored in code.
