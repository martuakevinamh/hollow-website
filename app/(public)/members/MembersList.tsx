'use client';

import { useState } from 'react';
import Image from 'next/image';
import { type Member } from '@/lib/supabase';
import styles from './members.module.css';

const RANK_ORDER = ['TOP OG/KING', 'OG', 'Top Boy', 'Brudda', 'Rude Boy', 'The Youth', 'Muscle'];
const RANK_COLORS: Record<string, string> = {
  'TOP OG/KING': '#FFD700',
  'OG':          '#C0C0C0',
  'Top Boy':     '#B22234',
  'Brudda':      '#7ba7f7',
  'Rude Boy':    '#f7a07b',
  'The Youth':   '#86efac',
  'Muscle':      '#a0aec0',
};
const RANK_ICONS: Record<string, string> = {
  'TOP OG/KING': '👑',
  'OG':          '🦅',
  'Top Boy':     '🎯',
  'Brudda':      '🤜',
  'Rude Boy':    '🔥',
  'The Youth':   '⚡',
  'Muscle':      '💪',
};
const SERVER_LABELS: Record<string, string> = {
  samp: 'SAMP',
  fivem: 'FiveM',
  both: 'Both',
};
const SERVER_BADGE: Record<string, string> = {
  samp: 'badge-samp',
  fivem: 'badge-fivem',
  both: 'badge-both',
};

interface MembersListProps {
  initialMembers: Member[];
}

export default function MembersList({ initialMembers }: MembersListProps) {
  const [activeTab, setActiveTab] = useState<'samp' | 'fivem'>('samp');

  // Filter members by tab
  const filteredMembers = initialMembers.filter(
    (m) => m.server === activeTab || m.server === 'both'
  );

  // Group by rank
  const grouped = RANK_ORDER.reduce<Record<string, Member[]>>((acc, rank) => {
    const inRank = filteredMembers.filter((m) => m.rank === rank);
    if (inRank.length > 0) acc[rank] = inRank;
    return acc;
  }, {});

  const isEmpty = filteredMembers.length === 0;

  return (
    <div>
      {/* Tab Switcher */}
      <div className={styles.tabButtons}>
        <button
          onClick={() => setActiveTab('samp')}
          className={`${styles.tabBtn} ${activeTab === 'samp' ? styles.active : ''}`}
        >
          🎮 GTA SA:MP
        </button>
        <button
          onClick={() => setActiveTab('fivem')}
          className={`${styles.tabBtn} ${activeTab === 'fivem' ? styles.active : ''}`}
        >
          🚗 GTA FiveM
        </button>
      </div>

      {isEmpty ? (
        /* Empty State */
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏴󠁧󠁢󠁥󠁮󠁧󠁿</div>
          <h2 className={styles.emptyTitle}>Roster Segera Hadir</h2>
          <p className={styles.emptyDesc}>
            Data anggota untuk server ini sedang dalam proses pengisian. Nantikan lineup lengkap Hollow.
          </p>
        </div>
      ) : (
        /* Grouped by rank */
        Object.entries(grouped).map(([rank, rankMembers]) => (
          <div key={rank} className={styles.rankSection}>
            <div className={styles.rankHeader}>
              <span
                className={styles.rankIcon}
                style={{ color: RANK_COLORS[rank] ?? '#F5F5F5' }}
              >
                {RANK_ICONS[rank] ?? '⭐'}
              </span>
              <h2
                className={styles.rankTitle}
                style={{ color: RANK_COLORS[rank] ?? '#F5F5F5' }}
              >
                {rank}
              </h2>
              <span className={styles.rankCount}>{rankMembers.length}</span>
              <div
                className={styles.rankLine}
                style={{ background: RANK_COLORS[rank] ?? '#F5F5F5' }}
              />
            </div>

            <div className={styles.memberGrid}>
              {rankMembers.map((member) => (
                <div key={member.id} className={styles.memberCard}>
                  {/* Avatar */}
                  <div className={styles.avatarWrapper}>
                    {member.photo_url ? (
                      <Image
                        src={member.photo_url}
                        alt={member.name_rp}
                        fill
                        className={styles.avatarImg}
                        sizes="(max-width: 640px) 80px, 96px"
                      />
                    ) : (
                      <div className={styles.avatarFallback}>
                        {member.name_rp.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className={styles.avatarBorder}
                      style={{ borderColor: RANK_COLORS[member.rank] ?? '#F5F5F5' }}
                    />
                  </div>

                  {/* Info */}
                  <div className={styles.memberInfo}>
                    <h3 className={styles.memberName}>{member.name_rp}</h3>
                    <span
                      className={styles.memberRank}
                      style={{ color: RANK_COLORS[member.rank] ?? '#F5F5F5' }}
                    >
                      {RANK_ICONS[member.rank]} {member.rank}
                    </span>
                    {member.bio && (
                      <p className={styles.memberBio}>{member.bio}</p>
                    )}
                    <div className={styles.memberMeta}>
                      <span className={`badge ${SERVER_BADGE[member.server] ?? ''}`}>
                        {SERVER_LABELS[member.server] ?? member.server}
                      </span>
                      <span className={styles.joinDate}>
                        Joined {new Date(member.joined_at).getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
