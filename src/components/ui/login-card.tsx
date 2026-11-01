import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { useAuth } from '../../lib/auth-context';

export default function LoginCard() {
  const { user, configured, signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const destination = params.get('next') === 'plans' ? '/plans' : '/my-plans';
  const [status, setStatus] = useState<string | null>(
    params.get('error') === 'google' ? 'Google sign-in could not be completed. Please try again.' : null,
  );
  const [busy, setBusy] = useState(false);

  // Once Firebase reports a signed-in user, move on to the destination.
  useEffect(() => {
    if (user) navigate(destination, { replace: true });
  }, [user, destination, navigate]);

  async function onSignIn() {
    setBusy(true);
    setStatus(null);
    try {
      await signIn();
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setStatus(null);
      } else {
        setStatus((error as Error).message || 'Google sign-in could not be completed.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full text-left shadow-card">
      <CardHeader className="gap-1.5 p-6 pb-0 sm:p-8 sm:pb-0">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="font-display text-xl font-medium tracking-tight text-ink sm:text-2xl">Sign in</CardTitle>
          <Badge variant="secondary" className="shrink-0 uppercase tracking-[0.14em]">Optional</Badge>
        </div>
        <CardDescription className="text-sm font-normal leading-relaxed text-ink/70">
          Use your Google account to view your Geo Snap account. The Android camera works without signing in.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-6 sm:p-8 sm:pt-6">
        <button
          type="button"
          onClick={() => void onSignIn()}
          disabled={!configured || busy}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-card text-sm font-medium text-ink transition-colors hover:bg-cream disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.3 0 24 0 14.6 0 6.4 5.4 2.6 13.2l7.9 6.2C12.3 13.3 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.1 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" />
            <path fill="#FBBC05" d="M10.5 28.4a14.5 14.5 0 0 1 0-8.8l-7.9-6.2a24 24 0 0 0 0 21.2l7.9-6.2z" />
            <path fill="#34A853" d="M24 48c6.3 0 11.6-2.1 15.5-5.7l-7.1-5.5c-2 1.3-4.6 2.1-8.4 2.1-6.3 0-11.7-3.8-13.6-9.1l-7.9 6.2C6.4 42.6 14.6 48 24 48z" />
          </svg>
          {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        {!configured && <p role="alert" className="mt-4 text-sm text-[#B3261E]">Google sign-in is not configured yet.</p>}
        {status && <p role="alert" className="mt-4 rounded-xl border border-[#B3261E]/25 bg-[#B3261E]/[0.06] px-4 py-3 text-sm text-[#B3261E]">{status}</p>}
      </CardContent>
      <CardFooter className="p-6 pt-0 sm:p-8 sm:pt-0">
        <p className="text-xs font-normal leading-relaxed text-ink/70">
          By continuing you agree to the <Link to="/terms" className="underline underline-offset-4">Terms &amp; Conditions</Link> and <Link to="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
        </p>
      </CardFooter>
    </Card>
  );
}
