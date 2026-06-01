'use client';

import { useState, useEffect } from 'react';
import { supabase, type SiteSettings, DEFAULT_SETTINGS } from '@/lib/supabase';
import styles from './settings.module.css';

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState<'about' | 'servers' | 'socials'>('about');
  const [form, setForm] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    setError('');
    try {
      const { data, error } = await supabase.from('settings').select('key, value');
      if (error) {
        setError(error.message);
      } else if (data && data.length > 0) {
        const dbSettings = { ...DEFAULT_SETTINGS };
        data.forEach((item: { key: string; value: string }) => {
          if (item.key in dbSettings) {
            (dbSettings as any)[item.key] = item.value;
          }
        });
        setForm(dbSettings);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching settings from database');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const records = Object.entries(form).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    try {
      const { error } = await supabase.from('settings').upsert(records);
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Pengaturan berhasil diperbarui!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Mengambil data pengaturan...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleSection}>
        <h2>⚙️ Hollow Site Settings</h2>
        <p>Kelola konten dinamis, cerita About Us, dan tautan sosial media resmi Hollow.</p>
      </div>

      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab('about')}
          className={`${styles.tabBtn} ${activeTab === 'about' ? styles.activeTabBtn : ''}`}
        >
          📖 Cerita Utama
        </button>
        <button
          onClick={() => setActiveTab('servers')}
          className={`${styles.tabBtn} ${activeTab === 'servers' ? styles.activeTabBtn : ''}`}
        >
          🎮 Konten Server (Lore)
        </button>
        <button
          onClick={() => setActiveTab('socials')}
          className={`${styles.tabBtn} ${activeTab === 'socials' ? styles.activeTabBtn : ''}`}
        >
          📱 Sosial Media & Discord
        </button>
      </div>

      {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
      {success && <div className={styles.successAlert}>✅ {success}</div>}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {activeTab === 'about' && (
            <div className={styles.formGrid}>
              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label>Judul Cerita Utama (About Us)</label>
                <input
                  type="text"
                  required
                  value={form.about_story_title}
                  onChange={(e) => setForm({ ...form, about_story_title: e.target.value })}
                  placeholder="Contoh: Dari Jalanan London ke Dunia Roleplay"
                />
              </div>

              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label>Deskripsi Cerita Utama</label>
                <textarea
                  required
                  rows={6}
                  value={form.about_story_desc}
                  onChange={(e) => setForm({ ...form, about_story_desc: e.target.value })}
                  placeholder="Tulis sejarah/cerita awal mula berdirinya Hollow..."
                />
              </div>
            </div>
          )}

          {activeTab === 'servers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 className={styles.formSectionTitle}>LORE GTA SA:MP</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Judul Tab SAMP</label>
                    <input
                      type="text"
                      required
                      value={form.about_samp_title}
                      onChange={(e) => setForm({ ...form, about_samp_title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Isi Konten SAMP (Mendukung paragraf baru)</label>
                    <textarea
                      required
                      rows={6}
                      value={form.about_samp_content}
                      onChange={(e) => setForm({ ...form, about_samp_content: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={styles.formSectionTitle}>LORE GTA FIVEM</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Judul Tab FiveM</label>
                    <input
                      type="text"
                      required
                      value={form.about_fivem_title}
                      onChange={(e) => setForm({ ...form, about_fivem_title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Isi Konten FiveM (Mendukung paragraf baru)</label>
                    <textarea
                      required
                      rows={6}
                      value={form.about_fivem_content}
                      onChange={(e) => setForm({ ...form, about_fivem_content: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'socials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 className={styles.formSectionTitle}>GTA SA:MP (THE HOLLOW BLOCK)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField}>
                    <label>Discord SAMP</label>
                    <input
                      type="url"
                      value={form.discord_samp}
                      onChange={(e) => setForm({ ...form, discord_samp: e.target.value })}
                      placeholder="https://discord.gg/..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>TikTok SAMP</label>
                    <input
                      type="url"
                      value={form.tiktok_samp}
                      onChange={(e) => setForm({ ...form, tiktok_samp: e.target.value })}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>YouTube SAMP</label>
                    <input
                      type="url"
                      value={form.youtube_samp}
                      onChange={(e) => setForm({ ...form, youtube_samp: e.target.value })}
                      placeholder="https://youtube.com/@..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Instagram SAMP</label>
                    <input
                      type="url"
                      value={form.instagram_samp}
                      onChange={(e) => setForm({ ...form, instagram_samp: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className={styles.formSectionTitle}>GTA FIVEM (THE HOLLOW NORTHENWALL)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField}>
                    <label>Discord FiveM</label>
                    <input
                      type="url"
                      value={form.discord_fivem}
                      onChange={(e) => setForm({ ...form, discord_fivem: e.target.value })}
                      placeholder="https://discord.gg/..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>TikTok FiveM</label>
                    <input
                      type="url"
                      value={form.tiktok_fivem}
                      onChange={(e) => setForm({ ...form, tiktok_fivem: e.target.value })}
                      placeholder="https://tiktok.com/@..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>YouTube FiveM</label>
                    <input
                      type="url"
                      value={form.youtube_fivem}
                      onChange={(e) => setForm({ ...form, youtube_fivem: e.target.value })}
                      placeholder="https://youtube.com/@..."
                    />
                  </div>

                  <div className={styles.formField}>
                    <label>Instagram FiveM</label>
                    <input
                      type="url"
                      value={form.instagram_fivem}
                      onChange={(e) => setForm({ ...form, instagram_fivem: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : '💾 Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
