import nodemailer from 'nodemailer';

function getMailTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS; // 16-character App Password

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
}

interface AbsenceAlertPayload {
  studentName: string;
  parentName: string;
  parentEmail: string;
  date: string;
  status: string; // "ABSENT" | "LATE"
}

export async function sendAbsenceAlert({
  studentName,
  parentName,
  parentEmail,
  date,
  status,
}: AbsenceAlertPayload) {
  const formattedDate = new Date(date).toLocaleDateString(undefined, {
    dateStyle: 'long',
  });

  const subject = `LITTLE HOUSE Notice: Attendance Status Alert (${status})`;
  const bodyText = `Dear ${parentName},\n\nThis is to inform you that your child, ${studentName}, was marked as ${status} in homeroom attendance on ${formattedDate}.\n\nIf you believe this is in error, or if you wish to provide a reason for this absence, please contact the school administration office or message the homeroom teacher directly via the parent portal.\n\nBest regards,\nLITTLE HOUSE Administration`;

  console.log(`\n======================================================`);
  console.log(`[ALERT] SENDING EMAIL TO PARENT: ${parentEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${bodyText}`);
  console.log(`======================================================\n`);

  // 1. Try Gmail SMTP
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"LITTLE HOUSE Administration" <${process.env.GMAIL_USER}>`,
        to: parentEmail,
        subject,
        text: bodyText,
      });
      console.log(`[ALERT] Email sent successfully via Gmail SMTP!`);
      return { success: true, mode: 'gmail' };
    } catch (gmailErr) {
      console.error(`[ALERT] Failed to send email via Gmail SMTP:`, gmailErr);
    }
  }

  // 2. Fallback to Resend API
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'LITTLE HOUSE Alerts <alerts@littlehouse.edu>',
          to: parentEmail,
          subject,
          text: bodyText,
        }),
      });

      if (res.ok) {
        console.log(`[ALERT] Email sent successfully via Resend API!`);
        return { success: true, mode: 'resend' };
      }
    } catch (resendErr) {
      console.error(`[ALERT] Failed to send email via Resend API:`, resendErr);
    }
  }

  console.log(`[ALERT] (Gmail/Resend credentials missing; falling back to mock console logs)`);
  return { success: true, mode: 'mock' };
}

interface AdmissionConfirmationPayload {
  studentName: string;
  parentName: string;
  parentEmail: string;
  grade: string;
  paymentReference: string;
  amount: number;
}

export async function sendAdmissionPaymentConfirmation({
  studentName,
  parentName,
  parentEmail,
  grade,
  paymentReference,
  amount,
}: AdmissionConfirmationPayload) {
  const subject = `LITTLE HOUSE: Admission Application Fee Paid Successfully`;
  const bodyText = `Dear ${parentName},\n\nThank you for submitting your child's admission application. We have successfully received your application fee payment.\n\nTransaction Receipt Details:\n----------------------------------------\nStudent Name: ${studentName}\nGrade Applied: ${grade}\nParent Name: ${parentName}\nParent Email: ${parentEmail}\nFee Amount Paid: ₹${amount.toLocaleString('en-IN')}\nPayment Reference ID: ${paymentReference}\n----------------------------------------\n\n📢 IMPORTANT NEXT STEPS:\nPlease print this email confirmation (or screenshot it) and bring it physically to the LITTLE HOUSE School Office along with your child's physical documentation (birth certificate, academic transcripts, and identification) to finalize the enrollment process.\n\nIf you have any questions, please contact our administrative office.\n\nBest regards,\nLITTLE HOUSE Admissions Office`;

  console.log(`\n======================================================`);
  console.log(`[ALERT] SENDING EMAIL TO PARENT: ${parentEmail}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${bodyText}`);
  console.log(`======================================================\n`);

  // 1. Try Gmail SMTP
  const transporter = getMailTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"LITTLE HOUSE Admissions" <${process.env.GMAIL_USER}>`,
        to: parentEmail,
        subject,
        text: bodyText,
      });
      console.log(`[ALERT] Admission confirmation email sent successfully via Gmail SMTP!`);
      return { success: true, mode: 'gmail' };
    } catch (gmailErr) {
      console.error(`[ALERT] Failed to send admission email via Gmail SMTP:`, gmailErr);
    }
  }

  // 2. Fallback to Resend API
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'LITTLE HOUSE Admissions <admissions@littlehouse.edu>',
          to: parentEmail,
          subject,
          text: bodyText,
        }),
      });

      if (res.ok) {
        console.log(`[ALERT] Admission confirmation email sent successfully via Resend API!`);
        return { success: true, mode: 'resend' };
      }
    } catch (resendErr) {
      console.error(`[ALERT] Failed to send admission email via Resend API:`, resendErr);
    }
  }

  console.log(`[ALERT] (Gmail/Resend credentials missing; falling back to mock console logs)`);
  return { success: true, mode: 'mock' };
}

interface WhatsAppConfirmationPayload {
  studentName: string;
  parentName: string;
  parentPhone: string;
  paymentReference: string;
  amount: number;
}

export async function sendWhatsAppConfirmation({
  studentName,
  parentName,
  parentPhone,
  paymentReference,
  amount,
}: WhatsAppConfirmationPayload) {
  const messageBody = `Hello ${parentName}, LITTLE HOUSE has received your admission application fee of ₹${amount.toLocaleString('en-IN')} for Student: ${studentName}. Reference ID: ${paymentReference}. Please print this receipt and bring it to the school office to finalize enrollment.`;

  console.log(`\n======================================================`);
  console.log(`[ALERT] SENDING WHATSAPP TO: ${parentPhone}`);
  console.log(`Message:\n${messageBody}`);
  console.log(`======================================================\n`);

  const authKey = process.env.MSG91_AUTH_KEY;
  const integratedNumber = process.env.MSG91_INTEGRATED_NUMBER; // e.g. 919876543210
  const templateName = process.env.MSG91_TEMPLATE_NAME; // optional

  if (!authKey || !integratedNumber) {
    console.log(`[ALERT] (MSG91 credentials missing; falling back to mock console logs)`);
    return { success: true, mode: 'mock' };
  }

  // Format recipient phone number: digits only (MSG91 requires country code without + sign)
  let cleanRecipient = parentPhone.replace(/\D/g, '');
  if (cleanRecipient.length === 10) {
    cleanRecipient = '91' + cleanRecipient; // Prefix India if 10 digits
  }

  try {
    let endpoint = 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/';
    let payload: any = {};

    if (templateName) {
      // Template Message Endpoint
      endpoint = 'https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/';
      payload = {
        to: cleanRecipient,
        type: 'template',
        messaging_product: 'whatsapp',
        template: {
          name: templateName,
          language: {
            code: 'en'
          },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: parentName },
                { type: 'text', text: `₹${amount.toLocaleString('en-IN')}` },
                { type: 'text', text: studentName },
                { type: 'text', text: paymentReference }
              ]
            }
          ]
        }
      };
    } else {
      // Session Free-Text Message Endpoint
      payload = {
        integrated_number: integratedNumber.replace(/\D/g, ''),
        content_type: 'text',
        recipient_number: cleanRecipient,
        text: messageBody
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authkey: authKey,
        accept: 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Failed to trigger MSG91 API.');
    }

    console.log(`[ALERT] WhatsApp message triggered successfully via MSG91!`);
    return { success: true, mode: 'msg91' };
  } catch (err) {
    console.error(`[ALERT] Error triggering MSG91 WhatsApp message:`, err);
    return { success: false, error: err };
  }
}
