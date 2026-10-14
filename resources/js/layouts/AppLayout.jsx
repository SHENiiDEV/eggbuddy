import CookieBanner from '../components/CookieBanner.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import SiteHeader from '../components/SiteHeader.jsx';
import Toasts from '../components/Toasts.jsx';

export default function AppLayout({ children, bare = false }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className={`flex-1 ${bare ? '' : 'pb-20'}`}>{children}</main>
      <SiteFooter />
      <Toasts />
      <CookieBanner />
    </div>
  );
}

export const withLayout = (page) => <AppLayout>{page}</AppLayout>;
