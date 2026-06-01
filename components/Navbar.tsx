'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';
import { type SiteSettings, DEFAULT_SETTINGS } from '@/lib/supabase';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Members' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
];

export default function Navbar({ settings }: { settings?: SiteSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const currentSettings = settings || DEFAULT_SETTINGS;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src="/HOLLOW-UK.gif"
            alt="Hollow Logo"
            width={42}
            height={42}
            unoptimized
          />
          <div className={styles.logoText}>
            Hollow
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className={styles.desktopNav}>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href={currentSettings.discord_samp}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.navLink} ${styles.joinLink}`}
          >
            Join Discord
          </a>
        </div>

        {/* Hamburger Trigger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          {navLinks.map((link, i) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.mobileLink} ${pathname === link.href ? styles.mobileLinkActive : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className={styles.mobileSocials}>
          <a
            href={currentSettings.discord_samp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            Join Discord
          </a>
        </div>
      </div>
    </nav>
  );
}
