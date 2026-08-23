import Footer from '../Footer';
import Header from '../Header';

export default function LayoutPrincipal({ children }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
