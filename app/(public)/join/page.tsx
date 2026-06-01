import type { Metadata } from 'next';
import Image from 'next/image';
import styles from './join.module.css';
import { getSettings } from '@/lib/supabase';

export const metadata: Metadata = {
  title: 'Join Us',
  description: 'Bergabunglah dengan Hollow melalui Discord kami. Jadilah bagian dari komunitas gangster UK terbaik di GTA SAMP dan FiveM.',
};

const steps = [
  {
    step: '01',
    title: 'Join Discord',
    desc: 'Klik tombol di bawah untuk bergabung ke server Discord resmi Hollow.',
    icon: '🎮',
  },
  {
    step: '02',
    title: 'Baca Rules',
    desc: 'Baca dan pahami semua peraturan komunitas yang tersedia di channel #rules.',
    icon: '📜',
  },
  {
    step: '03',
    title: 'Perkenalkan Diri',
    desc: 'Perkenalkan dirimu di channel #perkenalan dan ceritakan pengalaman RP-mu.',
    icon: '👋',
  },
  {
    step: '04',
    title: 'Mulai Roleplay',
    desc: 'Setelah diverifikasi, kamu siap bergabung dalam aksi di server SAMP atau FiveM!',
    icon: '🚀',
  },
];

const requirements = [
  'Minimal berumur 17 tahun',
  'Memiliki pemahaman dasar tentang roleplay',
  'Aktif di server minimal 3x seminggu',
  'Menghormati sesama anggota komunitas',
  'Siap mengikuti arahan dari senior/pengurus',
  'Tidak terlibat drama atau konflik berlebihan',
];

export default async function JoinPage() {
  const settings = await getSettings();

  return (
    <>
      {/* Hero */}
      <section className={styles.joinHero}>
        <div className={styles.joinHeroBg}>
          <Image src="/BIG_FLAG.jpg" alt="" fill style={{ objectFit: 'cover' }} aria-hidden />
          <div className={styles.joinHeroOverlay} />
        </div>
        <div className={`container ${styles.joinHeroContent}`}>
          <div className={styles.joinLogo}>
            <Image src="/HOLLOW-UK.gif" alt="Hollow Logo" width={100} height={100} unoptimized />
          </div>
          <span className="section-tag">Rekrutmen</span>
          <h1 className={styles.joinTitle}>Join Hollow</h1>
          <p className={styles.joinSubtitle}>
            Satu langkah menuju persaudaraan yang tak tergoyahkan
          </p>
          <a
            href={settings.discord_samp}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn btn-primary ${styles.discordBtn}`}
            id="join-discord-main"
          >
            🎮 Join Discord Sekarang
          </a>
        </div>
      </section>

      {/* Steps */}
      <section className={styles.stepsSection}>
        <div className="container">
          <div className="section-header">
            <span className="section-tag">Cara Bergabung</span>
            <h2 className="section-title">4 Langkah <span>Mudah</span></h2>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((step, i) => (
              <div key={step.step} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.step}</div>
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
                {i < steps.length - 1 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className={styles.reqSection}>
        <div className={styles.reqBg} aria-hidden="true" />
        <div className="container">
          <div className={styles.reqGrid}>
            <div className={styles.reqText}>
              <span className="section-tag">Syarat</span>
              <h2 className={styles.reqTitle}>Yang Kami <span>Cari</span></h2>
              <p className={styles.reqDesc}>
                Hollow adalah komunitas yang selektif. Kami mencari anggota yang
                serius, loyal, dan siap berkomitmen untuk membangun komunitas bersama.
              </p>
              <ul className={styles.reqList}>
                {requirements.map((req) => (
                  <li key={req} className={styles.reqItem}>
                    <span className={styles.reqCheck}>✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.reqCard}>
              <div className={styles.reqCardHeader}>
                <h3>Siap Bergabung?</h3>
                <p>Semua proses rekrutmen dilakukan via Discord. Klik tombol di bawah untuk mulai.</p>
              </div>
              <div className={styles.reqCardBody}>
                <div className={styles.discordPreview}>
                  <div className={styles.discordIcon}>🎮</div>
                  <div>
                    <div className={styles.discordName}>Hollow</div>
                    <div className={styles.discordServer}>Official Discord Server</div>
                  </div>
                  <div className={styles.onlineDot} />
                </div>
                <a
                  href={settings.discord_samp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
                  id="join-discord-card"
                >
                  Gabung Discord →
                </a>
                <p className={styles.reqNote}>
                  Proses verifikasi biasanya memakan waktu 1-3 hari kerja setelah kamu memperkenalkan diri di Discord.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
