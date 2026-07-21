import nodemailer from 'nodemailer';
import config from '../config/config.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.email, 
    pass: config.password, 
  },
});

export const sendWelcomeEmail = async (userEmail: string, userName: string) => {
  try {
    const mailOptions = {
      from: `"ProveNode" <${config.email}>`,
      to: userEmail,
      subject: 'Welcome to ProveNode',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 420px; margin: 20px auto; padding: 32px 24px; border: 1px solid #f3f4f6; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);">
            
            <div style="text-align: center; margin-bottom: 20px;">
                <img src="https://res.cloudinary.com/doorp4zdu/image/upload/v1784609476/proveNode_logo_kjnuzj.png" alt="ProveNode" width="44" style="display: block; margin: 0 auto;" />
            </div>
            <h2 style="color: #09090b; font-size: 18px; font-weight: 600; text-align: center; margin-bottom: 24px; margin-top: 0; letter-spacing: -0.3px;">Welcome to ProveNode</h2>
            <p style="color: #09090b; font-size: 15px; font-weight: 600; margin-bottom: 12px;">Hi ${userName},</p>
            
            <p style="color: #3f3f46; font-size: 15px; line-height: 1.6; font-weight: 400; margin-bottom: 28px;">
                ProveNode is built to give you absolute control over your digital assets. You can now seamlessly protect your images and track their provenance.
            </p>
            
            <p style="color: #71717a; font-size: 14px; margin: 0 0 2px 0;">Best regards,</p>
            <p style="color: #18181b; font-size: 14px; font-weight: 600; margin: 0;">The ProveNode Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};