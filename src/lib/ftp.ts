import * as ftp from 'basic-ftp';

/**
 * Dosya buffer'ını FTP ile sunucuya yükler.
 * @param buffer Yüklenecek dosyanın verisi
 * @param fileName Kaydedilecek dosyanın adı (örn: document-123.pdf)
 * @param subDir Opsiyonel alt klasör (örn: 'pp' -> uploads/pp)
 * @returns Başarılı olursa dosyanın public URL'sini döner.
 */
export async function uploadFileToFTP(buffer: Buffer, fileName: string, subDir?: string): Promise<string> {
  const client = new ftp.Client();
  client.ftp.verbose = false;

  const host = process.env.FTP_HOST || '';
  const user = process.env.FTP_USER || '';
  const password = process.env.FTP_PASS || '';
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const baseUploadDir = process.env.FTP_UPLOAD_DIR || 'httpdocs/uploads';
  const publicUrl = process.env.FTP_PUBLIC_URL || '';

  if (!host || !user || !password) {
    throw new Error('FTP yapılandırması eksik (.env kontrol edin)');
  }

  try {
    await client.access({ host, user, password, port, secure: false });

    // Hedef klasörü oluştur/git
    let finalUploadDir = baseUploadDir;
    if (subDir) {
        finalUploadDir = `${baseUploadDir.replace(/\/$/, '')}/${subDir}`;
    }
    
    await client.ensureDir(finalUploadDir);

    const stream = require('stream');
    const readStream = new stream.PassThrough();
    readStream.end(buffer);

    await client.uploadFrom(readStream, fileName);

    // Public URL'yi döndür
    const finalPublicUrl = subDir 
        ? `${publicUrl.replace(/\/$/, '')}/${subDir}/${fileName}`
        : `${publicUrl.replace(/\/$/, '')}/${fileName}`;

    return finalPublicUrl;
  } catch (err) {
    console.error('FTP Upload Hatası:', err);
    throw err;
  } finally {
    client.close();
  }
}

/**
 * FTP sunucusundan bir dökümanı indirir.
 */
export async function downloadFileFromFTP(fileName: string): Promise<Buffer> {
  const client = new ftp.Client();
  const host = process.env.FTP_HOST || '';
  const user = process.env.FTP_USER || '';
  const password = process.env.FTP_PASS || '';
  const port = parseInt(process.env.FTP_PORT || '21', 10);
  const uploadDir = process.env.FTP_UPLOAD_DIR || 'httpdocs/uploads';

  try {
    await client.access({ host, user, password, port, secure: false });
    await client.cd(uploadDir);

    const stream = require('stream');
    const writeStream = new stream.PassThrough();
    const chunks: any[] = [];
    
    writeStream.on('data', (chunk: any) => chunks.push(chunk));
    
    await client.downloadTo(writeStream, fileName);
    
    return Buffer.concat(chunks);
  } catch (err) {
    console.error('FTP Download Hatası:', err);
    throw err;
  } finally {
    client.close();
  }
}
