'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SAMPLogo, FiveMLogo } from '@/components/ServerLogos';
import type { GalleryItem } from '@/lib/supabase';
import styles from './lightbox.module.css';

interface LightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);
  const next = () => setCurrent((c) => (c + 1) % items.length);

  const item = items[current];

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Photo lightbox"
    >
      <div className={styles.lightbox} onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button className={styles.close} onClick={onClose} aria-label="Close lightbox">
          ✕
        </button>

        {/* Navigation prev */}
        {items.length > 1 && (
          <button className={`${styles.navBtn} ${styles.prev}`} onClick={prev} aria-label="Previous photo">
            ‹
          </button>
        )}

        {/* Image */}
        <div className={styles.imgWrapper}>
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className={styles.img}
            sizes="(max-width: 768px) 95vw, 80vw"
            priority
          />
        </div>

        {/* Navigation next */}
        {items.length > 1 && (
          <button className={`${styles.navBtn} ${styles.next}`} onClick={next} aria-label="Next photo">
            ›
          </button>
        )}

        {/* Caption */}
        <div className={styles.caption}>
          <span className={styles.captionTitle}>{item.title}</span>
          <span className={styles.captionCount}>{current + 1} / {items.length}</span>
        </div>
      </div>
    </div>
  );
}

interface GalleryGridProps {
  items: GalleryItem[];
}

export function GalleryGrid({ items }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'samp' | 'fivem'>('samp');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter items based on active tab and database server column
  const filteredItems = items.filter(
    (item) => item.server === activeTab || item.server === 'both'
  );

  return (
    <>
      {/* Tab Switcher */}
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

      {filteredItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📸</div>
          <h2 className={styles.emptyTitle}>Gallery Segera Hadir</h2>
          <p className={styles.emptyDesc}>
            Koleksi foto Hollow untuk server ini sedang dalam proses pengisian. Stay tuned!
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.map((item, i) => (
            <button
              key={item.id}
              className={styles.gridItem}
              onClick={() => setLightboxIndex(i)}
              aria-label={`View photo: ${item.title}`}
            >
              <div className={styles.gridImg}>
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className={styles.thumb}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <div className={styles.gridOverlay}>
                  <span className={styles.viewIcon}>🔍</span>
                  <span className={styles.gridTitle}>{item.title}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={filteredItems}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
