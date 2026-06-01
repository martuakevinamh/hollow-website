'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type NewsItem } from '@/lib/supabase';
import styles from './news.module.css';

interface NewsListProps {
  initialNews: NewsItem[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NewsList({ initialNews }: NewsListProps) {
  const [activeTab, setActiveTab] = useState<'samp' | 'fivem'>('samp');

  // Filter news items based on active tab and database server column
  const filteredNews = initialNews.filter(
    (item) => item.server === activeTab || item.server === 'both'
  );

  const isEmpty = filteredNews.length === 0;
  const [featured, ...rest] = filteredNews;

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
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📰</div>
          <h2 className={styles.emptyTitle}>Belum Ada Berita</h2>
          <p className={styles.emptyDesc}>
            Berita dan pengumuman Hollow untuk server ini akan segera hadir di sini. Stay tuned!
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featured && (
            <Link href={`/news/${featured.slug}`} className={styles.featuredCard} id="news-featured">
              <div className={styles.featuredImg}>
                {featured.cover_image_url ? (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className={styles.featuredThumb}
                    priority
                    sizes="(max-width: 768px) 100vw, 60vw"
                  />
                ) : (
                  <div className={styles.featuredImgFallback}>
                    <span>📰</span>
                  </div>
                )}
                <div className={styles.featuredOverlay} />
              </div>
              <div className={styles.featuredContent}>
                <span className={styles.featuredBadge}>Featured</span>
                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <div className={styles.featuredMeta}>
                  <span className={styles.author}>By {featured.author}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.date}>{formatDate(featured.published_at)}</span>
                </div>
                <span className={styles.readMore}>Baca Selengkapnya →</span>
              </div>
            </Link>
          )}

          {/* Rest of articles */}
          {rest.length > 0 && (
            <div className={styles.newsGrid}>
              {rest.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className={styles.newsCard}
                >
                  <div className={styles.newsCardImg}>
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.title}
                        fill
                        className={styles.newsThumb}
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className={styles.newsImgFallback}>📰</div>
                    )}
                  </div>
                  <div className={styles.newsCardBody}>
                    <h3 className={styles.newsCardTitle}>{item.title}</h3>
                    <div className={styles.newsMeta}>
                      <span className={styles.author}>By {item.author}</span>
                      <span className={styles.dot}>·</span>
                      <span className={styles.date}>{formatDate(item.published_at)}</span>
                    </div>
                    <span className={styles.readMoreSm}>Baca →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
