// AIESEC CRM Chrome Extension - Background Service Worker
// Content script injection, mesaj yönlendirme ve login işlemi

chrome.runtime.onInstalled.addListener(() => {
  console.log('AIESEC CRM Web Clipper yüklendi.');
  // Badge'i temizle
  chrome.action.setBadgeText({ text: '' });
});

// Başlangıçta kayıtlı token varsa badge göster
chrome.storage.local.get(['authToken'], (res) => {
  if (res.authToken) {
    chrome.action.setBadgeText({ text: '✓' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  }
});

// Storage değişikliklerini dinle ve badge güncelle
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.authToken) {
    if (changes.authToken.newValue) {
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
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

// ─── Login İşlemi (Service Worker'da) ───
// Popup kapansa bile bu istek tamamlanır ve token storage'a kaydedilir
async function handleLogin(crmUrl, email, password) {
  console.log('[AIESEC CRM] Login isteği gönderiliyor:', crmUrl);
  try {
    const res = await fetch(`${crmUrl}/api/auth/extension-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('[AIESEC CRM] Login response status:', res.status);
    const data = await res.json();

    if (res.ok && data.token) {
      // Token'ı storage'a kaydet — popup kapanmış olsa bile bu çalışır
      await chrome.storage.local.set({
        authToken: data.token,
        authUser: data.user,
        crmUrl: crmUrl,
        loginStatus: 'success',
      });
      console.log('[AIESEC CRM] Login başarılı, token kaydedildi.');
      return { success: true, token: data.token, user: data.user };
    } else {
      const errorMsg = data.error || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      console.warn('[AIESEC CRM] Login başarısız:', errorMsg);
      await chrome.storage.local.set({
        loginStatus: 'error',
        loginError: errorMsg,
      });
      return { success: false, error: errorMsg };
    }
  } catch (err) {
    console.error('[AIESEC CRM] Login fetch hatası:', err.message, err);
    const errorMsg = `Sunucu bağlantı hatası: ${err.message || 'Bilinmeyen hata'}`;
    await chrome.storage.local.set({
      loginStatus: 'error',
      loginError: errorMsg,
    });
    return { success: false, error: errorMsg };
  }
}

// Popup'tan gelen mesajları yönet
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ENSURE_CONTENT_SCRIPT') {
    ensureContentScript(message.tabId).then(() => {
      sendResponse({ success: true });
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // async response
  }

  if (message.action === 'LOGIN') {
    handleLogin(message.crmUrl, message.email, message.password).then((result) => {
      sendResponse(result);
    }).catch(err => {
      sendResponse({ success: false, error: err.message });
    });
    return true; // async response
  }
});
