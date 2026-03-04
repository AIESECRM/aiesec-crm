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