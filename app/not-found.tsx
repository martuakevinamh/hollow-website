import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        textAlign: 'center',
        background: 'var(--bg-base, #09090f)',
        color: '#ffffff',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'rgba(178, 34, 52, 0.12)',
          border: '1px solid rgba(178, 34, 52, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--crimson, #B22234)',
          marginBottom: '24px',
        }}
      >
        <ShieldAlert size={36} strokeWidth={1.8} />
      </div>

      <h1
        style={{
          fontFamily: 'var(--font-display, sans-serif)',
          fontSize: '3rem',
          fontWeight: 900,
          letterSpacing: '0.05em',
          margin: '0 0 12px 0',
          color: '#ffffff',
        }}
      >
        404
      </h1>

      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          color: 'var(--white-dim, #a0a0b0)',
          margin: '0 0 16px 0',
        }}
      >
        Artikel atau Halaman Tidak Ditemukan
      </h2>

      <p
        style={{
          maxWidth: '460px',
          color: 'var(--white-muted, #707080)',
          fontSize: '0.9rem',
          lineHeight: 1.6,
          marginBottom: '32px',
        }}
      >
        Halaman atau artikel yang kamu cari mungkin belum dipublikasikan, telah dihapus, atau tautan yang dimasukkan salah.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link
          href="/news"
          className="btn btn-primary"
          style={{ textDecoration: 'none' }}
        >
          Lihat Semua Berita
        </Link>
        <Link
          href="/"
          className="btn btn-outline"
          style={{ textDecoration: 'none' }}
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
