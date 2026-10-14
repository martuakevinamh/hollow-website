import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Camera } from 'lucide-react';
import { supabase, type GalleryItem, type GalleryAlbum } from '@/lib/supabase';
import { GalleryGrid } from './GalleryClient';
import styles from './gallery.module.css';

export const metadata: Metadata = {
  title: 'Gallery & Albums',
  description: 'Koleksi album event, video TikTok, dan dokumentasi foto Hollow di GTA SAMP dan FiveM.',
};

async function getGallery(): Promise<GalleryItem[]> {
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

async function getAlbums(): Promise<GalleryAlbum[]> {
  await connection();
  try {
    const { data: albumsData, error } = await supabase
      .from('gallery_albums')
      .select('*')
      .order('event_date', { ascending: false });

    if (error || !albumsData) return [];

    const albumsWithCounts = await Promise.all(
      albumsData.map(async (album) => {
        const [{ count: pCount }, { count: vCount }] = await Promise.all([
          supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('album_id', album.id),
          supabase.from('gallery_videos').select('id', { count: 'exact', head: true }).eq('album_id', album.id),
        ]);
        return {
          ...album,
          photo_count: pCount ?? 0,
          video_count: vCount ?? 0,
        };
      })
    );
    return albumsWithCounts;
  } catch {
    return [];
  }
}

export default async function GalleryPage() {
  const [items, albums] = await Promise.all([
    getGallery(),
    getAlbums(),
  ]);
  const isEmpty = items.length === 0 && albums.length === 0;

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
            <div style={{ display: 'inline-flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{albums.length}</span>
                <span className={styles.heroStatLabel}>Albums</span>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>{items.length}</span>
                <span className={styles.heroStatLabel}>Photos</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Content */}
      <section className={styles.gallerySection}>
        <div className="container">
          {isEmpty ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Camera size={44} strokeWidth={1.5} />
              </div>
              <h2 className={styles.emptyTitle}>Gallery Segera Hadir</h2>
              <p className={styles.emptyDesc}>
                Koleksi foto dan album event Hollow sedang dalam proses pengisian. Stay tuned!
              </p>
            </div>
          ) : (
            <GalleryGrid items={items} albums={albums} />
          )}
        </div>
      </section>
    </>
  );
}
