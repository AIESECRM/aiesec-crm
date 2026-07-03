// Google Haritalar DOM tarama ve buton ekleyici scripti

function scrapeMapsPlace() {
  const h1 = document.querySelector('h1.DUwDvf, h1[class*="headline"], h1');
  const name = h1 ? h1.innerText.trim() : '';

  let phone = '';
  let address = '';
  let category = '';

  // 1. Kategori bulma
  const catEl = document.querySelector('button.DkEaL, button[class*="DkEaL"], span[class*="category"]');
  if (catEl) category = catEl.innerText.trim();

  // 2. data-item-id ve aria-label ile arama
  const elements = document.querySelectorAll('button[data-item-id], [data-item-id], button[aria-label], a[aria-label]');
  elements.forEach(el => {
    const label = el.getAttribute('aria-label') || '';
    const itemId = el.getAttribute('data-item-id') || '';
    const text = el.innerText || '';

    if (itemId.includes('phone') || label.toLowerCase().includes('telefon') || label.toLowerCase().includes('phone')) {
      const p = (label || text).replace(/.*[Tt]elefon:\s*/, '').replace(/.*[Pp]hone:\s*/, '').trim();
      if (p && !phone) phone = p;
    }
    if (itemId.includes('address') || label.toLowerCase().includes('adres') || label.toLowerCase().includes('address')) {
      const a = (label || text).replace(/.*[Aa]dres:\s*/, '').replace(/.*[Aa]ddress:\s*/, '').trim();
      if (a && !address) address = a;
    }
  });

  // 3. Genel Google Maps metin tarama (Yedek/Fallback)
  const textNodes = document.querySelectorAll('.Io6YTe, .fontBodyMedium, [class*="fontBodyMedium"], div[class*="CsEnBe"]');
  textNodes.forEach(node => {
    const txt = node.innerText.trim();
    if (!txt) return;

    const phoneMatch = txt.match(/(\+90|0)?\s*[1-9]\d{2}[\s\-\.]?\d{3}[\s\-\.]?\d{2}[\s\-\.]?\d{2}/);
    if (!phone && phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      phone = phoneMatch[0];
    }

    if (!address && (txt.includes('Mah.') || txt.includes('Cad.') || txt.includes('Sok.') || txt.includes('Bulvarı') || txt.includes('No:') || txt.includes('Türkiye') || txt.includes('Turkey') || txt.split(',').length >= 2)) {
      if (!txt.includes('http') && !txt.includes('www.') && !phoneMatch) {
        address = txt;
      }
    }
  });

  let city = 'Genel';
  const cities = ["Aydın", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Denizli", "Eskişehir", "Gaziantep", "Kocaeli", "Konya", "Kütahya", "Sakarya", "Trabzon", "Adana"];
  cities.forEach(c => {
    if ((address + ' ' + name).toLowerCase().includes(c.toLowerCase())) city = c;
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

function injectAiesecWidget() {
  const h1 = document.querySelector('h1.DUwDvf, h1[class*="headline"], h1');
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
      const crmUrl = (res.crmUrl || 'https://aiesecrm.com').replace(/\/$/, '');
      try {
        const fetchRes = await fetch(`${crmUrl}/api/companies`, {
          method: 'POST',
          credentials: 'include',
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
          alert('Hata! Lütfen aiesecrm.com üzerinde oturumunuzun açık olduğundan emin olun.');
          if (btn) btn.textContent = '⚡ Tekrar Deneyin';
        }
      } catch (err) {
        alert('CRM sunucusuna erişilemedi.');
        if (btn) btn.textContent = '⚡ Şubeme Ekle';
      }
    });
  });
}

setInterval(() => {
  injectAiesecWidget();
}, 2000);
