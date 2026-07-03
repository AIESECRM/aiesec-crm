// Google Haritalar DOM tarama ve buton ekleyici scripti

function scrapeMapsPlace() {
  const h1 = document.querySelector('h1.DUwDvf') || document.querySelector('h1');
  const name = h1 ? h1.innerText.trim() : '';

  let phone = '';
  let address = '';
  let category = '';

  // Telefon & Adres bulma
  const buttons = document.querySelectorAll('button[data-item-id], button[aria-label]');
  buttons.forEach(btn => {
    const label = btn.getAttribute('aria-label') || btn.innerText || '';
    const itemId = btn.getAttribute('data-item-id') || '';

    if (itemId.startsWith('phone:') || label.toLowerCase().includes('telefon:') || label.toLowerCase().includes('phone:')) {
      phone = label.replace(/^[Tt]elefon:\s*/, '').replace(/^[Pp]hone:\s*/, '').trim();
    }
    if (itemId.startsWith('address:') || label.toLowerCase().includes('adres:') || label.toLowerCase().includes('address:')) {
      address = label.replace(/^[Aa]dres:\s*/, '').replace(/^[Aa]ddress:\s*/, '').trim();
    }
  });

  // Kategori bulma
  const catEl = document.querySelector('button.DkEaL') || document.querySelector('.DkEaL');
  if (catEl) category = catEl.innerText.trim();

  // Şehir tahmini
  let city = 'Genel';
  const cities = ["Aydın", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Denizli", "Eskişehir", "Gaziantep", "Kocaeli", "Konya", "Kütahya", "Sakarya", "Trabzon", "Adana"];
  cities.forEach(c => {
    if (address.toLowerCase().includes(c.toLowerCase())) city = c;
  });

  return { name, phone, address, category, city };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_MAPS') {
    const data = scrapeMapsPlace();
    sendResponse(data);
  }
  return true;
});

// Otomatik AIESEC Butonu Entegre Etme (Müthiş Kullanıcı Deneyimi)
function injectAiesecWidget() {
  const h1 = document.querySelector('h1.DUwDvf') || document.querySelector('h1');
  if (!h1 || document.getElementById('aiesec-clipper-widget')) return;

  const container = h1.parentElement || h1;
  const widget = document.createElement('div');
  widget.id = 'aiesec-clipper-widget';
  widget.className = 'aiesec-maps-widget';
  widget.innerHTML = `
    <div class="aiesec-widget-inner">
      <span class="aiesec-widget-logo">AIESEC CRM</span>
      <button id="aiesecQuickSendBtn" class="aiesec-quick-btn">⚡ Şubeme Ekle</button>
    </div>
  `;

  container.appendChild(widget);

  document.getElementById('aiesecQuickSendBtn')?.addEventListener('click', async () => {
    const data = scrapeMapsPlace();
    if (!data.name) return;

    const btn = document.getElementById('aiesecQuickSendBtn');
    if (btn) btn.textContent = '⏳ Ekleniyor...';

    chrome.storage.local.get(['crmUrl'], async (res) => {
      const crmUrl = (res.crmUrl || 'http://localhost:3000').replace(/\/$/, '');
      try {
        const fetchRes = await fetch(`${crmUrl}/api/companies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            category: data.category || 'Google Maps',
            chapter: '',
            status: 'NO_ANSWER',
            notes: `Google Maps üzerinden tek tıkla eklendi. Adres: ${data.address || ''}`
          })
        });

        if (fetchRes.ok) {
          if (btn) {
            btn.textContent = '✔ Şubeye Eklendi';
            btn.style.background = '#10b981';
          }
        } else {
          alert('Hata! Lütfen CRM oturumunuzun açık olduğundan emin olun.');
          if (btn) btn.textContent = '⚡ Tekrar Deneyin';
        }
      } catch (err) {
        alert('CRM sunucusuna erişilemedi.');
        if (btn) btn.textContent = '⚡ Şubeme Ekle';
      }
    });
  });
}

// Google Maps sayfa değişimlerini dinle ve butonu ekle
setInterval(() => {
  injectAiesecWidget();
}, 2000);
