# Chrome Web Store Submission Template — Ai Writer (Filled)

Use this document when submitting **Ai Writer** to the Chrome Web Store. Replace the GitHub URLs below if your repo or username differ.

---

## 1. Single Purpose Description

**Field:** Single purpose description* (max 1,000 characters)

**Your text:**
```
Ai Writer is a productivity extension that lets users rewrite, correct, and enhance text using AI. Users select text on any webpage and use the context menu or extension popup to send it to their configured AI provider (OpenAI or Google Gemini). The extension shows the improved text and allows copy or inline replace in editable fields. API keys and settings are stored locally. All extension code runs in the browser; only the user's selected text is sent to the user's chosen API when they trigger a rewrite.
```

---

## 2. Permission Justifications

### Storage Permission

**Field:** storage justification* (max 1,000 characters)

**Your text:**
```
The 'storage' permission is required to save the user's API configuration (API key, endpoint, model, provider choice) locally in the browser using Chrome's storage API. This data is stored only on the user's device and is never transmitted to any server other than the user's chosen AI API when they explicitly request a rewrite. The extension needs this permission to persist settings between sessions and enable the core AI rewriting functionality.
```

### ActiveTab Permission

**Field:** activeTab justification* (max 1,000 characters)

**Your text:**
```
The 'activeTab' permission is required to read the current tab when the user clicks the extension icon, so the extension can retrieve the user's selected text and display it in the popup. It is also used to inject the content script when the user requests a text replacement, so the rewritten text can be inserted into editable fields. The extension accesses the active tab only when the user explicitly opens the popup or uses the context menu to rewrite selected text.
```

### Scripting Permission

**Field:** scripting justification* (max 1,000 characters)

**Your text:**
```
The 'scripting' permission is required to inject the content script into the active tab when the user uses the extension, so the extension can read the current selection, show the result overlay after a context-menu rewrite, and replace text in editable elements. Injection happens only in response to user actions (opening the popup or choosing a context menu option).
```

### Context Menus Permission

**Field:** contextMenus justification (if asked)

**Your text:**
```
The 'contextMenus' permission is required to add "Rewrite (Professional)", "Fix grammar & spelling", "Shorten", "Expand", "Make it friendly", and "Translate" to the right-click menu when the user selects text. This provides quick access to AI rewriting without opening the popup.
```

### Notifications Permission

**Field:** notifications justification (if asked)

**Your text:**
```
The 'notifications' permission is used only as a fallback when the content script cannot be injected (e.g. restricted page). In that case, the extension copies the result to the clipboard and shows a small notification that the result was copied. No notifications are used for marketing or tracking.
```

### Host Permission Justification

**Field:** Host permission justification* (max 1,000 characters)

**Your text:**
```
The '<all_urls>' host permission is required for the extension's core functionality: AI rewriting must work on any page where the user selects text (email clients, forms, docs, social media, etc.). The content script is needed on pages to read the selection, show the result overlay after a context-menu rewrite, and replace text in textareas, inputs, and contenteditable elements. The extension only accesses page content when the user explicitly selects text and triggers a rewrite. It does not collect, transmit, or analyze browsing data; selected text is sent only to the user's configured AI API when they request a rewrite.
```

---

## 3. Remote Code

**Question:** Are you using remote code?

**Answer:**
- [x] **No, I am not using remote code**
- [ ] Yes, I am using remote code

All JavaScript is included in the extension package. The extension calls external APIs (OpenAI, Gemini) only with the user's own API key and only when the user triggers a rewrite; no remote scripts or eval of remote code are loaded.

---

## 4. Data Collection

**Question:** What user data do you plan to collect from users now or in the future?

**Check ONLY the boxes that apply:**

- [x] **Personally identifiable information** (e.g., name, address, email, age, ID number)  
  Users voluntarily enter their API key and settings in the options page; these are stored locally. No other PII is collected.

- [ ] Health information
- [ ] Financial and payment information
- [ ] Authentication information (passwords, etc. — API key is user-provided and stored locally only)
- [ ] Personal communications
- [ ] Location
- [ ] Web history
- [ ] User activity (keystroke logging, etc.)
- [ ] Website content (selected text is sent only to the user's chosen AI API when they trigger a rewrite; not collected or stored by the extension)

---

## 5. Certifications

**Check ALL THREE boxes (required):**

- [x] **I do not sell or transfer user data to third parties, apart from the approved use cases**
- [x] **I do not use or transfer user data for purposes that are unrelated to my item's single purpose**
- [x] **I do not use or transfer user data to determine creditworthiness or for lending purposes**

---

## 6. Privacy Policy URL

**Field:** Privacy policy URL* (max 2,048 characters)

**Use this URL (after you push to GitHub and enable Pages — see GITHUB_SETUP.md):**
```
https://AdhamBanishamsah.github.io/Ai-Writer/
```
Replace `AdhamBanishamsah` with your GitHub username (lowercase in URL if your username is lowercase).

**Important:** Do **not** use `https://github.com/.../blob/main/PRIVACY_POLICY.md` — the Chrome Web Store often treats it as not reachable. Use GitHub Pages (the URL above) after enabling Pages from the **/docs** folder in your repo Settings → Pages.

---

## 7. Additional URLs (Store Listing)

### Official URL
**Answer:** Select **"None"** (unless you have a verified domain).

### Website link (required)
Use your GitHub repo URL. Example:
```
https://github.com/AdhamBanishamsah/Ai-Writer
```
Replace with your actual username/repo. The repo must exist and be public.

### Support link (required)
Use your repo’s Issues page. Example:
```
https://github.com/AdhamBanishamsah/Ai-Writer/issues
```
Replace with your actual username/repo. The repo must exist and be public.

---

## 8. Store Listing Information

### Name
```
Ai Writer
```

### Short Description (132 characters max)
```
AI-powered text rewriting, grammar fix, and enhancement. Select text, right-click or use popup—works with OpenAI and Gemini.
```

### Full Description
```
Ai Writer is a Chrome extension that helps you rewrite, correct, and improve text using AI. Select any text on any webpage, then use the right-click menu or the extension popup to get a clearer, more professional, friendlier, shorter, or expanded version—or fix grammar and spelling, or translate to English.

Key Features:
• Right-click context menu: Rewrite (Professional), Fix grammar & spelling, Shorten, Expand, Make it friendly, Translate
• Extension popup with mode selector and Copy / Replace / Swap
• Inline replace in textareas, inputs, and contenteditable fields when possible
• Supports OpenAI and Google Gemini; you bring your own API key
• API key and settings stored locally in your browser

How it works:
1. Install the extension and add your API key in Options (OpenAI or Gemini).
2. Select text on any page.
3. Right-click and choose a rewrite option, or click the extension icon and use the popup.
4. Copy the result or replace the selected text in the page if the field is editable.

Perfect for:
• Emails, forms, and documents
• Social posts and comments
• Quick grammar and style fixes
• Translating text to English

Privacy:
Your API key and settings are stored only on your device. Selected text is sent only to your chosen AI API when you trigger a rewrite. The extension does not collect or sell your data.
```

### Category
**Productivity**

### Language
English (add others if you localize).

---

## 9. Checklist Before Submission

- [x] Single purpose description written (under 1,000 chars)
- [x] All permission justifications written (under 1,000 chars each)
- [x] Remote code: No
- [x] Data collection checkboxes selected appropriately
- [x] All 3 certification boxes checked
- [ ] Privacy policy URL ready and publicly accessible
- [ ] Homepage URL and Support URL set (replace placeholders above if needed)
- [x] Store listing description ready
- [ ] Screenshots prepared (recommended: popup, options, context menu, overlay)
- [ ] Promotional tiles created (if required)
- [x] Extension package (ZIP) created — see project folder for Ai-Writer-Chrome-Store.zip

---

## 10. Notes

- Replace `AdhamBanishamsah` and `Ai-Writer` in URLs if your GitHub username or repo name differ.
- You must host a real privacy policy (e.g. GitHub Pages or a PRIVACY_POLICY.md in the repo) before submitting.
- In-depth review for `<all_urls>` is normal; the justifications above explain why it is needed.
- Review often takes 1–3 business days.

Good luck with your submission.
