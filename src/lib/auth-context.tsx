import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { auth, firebaseReady, googleProvider } from './firebase';
import { getMe, feefloReady, type GeoPlan } from './feeflo';

export type SiteUser = { uid: string; email: string; name: string | null; picture: string | null };

type AuthValue = {
  user: SiteUser | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  isPro: boolean;
  plan: GeoPlan | null;
  /** The current Firebase ID token, or null when signed out / unconfigured. */
  getToken: () => Promise<string | null>;
  /** Re-read the plan from FeeFlo (after a purchase, for example). */
  refresh: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function toSiteUser(user: User): SiteUser {
  return { uid: user.uid, email: user.email || '', name: user.displayName, picture: user.photoURL };
}

function planIsActive(plan: GeoPlan | null): boolean {
  if (!plan || plan.plan !== 'pro' || !plan.planExpiresAt) return false;
  return new Date(plan.planExpiresAt).getTime() > Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SiteUser | null>(null);
  const [plan, setPlan] = useState<GeoPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firebaseUser = useRef<User | null>(null);

  const getToken = useCallback(async () => {
    return firebaseUser.current ? firebaseUser.current.getIdToken() : null;
  }, []);

  const loadPlan = useCallback(async () => {
    // The plan is advisory UI; a failure here must never block sign-in.
    if (!feefloReady || !firebaseUser.current) {
      setPlan(null);
      return;
    }
    try {
      const token = await firebaseUser.current.getIdToken();
      setPlan(await getMe(token));
    } catch {
      setPlan(null);
    }
  }, []);

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false);
      setError('Sign-in is not configured yet.');
      return;
    }
    return onAuthStateChanged(auth, async (fbUser) => {
      firebaseUser.current = fbUser;
      setUser(fbUser ? toSiteUser(fbUser) : null);
      setError(null);
      await loadPlan();
      setLoading(false);
    });
  }, [loadPlan]);

  const signIn = useCallback(async () => {
    if (!auth) throw new Error('Sign-in is not configured yet.');
    setError(null);
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await firebaseSignOut(auth);
    setPlan(null);
  }, []);

  const value = useMemo<AuthValue>(() => ({
    user,
    loading,
    error,
    configured: firebaseReady,
    isPro: planIsActive(plan),
    plan,
    getToken,
    refresh: loadPlan,
    signIn,
    signOut,
  }), [user, loading, error, plan, getToken, loadPlan, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}
