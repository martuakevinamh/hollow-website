'use client';

import { useState } from 'react';
import { SAMPLogo, FiveMLogo } from '@/components/ServerLogos';
import styles from './AboutTabs.module.css';
import { type SiteSettings, DEFAULT_SETTINGS } from '@/lib/supabase';

export default function AboutTabs({ settings }: { settings?: SiteSettings }) {
  const [activeTab, setActiveTab] = useState<'samp' | 'fivem'>('samp');
  const currentSettings = settings || DEFAULT_SETTINGS;

  return (
    <div className={styles.container}>
      <div className={styles.tabButtons}>
        <button
          onClick={() => setActiveTab('samp')}
          className={`${styles.tabBtn} ${activeTab === 'samp' ? styles.active : ''}`}
        >
          <SAMPLogo size={18} /> GTA SA:MP
        </button>
        <button
          onClick={() => setActiveTab('fivem')}
          className={`${styles.tabBtn} ${activeTab === 'fivem' ? styles.active : ''}`}
        >
          <FiveMLogo size={18} /> GTA FiveM
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'samp' ? (
          <div className={styles.contentItem}>
            <h3 className={styles.contentTitle}>{currentSettings.about_samp_title}</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {currentSettings.about_samp_content}
            </p>
            <div className={styles.tags}>
              <span>#FactionWar</span>
              <span>#ClassicRoleplay</span>
              <span>#TurfDominance</span>
            </div>
          </div>
        ) : (
          <div className={styles.contentItem}>
            <h3 className={styles.contentTitle}>{currentSettings.about_fivem_title}</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {currentSettings.about_fivem_content}
            </p>
            <div className={styles.tags}>
              <span>#DeepRP</span>
              <span>#VoiceRoleplay</span>
              <span>#ModernUKDrill</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
