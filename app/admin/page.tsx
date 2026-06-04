'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import {
  Users,
  Images,
  Newspaper,
  UserPlus,
  ImagePlus,
  FilePlus,
  AlertTriangle,
  HardDrive,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    members: 0,
    news: 0,
    gallery: 0,
  });
  const [loading, setLoading] = useState(true);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [storageSetup, setStorageSetup] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [storageResults, setStorageResults] = useState<{ bucket: string; status: string; message: string }[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: membersCount, error: membersErr },
          { count: newsCount, error: newsErr },
          { count: galleryCount }
        ] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact', head: true }),
          supabase.from('news').select('*', { count: 'exact', head: true }),
          supabase.from('gallery').select('*', { count: 'exact', head: true }),
        ]);

        if (membersErr?.message === 'Not configured' || newsErr?.message === 'Not configured') {
          setDbConfigured(false);
          setLoading(false);
          return;
        }

        setStats({
          members: membersCount || 0,
          news: newsCount || 0,
          gallery: galleryCount || 0,
        });
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  async function handleSetupStorage() {
    setStorageSetup('loading');
    try {
      const res = await fetch('/api/admin/setup-storage', { method: 'POST' });
      const json = await res.json();
      setStorageResults(json.results || []);
      setStorageSetup(res.ok ? 'done' : 'error');
    } catch {
      setStorageSetup('error');
      setStorageResults([{ bucket: 'unknown', status: 'error', message: 'Network error — check server logs.' }]);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading stats...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {!dbConfigured && (
        <div className={styles.warningBanner}>
          <h3><AlertTriangle size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Database Not Configured</h3>
          <p>
            Your Supabase credentials are missing or default in <code>.env.local</code>. 
            Please configure them to view real stats and manage data. Database operations will fail.
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Users size={24} strokeWidth={1.5} /></div>
          <div>
            <div className={styles.statVal}>{stats.members}</div>
            <div className={styles.statLabel}>Roster Members</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Images size={24} strokeWidth={1.5} /></div>
          <div>
            <div className={styles.statVal}>{stats.gallery}</div>
            <div className={styles.statLabel}>Gallery Images</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><Newspaper size={24} strokeWidth={1.5} /></div>
          <div>
            <div className={styles.statVal}>{stats.news}</div>
            <div className={styles.statLabel}>News Articles</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickSection}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionsGrid}>
          <Link href="/admin/members?add=true" className={styles.actionBtn}>
            <span className={styles.actionIcon}><UserPlus size={28} strokeWidth={1.5} /></span>
            <span>Add Member</span>
          </Link>
          <Link href="/admin/gallery?add=true" className={styles.actionBtn}>
            <span className={styles.actionIcon}><ImagePlus size={28} strokeWidth={1.5} /></span>
            <span>Upload Photo</span>
          </Link>
          <Link href="/admin/news?add=true" className={styles.actionBtn}>
            <span className={styles.actionIcon}><FilePlus size={28} strokeWidth={1.5} /></span>
            <span>Publish Article</span>
          </Link>
        </div>
      </div>

      {/* Storage Setup */}
      <div className={styles.systemInfo}>
        <h3 className={styles.sectionTitle}>Storage Setup</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--white-dim)', marginBottom: '16px' }}>
          Jalankan sekali untuk membuat bucket <code>gallery-images</code> dan <code>member-photos</code> di Supabase Storage.
        </p>
        <button
          onClick={handleSetupStorage}
          disabled={storageSetup === 'loading'}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
        >
          <HardDrive size={16} />
          {storageSetup === 'loading' ? 'Creating buckets...' : 'Setup Storage Buckets'}
        </button>
        {storageResults.length > 0 && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {storageResults.map((r) => (
              <div key={r.bucket} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem' }}>
                {r.status === 'error'
                  ? <XCircle size={16} color="#ff4d6d" />
                  : <CheckCircle2 size={16} color="#4ade80" />}
                <code style={{ color: 'var(--white)' }}>{r.bucket}</code>
                <span style={{ color: 'var(--white-dim)' }}>— {r.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Information */}
      <div className={styles.systemInfo}>
        <h3 className={styles.sectionTitle}>System Status</h3>
        <table className={styles.statusTable}>
          <tbody>
            <tr>
              <td>Supabase connection:</td>
              <td>{dbConfigured ? <span className={styles.statusActive}>● Active</span> : <span className={styles.statusInactive}>● Disconnected</span>}</td>
            </tr>
            <tr>
              <td>Auth provider:</td>
              <td><span className={styles.statusActive}>● Firebase Auth (Active)</span></td>
            </tr>
            <tr>
              <td>Node environment:</td>
              <td><code>{process.env.NODE_ENV}</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
