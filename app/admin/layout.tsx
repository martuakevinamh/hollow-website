'use client';

import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  Images,
  Newspaper,
  Settings,
  KeyRound,
  LogOut,
  Globe,
  X,
  Menu,
} from 'lucide-react';
import styles from './admin-layout.module.css';

function AdminProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, loading, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
  }, [user, loading, router, pathname]);


  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <div className={styles.spinner} />
        <p>Checking admin authorization...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect shortly in useEffect
  }

  const menuItems = [
    { href: '/admin',          label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/admin/members',  label: 'Members',   Icon: Users },
    { href: '/admin/gallery',  label: 'Gallery',   Icon: Images },
    { href: '/admin/news',     label: 'News',      Icon: Newspaper },
    { href: '/admin/settings', label: 'Settings',  Icon: Settings },
    ...(role === 'utama' ? [{ href: '/admin/users', label: 'Admins', Icon: KeyRound }] : []),
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Mobile Top Navbar */}
      <header className={styles.mobileNavbar}>
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar menu"
        >
          <Menu size={20} />
        </button>
        <div className={styles.mobileNavbarLogo}>
          <Image
            src="/HOLLOW-UK.gif"
            alt="Hollow Logo"
            width={32}
            height={32}
            unoptimized
          />
          <span>HOLLOW PANEL</span>
        </div>
        <Link href="/" target="_blank" className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.65rem', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Globe size={13} /> Site
        </Link>
      </header>

      {/* Backdrop for mobile sidebar drawer */}
      {sidebarOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (Responsive drawer on mobile) */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarBrand}>
          <div className={styles.brandMainInfo}>
            <Image
              src="/HOLLOW-UK.gif"
              alt="Hollow Logo"
              width={40}
              height={40}
              unoptimized
            />
            <div>
              <div className={styles.brandTitle}>HOLLOW PANEL</div>
              <div className={styles.brandSubtitle}>Admin Dashboard</div>
            </div>
          </div>
          {/* Close button visible only on mobile */}
          <button
            className={styles.sidebarCloseBtn}
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`${styles.navItem} ${
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? styles.active
                  : ''
              }`}
            >
              <item.Icon size={18} className={styles.navIcon} strokeWidth={1.75} />
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button onClick={logout} className={styles.logoutBtn}>
            <LogOut size={15} strokeWidth={1.75} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className={styles.mainContent}>
        <header className={styles.mainHeader}>
          <h2 className={styles.pageTitle}>
            {menuItems.find((item) => pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href)))?.label || 'Admin'}
          </h2>
          <div className={styles.headerActions}>
            <Link href="/" target="_blank" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Globe size={14} /> View Website
            </Link>
          </div>
        </header>
        <div className={styles.contentBody}>{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminProtectedContent>{children}</AdminProtectedContent>
    </AuthProvider>
  );
}
