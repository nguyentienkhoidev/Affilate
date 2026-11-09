import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SiteHeadTelemetry from '@/components/seo/SiteHeadTelemetry';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeadTelemetry />
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
