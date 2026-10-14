'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Newspaper } from 'lucide-react';
import { SAMPLogo, FiveMLogo } from '@/components/ServerLogos';
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
          <SAMPLogo size={18} /> GTA SA:MP
        </button>
        <button
          onClick={() => setActiveTab('fivem')}
          className={`${styles.tabBtn} ${activeTab === 'fivem' ? styles.active : ''}`}
        >
          <FiveMLogo size={18} /> GTA FiveM
        </button>
      </div>

      {isEmpty ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Newspaper size={44} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyTitle}>Belum Ada Berita</h2>
          <p className={styles.emptyDesc}>
            Berita dan pengumuman Hollow untuk server ini akan segera hadir di sini. Stay tuned!
          </p>
        </div>
      ) : (
        <>
          {/* Featured Post */}
          {featured && (
            <div className={styles.featuredCard} id="news-featured">
              <Link href={`/news/${featured.slug}`} className={styles.featuredImg}>
                {featured.cover_image_url ? (
                  <Image
                    src={featured.cover_image_url}
                    alt={featured.title}
                    fill
                    className={styles.featuredThumb}
                    priority
                    sizes="(max-width: 768px) 100vw, 60vw"
                    unoptimized
                  />
                ) : (
                  <div className={styles.featuredImgFallback}>
                    <Newspaper size={36} strokeWidth={1.5} />
                  </div>
                )}
                <div className={styles.featuredOverlay} />
              </Link>
              <div className={styles.featuredContent}>
                <span className={styles.featuredBadge}>Featured</span>
                <Link href={`/news/${featured.slug}`} className={styles.titleLink}>
                  <h2 className={styles.featuredTitle}>{featured.title}</h2>
                </Link>
                <div className={styles.featuredMeta}>
                  <span className={styles.author}>By {featured.author}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.date}>{formatDate(featured.published_at)}</span>
                </div>
                <Link href={`/news/${featured.slug}`} className={styles.readMore}>
                  Baca Selengkapnya →
                </Link>
              </div>
            </div>
          )}

          {/* Rest of articles */}
          {rest.length > 0 && (
            <div className={styles.newsGrid}>
              {rest.map((item) => (
                <div key={item.id} className={styles.newsCard}>
                  <Link href={`/news/${item.slug}`} className={styles.newsCardImg}>
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.title}
                        fill
                        className={styles.newsThumb}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className={styles.newsImgFallback}>
                        <Newspaper size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </Link>
                  <div className={styles.newsCardBody}>
                    <Link href={`/news/${item.slug}`} className={styles.titleLink}>
                      <h3 className={styles.newsCardTitle}>{item.title}</h3>
                    </Link>
                    <div className={styles.newsMeta}>
                      <span className={styles.author}>By {item.author}</span>
                      <span className={styles.dot}>·</span>
                      <span className={styles.date}>{formatDate(item.published_at)}</span>
                    </div>
                    <Link href={`/news/${item.slug}`} className={styles.readMoreSm}>
                      Baca Selengkapnya →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
