import * as ftp from 'basic-ftp';

/**
 * Dosya buffer'ını FTP ile sunucuya yükler.
 * @param buffer Yüklenecek dosyanın verisi
 * @param fileName Kaydedilecek dosyanın adı (örn: document-123.pdf)
 * @returns Başarılı olursa dosyanın public URL'sini döner.
 */
export async function uploadFileToFTP(buffer: Buffer, fileName: string): Promise<string> {
  const client = new ftp.Client();
  client.ftp.verbose = false; // Dev ortamında hata ayıklamak isterseniz true yapabilirsiniz.

  const host = process.env.FTP_HOST || '';
  const user = process.env.FTP_USER || '';
  const password = process.env.FTP_PASS || '';
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const uploadDir = process.env.FTP_UPLOAD_DIR || 'public_html/uploads';
  const publicUrl = process.env.FTP_PUBLIC_URL || '';

  if (!host || !user || !password) {
    throw new Error('FTP yapılandırması eksik (.env kontrol edin)');
  }

  try {
    // 1. FTP'ye bağlan
    await client.access({
      host,
      user,
      password,
      port,
      secure: false, // TLS gerekiyorsa true yapılmalı
    });

    // 2. Hedef klasöre git (yoksa FTP hatası verir, klasörün var olduğundan emin olunmalı)
    await client.cd(uploadDir);

    // 3. Dosyayı Ram'den Stream olarak yükle
    const stream = require('stream');
    const readStream = new stream.PassThrough();
    readStream.end(buffer);

    await client.uploadFrom(readStream, fileName);

    // 4. Public URL'yi döndür
    return `${publicUrl.replace(/\/$/, '')}/${fileName}`;
  } catch (err) {
    console.error('FTP Upload Hatası:', err);
    throw err;
  } finally {
    // Bağlantıyı güvenle kapat
    client.close();
  }
}
