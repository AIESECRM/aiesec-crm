document.addEventListener('DOMContentLoaded', () => {
  const crmUrlInput = document.getElementById('crmUrlInput');
  const saveUrlBtn = document.getElementById('saveUrlBtn');
  const urlStatus = document.getElementById('urlStatus');
  const scanBtn = document.getElementById('scanBtn');
  const scanStats = document.getElementById('scanStats');
  const scanResultList = document.getElementById('scanResultList');

  // Login elementleri
  const loginPanel = document.getElementById('loginPanel');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginBtn = document.getElementById('loginBtn');
  const loginError = document.getElementById('loginError');
  const userBar = document.getElementById('userBar');
  const userName = document.getElementById('userName');
  const logoutBtn = document.getElementById('logoutBtn');
  const scanPanel = document.getElementById('scanPanel');

  let scrapedItems = [];
  let authToken = null;

  // ─── Yardımcı Fonksiyonlar ───

  function getCrmUrl() {
    return (crmUrlInput.value.trim() || 'https://www.aiesecrm.com').replace(/\/$/, '');
  }

  function authHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  }

  function showLoggedIn(user) {
    loginPanel.classList.add('hidden');
    userBar.classList.remove('hidden');
    scanPanel.classList.remove('hidden');
    userName.textContent = user.name || user.email || 'Kullanıcı';
  }

  function showLoggedOut() {
    loginPanel.classList.remove('hidden');
    userBar.classList.add('hidden');
    scanPanel.classList.add('hidden');
    scanResultList.classList.add('hidden');
    scanStats.classList.add('hidden');
    authToken = null;
    loginError.textContent = '';
  }

  // ─── Başlangıçta Kayıtlı Token Kontrolü ───

  chrome.storage.local.get(['crmUrl', 'authToken', 'authUser', 'loginStatus', 'loginError'], (res) => {
    // Eski www'suz URL'yi otomatik düzelt
    let savedUrl = res.crmUrl || 'https://www.aiesecrm.com';
    if (savedUrl === 'https://aiesecrm.com') {
      savedUrl = 'https://www.aiesecrm.com';
      chrome.storage.local.set({ crmUrl: savedUrl });
    }
    crmUrlInput.value = savedUrl;

    if (res.authToken && res.authUser) {
      authToken = res.authToken;
      showLoggedIn(res.authUser);

      // Eğer popup kapandıktan sonra login başarılı olduysa kullanıcıya bildir
      if (res.loginStatus === 'success') {
        chrome.storage.local.remove(['loginStatus', 'loginError']);
      }
    } else {
      showLoggedOut();

      // Eğer login hatası varsa göster (popup kapanmış iken oluşan hata)
      if (res.loginStatus === 'error' && res.loginError) {
        loginError.textContent = res.loginError;
        chrome.storage.local.remove(['loginStatus', 'loginError']);
      }
    }
  });

  // ─── Giriş ───

  loginBtn.addEventListener('click', async () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    loginError.textContent = '';

    if (!email || !password) {
      loginError.textContent = 'Email ve şifre gereklidir.';
      return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = '⏳ Giriş yapılıyor...';

    const crmUrl = getCrmUrl();

    try {
      // Login isteğini background service worker üzerinden gönder
      // Böylece popup kapansa bile istek tamamlanır ve token kaydedilir
      const result = await chrome.runtime.sendMessage({
        action: 'LOGIN',
        crmUrl,
        email,
        password,
      });

      if (result && result.success) {
        authToken = result.token;
        // Başarılı giriş görsel geri bildirimi
        loginBtn.textContent = '✅ Giriş Başarılı!';
        loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        // Kısa bir gecikme ile UI'ı güncelle — kullanıcı başarıyı görsün
        await new Promise(resolve => setTimeout(resolve, 600));
        loginBtn.style.background = '';
        showLoggedIn(result.user);
      } else {
        loginError.textContent = (result && result.error) || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
      }
    } catch (err) {
      // Service worker ile iletişim kurulamadıysa doğrudan dene
      try {
        const res = await fetch(`${crmUrl}/api/auth/extension-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok && data.token) {
          authToken = data.token;
          chrome.storage.local.set({
            authToken: data.token,
            authUser: data.user,
            crmUrl: crmUrl,
          });
          loginBtn.textContent = '✅ Giriş Başarılı!';
          loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          await new Promise(resolve => setTimeout(resolve, 600));
          loginBtn.style.background = '';
          showLoggedIn(data.user);
        } else {
          loginError.textContent = data.error || 'Giriş başarısız. Bilgilerinizi kontrol edin.';
        }
      } catch (innerErr) {
        loginError.textContent = 'CRM sunucusuna bağlanılamadı. İnternet bağlantınızı ve CRM adresini kontrol edin.';
      }
    } finally {
      loginBtn.disabled = false;
      if (loginBtn.textContent !== '✅ Giriş Başarılı!') {
        loginBtn.textContent = 'Giriş Yap';
      }
    }
  });

  // Enter ile giriş
  loginPassword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginBtn.click();
  });
  loginEmail.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') loginPassword.focus();
  });

  // ─── Çıkış ───

  logoutBtn.addEventListener('click', () => {
    chrome.storage.local.remove(['authToken', 'authUser'], () => {
      showLoggedOut();
    });
  });

  // ─── URL Kaydet ───

  saveUrlBtn.addEventListener('click', () => {
    const url = crmUrlInput.value.trim().replace(/\/$/, '');
    chrome.storage.local.set({ crmUrl: url }, () => {
      urlStatus.textContent = '✔ Adres kaydedildi.';
      setTimeout(() => { urlStatus.textContent = ''; }, 2000);
    });
  });

  // ─── Sayfayı Tara (Toplu Liste) ───

  scanBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url?.includes('google.com/maps')) {
      alert('Lütfen Google Haritalar (maps.google.com) sekmesi açıkken bu butonu kullanın.');
      return;
    }

    scanBtn.textContent = '⏳ Taranıyor...';
    scanBtn.disabled = true;
    scanResultList.innerHTML = '';
    scanResultList.classList.add('hidden');
    scanStats.classList.add('hidden');

    // Content script'in yüklü olduğundan emin ol
    try {
      await chrome.runtime.sendMessage({ action: 'ENSURE_CONTENT_SCRIPT', tabId: tab.id });
    } catch {
      // Background script olmayabilir, devam et
    }

    await new Promise(resolve => setTimeout(resolve, 300));

    chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_MAPS_LIST' }, async (response) => {
      scanBtn.innerHTML = '<span>⚡ Tüm Sonuçları Tara</span>';
      scanBtn.disabled = false;

      if (chrome.runtime.lastError) {
        console.warn('Content script hatası:', chrome.runtime.lastError.message);
        alert('Google Haritalar sayfasıyla iletişim kurulamadı. Sayfayı yenileyip tekrar deneyin.');
        return;
      }

      if (!response || !Array.isArray(response) || response.length === 0) {
        alert('Sol panelde işletme listesi bulunamadı. Google Haritalar\'da bir arama yapıp sonuçların yüklenmesini bekleyin.');
        return;
      }

      scrapedItems = response;
      scanStats.textContent = `📊 ${response.length} işletme bulundu`;
      scanStats.classList.remove('hidden');
      scanResultList.classList.remove('hidden');

      // Her işletme için kart oluştur
      const crmUrl = getCrmUrl();

      for (let i = 0; i < response.length; i++) {
        const item = response[i];
        const card = document.createElement('div');
        card.className = 'result-item';
        card.innerHTML = `
          <div class="res-name">${escapeHtml(item.name)}</div>
          <div class="res-detail">📞 ${escapeHtml(item.phone || 'Telefon yok')}</div>
          <div class="res-detail">📍 ${escapeHtml(item.address || 'Adres yok')}</div>
          ${item.category ? `<div class="res-detail">🏷️ ${escapeHtml(item.category)}</div>` : ''}
          <div class="result-item-footer">
            <span class="badge-container" id="badge-${i}">
              <span style="color:#64748b; font-size:10px;">🔍 Kontrol ediliyor...</span>
            </span>
            <button class="btn-add-item hidden" id="addBtn-${i}" data-index="${i}">+ Ekle</button>
          </div>
        `;
        scanResultList.appendChild(card);

        // Her kart için CRM kontrolünü arka planda başlat
        checkCrmMatch(crmUrl, item, i);
      }
    });
  });

  // ─── CRM Eşleşme Kontrolü ───

  async function checkCrmMatch(crmUrl, item, index) {
    const badgeEl = document.getElementById(`badge-${index}`);
    const addBtn = document.getElementById(`addBtn-${index}`);
    if (!badgeEl) return;

    try {
      const res = await fetch(`${crmUrl}/api/market-research?city=${encodeURIComponent(item.city || 'Genel')}&keyword=${encodeURIComponent(item.name)}`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        badgeEl.innerHTML = '<span style="color:#e11d48; font-size:10px;">⚠️ Oturum dolmuş</span>';
        return;
      }

      const data = await res.json();

      if (res.ok && data.items) {
        const match = data.items.find(i => i.name === item.name || (item.phone && i.phone && i.phone.includes(item.phone.replace(/\D/g, '').slice(-7))));

        if (match && match.matchStatus === 'SAME_CHAPTER') {
          badgeEl.innerHTML = `<span class="badge badge-same">🔴 Kayıtlı</span>`;
        } else {
          badgeEl.innerHTML = `<span class="badge badge-clean">🟢 Uygun</span>`;
          if (addBtn) addBtn.classList.remove('hidden');
        }
      } else {
        badgeEl.innerHTML = `<span class="badge badge-clean">🟢 Uygun</span>`;
        if (addBtn) addBtn.classList.remove('hidden');
      }
    } catch (e) {
      badgeEl.innerHTML = '<span style="color:#e11d48; font-size:10px;">⚠️ Kontrol edilemedi</span>';
      if (addBtn) addBtn.classList.remove('hidden');
    }
  }

  // ─── CRM'e Ekle (Toplu Liste) ───

  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('.btn-add-item');
    if (!btn) return;

    const index = parseInt(btn.dataset.index);
    const item = scrapedItems[index];
    if (!item) return;

    btn.disabled = true;
    btn.textContent = '⏳...';

    const crmUrl = getCrmUrl();

    try {
      const res = await fetch(`${crmUrl}/api/companies`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: item.name,
          phone: item.phone,
          category: item.category || 'Google Maps',
          chapter: '',
          status: 'NO_ANSWER',
          notes: `Google Maps Clipper üzerinden eklendi. Adres: ${item.address || ''}`
        })
      });

      if (res.status === 401) {
        alert('Oturum süresi dolmuş. Lütfen tekrar giriş yapın.');
        chrome.storage.local.remove(['authToken', 'authUser']);
        showLoggedOut();
        return;
      }

      const data = await res.json();
      if (res.ok) {
        btn.textContent = '✔ Eklendi';
        btn.classList.add('added');
        btn.disabled = true;
        const badgeEl = document.getElementById(`badge-${index}`);
        if (badgeEl) badgeEl.innerHTML = '<span class="badge badge-same">✔ Eklendi</span>';
      } else {
        alert(data.error || 'Eklenirken hata oluştu.');
        btn.textContent = '+ Ekle';
        btn.disabled = false;
      }
    } catch (err) {
      alert('CRM sunucusuna bağlanılamadı.');
      btn.textContent = '+ Ekle';
      btn.disabled = false;
    }
  });

  // ─── Yardımcı: HTML Escape ───
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
});
