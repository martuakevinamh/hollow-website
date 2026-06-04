import type { Metadata } from 'next';
import { connection } from 'next/server';
import { supabase, type NewsItem } from '@/lib/supabase';
import styles from './news.module.css';
import NewsList from './NewsList';

export const metadata: Metadata = {
  title: 'News',
  description: 'Berita terbaru, pengumuman, dan update dari Hollow — komunitas gangster UK di GTA SAMP dan FiveM.',
};

async function getNews(): Promise<NewsItem[]> {
  // Opt out of static prerendering — always fetch fresh data from DB
  await connection();

  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const news = await getNews();

  return (
    <>
      {/* Page Hero */}
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} />
        <div className={`container ${styles.pageHeroContent}`}>
          <span className="section-tag">Berita & Update</span>
          <h1 className={styles.pageTitle}>News</h1>
          <p className={styles.pageSubtitle}>
            Informasi terbaru, pengumuman event, dan cerita dari Hollow.
          </p>
        </div>
      </section>

      {/* News Content */}
      <section className={styles.newsSection}>
        <div className="container">
          <NewsList initialNews={news} />
        </div>
      </section>
    </>
  );
}
