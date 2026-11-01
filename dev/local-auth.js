import { loadEnv } from 'vite';

export default function localAuth() {
  return {
    name: 'local-auth-api',
    config(_config, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      if (!process.env.SESSION_SECRET && env.SESSION_SECRET) process.env.SESSION_SECRET = env.SESSION_SECRET;
      if (!process.env.VITE_GOOGLE_CLIENT_ID && env.VITE_GOOGLE_CLIENT_ID) process.env.VITE_GOOGLE_CLIENT_ID = env.VITE_GOOGLE_CLIENT_ID;
    },
    configureServer(server) {
      server.middlewares.use('/api/auth', async (request, response, next) => {
        const route = request.url?.split('?')[0].replace(/^\//, '');
        if (!route || !['google', 'google-redirect', 'session', 'logout'].includes(route)) return next();
        try {
          if (request.method === 'POST') {
            let raw = '';
            for await (const chunk of request) {
              raw += chunk.toString();
              if (raw.length > 20_000) {
                response.statusCode = 413;
                response.end('Request too large.');
                return;
              }
            }
            request.body = request.headers['content-type']?.includes('application/json')
              ? JSON.parse(raw || '{}')
              : Object.fromEntries(new URLSearchParams(raw));
          }
          response.status = (code) => { response.statusCode = code; return response; };
          response.json = (body) => {
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify(body));
            return response;
          };
          const handler = (await import(`../api/auth/${route}.mjs`)).default;
          await handler(request, response);
        } catch (error) { next(error); }
      });
    },
  };
}
