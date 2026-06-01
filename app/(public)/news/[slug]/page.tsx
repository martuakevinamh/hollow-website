import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabase, type NewsItem } from '@/lib/supabase';
import styles from './detail.module.css';

// params is a Promise in Next.js 16
type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string): Promise<NewsItem | null> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

async function getRelated(currentSlug: string): Promise<NewsItem[]> {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('is_published', true)
      .neq('slug', currentSlug)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) return [];
    return data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Artikel tidak ditemukan' };

  return {
    title: article.title,
    description: `${article.title} — Ditulis oleh ${article.author} di Hollow.`,
    openGraph: {
      title: article.title,
      description: `Berita dari Hollow oleh ${article.author}.`,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

export async function generateStaticParams() {
  // Return empty array: all slug paths rendered on first request
  return [];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  const related = await getRelated(slug);

  return (
    <>
      {/* Article Hero */}
      <section className={styles.articleHero}>
        {article.cover_image_url ? (
          <div className={styles.heroBg}>
            <Image
              src={article.cover_image_url}
              alt={article.title}
              fill
              priority
              quality={85}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
            <div className={styles.heroOverlay} />
          </div>
        ) : (
          <div className={styles.heroBgPlain} />
        )}

        <div className={`container ${styles.heroContent}`}>
          <Link href="/news" className={styles.backLink}>
            ← Kembali ke News
          </Link>
          <div className={styles.articleMeta}>
            <span className={styles.author}>By {article.author}</span>
            <span className={styles.dot}>·</span>
            <time className={styles.date} dateTime={article.published_at}>
              {formatDate(article.published_at)}
            </time>
          </div>
          <h1 className={styles.articleTitle}>{article.title}</h1>
        </div>
      </section>

      {/* Article Body */}
      <section className={styles.articleSection}>
        <div className="container">
          <div className={styles.articleLayout}>
            {/* Content */}
            <article className={styles.articleContent}>
              {/* Render content paragraphs */}
              {article.content.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </article>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Tentang Penulis</h3>
                <div className={styles.authorCard}>
                  <div className={styles.authorAvatar}>
                    {article.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.authorName}>{article.author}</div>
                    <div className={styles.authorRole}>Hollow</div>
                  </div>
                </div>
              </div>

              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Informasi</h3>
                <dl className={styles.infoList}>
                  <dt>Dipublikasikan</dt>
                  <dd>{formatDate(article.published_at)}</dd>
                  <dt>Penulis</dt>
                  <dd>{article.author}</dd>
                </dl>
              </div>

              <Link href="/join" className={`btn btn-primary ${styles.joinBtn}`} id="news-join-cta">
                Join Hollow →
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className="container">
            <div className="section-header">
              <span className="section-tag">Baca Juga</span>
              <h2 className="section-title">Artikel <span>Terkait</span></h2>
            </div>
            <div className={styles.relatedGrid}>
              {related.map((item) => (
                <Link key={item.id} href={`/news/${item.slug}`} className={styles.relatedCard}>
                  <div className={styles.relatedImg}>
                    {item.cover_image_url ? (
                      <Image
                        src={item.cover_image_url}
                        alt={item.title}
                        fill
                        className={styles.relatedThumb}
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                    ) : (
                      <div className={styles.relatedImgFallback}>📰</div>
                    )}
                  </div>
                  <div className={styles.relatedBody}>
                    <h3 className={styles.relatedTitle}>{item.title}</h3>
                    <span className={styles.relatedDate}>
                      {new Date(item.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
