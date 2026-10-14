'use client';

import { useState, useEffect, useCallback, useId } from 'react';
import Image from 'next/image';
import { Camera, ChevronLeft, ChevronRight, X, Play, Pause, ZoomIn, Layers, Sparkles } from 'lucide-react';
import styles from './article-album.module.css';

interface ArticleAlbumProps {
  title: string;
  images: string[];
}

export function ArticleAlbum({ title, images }: ArticleAlbumProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const dialogId = useId();

  const total = images.length;

  const nextPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevPhoto = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    setIsPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setIsPlaying(false);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextPhoto();
      if (e.key === 'ArrowLeft') prevPhoto();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, nextPhoto, prevPhoto]);

  // Slideshow timer
  useEffect(() => {
    if (!lightboxOpen || !isPlaying || total <= 1) return;

    const timer = setInterval(() => {
      nextPhoto();
    }, 4000);

    return () => clearInterval(timer);
  }, [lightboxOpen, isPlaying, total, nextPhoto, currentIndex]);

  if (!images || images.length === 0) return null;

  return (
    <section className={styles.albumSection} aria-label="Album Galeri Foto">
      {/* Header */}
      <div className={styles.albumHeader}>
        <div>
          <span className={styles.tagline}>
            <Camera size={14} strokeWidth={2} /> Album Dokumentasi
          </span>
          <h2 className={styles.albumTitle}>Dokumentasi & Galeri Foto</h2>
        </div>
        <div className={styles.photoCountBadge}>
          <Layers size={14} /> {total} Foto Tersedia
        </div>
      </div>

      {/* Visual Collage Grid based on photo count */}
      {total === 1 && (
        <div
          className={`${styles.singleGrid} ${styles.gridItemInteractive}`}
          onClick={() => openLightbox(0)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
        >
          <Image
            src={images[0]}
            alt={`${title} - Foto 1`}
            fill
            className={styles.albumImg}
            sizes="(max-width: 1024px) 100vw, 800px"
            unoptimized
          />
          <div className={styles.itemOverlay}>
            <span className={styles.zoomBadge}>
              <ZoomIn size={14} /> Perbesar Foto
            </span>
          </div>
        </div>
      )}

      {total === 2 && (
        <div className={styles.twoGrid}>
          {images.map((src, i) => (
            <div
              key={i}
              className={`${styles.twoGridItem} ${styles.gridItemInteractive}`}
              onClick={() => openLightbox(i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && openLightbox(i)}
            >
              <Image
                src={src}
                alt={`${title} - Foto ${i + 1}`}
                fill
                className={styles.albumImg}
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
              <div className={styles.itemOverlay}>
                <span className={styles.zoomBadge}>
                  <ZoomIn size={14} /> Foto #{i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {total === 3 && (
        <div className={styles.threeGrid}>
          <div
            className={`${styles.threeGridMain} ${styles.gridItemInteractive}`}
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={`${title} - Foto 1`}
              fill
              className={styles.albumImg}
              sizes="(max-width: 768px) 100vw, 60vw"
              unoptimized
            />
            <div className={styles.itemOverlay}>
              <span className={styles.zoomBadge}>
                <Sparkles size={14} /> Foto Utama
              </span>
            </div>
          </div>
          <div className={styles.threeGridStack}>
            {images.slice(1, 3).map((src, i) => (
              <div
                key={i + 1}
                className={`${styles.threeGridStackItem} ${styles.gridItemInteractive}`}
                onClick={() => openLightbox(i + 1)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && openLightbox(i + 1)}
              >
                <Image
                  src={src}
                  alt={`${title} - Foto ${i + 2}`}
                  fill
                  className={styles.albumImg}
                  sizes="(max-width: 768px) 50vw, 40vw"
                  unoptimized
                />
                <div className={styles.itemOverlay}>
                  <span className={styles.zoomBadge}>
                    <ZoomIn size={14} /> Foto #{i + 2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total >= 4 && (
        <div className={styles.magazineGrid}>
          {/* Main Hero Spotlight */}
          <div
            className={`${styles.magazineMain} ${styles.gridItemInteractive}`}
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && openLightbox(0)}
          >
            <Image
              src={images[0]}
              alt={`${title} - Foto Utama`}
              fill
              className={styles.albumImg}
              sizes="(max-width: 768px) 100vw, 60vw"
              unoptimized
            />
            <div className={styles.itemOverlay}>
              <span className={styles.zoomBadge}>
                <Sparkles size={14} /> Foto Utama
              </span>
            </div>
          </div>

          {/* Right Thumbnails Stack */}
          <div className={styles.magazineStack}>
            {images.slice(1, 4).map((src, i) => {
              const actualIndex = i + 1;
              const isLastThumbnail = i === 2;
              const remainingCount = total - 4;

              return (
                <div
                  key={actualIndex}
                  className={`${styles.magazineThumb} ${styles.gridItemInteractive}`}
                  onClick={() => openLightbox(actualIndex)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && openLightbox(actualIndex)}
                >
                  <Image
                    src={src}
                    alt={`${title} - Foto ${actualIndex + 1}`}
                    fill
                    className={styles.albumImg}
                    sizes="(max-width: 768px) 33vw, 40vw"
                    unoptimized
                  />
                  {isLastThumbnail && remainingCount > 0 ? (
                    <div className={styles.moreOverlay}>
                      <span className={styles.moreCount}>+{remainingCount}</span>
                      <span className={styles.moreLabel}>Foto Lainnya</span>
                    </div>
                  ) : (
                    <div className={styles.itemOverlay}>
                      <span className={styles.zoomBadge}>
                        <ZoomIn size={14} /> #{actualIndex + 1}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Album Action Bar */}
      <div className={styles.albumFooter}>
        <div className={styles.albumNote}>
          <Layers size={16} color="var(--crimson)" />
          <span>Klik foto mana saja untuk membuka album dalam mode bioskop layar penuh.</span>
        </div>
        <button
          onClick={() => openLightbox(0)}
          className={styles.openAlbumBtn}
          type="button"
        >
          Buka Album Penuh ({total} Foto) ↗
        </button>
      </div>

      {/* Fullscreen Album Lightbox */}
      {lightboxOpen && (
        <div
          className={styles.lightboxBackdrop}
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogId}
          onClick={closeLightbox}
        >
          {/* Header */}
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxTitleWrap}>
              <span className={styles.lightboxSubtitle} id={dialogId}>
                Album Dokumentasi Hollow
              </span>
              <div className={styles.lightboxArticleTitle}>{title}</div>
            </div>

            <div className={styles.lightboxControls}>
              <div className={styles.counterPill}>
                {currentIndex + 1} / {total}
              </div>

              {total > 1 && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={styles.controlBtn}
                  title={isPlaying ? 'Jeda Slideshow' : 'Putar Slideshow'}
                  type="button"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
              )}

              <button
                onClick={closeLightbox}
                className={styles.closeBtn}
                title="Tutup (Esc)"
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Main Stage */}
          <div className={styles.lightboxStage} onClick={(e) => e.stopPropagation()}>
            {total > 1 && (
              <button
                onClick={prevPhoto}
                className={`${styles.stageNavBtn} ${styles.prevBtn}`}
                title="Foto Sebelumnya (←)"
                type="button"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            <div className={styles.mainImageWrapper}>
              <Image
                src={images[currentIndex]}
                alt={`${title} - Foto ${currentIndex + 1}`}
                fill
                style={{ objectFit: 'contain' }}
                priority
                sizes="(max-width: 1200px) 95vw, 1200px"
                unoptimized
              />
            </div>

            {total > 1 && (
              <button
                onClick={nextPhoto}
                className={`${styles.stageNavBtn} ${styles.nextBtn}`}
                title="Foto Selanjutnya (→)"
                type="button"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Bottom Filmstrip */}
          {total > 1 && (
            <div className={styles.lightboxFilmstrip} onClick={(e) => e.stopPropagation()}>
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`${styles.filmstripThumb} ${
                    idx === currentIndex ? styles.filmstripActive : ''
                  }`}
                  onClick={() => setCurrentIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setCurrentIndex(idx)}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="80px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
