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

  let currentScrapedItem = null;

  // URL Yükle
  chrome.storage.local.get(['crmUrl'], (res) => {
    crmUrlInput.value = res.crmUrl || 'http://localhost:3000';
  });

  // URL Kaydet
  saveUrlBtn.addEventListener('click', () => {
    const url = crmUrlInput.value.trim().replace(/\/$/, '');
    chrome.storage.local.set({ crmUrl: url }, () => {
      urlStatus.textContent = '✔ Adres kaydedildi.';
      setTimeout(() => { urlStatus.textContent = ''; }, 2000);
    });
  });

  // Sayfayı Tara
  scanBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url?.includes('google.com/maps')) {
      alert('Lütfen Google Haritalar (maps.google.com) sekmesi açıkken bu butonu kullanın.');
      return;
    }

    scanBtn.textContent = '⏳ Tara ve Kontrol Et...';
    scanBtn.disabled = true;

    chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_MAPS' }, async (response) => {
      scanBtn.innerHTML = '<span>⚡ Aktif Harita Sayfasını Tara</span>';
      scanBtn.disabled = false;

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
      const crmUrl = (crmUrlInput.value.trim() || 'http://localhost:3000').replace(/\/$/, '');
      matchBadgeContainer.innerHTML = '<span style="color:#64748b; font-size:11px;">🔍 CRM verileriyle karşılaştırılıyor...</span>';
      addToCrmBtn.classList.add('hidden');

      try {
        const res = await fetch(`${crmUrl}/api/market-research?city=${encodeURIComponent(response.city || 'Genel')}&keyword=${encodeURIComponent(response.name)}`);
        const data = await res.json();

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
        matchBadgeContainer.innerHTML = `<span style="color:#e11d48; font-size:11px;">⚠️ CRM bağlantısı kurulamadı. Oturumunuzu kontrol edin.</span>`;
      }
    });
  });

  // CRM'e Ekle
  addToCrmBtn.addEventListener('click', async () => {
    if (!currentScrapedItem) return;
    addToCrmBtn.disabled = true;
    addToCrmBtn.textContent = '⏳ Ekleniyor...';

    const crmUrl = (crmUrlInput.value.trim() || 'http://localhost:3000').replace(/\/$/, '');

    try {
      const res = await fetch(`${crmUrl}/api/companies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentScrapedItem.name,
          phone: currentScrapedItem.phone,
          category: currentScrapedItem.category || 'Google Maps',
          chapter: '', // API session'dan alır
          status: 'NO_ANSWER',
          notes: `Google Maps Clipper üzerinden eklendi. Adres: ${currentScrapedItem.address || ''}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        addToCrmBtn.classList.add('hidden');
        matchBadgeContainer.innerHTML = `<span class="badge badge-same">✔ Şubenize Başarıyla Eklendi!</span>`;
      } else {
        alert(data.error || 'Eklenirken hata oluştu. CRM oturumunuzun açık olduğundan emin olun.');
      }
    } catch (err) {
      alert('CRM sunucusuna bağlanılamadı.');
    } finally {
      addToCrmBtn.disabled = false;
      addToCrmBtn.textContent = '+ Şubeme Ekle & Başlat';
    }
  });
});
