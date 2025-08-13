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
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: 'Method not allowed' };
    }

    const submission = JSON.parse(event.body);

    const res = await fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer ${apiToken}` }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Failed to fetch submissions count' })
      };
    }

    const submissions = await res.json();
    const count = submissions.length;

    const emailContent = `
    New form received!
    
    Name: ${submission.data.name || 'N/A'}
    Email: ${submission.data.email || 'N/A'}
    Dietary restrictions: ${submission.data.dietary || 'N/A'}
    Other dietary restrictions: ${submission.data.dietary_other || 'N/A'}

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
      const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error) {
      console.error('Brevo API error:', error.response?.body || error.message);
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Bad Request',
          details: error.response?.body || error.message
        })
      };
    }

    return { statusCode: 200, body: 'Email sent successfully' };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}
