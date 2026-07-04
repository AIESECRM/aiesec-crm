document.addEventListener('DOMContentLoaded', () => {
  const crmUrlInput = document.getElementById('crmUrlInput');
  const saveUrlBtn = document.getElementById('saveUrlBtn');
  const urlStatus = document.getElementById('urlStatus');
  const scanBtn = document.getElementById('scanBtn');
  const scanResult = document.getElementById('scanResult');
  const companyName = document.getElementById('companyName');
  const companyPhone = document.getElementById('companyPhone');
  const companyAddress = document.getElementById('companyAddress');
  const matchBadgeContainer = document.getElementById('matchBadgeContainer');
  const addToCrmBtn = document.getElementById('addToCrmBtn');

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

  let currentScrapedItem = null;
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
    scanResult.classList.add('hidden');
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

  // ─── Sayfayı Tara ───

  scanBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url?.includes('google.com/maps')) {
      alert('Lütfen Google Haritalar (maps.google.com) sekmesi açıkken bu butonu kullanın.');
      return;
    }

    scanBtn.textContent = '⏳ Tara ve Kontrol Et...';
    scanBtn.disabled = true;

    // Content script'in yüklü olduğundan emin ol
    try {
      await chrome.runtime.sendMessage({ action: 'ENSURE_CONTENT_SCRIPT', tabId: tab.id });
    } catch {
      // Background script olmayabilir, devam et
    }

    // Kısa bir bekleme (inject sonrası)
    await new Promise(resolve => setTimeout(resolve, 300));

    chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_MAPS' }, async (response) => {
      scanBtn.innerHTML = '<span>⚡ Aktif Harita Sayfasını Tara</span>';
      scanBtn.disabled = false;

      // chrome.runtime.lastError kontrolü
      if (chrome.runtime.lastError) {
        console.warn('Content script hatası:', chrome.runtime.lastError.message);
        alert('Google Haritalar sayfasıyla iletişim kurulamadı. Sayfayı yenileyip tekrar deneyin.');
        return;
      }

      if (!response || !response.name) {
        alert('Google Haritalar sayfasında açık bir işletme detay kartı algılanamadı. Lütfen sol panelde bir işletmeye tıklayıp detaylarını açın.');
        return;
      }

      currentScrapedItem = response;
      companyName.textContent = response.name;
      companyPhone.textContent = response.phone || 'Telefon bulunamadı';
      companyAddress.textContent = response.address || 'Adres bulunamadı';
      scanResult.classList.remove('hidden');

      // CRM Kontrolü
      const crmUrl = getCrmUrl();
      matchBadgeContainer.innerHTML = '<span style="color:#64748b; font-size:11px;">🔍 CRM verileriyle karşılaştırılıyor...</span>';
      addToCrmBtn.classList.add('hidden');

      try {
        const res = await fetch(`${crmUrl}/api/market-research?city=${encodeURIComponent(response.city || 'Genel')}&keyword=${encodeURIComponent(response.name)}`, {
          headers: authHeaders(),
        });
        const data = await res.json();

        if (res.status === 401) {
          matchBadgeContainer.innerHTML = '<span style="color:#e11d48; font-size:11px;">⚠️ Oturum süresi dolmuş. Lütfen tekrar giriş yapın.</span>';
          chrome.storage.local.remove(['authToken', 'authUser']);
          setTimeout(() => showLoggedOut(), 2000);
          return;
        }

        if (res.ok && data.items) {
          const match = data.items.find(i => i.name === response.name || (response.phone && i.phone && i.phone.includes(response.phone.replace(/\D/g, '').slice(-7))));
          
          if (match && match.matchStatus === 'SAME_CHAPTER') {
            matchBadgeContainer.innerHTML = `<span class="badge badge-same">🔴 Şubenizde Kayıtlı (${match.matchedCompany?.status || 'Kayıtlı'})</span>`;
          } else {
            matchBadgeContainer.innerHTML = `<span class="badge badge-clean">🟢 Sistemde Yok (Uygun)</span>`;
            addToCrmBtn.classList.remove('hidden');
          }
        } else {
          matchBadgeContainer.innerHTML = `<span class="badge badge-clean">🟢 Sistemde Yok (Hazır)</span>`;
          addToCrmBtn.classList.remove('hidden');
        }
      } catch (e) {
        matchBadgeContainer.innerHTML = `<span style="color:#e11d48; font-size:11px;">⚠️ CRM bağlantısı kurulamadı. İnternet bağlantınızı kontrol edin.</span>`;
      }
    });
  });

  // ─── CRM'e Ekle ───

  addToCrmBtn.addEventListener('click', async () => {
    if (!currentScrapedItem) return;
    addToCrmBtn.disabled = true;
    addToCrmBtn.textContent = '⏳ Ekleniyor...';

    const crmUrl = getCrmUrl();

    try {
      const res = await fetch(`${crmUrl}/api/companies`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: currentScrapedItem.name,
          phone: currentScrapedItem.phone,
          category: currentScrapedItem.category || 'Google Maps',
          chapter: '',
          status: 'NO_ANSWER',
          notes: `Google Maps Clipper üzerinden eklendi. Adres: ${currentScrapedItem.address || ''}`
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
        addToCrmBtn.classList.add('hidden');
        matchBadgeContainer.innerHTML = `<span class="badge badge-same">✔ Şubenize Başarıyla Eklendi!</span>`;
      } else {
        alert(data.error || 'Eklenirken hata oluştu.');
      }
    } catch (err) {
      alert('CRM sunucusuna bağlanılamadı. İnternet bağlantınızı kontrol edin.');
    } finally {
      addToCrmBtn.disabled = false;
      addToCrmBtn.textContent = '+ Şubeme Ekle & Başlat';
    }
  });
});
