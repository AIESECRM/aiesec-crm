// AIESEC CRM Chrome Extension - Background Service Worker
// Content script injection ve mesaj yönlendirme

chrome.runtime.onInstalled.addListener(() => {
  console.log('AIESEC CRM Web Clipper yüklendi.');
});

// Content script'in inject edilip edilmediğini kontrol et, gerekirse inject et
async function ensureContentScript(tabId) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => !!document.getElementById('aiesec-clipper-widget') || !!window.__aiesecContentScriptLoaded,
    });

    if (!results || !results[0]?.result) {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js'],
      });
      await chrome.scripting.insertCSS({
        target: { tabId },
        files: ['content.css'],
      });
    }
  } catch (err) {
    console.warn('Content script inject edilemedi:', err.message);
  }
}

// Popup'tan gelen mesajları content script'e yönlendir
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ENSURE_CONTENT_SCRIPT') {
    ensureContentScript(message.tabId).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true;
  }
});
