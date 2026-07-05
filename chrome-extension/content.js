// Google Haritalar DOM tarama ve buton ekleyici scripti

window.__aiesecContentScriptLoaded = true;

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

    // Telefon: data-item-id "phone:tel:+905551234567" formatında olabilir
    if (itemId.includes('phone') || label.toLowerCase().includes('telefon') || label.toLowerCase().includes('phone')) {
      if (!phone) {
        // Önce data-item-id'den direkt numarayı çıkar
        const telMatch = itemId.match(/phone:tel:(.+)/);
        if (telMatch) {
          phone = telMatch[1].trim();
        } else {
          // aria-label veya metin içinden telefon numarasını çıkar
          const p = (label || text).replace(/.*[Tt]elefon:\s*/, '').replace(/.*[Pp]hone:\s*/, '').trim();
          if (p) phone = p;
        }
      }
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

    // Geniş telefon regex: Türkiye (+90, 0xxx) ve uluslararası formatlar
    const phoneMatch = txt.match(/(\+?\d{1,4}[\s\-\.]?)?\(?\d{2,4}\)?[\s\-\.]?\d{2,4}[\s\-\.]?\d{2,4}[\s\-\.]?\d{0,4}/);
    if (!phone && phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
      phone = phoneMatch[0].trim();
    }

    if (!address && (txt.includes('Mah.') || txt.includes('Cad.') || txt.includes('Sok.') || txt.includes('Bulvarı') || txt.includes('No:') || txt.includes('Türkiye') || txt.includes('Turkey') || txt.split(',').length >= 2)) {
      if (!txt.includes('http') && !txt.includes('www.') && !phoneMatch) {
        address = txt;
      }
    }
  });

  // 4. Google Maps telefon satırı: ikon yanındaki metin (son çare)
  if (!phone) {
    const phoneRows = document.querySelectorAll('[data-tooltip="Telefon numarasını kopyala"], [data-tooltip="Copy phone number"], [aria-label*="telefon"], [aria-label*="phone"]');
    phoneRows.forEach(el => {
      if (phone) return;
      const parent = el.closest('.CsEnBe, .AeaXub, [class*="fontBody"]') || el.parentElement;
      if (parent) {
        const rowText = parent.innerText.trim();
        const m = rowText.match(/(\+?\d[\d\s\-\.\(\)]{8,})/);
        if (m) phone = m[1].trim();
      }
    });
  }

  let city = 'Genel';
  const cities = ["Aydın", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Denizli", "Eskişehir", "Gaziantep", "Kocaeli", "Konya", "Kütahya", "Sakarya", "Trabzon", "Adana"];
  cities.forEach(c => {
    if ((address + ' ' + name).toLowerCase().includes(c.toLowerCase())) city = c;
  });

  return { name, phone, address, category, city };
}

// Google Maps arama sonuçları panelindeki TÜM işletme kartlarını tarar
function scrapeMapsList() {
  const results = [];

  // Şehir listesi (scrapeMapsPlace ile aynı)
  const cities = ["Aydın", "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Denizli", "Eskişehir", "Gaziantep", "Kocaeli", "Konya", "Kütahya", "Sakarya", "Trabzon", "Adana"];

  // 1. Sonuç kartlarını bul – feed container veya Nv2PK kartları
  const cards = document.querySelectorAll('div[role="feed"] > div > div[jsaction], div.Nv2PK');

  cards.forEach(card => {
    let name = '';
    let phone = '';
    let address = '';
    let category = '';

    // 2. İşletme adı: a.hfpxzc bağlantısının aria-label özniteliğinden al
    const link = card.querySelector('a.hfpxzc');
    if (link) {
      name = (link.getAttribute('aria-label') || '').trim();
    }
    // Eğer link yoksa kart içindeki başlık metinlerini dene
    if (!name) {
      const titleEl = card.querySelector('.qBF1Pd, .fontHeadlineSmall, [class*="fontHeadlineSmall"]');
      if (titleEl) name = titleEl.innerText.trim();
    }

    // İsim bulunamadıysa bu kart bir sonuç kartı değildir, atla
    if (!name) return;

    // 3. Kart içindeki .W4Efsd elemanlarından kategori, adres ve telefon bilgisi çıkar
    const infoEls = card.querySelectorAll('.W4Efsd');
    infoEls.forEach(el => {
      const txt = el.innerText.trim();
      if (!txt) return;

      // Telefon numarası tarama (geniş format)
      const phoneMatch = txt.match(/(\+?\d{1,4}[\s\-\.]?)?\(?\d{2,4}\)?[\s\-\.]?\d{2,4}[\s\-\.]?\d{2,4}[\s\-\.]?\d{0,4}/);
      if (!phone && phoneMatch && phoneMatch[0].replace(/\D/g, '').length >= 10) {
        phone = phoneMatch[0].trim();
      }

      // Adres ipuçları
      if (!address && (txt.includes('Mah.') || txt.includes('Cad.') || txt.includes('Sok.') || txt.includes('Bulvarı') || txt.includes('No:') || txt.includes('Türkiye') || txt.includes('Turkey') || txt.split(',').length >= 2)) {
        if (!txt.includes('http') && !txt.includes('www.') && !phoneMatch) {
          address = txt;
        }
      }

      // Kategori: genellikle ilk kısa .W4Efsd metni (· ayırıcı içerebilir)
      if (!category && txt.length < 60 && !phoneMatch && !txt.includes('Mah.') && !txt.includes('Cad.') && !txt.includes('Sok.')) {
        // "4,3 · (120)" gibi puan satırlarını atla
        if (!/^\d[.,]\d/.test(txt)) {
          category = txt.split('·').map(s => s.trim()).filter(s => s && !/^\(\d+\)$/.test(s))[0] || '';
        }
      }
    });

    // 4. Şehir tespiti
    let city = 'Genel';
    cities.forEach(c => {
      if ((address + ' ' + name).toLowerCase().includes(c.toLowerCase())) city = c;
    });

    results.push({ name, phone, address, category, city });
  });

  return results;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SCRAPE_MAPS') {
    const data = scrapeMapsPlace();
    sendResponse(data);
  }
  if (request.action === 'SCRAPE_MAPS_LIST') {
    const list = scrapeMapsList();
    sendResponse(list);
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

    chrome.storage.local.get(['crmUrl', 'authToken'], async (res) => {
      const crmUrl = (res.crmUrl || 'https://www.aiesecrm.com').replace(/\/$/, '');
      const token = res.authToken;

      if (!token) {
        alert('AIESEC CRM eklentisinde giriş yapmanız gerekiyor. Eklenti ikonuna tıklayıp giriş yapın.');
        if (btn) btn.textContent = '⚡ Şubeme Ekle';
        return;
      }

      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        };

        const fetchRes = await fetch(`${crmUrl}/api/companies`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: data.name,
            phone: data.phone,
            category: data.category || 'Google Maps',
            chapter: '',
            status: 'NO_ANSWER',
            notes: `Google Maps üzerinden tek tıkla eklendi. Adres: ${data.address || ''}`
          })
        });

        if (fetchRes.status === 401) {
          alert('Oturum süresi dolmuş. Eklenti ikonuna tıklayıp tekrar giriş yapın.');
          chrome.storage.local.remove(['authToken', 'authUser']);
          if (btn) btn.textContent = '⚡ Şubeme Ekle';
          return;
        }

        if (fetchRes.ok) {
          if (btn) {
            btn.textContent = '✔ Şubeye Eklendi';
            btn.style.background = '#10b981';
          }
        } else {
          const errData = await fetchRes.json().catch(() => ({}));
          alert(errData.error || 'Hata! Lütfen aiesecrm.com üzerinde oturumunuzun açık olduğundan emin olun.');
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
