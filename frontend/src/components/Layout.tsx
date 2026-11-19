import { Link, Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <>
      <header className="header">
        <div className="container header__inner">
          <Link to="/" className="logo">🏠 NhàĐất</Link>
          <nav><Link to="/?listingType=SALE">Mua bán</Link> <Link to="/?listingType=RENT">Cho thuê</Link></nav>
        </div>
      </header>
      <main className="container"><Outlet /></main>
      <footer className="footer"><div className="container">© {new Date().getFullYear()} NhàĐất</div></footer>
    </>
  );
}
