import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Plans from './pages/Plans';
import Auth from './pages/Auth';
import Download from './pages/Download';
import Support from './pages/Support';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import NotFound from './pages/NotFound';
import Account from './pages/Account';
import PaymentSuccess from './pages/PaymentSuccess';
import Admin from './pages/Admin';
import { AuthProvider } from './lib/auth-context';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A link that names a section should land on it; everything else starts at the top.
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/support" element={<Support />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/download" element={<Download />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/account" element={<Account />} />
        <Route path="/my-plans" element={<Account />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
