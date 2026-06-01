import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Hollow — UK Gangster Roleplay Community',
  description: 'Komunitas gangster UK terkemuka di GTA SAMP dan GTA FiveM Roleplay. Bergabunglah dan rasakan pengalaman roleplay kelas dunia.',
};

const stats = [
  { value: '200+', label: 'Active Members' },
  { value: '5+', label: 'Tahun Berdiri' },
  { value: '2', label: 'Platform Aktif' },
  { value: '24/7', label: 'Server Online' },
];

const servers = [
  {
    name: 'GTA SA:MP',
    badge: 'SAMP',
    badgeClass: 'badge-samp',
    desc: 'Server roleplay SAMP kami menawarkan pengalaman UK gangster yang imersif dengan script custom dan event reguler.',
    features: ['Custom UK Gang Script', 'Event Mingguan', 'Economy System', 'Voice RP Support'],
  },
  {
    name: 'GTA FiveM',
    badge: 'FIVEM',
    badgeClass: 'badge-fivem',
    desc: 'Di FiveM, Hollow menghadirkan roleplay high-quality dengan grafis realistis dan mekanik gangster modern.',
    features: ['High-Quality Graphics', 'Advanced RP Mechanics', 'Custom Maps & MLOs', 'Active Community'],
  },
];

const features = [
  {
    icon: '⚔️',
    title: 'Gang Warfare',
    desc: 'Rebut wilayah, lindungi blok, dan dominasi jalanan dalam perang gang yang epik.',
  },
  {
    icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    title: 'UK Authentic',
    desc: 'Tema UK sejati — dari slang, fashion, hingga budaya street yang autentik di dunia RP.',
  },
  {
    icon: '👥',
    title: 'Komunitas Solid',
    desc: 'Lebih dari 200 anggota aktif yang saling mendukung dan menjaga kesolidan gang.',
  },
  {
    icon: '🎭',
    title: 'Deep Roleplay',
    desc: 'Cerita, karakter, dan interaksi yang mendalam untuk pengalaman RP yang tak terlupakan.',
  },
  {
    icon: '🏆',
    title: 'Rank System',
    desc: 'Naiki hirarki dari Street Soldier hingga Boss lewat dedikasi dan loyalitas.',
  },
  {
    icon: '🎮',
    title: 'Multi Platform',
    desc: 'Hadir di GTA SAMP dan GTA FiveM — pilih platform favoritmu dan bergabung bersama kami.',
  },
];

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className={styles.hero} id="hero">
        {/* Background */}
        <div className={styles.heroBg}>
          <Image
            src="/BIG_FLAG.jpg"
            alt="Hollow — Union Jack"
            fill
            priority
            quality={90}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className={styles.heroOverlay} />
          <div className={styles.heroNoise} aria-hidden="true" />
        </div>

        <div className={`container ${styles.heroContent}`}>
          {/* Logo GIF */}
          <div className={styles.heroLogo}>
            <Image
              src="/HOLLOW-UK.gif"
              alt="Hollow Logo"
              width={160}
              height={160}
              unoptimized
              priority
            />
          </div>

          <div className={styles.heroTag}>
            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 GTA SAMP & FIVEM ROLEPLAY</span>
          </div>

          <h1 className={styles.heroTitle}>
            HOLLOW
          </h1>

          <p className={styles.heroSubtitle}>
            Komunitas Gangster UK Terkemuka di Dunia Roleplay
          </p>

          <p className={styles.heroDesc}>
            Dari jalanan London ke server roleplay — Hollow menghadirkan pengalaman
            gang UK yang autentik, solid, dan penuh adrenalin di GTA SAMP dan GTA FiveM.
          </p>

          <div className={styles.heroCtas}>
            <Link href="/join" className="btn btn-primary" id="hero-join-btn">
              Join Hollow →
            </Link>
            <Link href="/about" className="btn btn-outline" id="hero-about-btn">
              Learn More
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={styles.scrollIndicator} aria-hidden="true">
          <span className={styles.scrollDot} />
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsSection}>
        <div className="container">
          <div className={styles.statsGrid}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.statCard}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVERS */}
      <section className={styles.serversSection} id="servers">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Platform Kami</span>
            <h2 className="section-title">Aktif di <span>2 Server</span></h2>
            <p className="section-desc">
              Hollow hadir di dua platform GTA roleplay terpopuler — pilih yang sesuai gaya bermainmu.
            </p>
          </div>

          <div className={styles.serverGrid}>
            {servers.map((server) => (
              <div key={server.name} className={styles.serverCard}>
                <div className={styles.serverCardHeader}>
                  <h3 className={styles.serverCardName}>{server.name}</h3>
                  <span className={`badge ${server.badgeClass}`}>{server.badge}</span>
                </div>
                <p className={styles.serverCardDesc}>{server.desc}</p>
                <ul className={styles.serverFeatures}>
                  {server.features.map((f) => (
                    <li key={f} className={styles.serverFeature}>
                      <span className={styles.featureCheck}>✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/join" className={`btn btn-primary ${styles.serverBtn}`}>
                  Bergabung →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection} id="features">
        <div className={styles.featuresBg} aria-hidden="true" />
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Kenapa Hollow</span>
            <h2 className="section-title">Lebih dari Sekedar <span>Gang</span></h2>
            <p className="section-desc">
              Kami bukan hanya komunitas — kami adalah keluarga yang membangun dunia roleplay terbaik bersama.
            </p>
          </div>

          <div className="grid-3">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                className={styles.featureCard}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={styles.featureIcon}>{feat.icon}</div>
                <h3 className={styles.featureTitle}>{feat.title}</h3>
                <p className={styles.featureDesc}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREVIEW MEMBERS */}
      <section className={styles.previewSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Crew</span>
            <h2 className="section-title">Meet <span>Hollow</span></h2>
            <p className="section-desc">Kenali para loyalis yang menjaga jalan dan menjunjung nama Hollow.</p>
          </div>
          <div className={styles.previewCta}>
            <Link href="/members" className="btn btn-navy" id="view-members-btn">
              Lihat Semua Member →
            </Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <div className={styles.finalCtaBg}>
          <Image
            src="/BIG_FLAG.jpg"
            alt=""
            fill
            style={{ objectFit: 'cover' }}
            aria-hidden="true"
          />
          <div className={styles.finalCtaOverlay} />
        </div>
        <div className={`container ${styles.finalCtaContent}`}>
          <h2 className={styles.finalCtaTitle}>Siap Jadi Bagian dari Hollow?</h2>
          <p className={styles.finalCtaDesc}>
            Bergabunglah di Discord kami dan mulai perjalananmu sebagai anggota
            komunitas gangster UK terbaik di dunia roleplay.
          </p>
          <div className={styles.finalCtaBtns}>
            <Link href="/join" className="btn btn-primary" id="final-cta-join">
              Join Hollow →
            </Link>
            <Link href="/gallery" className="btn btn-outline" id="final-cta-gallery">
              Lihat Gallery
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
