'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Calendar,
  Camera,
  Film,
  ZoomIn,
  Play,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Pause,
  Layers,
} from 'lucide-react';
import type { GalleryAlbum, GalleryItem, GalleryVideo } from '@/lib/supabase';
import styles from './album-detail.module.css';

interface Props {
  album: GalleryAlbum;
  photos: GalleryItem[];
  videos: GalleryVideo[];
}

function extractTikTokId(url: string): string | null {
  if (!url) return null;
  // Match standard tiktok URLs like /video/1234567890 or v/1234567890
  const match = url.match(/(?:video|v)\/(\d+)/);
  if (match) return match[1];
  // If user pasted just a direct numerical ID
  if (/^\d{15,22}$/.test(url.trim())) return url.trim();
  return null;
}

export default function AlbumDetailClient({ album, photos, videos }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'photos' | 'videos'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, photos.length]);

  // Slideshow timer
  useEffect(() => {
    if (!isPlaying || lightboxIndex === null || photos.length <= 1) return;
    const timer = setInterval(() => {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
    }, 4000);
    return () => clearInterval(timer);
  }, [isPlaying, lightboxIndex, photos.length]);

  const prevPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev - 1 + photos.length) % photos.length : 0));
  }, [photos.length]);

  const nextPhoto = useCallback(() => {
    setLightboxIndex((prev) => (prev !== null ? (prev + 1) % photos.length : 0));
  }, [photos.length]);

  const showPhotos = activeTab === 'all' || activeTab === 'photos';
  const showVideos = activeTab === 'all' || activeTab === 'videos';

  const formattedDate = album.event_date
    ? new Date(album.event_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className={styles.pageWrapper}>
      {/* Hero / Header */}
      <section className={styles.heroSection}>
        <div className={styles.heroBg}>
          {album.cover_url && (
            <Image
              src={album.cover_url}
              alt={album.title}
              fill
              priority
              className={styles.heroBgImg}
              sizes="100vw"
            />
          )}
          <div className={styles.heroOverlay} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <Link href="/gallery" className={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Kembali ke Galeri</span>
          </Link>

          <div className={styles.badgeRow}>
            <span className={styles.serverBadge}>
              {album.server === 'both' ? 'SAMP & FIVEM' : album.server.toUpperCase()}
            </span>
            {formattedDate && (
              <span className={styles.dateBadge}>
                <Calendar size={13} />
                <span>{formattedDate}</span>
              </span>
            )}
          </div>

          <h1 className={styles.albumTitle}>{album.title}</h1>
          {album.description && (
            <p className={styles.albumDesc}>{album.description}</p>
          )}

          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <Camera size={16} />
              <span>{photos.length} Foto</span>
            </div>
            <div className={styles.statItem}>
              <Film size={16} />
              <span>{videos.length} Video TikTok</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className={`container ${styles.contentContainer}`}>
        {/* Tab Controls */}
        <div className={styles.tabBar}>
          <button
            onClick={() => setActiveTab('all')}
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.activeTab : ''}`}
          >
            <Layers size={16} />
            <span>Semua Media ({photos.length + videos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`${styles.tabBtn} ${activeTab === 'photos' ? styles.activeTab : ''}`}
          >
            <Camera size={16} />
            <span>Foto ({photos.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`${styles.tabBtn} ${activeTab === 'videos' ? styles.activeTab : ''}`}
          >
            <Film size={16} />
            <span>Video TikTok ({videos.length})</span>
          </button>
        </div>

        {/* Videos Section */}
        {showVideos && videos.length > 0 && (
          <section className={styles.mediaSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingIcon}>
                <Film size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Video Pendek TikTok</h2>
                <p className={styles.sectionSubtitle}>
                  Klip aksi dan momen rekaman langsung dari lapangan
                </p>
              </div>
            </div>

            <div className={styles.videoGrid}>
              {videos.map((vid) => {
                const tikTokId = extractTikTokId(vid.tiktok_url);
                return (
                  <article key={vid.id} className={styles.videoCard}>
                    <div className={styles.videoHeader}>
                      <h3 className={styles.videoTitle}>{vid.title}</h3>
                      <a
                        href={vid.tiktok_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.openTikTokLink}
                        title="Buka di TikTok"
                      >
                        <span>TikTok</span>
                        <ExternalLink size={13} />
                      </a>
                    </div>

                    <div className={styles.videoFrameWrapper}>
                      {tikTokId ? (
                        <iframe
                          src={`https://www.tiktok.com/embed/v2/${tikTokId}`}
                          className={styles.tiktokIframe}
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          loading="lazy"
                        />
                      ) : (
                        <div className={styles.videoFallback}>
                          <Play size={40} strokeWidth={1.5} />
                          <p>{vid.title}</p>
                          <a
                            href={vid.tiktok_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            Tonton di TikTok
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Photos Section */}
        {showPhotos && photos.length > 0 && (
          <section className={styles.mediaSection}>
            <div className={styles.sectionHeading}>
              <div className={styles.headingIcon}>
                <Camera size={20} />
              </div>
              <div>
                <h2 className={styles.sectionTitle}>Dokumentasi Foto</h2>
                <p className={styles.sectionSubtitle}>
                  Klik salah satu foto untuk melihat dalam resolusi penuh
                </p>
              </div>
            </div>

            <div className={styles.photoGrid}>
              {photos.map((photo, idx) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className={styles.photoCard}
                  aria-label={`Lihat foto ${photo.title || idx + 1}`}
                >
                  <div className={styles.photoImgWrapper}>
                    <Image
                      src={photo.image_url}
                      alt={photo.title || `Foto album ${idx + 1}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className={styles.photoImg}
                    />
                    <div className={styles.photoOverlay}>
                      <span className={styles.zoomPill}>
                        <ZoomIn size={16} />
                        <span>Perbesar</span>
                      </span>
                      {photo.title && (
                        <span className={styles.photoCardTitle}>{photo.title}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Empty state when no media in current filter */}
        {photos.length === 0 && videos.length === 0 && (
          <div className={styles.emptyState}>
            <Camera size={48} strokeWidth={1.2} />
            <h2>Album Belum Berisi Media</h2>
            <p>Admin sedang menyusun dokumentasi untuk event ini. Silakan cek kembali nanti.</p>
            <Link href="/gallery" className="btn btn-secondary">
              Kembali ke Daftar Galeri
            </Link>
          </div>
        )}
      </main>

      {/* Lightbox Cinema Mode */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          className={styles.lightboxBackdrop}
          onClick={() => setLightboxIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.lightboxModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTopBar}>
              <div className={styles.lightboxInfo}>
                <span className={styles.lightboxCounter}>
                  {lightboxIndex + 1} / {photos.length}
                </span>
                <span className={styles.lightboxTitle}>
                  {photos[lightboxIndex].title || album.title}
                </span>
              </div>

              <div className={styles.lightboxControls}>
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setIsPlaying((p) => !p)}
                    className={styles.iconBtn}
                    title={isPlaying ? 'Jeda Slideshow' : 'Mulai Slideshow'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setLightboxIndex(null)}
                  className={styles.iconBtn}
                  title="Tutup"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className={styles.lightboxMainArea}>
              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={prevPhoto}
                  className={`${styles.navArrow} ${styles.prevArrow}`}
                  aria-label="Foto sebelumnya"
                >
                  <ChevronLeft size={28} />
                </button>
              )}

              <div className={styles.lightboxImgContainer}>
                <Image
                  src={photos[lightboxIndex].image_url}
                  alt={photos[lightboxIndex].title || `Foto ${lightboxIndex + 1}`}
                  fill
                  priority
                  className={styles.lightboxImg}
                  sizes="90vw"
                />
              </div>

              {photos.length > 1 && (
                <button
                  type="button"
                  onClick={nextPhoto}
                  className={`${styles.navArrow} ${styles.nextArrow}`}
                  aria-label="Foto selanjutnya"
                >
                  <ChevronRight size={28} />
                </button>
              )}
            </div>

            {/* Filmstrip thumbnails */}
            {photos.length > 1 && (
              <div className={styles.filmstrip}>
                {photos.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className={`${styles.filmstripThumb} ${
                      i === lightboxIndex ? styles.activeThumb : ''
                    }`}
                  >
                    <Image
                      src={p.image_url}
                      alt=""
                      fill
                      sizes="64px"
                      style={{ objectFit: 'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
