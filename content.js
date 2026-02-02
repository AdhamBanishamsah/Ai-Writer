// Content script for Ai Writer
// Prevent multiple initializations
(function() {
  'use strict';
  
  // Check if already initialized
  if (window.__aiwriter_initialized) {
    return;
  }
  window.__aiwriter_initialized = true;

  let overlay = null;
  let selectedText = '';
  let isEditable = false;
  let editableElement = null;

  // Listen for messages from background script and popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showResult') {
    showResultOverlay(request.originalText, request.result, request.mode);
    sendResponse({ success: true });
  } else if (request.action === 'showError') {
    showErrorOverlay(request.error);
    sendResponse({ success: true });
  } else if (request.action === 'getSelection') {
    const selection = getSelectedText();
    sendResponse({ 
      text: selection.text,
      isEditable: selection.isEditable,
      element: null // Can't send DOM elements
    });
  } else if (request.action === 'replaceText') {
    const editableEl = findEditableElement();
    if (editableEl) {
      replaceSelectedText(request.text);
      sendResponse({ success: true });
    } else {
      sendResponse({ success: false, error: 'No editable element found' });
    }
  }
  return true;
});

// Get selected text and check if it's in an editable element
const getSelectedText = () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (!text) {
    return { text: '', isEditable: false };
  }

  const range = selection.getRangeAt(0);
  let element = range.commonAncestorContainer;
  
  // Navigate to the actual element
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement;
  }

  // Check if selection is in editable element
  const isInEditable = isElementEditable(element);
  
  return {
    text,
    isEditable: isInEditable,
    element: isInEditable ? element : null
  };
};

// Check if element or its parent is editable
const isElementEditable = (element) => {
  if (!element) return false;

  // Check current element
  if (element.tagName === 'TEXTAREA' || 
      (element.tagName === 'INPUT' && element.type === 'text')) {
    return true;
  }

  if (element.isContentEditable) {
    return true;
  }

  // Check parent elements
  let current = element.parentElement;
  let depth = 0;
  while (current && depth < 5) {
    if (current.tagName === 'TEXTAREA' || 
        (current.tagName === 'INPUT' && current.type === 'text')) {
      return true;
    }
    if (current.isContentEditable) {
      return true;
    }
    current = current.parentElement;
    depth++;
  }

  return false;
};

// Find the editable element containing the selection
const findEditableElement = () => {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  let element = range.commonAncestorContainer;
  
  if (element.nodeType === Node.TEXT_NODE) {
    element = element.parentElement;
  }

  // Check current element
  if (element.tagName === 'TEXTAREA' || 
      (element.tagName === 'INPUT' && element.type === 'text')) {
    return element;
  }

  if (element.isContentEditable) {
    return element;
  }

  // Check parent elements
  let current = element.parentElement;
  let depth = 0;
  while (current && depth < 5) {
    if (current.tagName === 'TEXTAREA' || 
        (current.tagName === 'INPUT' && current.type === 'text')) {
      return current;
    }
    if (current.isContentEditable) {
      return current;
    }
    current = current.parentElement;
    depth++;
  }

  return null;
};

// Show result overlay
const showResultOverlay = (originalText, result, mode) => {
  selectedText = originalText;
  editableElement = findEditableElement();
  isEditable = editableElement !== null;

  // Remove existing overlay
  if (overlay) {
    overlay.remove();
  }

  // Create overlay
  overlay = document.createElement('div');
  overlay.id = 'aiwriter-overlay';
  overlay.innerHTML = `
    <div class="aiwriter-modal">
      <div class="aiwriter-header">
        <h3>AI Result</h3>
        <button class="aiwriter-close" aria-label="Close">×</button>
      </div>
      <div class="aiwriter-content">
        <textarea class="aiwriter-output" readonly>${escapeHtml(result)}</textarea>
        <div class="aiwriter-actions">
          <button class="aiwriter-btn aiwriter-btn-copy" id="aiwriter-copy">Copy</button>
          <button class="aiwriter-btn aiwriter-btn-replace" id="aiwriter-replace" ${isEditable ? '' : 'disabled title="Replace is only available when the selected text is in an editable field (e.g. text box)."'} aria-label="${isEditable ? 'Replace selected text' : 'Replace (only available in editable fields)'}">Replace</button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  if (!document.getElementById('aiwriter-styles')) {
    const style = document.createElement('style');
    style.id = 'aiwriter-styles';
    style.textContent = `
      #aiwriter-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      .aiwriter-modal {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        width: 90%;
        max-width: 600px;
        max-height: 85vh;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .aiwriter-header {
        flex-shrink: 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
      }
      .aiwriter-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;
      }
      .aiwriter-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }
      .aiwriter-close:hover {
        background: #f0f0f0;
        color: #333;
      }
      .aiwriter-content {
        flex: 1;
        min-height: 0;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        overflow: hidden;
      }
      .aiwriter-output {
        flex: 1;
        min-height: 120px;
        width: 100%;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        font-family: inherit;
        line-height: 1.5;
        resize: none;
        overflow-y: auto;
        box-sizing: border-box;
      }
      .aiwriter-output:focus {
        outline: 2px solid #4a90e2;
        outline-offset: -1px;
      }
      .aiwriter-actions {
        flex-shrink: 0;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
      }
      .aiwriter-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .aiwriter-btn-copy {
        background: #4a90e2;
        color: white;
      }
      .aiwriter-btn-copy:hover {
        background: #357abd;
      }
      .aiwriter-btn-replace {
        background: #28a745;
        color: white;
      }
      .aiwriter-btn-replace:hover {
        background: #218838;
      }
      .aiwriter-btn-replace:disabled {
        background: #9e9e9e;
        color: #e0e0e0;
        cursor: not-allowed;
      }
      .aiwriter-loading {
        text-align: center;
        padding: 40px;
        color: #666;
      }
      .aiwriter-spinner {
        border: 3px solid #f3f3f3;
        border-top: 3px solid #4a90e2;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(overlay);

  // Event listeners
  const closeBtn = overlay.querySelector('.aiwriter-close');
  const copyBtn = overlay.querySelector('#aiwriter-copy');
  const replaceBtn = overlay.querySelector('#aiwriter-replace');

  const handleClose = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  closeBtn.addEventListener('click', handleClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleClose();
    }
  });

  copyBtn.addEventListener('click', () => {
    const output = overlay.querySelector('.aiwriter-output');
    output.select();
    document.execCommand('copy');
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
      copyBtn.textContent = 'Copy';
    }, 2000);
  });

  replaceBtn.addEventListener('click', () => {
    if (!isEditable) return;
    replaceSelectedText(result);
    handleClose();
  });

  // Close on Escape key
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);
};

// Show error overlay
const showErrorOverlay = (errorMessage) => {
  if (overlay) {
    overlay.remove();
  }

  overlay = document.createElement('div');
  overlay.id = 'aiwriter-overlay';
  overlay.innerHTML = `
    <div class="aiwriter-modal">
      <div class="aiwriter-header">
        <h3>Error</h3>
        <button class="aiwriter-close" aria-label="Close">×</button>
      </div>
      <div class="aiwriter-content">
        <p style="color: #d32f2f; margin: 0;">${escapeHtml(errorMessage)}</p>
        <div class="aiwriter-actions">
          <button class="aiwriter-btn aiwriter-btn-copy" id="aiwriter-close-error">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeBtn = overlay.querySelector('.aiwriter-close');
  const closeErrorBtn = overlay.querySelector('#aiwriter-close-error');

  const handleClose = () => {
    if (overlay) {
      overlay.remove();
      overlay = null;
    }
  };

  closeBtn.addEventListener('click', handleClose);
  closeErrorBtn.addEventListener('click', handleClose);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      handleClose();
    }
  });
};

// Replace selected text in editable element
const replaceSelectedText = (newText) => {
  if (!editableElement) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  try {
    if (editableElement.tagName === 'TEXTAREA' || editableElement.tagName === 'INPUT') {
      const start = editableElement.selectionStart;
      const end = editableElement.selectionEnd;
      const text = editableElement.value;
      editableElement.value = text.substring(0, start) + newText + text.substring(end);
      editableElement.selectionStart = editableElement.selectionEnd = start + newText.length;
      editableElement.focus();
      
      // Trigger input event
      editableElement.dispatchEvent(new Event('input', { bubbles: true }));
    } else if (editableElement.isContentEditable) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(newText);
      range.insertNode(textNode);
      
      // Move cursor after inserted text
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger input event
      editableElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  } catch (error) {
    console.error('Error replacing text:', error);
    // Fallback: just copy to clipboard
    navigator.clipboard.writeText(newText).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = newText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  }
};

  // Escape HTML to prevent XSS
  const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

})(); // End of IIFE - prevents variable redeclaration
