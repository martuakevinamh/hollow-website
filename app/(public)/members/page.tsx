import type { Metadata } from 'next';
import { supabase, type Member } from '@/lib/supabase';
import styles from './members.module.css';
import MembersList from './MembersList';

export const metadata: Metadata = {
  title: 'Members',
  description: 'Kenali para loyalis Hollow — anggota aktif yang menjaga jalan dan menjunjung nama komunitas gangster UK terkemuka di GTA SAMP dan FiveM.',
};

async function getMembers(): Promise<Member[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('is_active', true)
      .order('joined_at', { ascending: true });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function MembersPage() {
  const members = await getMembers();
  const isEmpty = members.length === 0;

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} />
        <div className={`container ${styles.pageHeroContent}`}>
          <span className="section-tag">The Crew</span>
          <h1 className={styles.pageTitle}>Meet Hollow</h1>
          <p className={styles.pageSubtitle}>
            Para loyalis yang menjaga jalan dan menjunjung nama Hollow.
          </p>
          {!isEmpty && (
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{members.length}</span>
              <span className={styles.heroStatLabel}>Active Members</span>
            </div>
          )}
        </div>
      </section>

      {/* Members Content */}
      <section className={styles.membersSection}>
        <div className="container">
          <MembersList initialMembers={members} />
        </div>
      </section>

      {/* CTA */}
      <section className={styles.membersCta}>
        <div className="container">
          <h2 className={styles.ctaTitle}>Ingin Namamu Ada di Sini?</h2>
          <p className={styles.ctaDesc}>Bergabunglah dan buktikan loyalitasmu kepada Hollow.</p>
          <a href="/join" className="btn btn-primary" id="members-join-cta">
            Join Hollow →
          </a>
        </div>
      </section>
    </>
  );
}
