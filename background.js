// Background service worker for Ai Writer

const MODES = {
  PROFESSIONAL: 'professional',
  FRIENDLY: 'friendly',
  SHORTEN: 'shorten',
  EXPAND: 'expand',
  GRAMMAR: 'grammar',
  TRANSLATE: 'translate'
};

// Create context menu items on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'rewrite-professional',
    title: 'Rewrite (Professional)',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'fix-grammar',
    title: 'Fix grammar & spelling',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'shorten',
    title: 'Shorten',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'expand',
    title: 'Expand',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'make-friendly',
    title: 'Make it friendly',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'translate',
    title: 'Translate',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!info.selectionText) {
    return;
  }

  let mode = MODES.PROFESSIONAL;
  switch (info.menuItemId) {
    case 'rewrite-professional':
      mode = MODES.PROFESSIONAL;
      break;
    case 'fix-grammar':
      mode = MODES.GRAMMAR;
      break;
    case 'shorten':
      mode = MODES.SHORTEN;
      break;
    case 'expand':
      mode = MODES.EXPAND;
      break;
    case 'make-friendly':
      mode = MODES.FRIENDLY;
      break;
    case 'translate':
      mode = MODES.TRANSLATE;
      break;
  }

  try {
    const result = await rewriteText(info.selectionText, mode);
    
    // Ensure content script is injected, then send result
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });
    } catch (injectError) {
      // Content script might already be injected, or page doesn't allow injection
      console.log('Content script injection note:', injectError.message);
    }

    // Send result to content script to show overlay
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showResult',
        originalText: info.selectionText,
        result: result,
        mode: mode
      });
    } catch (messageError) {
      // If message fails, try to inject and send again
      console.error('Message error, attempting injection:', messageError);
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        // Wait a bit for script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        await chrome.tabs.sendMessage(tab.id, {
          action: 'showResult',
          originalText: info.selectionText,
          result: result,
          mode: mode
        });
      } catch (retryError) {
        console.error('Could not inject content script:', retryError);
        // Fallback: copy to clipboard
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (text) => {
              navigator.clipboard.writeText(text).catch(() => {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
              });
            },
            args: [result]
          });
          // Show notification if available
          if (chrome.notifications) {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon48.png',
              title: 'Ai Writer',
              message: 'Result copied to clipboard!'
            });
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
      }
    }
  } catch (error) {
    console.error('Error rewriting text:', error);
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: 'showError',
        error: error.message || 'Failed to rewrite text'
      });
    } catch (messageError) {
      console.error('Could not send error message:', messageError);
      // Fallback notification if available
      if (chrome.notifications) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon48.png',
          title: 'Ai Writer Error',
          message: error.message || 'Failed to rewrite text'
        });
      }
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'rewrite') {
    rewriteText(request.text, request.mode)
      .then(result => sendResponse({ success: true, result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['provider', 'apiKey', 'apiKeyOpenAI', 'apiKeyGemini', 'apiEndpoint', 'model'], (items) => {
      const provider = items.provider || 'openai';
      const apiKey = provider === 'gemini'
        ? (items.apiKeyGemini !== undefined ? items.apiKeyGemini : (items.apiKey || ''))
        : (items.apiKeyOpenAI !== undefined ? items.apiKeyOpenAI : (items.apiKey || ''));
      sendResponse({
        provider: provider,
        apiKey: apiKey,
        apiEndpoint: items.apiEndpoint || (provider === 'gemini'
          ? 'https://generativelanguage.googleapis.com/v1beta'
          : 'https://api.openai.com/v1/chat/completions'),
        model: items.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini')
      });
    });
    return true;
  }
});

// Build prompt based on mode
const buildPrompt = (text, mode) => {
  const baseInstructions = {
    [MODES.PROFESSIONAL]: 'Rewrite the following text to be clearer and more professional while keeping the same meaning. IMPORTANT: Keep the text in the same language as the input - do not translate it. Preserve names, URLs, and product names. Return only the rewritten text without any explanations:',
    [MODES.GRAMMAR]: 'Fix grammar and spelling mistakes in the following text. Keep the meaning and language exactly the same - do not translate. Preserve names, URLs, and product names. Return only the corrected text without any explanations:',
    [MODES.FRIENDLY]: 'Rewrite the following text to be warmer and more casual while keeping the same meaning. IMPORTANT: Keep the text in the same language as the input - do not translate it. Preserve names, URLs, and product names. Return only the rewritten text without any explanations:',
    [MODES.SHORTEN]: 'Shorten the following text while preserving all key points. IMPORTANT: Keep the text in the same language as the input - do not translate it. Preserve names, URLs, and product names. Return only the shortened text without any explanations:',
    [MODES.EXPAND]: 'Expand the following text by adding clarity and detail without changing the meaning. IMPORTANT: Keep the text in the same language as the input - do not translate it. Preserve names, URLs, and product names. Return only the expanded text without any explanations:',
    [MODES.TRANSLATE]: 'Translate the following text to English. Preserve names, URLs, and product names. Return only the translated text without any explanations:'
  };

  return `${baseInstructions[mode]}\n\n${text}`;
};

// Rewrite text using AI API
const rewriteText = async (text, mode) => {
  // Limit text length
  const MAX_LENGTH = 10000;
  if (text.length > MAX_LENGTH) {
    throw new Error(`Text is too long. Maximum length is ${MAX_LENGTH} characters.`);
  }

  // Get settings (API key is stored per provider; fallback to legacy apiKey)
  const settings = await new Promise((resolve) => {
    chrome.storage.sync.get(['provider', 'apiKey', 'apiKeyOpenAI', 'apiKeyGemini', 'apiEndpoint', 'model'], (items) => {
      const provider = items.provider || 'openai';
      const apiKey = provider === 'gemini'
        ? (items.apiKeyGemini !== undefined ? items.apiKeyGemini : (items.apiKey || ''))
        : (items.apiKeyOpenAI !== undefined ? items.apiKeyOpenAI : (items.apiKey || ''));
      resolve({
        provider: provider,
        apiKey: apiKey,
        apiEndpoint: items.apiEndpoint || (provider === 'gemini'
          ? 'https://generativelanguage.googleapis.com/v1beta'
          : 'https://api.openai.com/v1/chat/completions'),
        model: items.model || (provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini')
      });
    });
  });

  if (!settings.apiKey) {
    throw new Error('API key not configured. Please set it in the extension options.');
  }

  const prompt = buildPrompt(text, mode);

  try {
    let response;
    let data;

    if (settings.provider === 'gemini') {
      // Gemini API format
      const systemInstruction = mode === MODES.TRANSLATE 
        ? ''
        : 'You must preserve the original language of the input text. Do not translate unless explicitly asked to translate. Keep the output in the same language as the input.';
      
      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\n${prompt}`
        : prompt;

      // Construct Gemini API URL correctly
      let baseUrl = settings.apiEndpoint.trim();
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
      const url = `${baseUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`;
      
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      data = await response.json();
      const result = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!result) {
        throw new Error('No result returned from Gemini API');
      }

      return result;
    } else {
      // OpenAI API format
      // Add system message for non-translate modes to preserve language
      const messages = mode === MODES.TRANSLATE 
        ? [{ role: 'user', content: prompt }]
        : [
            {
              role: 'system',
              content: 'You must preserve the original language of the input text. Do not translate unless explicitly asked to translate. Keep the output in the same language as the input.'
            },
            {
              role: 'user',
              content: prompt
            }
          ];

      response = await fetch(settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
          model: settings.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.statusText}`);
      }

      data = await response.json();
      const result = data.choices?.[0]?.message?.content?.trim();

      if (!result) {
        throw new Error('No result returned from API');
      }

      return result;
    }
  } catch (error) {
    if (error.message.includes('API key')) {
      throw error;
    }
    throw new Error(`Failed to connect to API: ${error.message}`);
  }
};
