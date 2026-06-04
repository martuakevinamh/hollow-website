import type { Metadata } from 'next';
import { connection } from 'next/server';
import { supabase, type GalleryItem } from '@/lib/supabase';
import { GalleryGrid } from './GalleryClient';
import styles from './gallery.module.css';

export const metadata: Metadata = {
  title: 'Gallery',
  description: 'Koleksi foto dan momen terbaik dari Hollow — komunitas gangster UK di GTA SAMP dan FiveM.',
};

async function getGallery(): Promise<GalleryItem[]> {
  // Opt out of static prerendering — always fetch fresh data from DB
  await connection();

  try {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const items = await getGallery();
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} />
        <div className={`container ${styles.pageHeroContent}`}>
          <span className="section-tag">Visual</span>
          <h1 className={styles.pageTitle}>Gallery</h1>
          <p className={styles.pageSubtitle}>
            Momen, aksi, dan kehidupan di jalanan Hollow.
          </p>
          {!isEmpty && (
            <div className={styles.heroStat}>
              <span className={styles.heroStatValue}>{items.length}</span>
              <span className={styles.heroStatLabel}>Photos</span>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Content */}
      <section className={styles.gallerySection}>
        <div className="container">
          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📸</div>
              <h2 className={styles.emptyTitle}>Gallery Segera Hadir</h2>
              <p className={styles.emptyDesc}>
                Koleksi foto Hollow sedang dalam proses pengisian. Stay tuned!
              </p>
            </div>
          ) : (
            <GalleryGrid items={items} />
          )}
        </div>
      </section>
    </>
  );
}
