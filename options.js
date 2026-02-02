// Options page script for Ai Writer

// DOM elements
const providerSelect = document.getElementById('provider');
const apiKeyInput = document.getElementById('api-key');
const apiEndpointInput = document.getElementById('api-endpoint');
const endpointGroup = document.getElementById('endpoint-group');
const modelInput = document.getElementById('model');
const saveBtn = document.getElementById('save-btn');
const testBtn = document.getElementById('test-btn');
const statusMessage = document.getElementById('status-message');
const apiKeyHelp = document.getElementById('api-key-help');
const endpointHelp = document.getElementById('endpoint-help');
const modelHelp = document.getElementById('model-help');
const replaceKeyBtn = document.getElementById('replace-key-btn');
const apiGuideLink = document.getElementById('api-guide-link');
const apiKeyStatusEl = document.getElementById('api-key-status');
const clearApiKeyBtn = document.getElementById('clear-api-key-btn');

// When a key is stored we show placeholder + Replace; we never put the real key in the input
let hasStoredKey = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (apiGuideLink) {
    apiGuideLink.href = chrome.runtime.getURL('api-guide.html');
  }
  loadSettings();
  setupEventListeners();
});

// Storage keys per provider so OpenAI and Gemini are configured independently
const STORAGE_KEY_OPENAI = 'apiKeyOpenAI';
const STORAGE_KEY_GEMINI = 'apiKeyGemini';

// Get the storage key for the current provider
const getCurrentProviderKeyName = () => {
  return providerSelect.value === 'gemini' ? STORAGE_KEY_GEMINI : STORAGE_KEY_OPENAI;
};

// Load saved settings (API key is per provider; we never show the real key in the input)
const loadSettings = () => {
  chrome.storage.sync.get(
    ['provider', 'apiKey', 'apiKeyOpenAI', 'apiKeyGemini', 'apiEndpoint', 'model'],
    (items) => {
      // Migrate legacy single apiKey to per-provider keys (one-time)
      if (items.apiKey !== undefined && items.apiKey !== null && String(items.apiKey).trim()) {
        const currentProvider = items.provider || 'openai';
        const toSet = {
          [STORAGE_KEY_OPENAI]: items.apiKeyOpenAI !== undefined ? items.apiKeyOpenAI : (currentProvider === 'openai' ? items.apiKey : ''),
          [STORAGE_KEY_GEMINI]: items.apiKeyGemini !== undefined ? items.apiKeyGemini : (currentProvider === 'gemini' ? items.apiKey : '')
        };
        chrome.storage.sync.set(toSet);
        chrome.storage.sync.remove('apiKey');
        items.apiKeyOpenAI = toSet[STORAGE_KEY_OPENAI];
        items.apiKeyGemini = toSet[STORAGE_KEY_GEMINI];
      }

      const currentProvider = items.provider || 'openai';
      providerSelect.value = currentProvider;

      const currentKey = currentProvider === 'gemini' ? (items.apiKeyGemini || '') : (items.apiKeyOpenAI || '');
      const hasValidStoredKey = currentKey && String(currentKey).trim().length > 0;

      if (hasValidStoredKey) {
        hasStoredKey = true;
        apiKeyInput.value = '';
        apiKeyInput.placeholder = '••••••••••••••••••••••••••••••';
        if (replaceKeyBtn) replaceKeyBtn.style.display = 'block';
        if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'inline-block';
        updateAPIKeyStatus(true);
      } else {
        hasStoredKey = false;
        apiKeyInput.value = '';
        updateAPIKeyPlaceholder();
        if (replaceKeyBtn) replaceKeyBtn.style.display = 'none';
        if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'none';
        updateAPIKeyStatus(false);
      }

      if (currentProvider === 'gemini') {
        apiEndpointInput.value = items.apiEndpoint || 'https://generativelanguage.googleapis.com/v1beta';
        modelInput.value = items.model || 'gemini-2.5-flash';
      } else {
        apiEndpointInput.value = items.apiEndpoint || 'https://api.openai.com/v1/chat/completions';
        modelInput.value = items.model || 'gpt-4o-mini';
      }

      updateUIForProvider();
    }
  );
};

// When user switches provider, update key state for the newly selected provider (from storage)
const refreshCurrentProviderKeyState = () => {
  const keyName = getCurrentProviderKeyName();
  chrome.storage.sync.get([keyName], (items) => {
    const currentKey = items[keyName];
    const hasValidStoredKey = currentKey && String(currentKey).trim().length > 0;
    hasStoredKey = hasValidStoredKey;
    apiKeyInput.value = '';
    if (hasValidStoredKey) {
      apiKeyInput.placeholder = '••••••••••••••••••••••••••••••';
      if (replaceKeyBtn) replaceKeyBtn.style.display = 'block';
      if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'inline-block';
      updateAPIKeyStatus(true);
    } else {
      updateAPIKeyPlaceholder();
      if (replaceKeyBtn) replaceKeyBtn.style.display = 'none';
      if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'none';
      updateAPIKeyStatus(false);
    }
  });
};

// Update API key placeholder based on provider (when no stored key)
const updateAPIKeyPlaceholder = () => {
  if (hasStoredKey) return;
  const provider = providerSelect.value;
  apiKeyInput.placeholder = provider === 'gemini' ? 'Enter your Gemini API key' : 'Enter your API key (sk-...)';
};

// Show "Not configured" or "Configured" next to API Key label
const updateAPIKeyStatus = (configured) => {
  if (!apiKeyStatusEl) return;
  apiKeyStatusEl.textContent = configured ? 'Configured' : 'Not configured';
  apiKeyStatusEl.className = 'api-key-status ' + (configured ? 'api-key-status--configured' : 'api-key-status--not-configured');
};

// Setup event listeners
const setupEventListeners = () => {
  providerSelect.addEventListener('change', () => {
    updateUIForProvider();
    refreshCurrentProviderKeyState();
  });

  if (replaceKeyBtn) {
    replaceKeyBtn.addEventListener('click', handleReplaceKey);
    replaceKeyBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleReplaceKey();
      }
    });
  }
  if (clearApiKeyBtn) {
    clearApiKeyBtn.addEventListener('click', handleReplaceKey);
    clearApiKeyBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleReplaceKey();
      }
    });
  }

  saveBtn.addEventListener('click', handleSave);
  saveBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSave();
    }
  });

  testBtn.addEventListener('click', handleTest);
  testBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTest();
    }
  });
};

// Replace API key: clear only the current provider's key and show empty input
const handleReplaceKey = () => {
  const keyName = getCurrentProviderKeyName();
  hasStoredKey = false;
  apiKeyInput.value = '';
  updateAPIKeyPlaceholder();
  if (replaceKeyBtn) replaceKeyBtn.style.display = 'none';
  if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'none';
  updateAPIKeyStatus(false);
  apiKeyInput.focus();
  chrome.storage.sync.remove(keyName);
};

// Update UI based on selected provider
const updateUIForProvider = () => {
  const provider = providerSelect.value;
  
  if (provider === 'gemini') {
    // Gemini settings
    if (!hasStoredKey) {
      apiKeyInput.placeholder = 'Enter your Gemini API key';
    }
    apiKeyHelp.innerHTML = 'Your Google Gemini API key. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">aistudio.google.com</a>';
    
    if (!apiEndpointInput.value || apiEndpointInput.value.includes('openai.com')) {
      apiEndpointInput.value = 'https://generativelanguage.googleapis.com/v1beta';
    }
    endpointHelp.textContent = 'Gemini API base endpoint. Leave as default for standard Gemini API.';
    
    if (!modelInput.value || modelInput.value.startsWith('gpt-')) {
      modelInput.value = 'gemini-2.5-flash';
    }
    modelHelp.textContent = 'Gemini model (e.g., gemini-2.5-flash, gemini-2.5-pro, gemini-1.5-pro, gemini-1.5-flash)';
    
    // Hide endpoint field for Gemini (it's auto-constructed)
    endpointGroup.style.display = 'none';
  } else {
    // OpenAI settings
    if (!hasStoredKey) {
      apiKeyInput.placeholder = 'Enter your API key (sk-...)';
    }
    apiKeyHelp.innerHTML = 'Your OpenAI API key. Get one at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a>';
    
    if (!apiEndpointInput.value || apiEndpointInput.value.includes('generativelanguage')) {
      apiEndpointInput.value = 'https://api.openai.com/v1/chat/completions';
    }
    endpointHelp.textContent = 'OpenAI API endpoint. Leave as default for standard OpenAI.';
    
    if (!modelInput.value || modelInput.value.startsWith('gemini-')) {
      modelInput.value = 'gpt-4o-mini';
    }
    modelHelp.textContent = 'OpenAI model (e.g., gpt-4o-mini, gpt-4, gpt-3.5-turbo)';
    
    // Show endpoint field for OpenAI
    endpointGroup.style.display = 'block';
  }
};

// Get the effective API key for the current provider (typed value or stored)
const getEffectiveApiKey = (callback) => {
  const typed = apiKeyInput.value.trim();
  if (typed) {
    callback(typed);
    return;
  }
  const keyName = getCurrentProviderKeyName();
  chrome.storage.sync.get([keyName], (items) => {
    const key = items[keyName];
    callback(key && String(key).trim() ? String(key).trim() : '');
  });
};

// Handle save button click
const handleSave = () => {
  const provider = providerSelect.value;
  const apiEndpoint = apiEndpointInput.value.trim();
  const model = modelInput.value.trim();

  getEffectiveApiKey((apiKey) => {
    if (!apiKey) {
      showStatus('Please enter an API key', 'error');
      return;
    }

    if (provider === 'openai' && !apiEndpoint) {
      showStatus('Please enter an API endpoint', 'error');
      return;
    }

    if (!model) {
      showStatus('Please enter a model name', 'error');
      return;
    }

    const keyName = getCurrentProviderKeyName();
    chrome.storage.sync.get([STORAGE_KEY_OPENAI, STORAGE_KEY_GEMINI], (items) => {
      const toSet = {
        provider: provider,
        apiEndpoint: apiEndpoint,
        model: model,
        [STORAGE_KEY_OPENAI]: provider === 'openai' ? apiKey : (items.apiKeyOpenAI || ''),
        [STORAGE_KEY_GEMINI]: provider === 'gemini' ? apiKey : (items.apiKeyGemini || '')
      };
      chrome.storage.sync.set(toSet, () => {
        if (chrome.runtime.lastError) {
          showStatus('Failed to save settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
          hasStoredKey = true;
          apiKeyInput.value = '';
          apiKeyInput.placeholder = '••••••••••••••••••••••••••••••';
          if (replaceKeyBtn) replaceKeyBtn.style.display = 'block';
          if (clearApiKeyBtn) clearApiKeyBtn.style.display = 'inline-block';
          updateAPIKeyStatus(true);
          showStatus('Settings saved successfully!', 'success');
        }
      });
    });
  });
};

// Handle test button click
const handleTest = async () => {
  const provider = providerSelect.value;
  const apiEndpoint = apiEndpointInput.value.trim();
  const model = modelInput.value.trim();

  getEffectiveApiKey(async (apiKey) => {
    if (!apiKey) {
      showStatus('Please enter an API key first', 'error');
      return;
    }

    if (provider === 'openai' && !apiEndpoint) {
      showStatus('Please enter an API endpoint first', 'error');
      return;
    }

    if (!model) {
      showStatus('Please enter a model name first', 'error');
      return;
    }

    showStatus('Testing connection...', 'info');
    testBtn.disabled = true;

    try {
    let response;
    
    if (provider === 'gemini') {
      // Gemini API format
      let baseUrl = apiEndpoint.trim();
      // Remove trailing slash
      if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
      }
      // Remove /models if present
      if (baseUrl.endsWith('/models')) {
        baseUrl = baseUrl.replace('/models', '');
      }
      // Ensure we have /v1beta
      if (!baseUrl.endsWith('/v1beta') && !baseUrl.endsWith('/v1')) {
        baseUrl = baseUrl + (baseUrl.endsWith('/') ? 'v1beta' : '/v1beta');
      }
      const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        })
      });
    } else {
      // OpenAI API format
      response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: 'user',
            content: 'Hello'
          }],
          max_tokens: 10
        })
      });
    }

    if (response.ok) {
      const data = await response.json();
      if (provider === 'gemini') {
        if (data.candidates && data.candidates.length > 0) {
          showStatus('Connection successful! Gemini API is working correctly.', 'success');
        } else {
          showStatus('Connection successful but received unexpected response format.', 'info');
        }
      } else {
        if (data.choices && data.choices.length > 0) {
          showStatus('Connection successful! OpenAI API is working correctly.', 'success');
        } else {
          showStatus('Connection successful but received unexpected response format.', 'info');
        }
      }
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.error?.message || errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      showStatus(`Connection failed: ${errorMsg}`, 'error');
    }
    } catch (error) {
      showStatus(`Connection failed: ${error.message}`, 'error');
    } finally {
      testBtn.disabled = false;
    }
  });
};

// Show status message
const showStatus = (message, type) => {
  statusMessage.textContent = message;
  statusMessage.className = `status-message ${type}`;
  statusMessage.style.display = 'block';

  // Auto-hide success messages after 3 seconds
  if (type === 'success') {
    setTimeout(() => {
      statusMessage.style.display = 'none';
    }, 3000);
  }
};
