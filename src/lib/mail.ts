import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  tls: {
    rejectUnauthorized: false,
    minVersion: "TLSv1",
  },
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendVerificationCode(
  email: string,
  code: string,
  name: string
) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "AIESEC CRM — E-posta Dogrulama Kodu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background-color: #037ef3; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AIESEC CRM</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Merhaba, ${name}!</h2>
          <p>Hesabinizi dogrulamak icin asagidaki kodu kullanin:</p>
          <div style="background-color: #037ef3; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">Bu kod 10 dakika gecerlidir.</p>
          <p style="color: #666;">Eger bu islemi siz yapmadiysaniz bu emaili gormezden gelebilirsiniz.</p>
        </div>
      </div>
    `,
  });
}

export async function sendPasswordResetCode(
  email: string,
  code: string,
  name: string
) {
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: "AIESEC CRM — Şifre Sıfırlama Kodu",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <div style="background-color: #037ef3; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AIESEC CRM</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Merhaba, ${name}!</h2>
          <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
          <div style="background-color: #ef4444; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 20px;">Bu kod 10 dakika geçerlidir.</p>
          <p style="color: #666;">Eğer bu işlemi siz yapmadıysanız bu emaili görmezden gelebilirsiniz.</p>
        </div>
      </div>
    `,
  });
}

const STATUS_LABELS_TR: Record<string, string> = {
  CALL_AGAIN: "Tekrar Ara",
  NO_ANSWER: "Cevap Yok",
  NEGATIVE: "Negatif",
};

export async function sendInactiveCompanyNotification(
  email: string,
  name: string,
  companies: { name: string; status: string; daysSince: number }[]
) {
  const companyRows = companies
    .map(
      (c) =>
        `<tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${c.name}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb;">${STATUS_LABELS_TR[c.status] || c.status}</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #e5e7eb; color: #dc2626; font-weight: 600;">${c.daysSince} gün</td>
        </tr>`
    )
    .join("");

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: `AIESEC CRM — ${companies.length} şirket dikkatinizi bekliyor`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #037ef3; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">AIESEC CRM</h1>
        </div>
        <div style="padding: 30px; background-color: #f9f9f9;">
          <h2>Merhaba, ${name}!</h2>
          <p>Aşağıdaki şirketlere <strong>3 gündür</strong> herhangi bir işlem yapılmadı. Lütfen takip edin:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; background: white; border-radius: 8px; overflow: hidden;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #6b7280;">Şirket</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #6b7280;">Durum</th>
                <th style="padding: 10px 12px; text-align: left; font-size: 13px; color: #6b7280;">Son İşlem</th>
              </tr>
            </thead>
            <tbody>
              ${companyRows}
            </tbody>
          </table>
          <p style="color: #666; font-size: 13px; margin-top: 20px;">
            Bu bildirimi almak istemiyorsanız, profilinizden e-posta bildirimlerini kapatabilirsiniz.
          </p>
        </div>
      </div>
    `,
  });
}