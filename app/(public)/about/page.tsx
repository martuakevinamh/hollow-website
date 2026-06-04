import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Crown, Bird, Target, Handshake, Flame, Zap, Dumbbell, ShieldCheck, ScrollText, Users } from 'lucide-react';
import AboutTabs from '@/components/AboutTabs';
import styles from './about.module.css';
import { getSettings } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'About',
  description: 'Pelajari sejarah, filosofi, dan struktur hierarki Hollow — komunitas gangster UK di GTA SAMP dan FiveM.',
};

const hierarchy = [
  { rank: 'TOP OG / KING', icon: <Crown size={32} strokeWidth={1.5} />, color: '#FFD700', desc: 'Pendiri atau legend geng. High commander yang dihormati di seluruh block — pelaku utama di balik segala operasi.' },
  { rank: 'OG',            icon: <Bird size={32} strokeWidth={1.5} />, color: '#C0C0C0', desc: 'Original Gangsta. Senior berpengaruh, mantan Top Boy yang kini jadi panutan dan penasihat generasi bawah.' },
  { rank: 'Top Boy',       icon: <Target size={32} strokeWidth={1.5} />, color: '#B22234', desc: 'Pemimpin area atau blok. Bertanggung jawab atas operasi dan anggota di bawah kendalinya.' },
  { rank: 'Brudda',        icon: <Handshake size={32} strokeWidth={1.5} />, color: '#7ba7f7', desc: 'Anggota resmi geng. Loyal, sudah teruji, dan dianggap keluarga oleh seluruh block.' },
  { rank: 'Rude Boy',      icon: <Flame size={32} strokeWidth={1.5} />, color: '#f7a07b', desc: 'Pemuda aktif di jalan — keras, ambisius, dan mulai mendapat rasa hormat dari sesama.' },
  { rank: 'The Youth',     icon: <Zap size={32} strokeWidth={1.5} />, color: '#86efac', desc: 'Anak muda yang baru mulai ikut kegiatan geng dan belajar kode jalanan Hollow.' },
  { rank: 'Muscle',        icon: <Dumbbell size={32} strokeWidth={1.5} />, color: '#a0aec0', desc: 'Sering nongkrong bareng geng, belum resmi jadi anggota tapi sudah membuktikan kehadiran di block.' },
];

const values = [
  { title: 'Loyalty', desc: 'Loyalitas adalah fondasi utama. Pengkhianatan tidak akan pernah ditoleransi di Hollow.', icon: <Handshake size={36} strokeWidth={1.5} color="var(--crimson)" /> },
  { title: 'Respect', desc: 'Hormati setiap anggota — dari Associate hingga Boss. Rasa hormat membangun kesolidan.', icon: <ShieldCheck size={36} strokeWidth={1.5} color="var(--crimson)" /> },
  { title: 'Code', desc: 'Kami hidup dengan kode. Ada aturan yang tidak boleh dilanggar demi menjaga nama Hollow.', icon: <ScrollText size={36} strokeWidth={1.5} color="var(--crimson)" /> },
  { title: 'Brotherhood', desc: 'Lebih dari sekedar gang — kami adalah saudara yang saling jaga satu sama lain.', icon: <Users size={36} strokeWidth={1.5} color="var(--crimson)" /> },
];

export default async function AboutPage() {
  // Opt out of static prerendering — always fetch fresh settings from DB
  await connection();
  const settings = await getSettings();

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg}>
          <Image src="/BIG_FLAG.jpg" alt="" fill style={{ objectFit: 'cover' }} aria-hidden />
          <div className={styles.pageHeroOverlay} />
        </div>
        <div className={`container ${styles.pageHeroContent}`}>
          <span className="section-tag">Tentang Kami</span>
          <h1 className={styles.pageTitle}>Hollow</h1>
          <p className={styles.pageSubtitle}>Kisah, Nilai, dan Struktur</p>
        </div>
      </section>

      {/* Story */}
      <section className={styles.storySection}>
        <div className="container">
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <span className="section-tag">Sejarah</span>
              <h2 className={styles.storyTitle}>{settings.about_story_title}</h2>
              <div className={styles.storyContent}>
                <p style={{ marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                  {settings.about_story_desc}
                </p>
                <AboutTabs settings={settings} />
              </div>
            </div>
            <div className={styles.storyVisual}>
              <div className={styles.storyImgWrapper}>
                <Image
                  src="/HOLLOW-UK.gif"
                  alt="Hollow Logo"
                  width={280}
                  height={280}
                  unoptimized
                />
              </div>
              <div className={styles.storyBadge}>
                <span className={styles.badgeYear}>2019</span>
                <span className={styles.badgeLabel}>Tahun Berdiri</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className={styles.valuesSection}>
        <div className={styles.valuesBg} aria-hidden="true" />
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Filosofi</span>
            <h2 className="section-title">Nilai-Nilai <span>Hollow</span></h2>
            <p className="section-desc">Empat pilar yang menopang identitas dan kesolidan Hollow.</p>
          </div>
          <div className="grid-2">
            {values.map((v) => (
              <div key={v.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{v.icon}</div>
                <div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hierarchy */}
      <section className={styles.hierarchySection}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Struktur</span>
            <h2 className="section-title">Hierarki <span>Gang</span></h2>
            <p className="section-desc">Setiap rank memiliki tanggung jawab dan hak istimewanya masing-masing.</p>
          </div>
          <div className={styles.hierarchyList}>
            {hierarchy.map((h, i) => (
              <div key={h.rank} className={styles.rankCard}>
                <div className={styles.rankNumber} style={{ color: h.color }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={styles.rankIcon}>{h.icon}</div>
                <div className={styles.rankInfo}>
                  <h3 className={styles.rankName} style={{ color: h.color }}>{h.rank}</h3>
                  <p className={styles.rankDesc}>{h.desc}</p>
                </div>
                <div className={styles.rankBar} style={{ background: h.color, width: `${100 - i * 14}%` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.aboutCta}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Tertarik Bergabung?</h2>
          <p className={styles.ctaDesc}>Mulai perjalananmu sebagai Associate dan buktikan loyalitasmu.</p>
          <Link href="/join" className="btn btn-primary" id="about-join-btn">
            Join Hollow →
          </Link>
        </div>
      </section>
    </>
  );
}
