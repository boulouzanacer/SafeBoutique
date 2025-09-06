import nodemailer from 'nodemailer';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

// Configuration pour Gmail SMTP (gratuit)
function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    throw new Error('GMAIL_USER et GMAIL_APP_PASSWORD doivent être configurés');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export async function sendContactEmail(formData: ContactFormData): Promise<void> {
  const transporter = createTransporter();
  
  // Email à envoyer à l'administrateur
  const adminEmailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.GMAIL_USER, // L'email sera envoyé à votre adresse Gmail
    subject: `Nouveau message de contact: ${formData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">Nouveau message de contact</h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #555; margin-bottom: 5px;">Informations du contact:</h3>
          <p><strong>Nom:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          ${formData.phone ? `<p><strong>Téléphone:</strong> ${formData.phone}</p>` : ''}
          <p><strong>Sujet:</strong> ${formData.subject}</p>
        </div>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #555; margin-bottom: 10px;">Message:</h3>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
            ${formData.message.replace(/\n/g, '<br>')}
          </div>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Ce message a été envoyé depuis le formulaire de contact de SafeSoft Boutique.</p>
          <p>Date: ${new Date().toLocaleString('fr-FR')}</p>
        </div>
      </div>
    `,
  };

  // Email de confirmation automatique au client
  const clientConfirmationOptions = {
    from: process.env.GMAIL_USER,
    to: formData.email,
    subject: 'Confirmation de réception de votre message - SafeSoft Boutique',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #007bff; text-align: center;">SafeSoft Boutique</h2>
        
        <div style="margin: 20px 0;">
          <h3 style="color: #333;">Bonjour ${formData.name},</h3>
          <p>Nous avons bien reçu votre message et nous vous remercions de nous avoir contactés.</p>
          <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        </div>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h4 style="color: #555; margin-top: 0;">Récapitulatif de votre message:</h4>
          <p><strong>Sujet:</strong> ${formData.subject}</p>
          <p><strong>Message:</strong></p>
          <p style="font-style: italic;">"${formData.message}"</p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; text-align: center;">
          <p>Cordialement,<br>L'équipe SafeSoft Boutique</p>
        </div>
      </div>
    `,
  };

  try {
    // Envoyer l'email à l'admin
    await transporter.sendMail(adminEmailOptions);
    
    // Envoyer la confirmation au client
    await transporter.sendMail(clientConfirmationOptions);
    
    console.log('Emails envoyés avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'envoi des emails:', error);
    throw new Error('Échec de l\'envoi des emails');
  }
}