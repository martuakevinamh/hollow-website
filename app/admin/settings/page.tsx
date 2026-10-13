'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Settings,
  BookOpen,
  Gamepad2,
  Building2,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Plus,
  RefreshCw,
  Upload,
  Trash2,
  Save,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import {
  supabase,
  type SiteSettings,
  DEFAULT_SETTINGS,
  type ServerCity,
  DEFAULT_SERVER_CITIES,
} from '@/lib/supabase';
import styles from './settings.module.css';

type Tab = 'about' | 'servers' | 'logos' | 'socials';

function generateLogoPath(prefix: string, fileName: string): string {
  const ext = fileName.split('.').pop() || 'png';
  const slug = prefix.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `city-${slug}-${Date.now()}.${ext}`;
}

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('about');
  const [form, setForm] = useState<SiteSettings>({ ...DEFAULT_SETTINGS });
  const [cities, setCities] = useState<ServerCity[]>(DEFAULT_SERVER_CITIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingCityId, setUploadingCityId] = useState<string | null>(null);

  // Dynamic City Form State
  const [isCityFormOpen, setIsCityFormOpen] = useState(false);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [cityNameInput, setCityNameInput] = useState('');
  const [cityServerInput, setCityServerInput] = useState<'samp' | 'fivem'>('samp');
  const [cityColorInput, setCityColorInput] = useState('#e2a02b');
  const [citySaving, setCitySaving] = useState(false);

  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    let isMounted = true;

    // Load site settings
    Promise.resolve(supabase.from('settings').select('key, value'))
      .then(({ data, error: fetchErr }) => {
        if (!isMounted) return;
        if (fetchErr) {
          setError(fetchErr.message);
        } else if (data && data.length > 0) {
          const dbSettings = { ...DEFAULT_SETTINGS };
          data.forEach((item: { key: string; value: string }) => {
            if (item.key in dbSettings) {
              (dbSettings as Record<string, string>)[item.key] = item.value;
            }
          });
          setForm(dbSettings);
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Error fetching settings');
        setLoading(false);
      });

    // Load dynamic server cities
    Promise.resolve(
      supabase.from('server_cities').select('*').order('sort_order', { ascending: true })
    )
      .then(({ data, error: cityErr }) => {
        if (!isMounted) return;
        if (!cityErr && data && data.length > 0) {
          setCities(data);
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_SERVER_CITIES silently
      });

    return () => {
      isMounted = false;
    };
  }, []);

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
      const { error: saveErr } = await supabase.from('settings').upsert(records);
      if (saveErr) {
        setError(saveErr.message);
      } else {
        setSuccess('Pengaturan berhasil diperbarui!');
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  }

  // ─── Dynamic City Handlers ───
  function handleOpenAddCity() {
    setEditingCityId(null);
    setCityNameInput('');
    setCityServerInput('samp');
    setCityColorInput('#e2a02b');
    setIsCityFormOpen(true);
  }

  function handleOpenEditCity(city: ServerCity) {
    setEditingCityId(city.id);
    setCityNameInput(city.name);
    setCityServerInput(city.server);
    setCityColorInput(city.color);
    setIsCityFormOpen(true);
  }

  async function handleSaveCity(e: React.FormEvent) {
    e.preventDefault();
    if (!cityNameInput.trim()) {
      setError('Nama server kota wajib diisi.');
      return;
    }

    setCitySaving(true);
    setError('');

    try {
      if (editingCityId) {
        // Update existing city
        const { error: updErr } = await supabase
          .from('server_cities')
          .update({
            name: cityNameInput.trim(),
            server: cityServerInput,
            color: cityColorInput,
          })
          .eq('id', editingCityId);

        if (updErr) throw updErr;

        setCities((prev) =>
          prev.map((c) =>
            c.id === editingCityId
              ? { ...c, name: cityNameInput.trim(), server: cityServerInput, color: cityColorInput }
              : c
          )
        );
        setSuccess(`Kota "${cityNameInput.trim()}" berhasil diperbarui!`);
      } else {
        // Create new city
        const newSortOrder = cities.length + 1;
        const { data: newRow, error: insErr } = await supabase
          .from('server_cities')
          .insert([
            {
              name: cityNameInput.trim(),
              server: cityServerInput,
              color: cityColorInput,
              sort_order: newSortOrder,
              is_active: true,
            },
          ])
          .select()
          .single();

        if (insErr) throw insErr;

        if (newRow) {
          setCities((prev) => [...prev, newRow]);
        }
        setSuccess(`Kota baru "${cityNameInput.trim()}" berhasil ditambahkan!`);
      }

      setIsCityFormOpen(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan kota');
    } finally {
      setCitySaving(false);
    }
  }

  async function handleDeleteCity(cityId: string, cityName: string) {
    if (!confirm(`Hapus server kota "${cityName}"? Kota ini tidak akan muncul lagi di website.`)) {
      return;
    }

    try {
      const { error: delErr } = await supabase
        .from('server_cities')
        .delete()
        .eq('id', cityId);

      if (delErr) throw delErr;

      setCities((prev) => prev.filter((c) => c.id !== cityId));
      setSuccess(`Kota "${cityName}" berhasil dihapus.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus kota');
    }
  }

  async function handleCityLogoUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    city: ServerCity
  ) {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const path = generateLogoPath(city.name, file.name);

    setUploadingCityId(city.id);
    setError('');

    try {
      const { error: upErr } = await supabase.storage
        .from('city-logos')
        .upload(path, file, { upsert: true });

      if (upErr) throw upErr;

      const { data } = supabase.storage.from('city-logos').getPublicUrl(path);
      const publicUrl = data.publicUrl;

      // Update database
      const { error: updErr } = await supabase
        .from('server_cities')
        .update({ logo_url: publicUrl })
        .eq('id', city.id);

      if (updErr) throw updErr;

      setCities((prev) =>
        prev.map((c) => (c.id === city.id ? { ...c, logo_url: publicUrl } : c))
      );

      setSuccess(`Logo untuk "${city.name}" berhasil diupload!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal upload logo kota';
      if (msg.toLowerCase().includes('row-level security') || msg.toLowerCase().includes('violates')) {
        setError('Storage RLS Policy: Bucket "city-logos" belum memiliki policy INSERT di Supabase. Jalankan query SQL Storage Policy di Supabase SQL Editor.');
      } else {
        setError(msg);
      }
    } finally {
      setUploadingCityId(null);
      e.target.value = '';
    }
  }

  async function handleCityLogoDelete(city: ServerCity) {
    try {
      const { error: updErr } = await supabase
        .from('server_cities')
        .update({ logo_url: null })
        .eq('id', city.id);

      if (updErr) throw updErr;

      setCities((prev) =>
        prev.map((c) => (c.id === city.id ? { ...c, logo_url: null } : c))
      );

      setSuccess(`Logo "${city.name}" dihapus.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal hapus logo kota');
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
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={24} color="var(--crimson-bright)" /> Hollow Site Settings
        </h2>
        <p>Kelola konten dinamis, cerita About Us, server kota aktif, dan tautan sosial media resmi Hollow.</p>
      </div>

      <div className={styles.tabs}>
        {([
          ['about',   'Cerita Utama', BookOpen],
          ['servers', 'Konten Server', Gamepad2],
          ['logos',   'Server Kota & Logo', Building2],
          ['socials', 'Sosial Media', Share2],
        ] as [Tab, string, LucideIcon][]).map(([tab, label, TabIcon]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.activeTabBtn : ''}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <TabIcon size={16} />
            {label}
          </button>
        ))}
      </div>

      {error   && <div className={styles.errorAlert} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> {error}</div>}
      {success && <div className={styles.successAlert} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={16} /> {success}</div>}

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* ─── TAB: ABOUT ─── */}
          {activeTab === 'about' && (
            <div className={styles.formGrid}>
              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label>Judul Cerita Utama (About Us)</label>
                <input
                  type="text"
                  required
                  value={form.about_story_title}
                  onChange={(e) => setForm({ ...form, about_story_title: e.target.value })}
                />
              </div>

              <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                <label>Deskripsi Cerita Utama</label>
                <textarea
                  required
                  rows={4}
                  value={form.about_story_desc}
                  onChange={(e) => setForm({ ...form, about_story_desc: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* ─── TAB: SERVERS CONTENT ─── */}
          {activeTab === 'servers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 className={styles.formSectionTitle}>GTA SA:MP (THE HOLLOW BLOCK)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Judul Lore SAMP</label>
                    <input
                      type="text"
                      required
                      value={form.about_samp_title}
                      onChange={(e) => setForm({ ...form, about_samp_title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Konten Lore SAMP</label>
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
                <h3 className={styles.formSectionTitle}>GTA FIVEM (THE HOLLOW NORTHENWALL)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Judul Lore FiveM</label>
                    <input
                      type="text"
                      required
                      value={form.about_fivem_title}
                      onChange={(e) => setForm({ ...form, about_fivem_title: e.target.value })}
                    />
                  </div>
                  <div className={styles.formField} style={{ gridColumn: '1 / -1' }}>
                    <label>Konten Lore FiveM</label>
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

          {/* ─── TAB: SERVER KOTA & LOGO (FULL DINAMIS) ─── */}
          {activeTab === 'logos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className={styles.cityHeaderRow}>
                <div>
                  <h3 className={styles.formSectionTitle} style={{ margin: 0 }}>
                    DAFTAR SERVER KOTA AKTIF ({cities.length})
                  </h3>
                  <p style={{ color: 'var(--white-dim)', fontSize: '0.8rem', margin: '4px 0 0 0' }}>
                    Kelola kota tempat Hollow aktif bermain di SAMP & FiveM. Admin bebas menambah kota baru, mengatur warna, dan mengupload logo.
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                  onClick={handleOpenAddCity}
                >
                  + Tambah Server Kota
                </button>
              </div>

              {/* Form Tambah/Edit Kota */}
              {isCityFormOpen && (
                <div className={styles.addCityBox}>
                  <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--white)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {editingCityId ? (
                      <>
                        <Pencil size={14} /> Edit Server Kota
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Tambah Server Kota Baru
                      </>
                    )}
                  </h4>
                  <div className={styles.cityFormGrid}>
                    <div className={styles.formField}>
                      <label>Nama Server Kota</label>
                      <input
                        type="text"
                        placeholder="Contoh: MandalikaRP, BataviaRP..."
                        value={cityNameInput}
                        onChange={(e) => setCityNameInput(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formField}>
                      <label>Platform Server</label>
                      <select
                        value={cityServerInput}
                        onChange={(e) => setCityServerInput(e.target.value as 'samp' | 'fivem')}
                        style={{
                          background: 'var(--bg-base)',
                          border: '1px solid var(--border)',
                          color: 'var(--white)',
                          padding: '12px 16px',
                          borderRadius: 'var(--radius)',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="samp">GTA SA:MP</option>
                        <option value="fivem">GTA FiveM</option>
                      </select>
                    </div>
                    <div className={styles.formField}>
                      <label>Warna Badge (Hex)</label>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={cityColorInput}
                          onChange={(e) => setCityColorInput(e.target.value)}
                          style={{
                            width: '42px',
                            height: '42px',
                            padding: '2px',
                            background: 'none',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius)',
                            cursor: 'pointer',
                          }}
                        />
                        <input
                          type="text"
                          value={cityColorInput}
                          onChange={(e) => setCityColorInput(e.target.value)}
                          style={{ flex: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      onClick={() => setIsCityFormOpen(false)}
                      disabled={citySaving}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                      onClick={handleSaveCity}
                      disabled={citySaving}
                    >
                      {citySaving ? 'Menyimpan...' : editingCityId ? 'Update Kota' : 'Simpan Kota'}
                    </button>
                  </div>
                </div>
              )}

              {/* Daftar Kartu Kota */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cities.map((city) => {
                  const isUploading = uploadingCityId === city.id;

                  return (
                    <div key={city.id} className={styles.logoRow}>
                      {/* Color accent bar */}
                      <div className={styles.logoAccent} style={{ background: city.color }} />

                      <div className={styles.logoPreviewWrap}>
                        {city.logo_url ? (
                          <Image
                            src={city.logo_url}
                            alt={city.name}
                            width={56}
                            height={56}
                            className={styles.logoPreview}
                            unoptimized
                          />
                        ) : (
                          <div
                            className={styles.logoPlaceholder}
                            style={{ borderColor: `${city.color}55`, color: city.color }}
                          >
                            <Building2 size={24} style={{ opacity: 0.8 }} />
                          </div>
                        )}
                      </div>

                      <div className={styles.logoInfo}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.logoCityName} style={{ color: city.color }}>
                            {city.name}
                          </span>
                          <span
                            className={`${styles.platformPill} ${
                              city.server === 'samp' ? styles.pillSamp : styles.pillFivem
                            }`}
                          >
                            {city.server.toUpperCase()}
                          </span>
                        </div>
                        <span className={styles.logoHint}>
                          {city.logo_url ? 'Logo aktif terunggah' : 'Belum ada logo gambar (menggunakan icon bawaan)'}
                        </span>
                      </div>

                      <div className={styles.logoActions}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          ref={(el) => {
                            fileRefs.current[city.id] = el;
                          }}
                          onChange={(e) => handleCityLogoUpload(e, city)}
                        />
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                          disabled={isUploading}
                          onClick={() => fileRefs.current[city.id]?.click()}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 size={13} className="animate-spin" /> Uploading...
                            </>
                          ) : city.logo_url ? (
                            <>
                              <RefreshCw size={13} /> Ganti Logo
                            </>
                          ) : (
                            <>
                              <Upload size={13} /> Upload Logo
                            </>
                          )}
                        </button>

                        {city.logo_url && (
                          <button
                            type="button"
                            className={styles.deleteLogoBtn}
                            onClick={() => handleCityLogoDelete(city)}
                            title="Hapus logo kota"
                          >
                            Hapus Logo
                          </button>
                        )}

                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => handleOpenEditCity(city)}
                          title="Edit nama atau warna kota"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Pencil size={13} /> Edit
                        </button>

                        <button
                          type="button"
                          className={styles.deleteLogoBtn}
                          onClick={() => handleDeleteCity(city.id, city.name)}
                          title="Hapus kota dari sistem"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB: SOCIALS ─── */}
          {activeTab === 'socials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div>
                <h3 className={styles.formSectionTitle}>GTA SA:MP (THE HOLLOW BLOCK)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  {([
                    ['discord_samp',   'Discord SAMP'],
                    ['tiktok_samp',    'TikTok SAMP'],
                    ['youtube_samp',   'YouTube SAMP'],
                    ['instagram_samp', 'Instagram SAMP'],
                  ] as [keyof SiteSettings, string][]).map(([field, label]) => (
                    <div key={field} className={styles.formField}>
                      <label>{label}</label>
                      <input
                        type="url"
                        value={form[field] as string}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className={styles.formSectionTitle}>GTA FIVEM (THE HOLLOW NORTHENWALL)</h3>
                <div className={styles.formGrid} style={{ marginTop: '12px' }}>
                  {([
                    ['discord_fivem',   'Discord FiveM'],
                    ['tiktok_fivem',    'TikTok FiveM'],
                    ['youtube_fivem',   'YouTube FiveM'],
                    ['instagram_fivem', 'Instagram FiveM'],
                  ] as [keyof SiteSettings, string][]).map(([field, label]) => (
                    <div key={field} className={styles.formField}>
                      <label>{label}</label>
                      <input
                        type="url"
                        value={form[field] as string}
                        onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                        placeholder="https://..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button — only for non-city tabs (city actions save immediately) */}
          {activeTab !== 'logos' && (
            <div className={styles.formActions}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Simpan Perubahan
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
