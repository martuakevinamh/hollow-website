'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { SAMPLogo, FiveMLogo } from '@/components/ServerLogos';
import Link from 'next/link';
import {
  Play,
  Pause,
  X,
  ChevronLeft,
  ChevronRight,
  Camera,
  ZoomIn,
  FolderOpen,
  Film,
  ArrowRight,
} from 'lucide-react';
import type { GalleryItem, GalleryAlbum } from '@/lib/supabase';
import styles from './lightbox.module.css';

interface LightboxProps {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
}

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + items.length) % items.length), [items.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % items.length), [items.length]);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return;

    const timer = setInterval(() => {
      next();
    }, 4000); // 4 seconds delay between slides

    return () => clearInterval(timer);
  }, [isPlaying, items.length, next, current]);

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
          <X size={20} strokeWidth={2} />
        </button>

        {/* Navigation prev */}
        {items.length > 1 && (
          <button className={`${styles.navBtn} ${styles.prev}`} onClick={prev} aria-label="Previous photo">
            <ChevronLeft size={24} strokeWidth={2} />
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
            <ChevronRight size={24} strokeWidth={2} />
          </button>
        )}

        {/* Caption */}
        <div className={styles.caption}>
          <span className={styles.captionTitle}>{item.title}</span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {items.length > 1 && (
              <button
                className={styles.playPauseBtn}
                onClick={() => setIsPlaying(!isPlaying)}
                title={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
            )}
            <span className={styles.captionCount}>{current + 1} / {items.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface GalleryGridProps {
  items: GalleryItem[];
  albums?: GalleryAlbum[];
}

export function GalleryGrid({ items, albums = [] }: GalleryGridProps) {
  const [activeTab, setActiveTab] = useState<'samp' | 'fivem'>('samp');
  const [viewMode, setViewMode] = useState<'albums' | 'photos'>(
    albums.length > 0 ? 'albums' : 'photos'
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Filter items based on active tab and database server column
  const filteredItems = items.filter(
    (item) => item.server === activeTab || item.server === 'both'
  );

  const filteredAlbums = albums.filter(
    (album) => album.server === activeTab || album.server === 'both'
  );

  return (
    <>
      {/* Mode Switcher: Albums vs Photos */}
      <div className={styles.modeSwitcher}>
        <button
          type="button"
          onClick={() => setViewMode('albums')}
          className={`${styles.modeBtn} ${viewMode === 'albums' ? styles.activeMode : ''}`}
        >
          <FolderOpen size={16} />
          <span>Album Event ({filteredAlbums.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('photos')}
          className={`${styles.modeBtn} ${viewMode === 'photos' ? styles.activeMode : ''}`}
        >
          <Camera size={16} />
          <span>Semua Foto ({filteredItems.length})</span>
        </button>
      </div>

      {/* Server Tab Switcher */}
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

      {/* ALBUMS VIEW */}
      {viewMode === 'albums' && (
        <>
          {filteredAlbums.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <FolderOpen size={44} strokeWidth={1.5} />
              </div>
              <h2 className={styles.emptyTitle}>Belum Ada Album Event</h2>
              <p className={styles.emptyDesc}>
                Dokumentasi event & aksi Hollow untuk server ini sedang dipersiapkan. Cek tab &quot;Semua Foto&quot; untuk dokumentasi harian.
              </p>
            </div>
          ) : (
            <div className={styles.albumGrid}>
              {filteredAlbums.map((album) => {
                const eventDateFormatted = album.event_date
                  ? new Date(album.event_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : null;

                return (
                  <Link
                    key={album.id}
                    href={`/gallery/albums/${album.id}`}
                    className={styles.albumCard}
                  >
                    <div className={styles.albumCoverWrapper}>
                      {album.cover_url ? (
                        <Image
                          src={album.cover_url}
                          alt={album.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className={styles.albumCoverImg}
                        />
                      ) : (
                        <div className={styles.albumCoverPlaceholder}>
                          <FolderOpen size={36} strokeWidth={1.2} />
                          <span>Hollow Album</span>
                        </div>
                      )}

                      <div className={styles.albumBadges}>
                        <span className={styles.albumServerBadge}>
                          {album.server === 'both' ? 'SAMP & FIVEM' : album.server.toUpperCase()}
                        </span>
                      </div>

                      <div className={styles.albumMediaCount}>
                        <span className={styles.countGroup}>
                          <Camera size={13} />
                          <span>{album.photo_count ?? 0}</span>
                        </span>
                        <span className={styles.countGroup}>
                          <Film size={13} />
                          <span>{album.video_count ?? 0}</span>
                        </span>
                      </div>
                    </div>

                    <div className={styles.albumBody}>
                      <h3 className={styles.albumTitle}>{album.title}</h3>
                      {album.description && (
                        <p className={styles.albumDesc}>{album.description}</p>
                      )}

                      <div className={styles.albumFooter}>
                        {eventDateFormatted ? (
                          <span>{eventDateFormatted}</span>
                        ) : (
                          <span>Event Hollow</span>
                        )}
                        <span className={styles.viewAlbumAction}>
                          <span>Buka Album</span>
                          <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* INDIVIDUAL PHOTOS VIEW */}
      {viewMode === 'photos' && (
        <>
          {filteredItems.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Camera size={44} strokeWidth={1.5} />
              </div>
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
                      <span className={styles.viewIcon}>
                        <ZoomIn size={18} strokeWidth={2} />
                      </span>
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
      )}
    </>
  );
}
