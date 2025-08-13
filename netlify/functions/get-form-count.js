export async function handler() {
  const formId = process.env.FORM_ID;
  const apiToken = process.env.NETLIFY_API_TOKEN;
  
  try {
    const res = await fetch(`https://api.netlify.com/api/v1/forms/${formId}/submissions`, {
      headers: { Authorization: `Bearer ${apiToken}` }
    });

    if (!res.ok) {
      return {
        statusCode: res.status,
        body: JSON.stringify({ error: 'Failed to fetch submissions' })
      };
    }
    console.log("FORM_ID:", process.env.FORM_ID);
    console.log("API Token starts with:", process.env.NETLIFY_API_TOKEN?.slice(0, 5));

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