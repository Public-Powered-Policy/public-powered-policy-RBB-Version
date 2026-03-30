/* =============================================================
   PUBLIC POWERED POLICY — Contact Form Function
   Receives form submissions, checks honeypot, forwards to
   StaticForms for email delivery.

   Required environment variable in Netlify:
     STATICFORMS_KEY  — your StaticForms access key
   ============================================================= */

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Parse URL-encoded form body
  const params  = new URLSearchParams(event.body);
  const name    = params.get('name')      || '';
  const email   = params.get('email')     || '';
  const message = params.get('message')   || '';
  const honeypot = params.get('bot-field') || '';

  // Detect AJAX vs. traditional form submit
  const wantsJson = (event.headers['accept'] || '').includes('application/json');

  // Honeypot: silently succeed so bots think it worked
  if (honeypot) {
    return wantsJson
      ? { statusCode: 200, body: JSON.stringify({ success: true }) }
      : { statusCode: 302, headers: { Location: '/thank-you/' } };
  }

  // Basic validation
  if (!email || !message) {
    return wantsJson
      ? { statusCode: 400, body: JSON.stringify({ success: false, error: 'Missing required fields' }) }
      : { statusCode: 302, headers: { Location: '/contact/' } };
  }

  // Forward to StaticForms
  try {
    const response = await fetch('https://api.staticforms.xyz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessKey: process.env.STATICFORMS_KEY,
        name,
        email,
        message
      })
    });

    if (!response.ok) throw new Error('StaticForms error');

    return wantsJson
      ? { statusCode: 200, body: JSON.stringify({ success: true }) }
      : { statusCode: 302, headers: { Location: '/thank-you/' } };

  } catch {
    return wantsJson
      ? { statusCode: 500, body: JSON.stringify({ success: false }) }
      : { statusCode: 302, headers: { Location: '/contact/' } };
  }
};
