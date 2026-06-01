'use client';

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './admin-layout.module.css';

function AdminProtectedContent({ children }: { children: React.ReactNode }) {
  const { user, loading, role, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/members', label: 'Members', icon: '👤' },
    { href: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { href: '/admin/news', label: 'News', icon: '📰' },
    { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ...(role === 'utama' ? [{ href: '/admin/users', label: 'Admins', icon: '🔑' }] : []),
  ];

  return (
    <div className={styles.adminLayout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarBrand}>
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

        <nav className={styles.sidebarNav}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${
                pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
                  ? styles.active
                  : ''
              }`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.userEmail}>{user.email}</span>
          </div>
          <button onClick={logout} className={styles.logoutBtn}>
            <span>🚪</span> Sign Out
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
            <Link href="/" target="_blank" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
              🌐 View Website
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
