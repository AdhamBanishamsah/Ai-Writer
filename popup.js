// Popup script for Ai Writer

const MAX_TEXT_LENGTH = 10000;

// DOM elements
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const modeSelect = document.getElementById('mode-select');
const rewriteBtn = document.getElementById('rewrite-btn');
const rewriteText = document.getElementById('rewrite-text');
const rewriteSpinner = document.getElementById('rewrite-spinner');
const outputSection = document.getElementById('output-section');
const copyBtn = document.getElementById('copy-btn');
const replaceBtn = document.getElementById('replace-btn');
const swapBtn = document.getElementById('swap-btn');
const charCount = document.getElementById('char-count');
const errorMessage = document.getElementById('error-message');
const settingsBtn = document.getElementById('settings-btn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSelectedText();
  setupEventListeners();
  updateCharCount();
});

// Load selected text from page
const loadSelectedText = async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we can access the tab
    if (!tab || !tab.id) {
      return;
    }

    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (injectError) {
      // Content script might already be injected, or page doesn't allow injection
      console.log('Content script injection note:', injectError.message);
    }

    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
      
      if (response && response.text) {
        inputText.value = response.text;
        updateCharCount();
        
        // Show replace button if text is editable
        if (response.isEditable) {
          replaceBtn.style.display = 'inline-block';
        } else {
          replaceBtn.style.display = 'none';
        }
      }
    } catch (messageError) {
      // Content script not ready or page doesn't support messaging
      console.log('Content script not ready or page not supported:', messageError.message);
      // User can still paste text manually
    }
  } catch (error) {
    // No selection or content script not ready
    console.log('Error loading selection:', error.message);
  }
};

// Setup event listeners
const setupEventListeners = () => {
  inputText.addEventListener('input', updateCharCount);
  
  rewriteBtn.addEventListener('click', handleRewrite);
  rewriteBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRewrite();
    }
  });

  copyBtn.addEventListener('click', handleCopy);
  copyBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCopy();
    }
  });

  replaceBtn.addEventListener('click', handleReplace);
  replaceBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleReplace();
    }
  });

  swapBtn.addEventListener('click', handleSwap);
  swapBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSwap();
    }
  });

  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  settingsBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      chrome.runtime.openOptionsPage();
    }
  });
};

// Update character count
const updateCharCount = () => {
  const count = inputText.value.length;
  charCount.textContent = `${count} characters`;
  
  if (count > MAX_TEXT_LENGTH) {
    charCount.style.color = '#c33';
    charCount.textContent += ` (max ${MAX_TEXT_LENGTH})`;
  } else {
    charCount.style.color = '#666';
  }
};

// Handle rewrite button click
const handleRewrite = async () => {
  const text = inputText.value.trim();
  
  if (!text) {
    showError('Please enter or select text to rewrite.');
    return;
  }

  if (text.length > MAX_TEXT_LENGTH) {
    showError(`Text is too long. Maximum length is ${MAX_TEXT_LENGTH} characters.`);
    return;
  }

  hideError();
  setLoading(true);

  try {
    const mode = modeSelect.value;
    const response = await chrome.runtime.sendMessage({
      action: 'rewrite',
      text: text,
      mode: mode
    });

    if (response.success) {
      outputText.value = response.result;
      outputSection.style.display = 'flex';
    } else {
      showError(response.error || 'Failed to rewrite text');
    }
  } catch (error) {
    showError(error.message || 'Failed to connect to extension');
  } finally {
    setLoading(false);
  }
};

// Handle copy button click
const handleCopy = () => {
  const text = outputText.value;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  }).catch(() => {
    // Fallback for older browsers
    outputText.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });
};

// Handle replace button click
const handleReplace = async () => {
  const text = outputText.value;
  if (!text) return;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab || !tab.id) {
      showError('Could not access the current tab.');
      return;
    }

    // Try to inject content script if needed
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
      // Wait a bit for script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (injectError) {
      // Content script might already be injected
      console.log('Content script injection note:', injectError.message);
    }

    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'replaceText',
        text: text
      });
      
      // Close popup after replacement
      window.close();
    } catch (messageError) {
      // If message fails, try injecting and sending again
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        await chrome.tabs.sendMessage(tab.id, {
          action: 'replaceText',
          text: text
        });
        window.close();
      } catch (retryError) {
        showError('Failed to replace text. The page may not support text replacement. Please try copying instead.');
      }
    }
  } catch (error) {
    showError('Failed to replace text. Please try copying instead.');
  }
};

// Handle swap button click
const handleSwap = () => {
  const input = inputText.value;
  const output = outputText.value;
  
  inputText.value = output;
  outputText.value = input;
  updateCharCount();
};

// Set loading state
const setLoading = (loading) => {
  rewriteBtn.disabled = loading;
  if (loading) {
    rewriteText.classList.add('hidden');
    rewriteSpinner.classList.remove('hidden');
  } else {
    rewriteText.classList.remove('hidden');
    rewriteSpinner.classList.add('hidden');
  }
};

// Show error message
const showError = (message) => {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
};

// Hide error message
const hideError = () => {
  errorMessage.style.display = 'none';
};
