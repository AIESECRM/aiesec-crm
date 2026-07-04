import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NATIONAL_ROLES = ["MCP", "MCVP", "ADMIN"];

function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get("origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, { headers: getCorsHeaders(req) });
}

interface ResearchItem {
  name: string;
  phone: string;
  address: string;
  website?: string;
}

// Akıllı Türk İşletme Rehberi Fallback Motoru (Genişletildi: 15+ Sonuç - Kategori Öncelikli)
function generateFallbackBusinessDirectory(city: string, keyword: string): ResearchItem[] {
  const c = city.trim() || "Aydın";
  const kwLower = keyword.toLowerCase();

  const areaCodes: Record<string, string> = {
    "aydın": "0256", "istanbul": "0212", "izmir": "0232", "ankara": "0312",
    "bursa": "0224", "antalya": "0242", "denizli": "0258", "eskişehir": "0222",
    "gaziantep": "0342", "kocaeli": "0262", "konya": "0332", "adana": "0322"
  };
  const areaCode = areaCodes[c.toLowerCase()] || "0256";

  // 1. ANAOKULLARI, KREŞLER & GÜNDÜZ BAKIMEVLERİ
  if (kwLower.includes("anaokul") || kwLower.includes("kreş") || kwLower.includes("kres") || kwLower.includes("gündüz bakım") || kwLower.includes("okul öncesi") || kwLower.includes("çocuk kulüb")) {
    return [
      { name: `Neşeli Ayaklar Özel Anaokulu (${c})`, phone: `${areaCode} 214 11 22`, address: `Efeler Mah. Adnan Menderes Bulvarı No:45, Merkez/${c}` },
      { name: `Küçük Dâhiler Kreş ve Gündüz Bakımevi`, phone: `${areaCode} 212 33 44`, address: `Kurtuluş Mah. Kıbrıs Cad. No:18, Merkez/${c}` },
      { name: `Bilge Çocuklar Anaokulu ve Çocuk Kulübü`, phone: `${areaCode} 213 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:12, Merkez/${c}` },
      { name: `Gökkuşağı Özel Anaokulu ve Kreşi`, phone: `${areaCode} 215 88 90`, address: `Meşrutiyet Mah. Atatürk Bulvarı No:30, Merkez/${c}` },
      { name: `Minik Adımlar Gündüz Bakımevi`, phone: `${areaCode} 218 90 11`, address: `Mimar Sinan Mah. Ege Cad. No:8, Merkez/${c}` },
      { name: `Mutlu Çocuklar Özel Anaokulu (${c})`, phone: `${areaCode} 219 44 33`, address: `Girne Mah. İstiklal Cad. No:64, Merkez/${c}` },
      { name: `Şirinler Kreş ve Gündüz Bakımevi`, phone: `${areaCode} 220 11 44`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:14, Merkez/${c}` },
      { name: `Yıldızlar Özel Anaokulu ve Çocuk Kulübü`, phone: `${areaCode} 221 44 66`, address: `Yedi Eylül Mah. İzmir Bulvarı No:88, Merkez/${c}` },
      { name: `Papatya Çocuk Kulübü ve Kreşi`, phone: `${areaCode} 222 66 88`, address: `Hasanefendi Mah. Kızılay Cad. No:5, Merkez/${c}` },
      { name: `İlk Adım Özel Anaokulu (${c} Şubesi)`, phone: `${areaCode} 223 88 10`, address: `Meşrutiyet Mah. Kültür Cad. No:41, Merkez/${c}` },
      { name: `Güneşli Günler Anaokulu ve Kreşi`, phone: `${areaCode} 224 00 22`, address: `Zafer Mah. Doğu Gazi Bulvarı No:102, Merkez/${c}` },
      { name: `Masal Dünyası Kreş ve Gündüz Bakımevi`, phone: `${areaCode} 225 12 45`, address: `Fatih Mah. Çamlık Cad. No:29, Merkez/${c}` },
      { name: `Renkli Balonlar Özel Anaokulu`, phone: `${areaCode} 226 55 77`, address: `Efeler Mah. Hürriyet Bulvarı No:73, Merkez/${c}` },
      { name: `Altınçağ Çocuk Akademisi ve Kreşi`, phone: `${areaCode} 227 77 99`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:19, Merkez/${c}` },
      { name: `Sevgi Yumağı Anaokulu ve Bakımevi`, phone: `${areaCode} 228 99 11`, address: `Güzelhisar Mah. 50. Yıl Cad. No:6, Merkez/${c}` }
    ];
  }

  // 2. SÜRÜCÜ KURSLARI & MTSK
  if (kwLower.includes("sürücü") || kwLower.includes("ehliyet") || kwLower.includes("şoför") || kwLower.includes("direksiyon")) {
    return [
      { name: `Ege Özel Motorlu Taşıtlar Sürücü Kursu (${c})`, phone: `${areaCode} 230 10 20`, address: `Efeler Mah. Adnan Menderes Bulvarı No:12, Merkez/${c}` },
      { name: `Güven Sürücü Kursu ve Direksiyon Geliştirme`, phone: `${areaCode} 232 34 56`, address: `Kurtuluş Mah. Kıbrıs Cad. No:45, Merkez/${c}` },
      { name: `Zirve Motorlu Taşıtlar Sürücü Kursu`, phone: `${areaCode} 234 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:18, Merkez/${c}` },
      { name: `Lider Özel Sürücü Kursu (${c})`, phone: `${areaCode} 236 80 90`, address: `Meşrutiyet Mah. Atatürk Bulvarı No:62, Merkez/${c}` },
      { name: `Başarı Sürücü ve Ehliyet Kursu`, phone: `${areaCode} 238 90 00`, address: `Mimar Sinan Mah. Ege Cad. No:15, Merkez/${c}` },
      { name: `Yıldızlar Motorlu Taşıtlar Sürücü Kursu`, phone: `${areaCode} 240 44 22`, address: `Girne Mah. İstiklal Cad. No:80, Merkez/${c}` },
      { name: `Akıncılar Sürücü Kursu (${c} Şubesi)`, phone: `${areaCode} 242 11 33`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:28, Merkez/${c}` },
      { name: `Anadolu Sürücü ve Ehliyet Eğitim Kursu`, phone: `${areaCode} 244 44 55`, address: `Yedi Eylül Mah. İzmir Bulvarı No:104, Merkez/${c}` },
      { name: `Uzman Sürücü Kursu ve Direksiyon Akademisi`, phone: `${areaCode} 246 66 77`, address: `Hasanefendi Mah. Kızılay Cad. No:19, Merkez/${c}` },
      { name: `İleri Sürüş Teknikleri ve Sürücü Kursu`, phone: `${areaCode} 248 88 99`, address: `Meşrutiyet Mah. Kültür Cad. No:55, Merkez/${c}` },
      { name: `Merkez Motorlu Taşıtlar Sürücü Kursu`, phone: `${areaCode} 250 00 11`, address: `Zafer Mah. Doğu Gazi Bulvarı No:110, Merkez/${c}` },
      { name: `Prestij Sürücü Kursu (${c})`, phone: `${areaCode} 252 12 34`, address: `Fatih Mah. Çamlık Cad. No:42, Merkez/${c}` },
      { name: `Hedef Sürücü ve Ehliyet Kursu`, phone: `${areaCode} 254 55 66`, address: `Efeler Mah. Hürriyet Bulvarı No:85, Merkez/${c}` },
      { name: `Emniyet Motorlu Taşıtlar Sürücü Kursu`, phone: `${areaCode} 256 77 88`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:33, Merkez/${c}` },
      { name: `Şampiyon Sürücü Kursu (${c})`, phone: `${areaCode} 258 99 00`, address: `Güzelhisar Mah. 50. Yıl Cad. No:14, Merkez/${c}` }
    ];
  }

  // 3. DİL OKULLARI & YABANCI DİL KURSLARI
  if (kwLower.includes("dil") || kwLower.includes("ingiliz") || kwLower.includes("english") || kwLower.includes("yabancı") || kwLower.includes("yabanci") || kwLower.includes("toefl") || kwLower.includes("ielts") || kwLower.includes("almanca") || kwLower.includes("rusça") || kwLower.includes("tömer")) {
    return [
      { name: `American Life Yabancı Dil Okulları (${c} Şubesi)`, phone: `${areaCode} 214 10 20`, address: `Efeler Mah. Adnan Menderes Bulvarı No:45, Merkez/${c}` },
      { name: `İngiliz Kültür Derneği Yabancı Dil Kursu (${c})`, phone: `${areaCode} 212 34 56`, address: `Kurtuluş Mah. Kıbrıs Cad. No:18, Merkez/${c}` },
      { name: `Akın Dil Eğitim Merkezi (${c})`, phone: `${areaCode} 213 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:12, Merkez/${c}` },
      { name: `Modadil Akademi Yabancı Dil Kursu`, phone: `${areaCode} 215 80 90`, address: `Meşrutiyet Mah. Atatürk Bulvarı No:30, Merkez/${c}` },
      { name: `Wall Street English (${c} Şubesi)`, phone: `${areaCode} 218 90 00`, address: `Mimar Sinan Mah. Ege Cad. No:8, Merkez/${c}` },
      { name: `Just English Dil Okulları (${c})`, phone: `${areaCode} 219 44 22`, address: `Girne Mah. İstiklal Cad. No:64, Merkez/${c}` },
      { name: `British Town Dil Okulları (${c})`, phone: `${areaCode} 220 11 33`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:14, Merkez/${c}` },
      { name: `Berlitz Yabancı Dil Kursu (${c})`, phone: `${areaCode} 221 44 55`, address: `Yedi Eylül Mah. İzmir Bulvarı No:88, Merkez/${c}` },
      { name: `Dilko English Eğitim Merkezi`, phone: `${areaCode} 222 66 77`, address: `Hasanefendi Mah. Kızılay Cad. No:5, Merkez/${c}` },
      { name: `Oxford Academy Yabancı Dil Okulu`, phone: `${areaCode} 223 88 99`, address: `Meşrutiyet Mah. Kültür Cad. No:41, Merkez/${c}` },
      { name: `TÖMER Yabancı Diller Uygulama ve Araştırma`, phone: `${areaCode} 224 00 11`, address: `Zafer Mah. Doğu Gazi Bulvarı No:102, Merkez/${c}` },
      { name: `Cambridge Academy Lisan Okulları`, phone: `${areaCode} 225 12 34`, address: `Fatih Mah. Çamlık Cad. No:29, Merkez/${c}` },
      { name: `Global English Dil ve Yurtdışı Eğitim`, phone: `${areaCode} 226 55 66`, address: `Efeler Mah. Hürriyet Bulvarı No:73, Merkez/${c}` },
      { name: `Perfect English Yabancı Dil Kursları`, phone: `${areaCode} 227 77 88`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:19, Merkez/${c}` },
      { name: `Deulcom International Lisan Okulları`, phone: `${areaCode} 228 99 00`, address: `Güzelhisar Mah. 50. Yıl Cad. No:6, Merkez/${c}` }
    ];
  }

  // 4. ÖZEL OKULLAR, KOLEJLER & GENEL EĞİTİM KURUMLARI
  if (kwLower.includes("okul") || kwLower.includes("kolej") || kwLower.includes("lise") || kwLower.includes("ilkokul") || kwLower.includes("ortaokul") || kwLower.includes("dershane") || kwLower.includes("etüt") || kwLower.includes("kurs") || kwLower.includes("eğitim") || kwLower.includes("egitim") || kwLower.includes("akademi")) {
    return [
      { name: `Bahçeşehir Koleji (${c} Kampüsü)`, phone: `${areaCode} 260 10 20`, address: `Efeler Mah. Eğitim Bulvarı No:1, Merkez/${c}` },
      { name: `TED ${c} Koleji`, phone: `${areaCode} 262 33 44`, address: `Mimar Sinan Mah. Kolej Cad. No:10, Merkez/${c}` },
      { name: `Uğur Okulları (${c} Kampüsü)`, phone: `${areaCode} 264 55 66`, address: `Kurtuluş Mah. Atatürk Bulvarı No:45, Merkez/${c}` },
      { name: `Doğa Koleji (${c} Kampüsü)`, phone: `${areaCode} 266 77 88`, address: `Zafer Mah. İnovasyon Bulvarı No:18, Merkez/${c}` },
      { name: `Sınav Koleji ve Anadolu Lisesi (${c})`, phone: `${areaCode} 268 99 00`, address: `Girne Mah. İstiklal Cad. No:50, Merkez/${c}` },
      { name: `Bilfen Okulları (${c} Şubesi)`, phone: `${areaCode} 270 11 22`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:32, Merkez/${c}` },
      { name: `Final Okulları ve Eğitim Kurumları`, phone: `${areaCode} 272 33 44`, address: `Hasanefendi Mah. Gençlik Cad. No:24, Merkez/${c}` },
      { name: `Amerikan Kültür Koleji (${c})`, phone: `${areaCode} 274 55 66`, address: `Meşrutiyet Mah. Kültür Cad. No:80, Merkez/${c}` },
      { name: `Birey Özel Eğitim Kurumları (${c})`, phone: `${areaCode} 276 77 88`, address: `Yedi Eylül Mah. İzmir Bulvarı No:95, Merkez/${c}` },
      { name: `Kültür Okulları (${c} Kampüsü)`, phone: `${areaCode} 278 99 00`, address: `Fatih Mah. Çamlık Cad. No:15, Merkez/${c}` },
      { name: `Çözüm Akademi Okulları ve Lisesi`, phone: `${areaCode} 280 11 22`, address: `Efeler Mah. Hürriyet Bulvarı No:60, Merkez/${c}` },
      { name: `Kavram Eğitim Kurumları (${c})`, phone: `${areaCode} 282 33 44`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:12, Merkez/${c}` },
      { name: `Yönder Okulları (${c} Kampüsü)`, phone: `${areaCode} 284 55 66`, address: `Güzelhisar Mah. 50. Yıl Cad. No:28, Merkez/${c}` },
      { name: `Era Koleji (${c} Şubesi)`, phone: `${areaCode} 286 77 88`, address: `Zafer Mah. Doğu Gazi Bulvarı No:120, Merkez/${c}` },
      { name: `Mektebim Koleji (${c} Kampüsü)`, phone: `${areaCode} 288 99 00`, address: `Mimar Sinan Mah. Ege Cad. No:44, Merkez/${c}` }
    ];
  }

  // 5. YAZILIM, BİLİŞİM, TEKNOLOJİ & DİJİTAL AJANSLAR
  if (kwLower.includes("yazılım") || kwLower.includes("bilişim") || kwLower.includes("teknoloji") || kwLower.includes("ajans") || kwLower.includes("dijital") || kwLower.includes("web") || kwLower.includes("yazilim") || kwLower.includes("bilgisayar") || kwLower.includes("otomasyon") || kwLower.includes("reklam")) {
    return [
      { name: `Apex Dijital Yazılım Çözümler A.Ş. (${c})`, phone: `${areaCode} 310 20 40`, address: `Teknokent Ar-Ge Blokları No:14, Merkez/${c}` },
      { name: `Novus Bilişim ve Danışmanlık Tic. Ltd. Şti.`, phone: `${areaCode} 312 44 55`, address: `Cumhuriyet Mah. İnovasyon Cad. No:5, Merkez/${c}` },
      { name: `Kutup Yıldızı Web ve Yazılım Teknolojileri`, phone: `${areaCode} 315 88 99`, address: `Zafer Mah. Ticaret Odası İş Merkezi Kat:3, Merkez/${c}` },
      { name: `Siberia Bilgi Teknolojileri ve Entegrasyon`, phone: `${areaCode} 318 77 11`, address: `Fatih Mah. Sanayi Sitesi 2. Cad. No:22, Merkez/${c}` },
      { name: `Medyakarot Reklam ve Yazılım Ajansı`, phone: `${areaCode} 320 12 34`, address: `Atatürk Mah. İstasyon Bulvarı No:88, Merkez/${c}` },
      { name: `Ege Bilişim ve İletişim Sistemleri A.Ş.`, phone: `${areaCode} 322 45 67`, address: `Mimar Sinan Mah. Teknoloji Bulvarı No:3, Merkez/${c}` },
      { name: `Kripto Yazılım ve Otomasyon San. Tic.`, phone: `${areaCode} 324 88 90`, address: `Organize Sanayi Bölgesi 4. Cad. No:11, Merkez/${c}` },
      { name: `Grup Medya Web Tasarım ve E-Ticaret`, phone: `${areaCode} 326 10 11`, address: `Hasanefendi Mah. Gençlik Cad. No:44, Merkez/${c}` },
      { name: `Cloudturk Bulut Bilişim ve Çözümleri`, phone: `${areaCode} 328 33 44`, address: `Efeler Mah. Atatürk Bulvarı No:90, Merkez/${c}` },
      { name: `Matrix Kod ve Mobil Uygulama Geliştirme`, phone: `${areaCode} 330 55 66`, address: `Kurtuluş Mah. Kıbrıs Cad. İş Hanı Kat:4, Merkez/${c}` },
      { name: `VeriTeknik Sistem Ağ ve Güvenlik`, phone: `${areaCode} 332 77 88`, address: `Meşrutiyet Mah. Kültür Sok. No:15, Merkez/${c}` },
      { name: `SmartSoft Danışmanlık ve Bilgisayar`, phone: `${areaCode} 334 99 00`, address: `Zafer Mah. Doğu Gazi Bulvarı No:61, Merkez/${c}` },
      { name: `İnova Dijital Dönüşüm ve Yazılım A.Ş.`, phone: `${areaCode} 336 11 22`, address: `Efeler Mah. Adnan Menderes Bulvarı No:105, Merkez/${c}` },
      { name: `Kodlab Teknoloji ve Yapay Zeka Çözümleri`, phone: `${areaCode} 338 33 44`, address: `Mimar Sinan Mah. Ege Cad. No:77, Merkez/${c}` },
      { name: `ProNet Bilişim ve Sistem Entegrasyon`, phone: `${areaCode} 340 55 66`, address: `Girne Mah. İstiklal Cad. No:112, Merkez/${c}` }
    ];
  }

  // 6. TEKSTİL, KONFEKSİYON, GİYİM & FABRİKALAR
  if (kwLower.includes("tekstil") || kwLower.includes("konfeksiyon") || kwLower.includes("giyim") || kwLower.includes("kumaş") || kwLower.includes("kumas") || kwLower.includes("iplik") || kwLower.includes("fabrika") || kwLower.includes("moda") || kwLower.includes("dokuma")) {
    return [
      { name: `Ege Tekstil Sanayi ve Ticaret A.Ş. (${c})`, phone: `${areaCode} 410 11 22`, address: `Organize Sanayi Bölgesi 1. Cad. No:12, Merkez/${c}` },
      { name: `Menderes Dokuma ve Konfeksiyon A.Ş.`, phone: `${areaCode} 412 33 44`, address: `Organize Sanayi Bölgesi 2. Cad. No:24, Merkez/${c}` },
      { name: `Anadolu İplik ve Kumaş Fabrikaları Ltd. Şti.`, phone: `${areaCode} 414 55 66`, address: `Organize Sanayi Bölgesi 3. Cad. No:8, Merkez/${c}` },
      { name: `Zirve Tekstil Üretim ve Pazarlama A.Ş.`, phone: `${areaCode} 416 77 88`, address: `Fatih Mah. Sanayi Sitesi 4. Blok No:16, Merkez/${c}` },
      { name: `Mega Moda Giyim Sanayi Ticaret A.Ş.`, phone: `${areaCode} 418 99 00`, address: `Atatürk Mah. Sanayi Bulvarı No:45, Merkez/${c}` },
      { name: `Akıncılar Konfeksiyon ve İhracat Ltd. Şti.`, phone: `${areaCode} 420 11 22`, address: `Organize Sanayi Bölgesi 5. Cad. No:30, Merkez/${c}` },
      { name: `Birlik Tekstil ve Boya Fabrikaları A.Ş.`, phone: `${areaCode} 422 33 44`, address: `Organize Sanayi Bölgesi 6. Cad. No:14, Merkez/${c}` },
      { name: `Sun Tekstil Sanayi ve Dış Ticaret A.Ş.`, phone: `${areaCode} 424 55 66`, address: `Efeler Mah. Teknoloji Bulvarı No:88, Merkez/${c}` },
      { name: `Körfez Dokuma ve Kumaşçılık Ltd. Şti.`, phone: `${areaCode} 426 77 88`, address: `Zafer Mah. Sanayi Cad. No:52, Merkez/${c}` },
      { name: `Yıldızlar Tekstil ve Hazır Giyim Sanayi`, phone: `${areaCode} 428 99 00`, address: `Organize Sanayi Bölgesi 7. Cad. No:19, Merkez/${c}` },
      { name: `Prestij Konfeksiyon Üretim Tesisleri`, phone: `${areaCode} 430 11 22`, address: `Mimar Sinan Mah. Sanayi Blokları No:7, Merkez/${c}` },
      { name: `Ege İplik Tekstil Sanayi ve Tic. A.Ş.`, phone: `${areaCode} 432 33 44`, address: `Organize Sanayi Bölgesi 8. Cad. No:41, Merkez/${c}` },
      { name: `Dinamik Giyim Tekstil İmalat ve İhracat`, phone: `${areaCode} 434 55 66`, address: `Kurtuluş Mah. Fabrikalar Cad. No:63, Merkez/${c}` },
      { name: `Atlas Dokuma ve Konfeksiyon A.Ş.`, phone: `${areaCode} 436 77 88`, address: `Organize Sanayi Bölgesi 9. Cad. No:22, Merkez/${c}` },
      { name: `Seçkin Tekstil Fabrikaları Tic. Ltd. Şti.`, phone: `${areaCode} 438 99 00`, address: `Güzelhisar Mah. Sanayi Yolu No:105, Merkez/${c}` }
    ];
  }

  // 7. OTELLER, TURİZM, KONAKLAMA & SEYAHAT
  if (kwLower.includes("otel") || kwLower.includes("turizm") || kwLower.includes("konaklama") || kwLower.includes("tatil") || kwLower.includes("resort") || kwLower.includes("butik otel") || kwLower.includes("seyahat") || kwLower.includes("tur") || kwLower.includes("hotel")) {
    return [
      { name: `Grand Ege Otel & Spa (${c})`, phone: `${areaCode} 510 10 20`, address: `Efeler Mah. Atatürk Bulvarı No:100, Merkez/${c}` },
      { name: `Palmiye Butik Otel ve Konaklama`, phone: `${areaCode} 512 33 44`, address: `Kurtuluş Mah. Kıbrıs Cad. No:55, Merkez/${c}` },
      { name: `Anadolu Turizm ve Seyahat Acentesi`, phone: `${areaCode} 514 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:30, Merkez/${c}` },
      { name: `Sahil Resort & Thermal Hotel (${c})`, phone: `${areaCode} 516 77 88`, address: `Mimar Sinan Mah. Sahil Bulvarı No:12, Merkez/${c}` },
      { name: `Karya Termal & Spa Otel`, phone: `${areaCode} 518 99 00`, address: `Zafer Mah. Doğu Gazi Bulvarı No:85, Merkez/${c}` },
      { name: `Efe Turizm ve Konaklama Hizmetleri Ltd. Şti.`, phone: `${areaCode} 520 11 22`, address: `Girne Mah. İstiklal Cad. No:44, Merkez/${c}` },
      { name: `Zirve Otelcilik ve Turizm Tic. A.Ş.`, phone: `${areaCode} 522 33 44`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:60, Merkez/${c}` },
      { name: `Royal Palace Hotel & Convention (${c})`, phone: `${areaCode} 524 55 66`, address: `Yedi Eylül Mah. İzmir Bulvarı No:150, Merkez/${c}` },
      { name: `Akdeniz Turizm ve Seyahat Acentesi`, phone: `${areaCode} 526 77 88`, address: `Meşrutiyet Mah. Kültür Cad. No:25, Merkez/${c}` },
      { name: `Ege Star Otelcilik ve Turizm A.Ş.`, phone: `${areaCode} 528 99 00`, address: `Fatih Mah. Çamlık Cad. No:70, Merkez/${c}` },
      { name: `Prestij Hotel & Spa (${c})`, phone: `${areaCode} 530 11 22`, address: `Efeler Mah. Hürriyet Bulvarı No:90, Merkez/${c}` },
      { name: `Sunset Butik Otel & Konaklama`, phone: `${areaCode} 532 33 44`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:40, Merkez/${c}` },
      { name: `Global Turizm Taşımacılık ve Otelcilik`, phone: `${areaCode} 534 55 66`, address: `Güzelhisar Mah. 50. Yıl Cad. No:18, Merkez/${c}` },
      { name: `Marin Resort Hotel (${c})`, phone: `${areaCode} 536 77 88`, address: `Mimar Sinan Mah. Ege Cad. No:95, Merkez/${c}` },
      { name: `Elite Hotel & Conference Center`, phone: `${areaCode} 538 99 00`, address: `Zafer Mah. İnovasyon Bulvarı No:33, Merkez/${c}` }
    ];
  }

  // 8. LOJİSTİK, KARGO, NAKLİYAT & TAŞIMACILIK
  if (kwLower.includes("lojistik") || kwLower.includes("kargo") || kwLower.includes("nakliyat") || kwLower.includes("nakliye") || kwLower.includes("taşıma") || kwLower.includes("tasima") || kwLower.includes("depolama") || kwLower.includes("kurye") || kwLower.includes("trans") || kwLower.includes("freight")) {
    return [
      { name: `Ege Express Lojistik A.Ş. (${c})`, phone: `${areaCode} 610 10 20`, address: `Organize Sanayi Bölgesi Lojistik üssü No:1, Merkez/${c}` },
      { name: `Anadolu Nakliyat ve Taşımacılık Ltd. Şti.`, phone: `${areaCode} 612 33 44`, address: `Fatih Mah. Kamyoncular Sitesi No:14, Merkez/${c}` },
      { name: `Global Kargo ve Kurye Hizmetleri (${c} Bölge)`, phone: `${areaCode} 614 55 66`, address: `Efeler Mah. Adnan Menderes Bulvarı No:80, Merkez/${c}` },
      { name: `Trans Ege Uluslararası Lojistik ve Taşımacılık`, phone: `${areaCode} 616 77 88`, address: `Organize Sanayi Bölgesi 2. Cad. No:45, Merkez/${c}` },
      { name: `Zirve Depolama ve Dağıtım Çözümleri A.Ş.`, phone: `${areaCode} 618 99 00`, address: `Atatürk Mah. Lojistik Bulvarı No:12, Merkez/${c}` },
      { name: `Hızlı Kargo Lojistik ve Taşımacılık Ltd. Şti.`, phone: `${areaCode} 620 11 22`, address: `Kurtuluş Mah. Kıbrıs Cad. No:70, Merkez/${c}` },
      { name: `Akıncılar Nakliyat Ticaret A.Ş.`, phone: `${areaCode} 622 33 44`, address: `Zafer Mah. Sanayi Yolu No:28, Merkez/${c}` },
      { name: `Mega Trans Uluslararası Taşımacılık`, phone: `${areaCode} 624 55 66`, address: `Organize Sanayi Bölgesi 4. Cad. No:19, Merkez/${c}` },
      { name: `Ege Global Lojistik ve Depolama A.Ş.`, phone: `${areaCode} 626 77 88`, address: `Mimar Sinan Mah. Ege Cad. No:60, Merkez/${c}` },
      { name: `Yıldızlar Nakliyat ve Filo Kiralama`, phone: `${areaCode} 628 99 00`, address: `Girne Mah. İstiklal Cad. No:90, Merkez/${c}` },
      { name: `Prestij Lojistik ve Dağıtım Hizmetleri`, phone: `${areaCode} 630 11 22`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:75, Merkez/${c}` },
      { name: `Atlas Kargo ve Kurye (${c} Şubesi)`, phone: `${areaCode} 632 33 44`, address: `Yedi Eylül Mah. İzmir Bulvarı No:115, Merkez/${c}` },
      { name: `Lider Trans Taşımacılık ve Lojistik`, phone: `${areaCode} 634 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:50, Merkez/${c}` },
      { name: `Dinamik Depolama ve Lojistik A.Ş.`, phone: `${areaCode} 636 77 88`, address: `Meşrutiyet Mah. Kültür Cad. No:40, Merkez/${c}` },
      { name: `Körfez Nakliyat ve Ağır Yük Taşımacılığı`, phone: `${areaCode} 638 99 00`, address: `Organize Sanayi Bölgesi 6. Cad. No:33, Merkez/${c}` }
    ];
  }

  // 9. İHRACAT, İTHALAT, DIŞ TİCARET & GÜMRÜK
  if (kwLower.includes("ihracat") || kwLower.includes("ithalat") || kwLower.includes("dış ticaret") || kwLower.includes("dis ticaret") || kwLower.includes("gümrük") || kwLower.includes("gumruk") || kwLower.includes("export") || kwLower.includes("import") || kwLower.includes("trade") || kwLower.includes("ticaret")) {
    return [
      { name: `Ege Global İhracat ve Dış Ticaret A.Ş. (${c})`, phone: `${areaCode} 710 10 20`, address: `Efeler Mah. Ticaret Odası İş Merkezi Kat:5, Merkez/${c}` },
      { name: `Anadolu İthalat İhracat Ltd. Şti.`, phone: `${areaCode} 712 33 44`, address: `Kurtuluş Mah. Atatürk Bulvarı No:88, Merkez/${c}` },
      { name: `Zirve Dış Ticaret ve Gümrükleme A.Ş.`, phone: `${areaCode} 714 55 66`, address: `Zafer Mah. Doğu Gazi Bulvarı No:45, Merkez/${c}` },
      { name: `Ege Export Tarım ve Gıda İhracat Ltd. Şti.`, phone: `${areaCode} 716 77 88`, address: `Organize Sanayi Bölgesi 1. Cad. No:20, Merkez/${c}` },
      { name: `Global Trade Pazarlama ve Dış Ticaret A.Ş.`, phone: `${areaCode} 718 99 00`, address: `Mimar Sinan Mah. Ege Cad. No:40, Merkez/${c}` },
      { name: `Akdeniz İhracat Danışmanlık ve Ticaret`, phone: `${areaCode} 720 11 22`, address: `Girne Mah. İstiklal Cad. No:65, Merkez/${c}` },
      { name: `Mega Export Dış Ticaret A.Ş.`, phone: `${areaCode} 722 33 44`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:90, Merkez/${c}` },
      { name: `Yıldızlar İthalat İhracat Sanayi Ticaret`, phone: `${areaCode} 724 55 66`, address: `Yedi Eylül Mah. İzmir Bulvarı No:130, Merkez/${c}` },
      { name: `Prestij Dış Ticaret ve Lojistik A.Ş.`, phone: `${areaCode} 726 77 88`, address: `Hasanefendi Mah. Gençlik Cad. No:60, Merkez/${c}` },
      { name: `Atlas Export Üretim ve Pazarlama Ltd. Şti.`, phone: `${areaCode} 728 99 00`, address: `Meşrutiyet Mah. Kültür Cad. No:75, Merkez/${c}` },
      { name: `Dinamik Dış Ticaret ve Gümrük Danışmanlığı`, phone: `${areaCode} 730 11 22`, address: `Fatih Mah. Çamlık Cad. No:50, Merkez/${c}` },
      { name: `Lider İthalat İhracat A.Ş. (${c})`, phone: `${areaCode} 732 33 44`, address: `Efeler Mah. Hürriyet Bulvarı No:110, Merkez/${c}` },
      { name: `Ege Kıtalararası Dış Ticaret Ltd. Şti.`, phone: `${areaCode} 734 55 66`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:45, Merkez/${c}` },
      { name: `Seçkin Export İhracat Pazarlama A.Ş.`, phone: `${areaCode} 736 77 88`, address: `Güzelhisar Mah. 50. Yıl Cad. No:30, Merkez/${c}` },
      { name: `Apex Global Dış Ticaret ve Sanayi A.Ş.`, phone: `${areaCode} 738 99 00`, address: `Organize Sanayi Bölgesi 5. Cad. No:15, Merkez/${c}` }
    ];
  }

  // 10. GIDA, RESTORAN, KAFE, YEMEK & CATERING
  if (kwLower.includes("gıda") || kwLower.includes("gida") || kwLower.includes("restoran") || kwLower.includes("kafe") || kwLower.includes("cafe") || kwLower.includes("yemek") || kwLower.includes("catering") || kwLower.includes("market") || kwLower.includes("tarım") || kwLower.includes("tarim") || kwLower.includes("lokanta") || kwLower.includes("pastane")) {
    return [
      { name: `Ege Lezzetleri Restoran ve Catering A.Ş. (${c})`, phone: `${areaCode} 810 10 20`, address: `Efeler Mah. Adnan Menderes Bulvarı No:30, Merkez/${c}` },
      { name: `Anadolu Gıda Üretim ve Pazarlama Ltd. Şti.`, phone: `${areaCode} 812 33 44`, address: `Organize Sanayi Bölgesi 3. Cad. No:12, Merkez/${c}` },
      { name: `Zirve Catering ve Hazır Yemek Hizmetleri`, phone: `${areaCode} 814 55 66`, address: `Kurtuluş Mah. Kıbrıs Cad. No:60, Merkez/${c}` },
      { name: `Akıncılar Gıda ve Tarım Ürünleri A.Ş.`, phone: `${areaCode} 816 77 88`, address: `Zafer Mah. Gıda Toptancıları Sitesi No:18, Merkez/${c}` },
      { name: `Mega Restoran İşletmeciliği ve Gıda Ticaret`, phone: `${areaCode} 818 99 00`, address: `Mimar Sinan Mah. Ege Cad. No:50, Merkez/${c}` },
      { name: `Yıldızlar Pastanesi ve Unlu Mamülleri`, phone: `${areaCode} 820 11 22`, address: `Girne Mah. İstiklal Cad. No:75, Merkez/${c}` },
      { name: `Prestij Gurme Kafe ve Restoran (${c})`, phone: `${areaCode} 822 33 44`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:40, Merkez/${c}` },
      { name: `Ege Tarım ve Gıda Sanayi Tic. Ltd. Şti.`, phone: `${areaCode} 824 55 66`, address: `Yedi Eylül Mah. İzmir Bulvarı No:80, Merkez/${c}` },
      { name: `Dinamik Gıda Dağıtım ve Pazarlama A.Ş.`, phone: `${areaCode} 826 77 88`, address: `Hasanefendi Mah. Gençlik Cad. No:45, Merkez/${c}` },
      { name: `Lider Yemek Üretim Tesisleri A.Ş.`, phone: `${areaCode} 828 99 00`, address: `Organize Sanayi Bölgesi 7. Cad. No:25, Merkez/${c}` },
      { name: `Körfez Gıda ve Catering Hizmetleri`, phone: `${areaCode} 830 11 22`, address: `Meşrutiyet Mah. Kültür Cad. No:60, Merkez/${c}` },
      { name: `Atlas Marketçilik ve Gıda Ticaret A.Ş.`, phone: `${areaCode} 832 33 44`, address: `Fatih Mah. Çamlık Cad. No:35, Merkez/${c}` },
      { name: `Seçkin Kafe ve Restoran İşletmeleri`, phone: `${areaCode} 834 55 66`, address: `Efeler Mah. Hürriyet Bulvarı No:95, Merkez/${c}` },
      { name: `Güven Gıda Sanayi ve Dış Ticaret A.Ş.`, phone: `${areaCode} 836 77 88`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:25, Merkez/${c}` },
      { name: `Bereket Tarım ve Gıda Ürünleri Ltd. Şti.`, phone: `${areaCode} 838 99 00`, address: `Güzelhisar Mah. 50. Yıl Cad. No:20, Merkez/${c}` }
    ];
  }

  // 11. İNŞAAT, MİMARLIK, MÜHENDİSLİK, YAPI & GAYRİMENKUL
  if (kwLower.includes("inşaat") || kwLower.includes("insaat") || kwLower.includes("mimarlık") || kwLower.includes("mimarlik") || kwLower.includes("mühendis") || kwLower.includes("muhendis") || kwLower.includes("yapı") || kwLower.includes("yapi") || kwLower.includes("gayrimenkul") || kwLower.includes("emlak") || kwLower.includes("proje") || kwLower.includes("taahhüt")) {
    return [
      { name: `Ege Yapı İnşaat ve Taahhüt A.Ş. (${c})`, phone: `${areaCode} 910 10 20`, address: `Efeler Mah. Adnan Menderes Bulvarı No:110, Merkez/${c}` },
      { name: `Anadolu Mimarlık ve Mühendislik Danışmanlık`, phone: `${areaCode} 912 33 44`, address: `Kurtuluş Mah. Kıbrıs Cad. No:80, Merkez/${c}` },
      { name: `Zirve İnşaat Gayrimenkul Geliştirme Ltd. Şti.`, phone: `${areaCode} 914 55 66`, address: `Zafer Mah. Doğu Gazi Bulvarı No:65, Merkez/${c}` },
      { name: `Akıncılar Yapı ve Proje Danışmanlık A.Ş.`, phone: `${areaCode} 916 77 88`, address: `Mimar Sinan Mah. Ege Cad. No:85, Merkez/${c}` },
      { name: `Mega İnşaat Taahhüt ve Ticaret A.Ş.`, phone: `${areaCode} 918 99 00`, address: `Girne Mah. İstiklal Cad. No:100, Merkez/${c}` },
      { name: `Yıldızlar Mimarlık Proje ve Tasarım Ofisi`, phone: `${areaCode} 920 11 22`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:55, Merkez/${c}` },
      { name: `Prestij Yapı Malzemeleri ve İnşaat Ltd. Şti.`, phone: `${areaCode} 922 33 44`, address: `Yedi Eylül Mah. İzmir Bulvarı No:140, Merkez/${c}` },
      { name: `Ege Mühendislik ve Müşavirlik A.Ş.`, phone: `${areaCode} 924 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:70, Merkez/${c}` },
      { name: `Dinamik Gayrimenkul Yatırım ve Emlak`, phone: `${areaCode} 926 77 88`, address: `Meşrutiyet Mah. Kültür Cad. No:90, Merkez/${c}` },
      { name: `Lider İnşaat Taahhüt Sanayi Ticaret A.Ş.`, phone: `${areaCode} 928 99 00`, address: `Fatih Mah. Çamlık Cad. No:60, Merkez/${c}` },
      { name: `Körfez Yapı Denetim ve Mühendislik`, phone: `${areaCode} 930 11 22`, address: `Efeler Mah. Hürriyet Bulvarı No:120, Merkez/${c}` },
      { name: `Atlas Mimarlık ve Kentsel Dönüşüm Ltd. Şti.`, phone: `${areaCode} 932 33 44`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:50, Merkez/${c}` },
      { name: `Seçkin İnşaat ve Proje Geliştirme A.Ş.`, phone: `${areaCode} 934 55 66`, address: `Güzelhisar Mah. 50. Yıl Cad. No:35, Merkez/${c}` },
      { name: `Güven Yapı ve Gayrimenkul Danışmanlığı`, phone: `${areaCode} 936 77 88`, address: `Zafer Mah. İnovasyon Bulvarı No:45, Merkez/${c}` },
      { name: `Temel Mühendislik ve İnşaat San. Tic. Ltd. Şti.`, phone: `${areaCode} 938 99 00`, address: `Mimar Sinan Mah. Kolej Cad. No:25, Merkez/${c}` }
    ];
  }

  // 12. SAĞLIK, HASTANE, POLİKLİNİK, TIP, KLİNİK & ECZANE
  if (kwLower.includes("sağlık") || kwLower.includes("saglik") || kwLower.includes("hastane") || kwLower.includes("poliklinik") || kwLower.includes("tıp") || kwLower.includes("tip") || kwLower.includes("klinik") || kwLower.includes("eczane") || kwLower.includes("diş") || kwLower.includes("dis") || kwLower.includes("medikal") || kwLower.includes("fizik") || kwLower.includes("doktor") || kwLower.includes("hekim")) {
    return [
      { name: `Ege Özel Sağlık Hizmetleri ve Polikliniği (${c})`, phone: `${areaCode} 210 10 20`, address: `Efeler Mah. Sağlık Bulvarı No:10, Merkez/${c}` },
      { name: `Anadolu Tıp ve Tanı Merkezi A.Ş.`, phone: `${areaCode} 212 33 44`, address: `Kurtuluş Mah. Hastane Cad. No:22, Merkez/${c}` },
      { name: `Zirve Diş Sağlığı ve Ağız Diş Polikliniği`, phone: `${areaCode} 214 55 66`, address: `Zafer Mah. Doğu Gazi Bulvarı No:50, Merkez/${c}` },
      { name: `Akıncılar Medikal ve Sağlık Ürünleri Ltd. Şti.`, phone: `${areaCode} 216 77 88`, address: `Mimar Sinan Mah. Ege Cad. No:30, Merkez/${c}` },
      { name: `Mega Özel Sağlık ve Fizik Tedavi Merkezi`, phone: `${areaCode} 218 99 00`, address: `Girne Mah. İstiklal Cad. No:85, Merkez/${c}` },
      { name: `Yıldızlar Tıp Merkezi ve Polikliniği (${c})`, phone: `${areaCode} 220 11 22`, address: `Cumhuriyet Mah. İstasyon Bulvarı No:45, Merkez/${c}` },
      { name: `Prestij Diş Klinikleri ve Sağlık Hizmetleri`, phone: `${areaCode} 222 33 44`, address: `Yedi Eylül Mah. İzmir Bulvarı No:110, Merkez/${c}` },
      { name: `Ege Medikal Cihazlar ve Sağlık Ticaret A.Ş.`, phone: `${areaCode} 224 55 66`, address: `Hasanefendi Mah. Gençlik Cad. No:55, Merkez/${c}` },
      { name: `Dinamik Sağlık Hizmetleri ve Laboratuvarı`, phone: `${areaCode} 226 77 88`, address: `Meşrutiyet Mah. Kültür Cad. No:70, Merkez/${c}` },
      { name: `Lider Göz Sağlığı ve Tıp Merkezi (${c})`, phone: `${areaCode} 228 99 00`, address: `Fatih Mah. Çamlık Cad. No:45, Merkez/${c}` },
      { name: `Körfez Özel Sağlık Polikliniği Ltd. Şti.`, phone: `${areaCode} 230 11 22`, address: `Efeler Mah. Hürriyet Bulvarı No:100, Merkez/${c}` },
      { name: `Atlas Medikal ve Sağlık Danışmanlığı`, phone: `${areaCode} 232 33 44`, address: `Kurtuluş Mah. Süleyman Seba Cad. No:35, Merkez/${c}` },
      { name: `Seçkin Estetik ve Sağlık Hizmetleri A.Ş.`, phone: `${areaCode} 234 55 66`, address: `Güzelhisar Mah. 50. Yıl Cad. No:25, Merkez/${c}` },
      { name: `Güven Özel Sağlık ve Tıp Merkezi`, phone: `${areaCode} 236 77 88`, address: `Zafer Mah. İnovasyon Bulvarı No:30, Merkez/${c}` },
      { name: `Hayat Diş Sağlığı ve Polikliniği (${c})`, phone: `${areaCode} 238 99 00`, address: `Mimar Sinan Mah. Kolej Cad. No:15, Merkez/${c}` }
    ];
  }

  // 13. GENEL ARAMA (15 İşletme Üretimi - Aranan Kelimeyi İçeren Şık İsimler)
  const prefixes = ["Ege", "Merkez", "Kurumsal", "Yıldız", "Güven", "Tekno", "Global", "Anadolu", "Lider", "Prestij", "Zirve", "İleri", "Dinamik", "Başarı", "Uzman"];
  const mahalleler = ["Efeler", "Cumhuriyet", "Zafer", "Hasanefendi", "Kurtuluş", "Meşrutiyet", "Mimar Sinan", "Girne", "Yedi Eylül", "Fatih", "Güzelhisar", "Atatürk", "İstiklal", "Orta", "Yeni"];
  
  return Array.from({ length: 15 }, (_, i) => {
    const cleanKw = keyword.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return {
      name: `${prefixes[i]} ${cleanKw} Ticaret ve Danışmanlık A.Ş. (${c})`,
      phone: `${areaCode} ${410 + i} ${10 + i * 2} ${20 + i}`,
      address: `${mahalleler[i]} Mah. ${cleanKw} Bulvarı No:${(i + 1) * 4}, Merkez/${c}`
    };
  });
}

export async function GET(req: NextRequest) {
  const cors = getCorsHeaders(req);
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Yetkisiz! Lütfen CRM sistemine giriş yaptığınızdan emin olun." }, { status: 401, headers: cors });

  const user = session.user as any;
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  const keyword = searchParams.get("keyword") || "";

  if (!city.trim() || !keyword.trim()) {
    return NextResponse.json({ error: "Lütfen şehir ve anahtar kelime belirtin." }, { status: 400, headers: cors });
  }

  const queryKey = `${city.trim()}_${keyword.trim()}`.toLowerCase();

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let quota = await prisma.apiQuotaUsage.findUnique({ where: { monthKey } });
  if (!quota) {
    quota = await prisma.apiQuotaUsage.create({
      data: { monthKey, count: 0, maxLimit: 4000 }
    });
  }

  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const cached = await prisma.marketResearchCache.findUnique({ where: { queryKey } });

  let items: ResearchItem[] = [];
  let isFromCache = false;

  if (cached && cached.createdAt > thirtyDaysAgo) {
    try {
      items = JSON.parse(cached.results);
      if (items.length > 0) {
        // Önbellekteki veriler eski hatalı eşleşmelerden geliyorsa önbelleği geçersiz kıl ve yeni motorla yeniden üret
        const firstItemName = (items[0].name || "").toLowerCase();
        const kwL = keyword.toLowerCase();
        const isDilSearch = kwL.includes("dil") || kwL.includes("ingiliz") || kwL.includes("english") || kwL.includes("yabancı") || kwL.includes("yabanci") || kwL.includes("toefl") || kwL.includes("ielts");
        const hasDilInResult = firstItemName.includes("american life") || firstItemName.includes("ingiliz kültür") || firstItemName.includes("akın dil") || firstItemName.includes("modadil") || firstItemName.includes("wall street") || firstItemName.includes("just english") || firstItemName.includes("british town") || firstItemName.includes("berlitz") || firstItemName.includes("dilko") || firstItemName.includes("oxford academy") || firstItemName.includes("tömer") || firstItemName.includes("cambridge academy");
        const isGenericFallback = firstItemName.includes("ticaret ve danışmanlık a.ş.");

        if ((!isDilSearch && hasDilInResult) || isGenericFallback) {
          items = [];
          isFromCache = false;
        } else {
          isFromCache = true;
        }
      } else {
        isFromCache = true;
      }
    } catch (e) {
      console.error("Cache ayrıştırma hatası:", e);
    }
  }

  if (!isFromCache) {
    if (quota.count >= quota.maxLimit) {
      return NextResponse.json({
        error: "Aylık ücretsiz API kotanız (4000) dolmuştur. Bütçe aşımı olmaması için yeni dış aramalar engellendi.",
        quota: { used: quota.count, maxLimit: quota.maxLimit, fromCache: false }
      }, { status: 429, headers: cors });
    }

    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (googleApiKey) {
      try {
        const queryStr = `${keyword} in ${city}, Turkey`;
        const googleRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(queryStr)}&key=${googleApiKey}&language=tr`);
        const googleData = await googleRes.json();

        if (googleData.results && googleData.results.length > 0) {
          items = googleData.results.slice(0, 50).map((r: any) => ({
            name: r.name || "",
            phone: r.formatted_phone_number || "",
            address: r.formatted_address || city,
          }));
        }

        await prisma.apiQuotaUsage.update({
          where: { monthKey },
          data: { count: { increment: 1 } }
        });
        quota.count += 1;
      } catch (err) {
        console.error("Google Places arama hatası:", err);
      }
    }

    if (items.length === 0) {
      try {
        const queryStr = `${keyword} ${city}`;
        const osmRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(queryStr)}&format=json&addressdetails=1&extratags=1&limit=50`, {
          headers: { 'User-Agent': 'AIESEC-CRM-B2B/1.0' }
        });
        const osmData = await osmRes.json();

        if (Array.isArray(osmData) && osmData.length > 0) {
          items = osmData.map((r: any) => ({
            name: r.display_name?.split(',')[0] || r.name || keyword,
            phone: r.extratags?.contact?.phone || r.extratags?.phone || "",
            address: r.display_name || city,
          }));
        }
      } catch (err) {
        console.error("OSM arama hatası:", err);
      }
    }

    // Harita servislerinden (Google & OSM) sonuç çıkmazsa sahte/simüle veri eklenmez.

    if (items.length > 0) {
      const nowTs = Math.floor(Date.now() / 1000);
      await prisma.marketResearchCache.upsert({
        where: { queryKey },
        update: { results: JSON.stringify(items), createdAt: nowTs },
        create: { queryKey, results: JSON.stringify(items), createdAt: nowTs }
      });
    }
  }

  // 4. ŞUBE VE TELEFON BAZLI KESİN ÇAKIŞMA KONTROLÜ
  const allCompanies = await prisma.company.findMany({
    select: {
      id: true,
      name: true,
      phone: true,
      status: true,
      chapter: true,
      updatedAt: true,
      managers: { select: { id: true, name: true } }
    }
  });

  // KURAL 1: Kesişmeyi yalnızca kullanıcının kendi şubesiyle yap (Başka şube kayıtları kesinlikle gizlenir)
  const myChapterCompanies = NATIONAL_ROLES.includes(user.role)
    ? allCompanies
    : allCompanies.filter(c => (c.chapter || '').toLowerCase().trim() === (user.chapter || '').toLowerCase().trim());

  const enrichItem = (item: any) => {
    const normPhone = item.phone?.replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '') || '';
    const normName = item.name?.toLowerCase().trim() || '';

    // KURAL 2: Önce telefon numarasına göre kesin kontrol
    let match = myChapterCompanies.find(c => {
      const cPhone = (c.phone || '').replace(/[\s\-\(\)\+]/g, '').replace(/^90/, '').replace(/^0/, '');
      return normPhone && cPhone && (normPhone.includes(cPhone) || cPhone.includes(normPhone)) && normPhone.length >= 7;
    });

    // KURAL 3: Telefon yoksa veya eşleşmediyse isim ve kelime bazlı akıllı eşleşmeye bak
    if (!match) {
      match = myChapterCompanies.find(c => {
        const cName = (c.name || '').toLowerCase().trim();
        if (!normName || !cName) return false;
        if (normName === cName || cName.includes(normName) || normName.includes(cName)) return true;

        // Kelime bazlı akıllı örtüşme (örn: "Aydın İngiliz Kültür" ile "İngiliz Kültür Derneği")
        const ignoreWords = ['özel', 'okulu', 'okulları', 'koleji', 'kursu', 'merkezi', 'şubesi', 'kampüsü', 'aydın', 'istanbul', 'izmir', 'ankara', 'ticaret', 'sanayi', 'a.ş.', 'ltd.', 'şti.', 've'];
        const getWords = (str: string) => str.split(/[\s\-\(\)\.,\/]+/).filter(w => w.length > 3 && !ignoreWords.includes(w));
        
        const normWords = getWords(normName);
        const cWords = getWords(cName);
        
        if (normWords.length >= 2 && cWords.length >= 2) {
          const commonCount = normWords.filter(w => cWords.includes(w)).length;
          if (commonCount >= 2) return true;
        }
        return false;
      });
    }

    let matchStatus: 'NONE' | 'SAME_CHAPTER' = 'NONE';
    let matchedCompany = null;

    if (match) {
      matchStatus = 'SAME_CHAPTER';
      matchedCompany = {
        id: match.id,
        name: match.name,
        status: match.status,
        chapter: match.chapter,
        managers: match.managers,
        lastActivityDate: match.updatedAt
      };
    }

    return {
      ...item,
      matchStatus,
      matchedCompany
    };
  };

  const enrichedItems = items.map(enrichItem);

  // Kullanıcının talebi: "şubemde kayıtlı kurumları göstermesin herseferinde yenileri çıksın"
  // Bu nedenle şubede kayıtlı olanları (SAME_CHAPTER) listeden tamamen çıkarıyoruz:
  // Sadece %100 GERÇEK (Google Haritalar ve OpenStreetMap'ten gelen) ve şubede KAYITLI OLMAYAN yeni kurumlar listelenir!
  const cleanItems = enrichedItems.filter(item => item.matchStatus !== 'SAME_CHAPTER');

  return NextResponse.json({
    items: cleanItems,
    quota: {
      used: quota.count,
      maxLimit: quota.maxLimit,
      fromCache: isFromCache,
    }
  }, { headers: cors });
}
