import { readSession } from '../../server/auth.mjs';

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed.' });
  try {
    const user = readSession(request);
    return response.status(200).json({ user, entitlement: null });
  } catch {
    return response.status(503).json({ error: 'Session service is not configured.' });
  }
}
