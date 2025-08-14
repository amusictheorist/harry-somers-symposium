import SibApiV3Sdk from 'sib-api-v3-sdk';

const defaultClient = SibApiV3Sdk.ApiClient.instance;
let brevoApi = defaultClient.authentications['api-key'];
brevoApi.apiKey = process.env.BREVO_API_KEY;

const formId = process.env.FORM_ID;
const sender = process.env.NOTIFY_EMAIL;
const recipient = process.env.RECIPIENT;
const apiToken = process.env.NETLIFY_API_TOKEN;

export async function handler(event) {
  try {
    const body = JSON.parse(event.body);
    const submission = body.payload;
    const fields = submission.data || {};

    const res = await fetch(
      `https://api.netlify.com/api/v1/forms/${formId}/submissions`,
      {
        headers: { Authorization: `Bearer ${apiToken}` }
      }
    );

    if (!res.ok) {
      console.error(`Failed to fetch submissions: ${res.status}`);
      return { statusCode: res.status, body: 'Failed to fetch submission count' }
    }

    const submissions = await res.json();
    const count = submissions.length;

    const emailContent = `
    New form submission received!
    
    Name: ${fields.name || 'N/A'}
    Email: ${fields.email || 'N/A'}
    Dietary restrictions: ${fields.dietary || 'N/A'}
    Other dietary restrictions: ${fields.dietary_other || 'N/A'}
    
    Total submissions so far: ${count}
    `;

    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = {
      sender: { email: sender, name: 'Form Notifications' },
      to: [{ email: recipient }],
      subject: 'New Symposium Registration',
      textContent: emailContent
    };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Brevo API error:', error.response?.body || error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Email send failed',
          details: error.response?.body || error.message
        })
      };
    }

    return { statusCode: 200, body: 'Webhook processed successfully' };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}