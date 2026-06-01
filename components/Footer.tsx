import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { type SiteSettings, DEFAULT_SETTINGS } from '@/lib/supabase';

const pagesLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/members', label: 'Members' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/news', label: 'News' },
  { href: '/join', label: 'Join Us' },
];

function getSocialIcon(label: string) {
  switch (label.toLowerCase()) {
    case 'discord':
      return (
        <svg viewBox="0 0 127.14 96.36" width="18" height="18" fill="currentColor">
          <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.4-5c.87-.64,1.71-1.32,2.51-2a75.48,75.48,0,0,0,72.82,0c.8.71,1.64,1.39,2.51,2a68.43,68.43,0,0,1-10.4,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129,54.65,122.94,31.58,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.83,46,53.83,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.07,46,96.07,53,91,65.69,84.69,65.69Z"/>
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
        </svg>
      );
    case 'tiktok':
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23 1.02 1.27 2.45 2.15 4.02 2.51v3.91c-1.74-.06-3.43-.75-4.73-1.92-.25-.22-.48-.47-.69-.72v7.11c.04 3.63-2.31 7.02-5.85 7.84-3.23.83-6.73-.62-8.31-3.62-1.72-3.13-1.01-7.25 1.63-9.58 1.94-1.77 4.76-2.28 7.18-1.35v4.06c-1.28-.62-2.88-.47-4.01.4-.99.73-1.42 2.05-1.11 3.25.32 1.34 1.55 2.37 2.93 2.43 1.61.1 3.09-1.07 3.32-2.67.06-.39.06-.79.06-1.18v-11.66zm0 0"/>
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.52 3.5 12 3.5 12 3.5s-7.52 0-9.388.505a3.003 3.003 0 0 0-2.11 2.108C0 8.03 0 12 0 12s0 3.97.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.48 20.5 12 20.5 12 20.5s7.52 0 9.388-.505a3.003 3.003 0 0 0 2.11-2.108C24 15.97 24 12 24 12s0-3.97-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    default:
      return null;
  }
}

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const currentSettings = settings || DEFAULT_SETTINGS;

  const socialSAMP = [
    { href: currentSettings.discord_samp, label: 'Discord' },
    { href: currentSettings.tiktok_samp, label: 'TikTok' },
    { href: currentSettings.youtube_samp, label: 'YouTube' },
    { href: currentSettings.instagram_samp, label: 'Instagram' },
  ].filter(s => s.href);

  const socialFiveM = [
    { href: currentSettings.discord_fivem, label: 'Discord' },
    { href: currentSettings.tiktok_fivem, label: 'TikTok' },
    { href: currentSettings.youtube_fivem, label: 'YouTube' },
    { href: currentSettings.instagram_fivem, label: 'Instagram' },
  ].filter(s => s.href);

  return (
    <footer className={styles.footer}>
      <div className={styles.footerBg} aria-hidden="true" />

      {/* CTA Banner */}
      <div className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2 className={styles.ctaTitle}>Ready to Join Hollow?</h2>
              <p className={styles.ctaDesc}>
                Bergabunglah dengan komunitas roleplay UK gangster terbaik di GTA SAMP & FiveM
              </p>
            </div>
            <a
              href={currentSettings.discord_samp}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              Join Discord →
            </a>
          </div>
        </div>
      </div>

      <div className="grunge-divider" />

      {/* Main Footer */}
      <div className={`container ${styles.mainFooter}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <Link href="/" className={styles.brandLogo}>
            <Image
              src="/HOLLOW-UK.gif"
              alt="Hollow"
              width={56}
              height={56}
              unoptimized
            />
            <div>
              <div className={styles.brandName}>Hollow</div>
              <div className={styles.brandTagline}>UK Gangster RP Community</div>
            </div>
          </Link>
          <p className={styles.brandDesc}>
            Komunitas roleplay gangster bertema UK yang berdiri di dunia GTA SAMP dan GTA FiveM.
            Loyalitas, Kehormatan, Jalan Kami.
          </p>

          {/* SAMP Socials */}
          <div className={styles.socialGroup}>
            <div className={styles.socialGroupTitle}>
              <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span> GTA SA:MP (The Hollow Block)
            </div>
            <div className={styles.socialRow}>
              {socialSAMP.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label={`SAMP ${s.label}`}
                  title={`SAMP ${s.label}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {getSocialIcon(s.label)}
                  </span>
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* FiveM Socials */}
          <div className={styles.socialGroup}>
            <div className={styles.socialGroupTitle}>
              <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿</span> GTA FiveM (The Hollow Northenwall)
            </div>
            <div className={styles.socialRow}>
              {socialFiveM.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialBtn}
                  aria-label={`FiveM ${s.label}`}
                  title={`FiveM ${s.label}`}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {getSocialIcon(s.label)}
                  </span>
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Pages */}
        <div className={styles.linkGroup}>
          <h3 className={styles.groupTitle}>Halaman</h3>
          <ul className={styles.linkList}>
            {pagesLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={styles.footerLink}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Servers */}
        <div className={styles.linkGroup}>
          <h3 className={styles.groupTitle}>Server</h3>
          <div className={styles.serverCards}>
            <div className={styles.serverCard}>
              <div className={styles.serverDot} data-status="active" />
              <div>
                <div className={styles.serverName}>GTA SAMP</div>
                <div className={styles.serverStatus}>Active Server</div>
              </div>
            </div>
            <div className={styles.serverCard}>
              <div className={styles.serverDot} data-status="active" />
              <div>
                <div className={styles.serverName}>GTA FiveM</div>
                <div className={styles.serverStatus}>Active Server</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className="container">
          <div className={styles.bottomInner}>
            <span className={styles.copyright}>
              © {new Date().getFullYear()} Hollow. All rights reserved.
            </span>
            <div className={styles.bottomTags}>
              <span className={styles.tag}>GTA SAMP</span>
              <span className={styles.tag}>GTA FiveM</span>
              <span className={styles.tag}>UK Roleplay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
