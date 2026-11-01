import { Navigate, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell';
import Seo from '../components/Seo';
import LoginCard from '../components/ui/login-card';
import { useAuth } from '../lib/auth-context';

export default function Auth() {
  const { user, loading } = useAuth();
  const [params] = useSearchParams();

  if (!loading && user) {
    return <Navigate to={params.get('next') === 'plans' ? '/plans' : '/my-plans'} replace />;
  }

  return (
    <PageShell
      title="Sign in"
      eyebrow="Welcome"
      center
    >
      <Seo
        title="Sign in - Geo Snap - NLR"
        description="Sign in to Geo Snap - NLR with Google. The Android camera keeps working on your device with no sign-in."
      />

      <p className="mx-auto mt-7 max-w-md text-sm font-normal leading-relaxed text-ink/85 sm:text-base">
        An account is optional. The camera, folders and vault work without one; sign in to view
        and manage your Pro plan.
      </p>

      <div className="mx-auto mt-10 max-w-md">
        <LoginCard />
      </div>
    </PageShell>
  );
}
