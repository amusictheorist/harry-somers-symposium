export async function handler() {
  const formId = process.env.FORM_ID;
  const apiToken = process.env.NETLIFY_API_TOKEN;
  
  try {
    const res = await fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer: ${apiToken}` }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Failed to fetch submissions' })
      };
    }

    const submissions = await res.json();
    return {
      statusCode: 200,
      body: JSON.stringify({ count: submissions.length })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
}