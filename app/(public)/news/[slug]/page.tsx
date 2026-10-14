import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Newspaper } from 'lucide-react';
import { supabase, type NewsItem } from '@/lib/supabase';
import { ArticleAlbum } from './ArticleAlbum';
import styles from './detail.module.css';

export const dynamic = 'force-dynamic';

// params is a Promise in Next.js 16
type PageProps = {
  params: Promise<{ slug: string }>;
};

async function getArticle(slug: string): Promise<NewsItem | null> {
  // Opt out of static prerendering — always fetch fresh data from DB
  await connection();

  try {
    const raw = decodeURIComponent(slug || '').trim();
    const withoutTrailingDash = raw.replace(/-+$/, '');

    // 1. Try finding by raw slug (whether published or draft)
    let { data } = await supabase
      .from('news')
      .select('*')
      .eq('slug', raw)
      .maybeSingle();

    // 2. If not found and had trailing dash, try without trailing dash
    if (!data && withoutTrailingDash !== raw) {
      const res = await supabase
        .from('news')
        .select('*')
        .eq('slug', withoutTrailingDash)
        .maybeSingle();
      data = res.data;
    }

    // 3. Fallback: case-insensitive ilike match
    if (!data) {
      const res = await supabase
        .from('news')
        .select('*')
        .ilike('slug', `${withoutTrailingDash}%`)
        .maybeSingle();
      data = res.data;
    }

    if (!data) return null;
    return data as NewsItem;
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
  if (!article) return { title: 'Artikel Tidak Ditemukan | Hollow' };

  return {
    title: `${article.title} | Hollow`,
    description: `${article.title} — Ditulis oleh ${article.author || 'Admin'} di Hollow.`,
    openGraph: {
      title: article.title,
      description: `Berita dari Hollow oleh ${article.author || 'Admin'}.`,
      images: article.cover_image_url ? [article.cover_image_url] : [],
    },
  };
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
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

  const related = await getRelated(article.slug || slug);

  // Extract album photos (from native gallery_images column or embedded tag)
  let albumImages: string[] = [];
  if (Array.isArray(article.gallery_images) && article.gallery_images.length > 0) {
    albumImages = article.gallery_images.filter(Boolean);
  }

  let cleanContent = article.content || '';
  if (cleanContent.includes('<!--hollow_gallery:')) {
    const match = cleanContent.match(/<!--hollow_gallery:(.*?)-->/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        if (Array.isArray(parsed) && albumImages.length === 0) {
          albumImages = parsed.filter(Boolean);
        }
      } catch {}
      cleanContent = cleanContent.replace(/<!--hollow_gallery:(.*?)-->/g, '').trim();
    }
  }

  return (
    <>
      {/* Article Hero */}
      <section className={styles.articleHero}>
        {article.cover_image_url ? (
          <div className={styles.heroBg}>
            <Image
              src={article.cover_image_url}
              alt={article.title || 'News Cover'}
              fill
              priority
              quality={85}
              style={{ objectFit: 'cover', objectPosition: 'center' }}
              unoptimized
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
            <span className={styles.author}>By {article.author || 'Admin'}</span>
            <span className={styles.dot}>·</span>
            <time className={styles.date} dateTime={article.published_at || undefined}>
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
              {cleanContent.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}

              {albumImages.length > 0 && (
                <ArticleAlbum title={article.title} images={albumImages} />
              )}
            </article>

            {/* Sidebar */}
            <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Tentang Penulis</h3>
                <div className={styles.authorCard}>
                  <div className={styles.authorAvatar}>
                    {(article.author || 'Admin').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className={styles.authorName}>{article.author || 'Admin'}</div>
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
                  <dd>{article.author || 'Admin'}</dd>
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
                        alt={item.title || 'Related article'}
                        fill
                        className={styles.relatedThumb}
                        sizes="(max-width: 640px) 100vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className={styles.relatedImgFallback}>
                        <Newspaper size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className={styles.relatedBody}>
                    <h3 className={styles.relatedTitle}>{item.title}</h3>
                    <span className={styles.relatedDate}>
                      {formatDate(item.published_at)}
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
