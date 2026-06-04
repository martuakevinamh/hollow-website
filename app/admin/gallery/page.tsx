'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, type GalleryItem } from '@/lib/supabase';
import Image from 'next/image';
import { ImagePlus, Trash2, Camera } from 'lucide-react';
import styles from './gallery-admin.module.css';

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [serverFilter, setServerFilter] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [server, setServer] = useState<'samp' | 'fivem' | 'both'>('samp');
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setItems(data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching gallery');
    } finally {
      setLoading(false);
    }
  }

  const handleAddOpen = () => {
    setTitle('');
    setServer('samp');
    setImageUrl(null);
    setIsFormOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError('');

      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase Storage bucket 'gallery-images'
      const { error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(filePath);

      setImageUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please upload a photo first');
      return;
    }

    try {
      const { error } = await supabase
        .from('gallery')
        .insert([{ title, image_url: imageUrl, server }]);

      if (error) throw error;

      setIsFormOpen(false);
      fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery item');
    }
  };

  const handleDelete = async (id: string, imageUrlStr: string) => {
    if (!confirm('Are you sure you want to permanently delete this photo?')) {
      return;
    }

    try {
      setError('');
      
      // Attempt to delete from database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Clean up storage (optional, best effort)
      try {
        const urlParts = imageUrlStr.split('/gallery-images/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          await supabase.storage.from('gallery-images').remove([filePath]);
        }
      } catch (storageErr) {
        console.warn('Storage cleanup failed:', storageErr);
      }

      fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchesServer = serverFilter ? item.server === serverFilter : true;
    return matchesSearch && matchesServer;
  });

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.controlBar}>
        <div className={styles.filters} style={{ display: 'flex', gap: '12px', flex: '1' }}>
          <input
            type="text"
            placeholder="🔍 Search photos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            style={{ maxWidth: '300px' }}
          />
          <select
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className={styles.selectInput}
            style={{
              padding: '10px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--white)',
              borderRadius: 'var(--radius)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <option value="">All Servers</option>
            <option value="samp">GTA SAMP</option>
            <option value="fivem">GTA FiveM</option>
            <option value="both">Both</option>
          </select>
        </div>
        <button onClick={handleAddOpen} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ImagePlus size={18} /> Upload Photo
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Loading gallery items...</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredItems.length === 0 ? (
            <div className={styles.noData}>
              No gallery items found. Upload photos of gang events or moments.
            </div>
          ) : (
            filteredItems.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={item.image_url}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                  />
                  <button
                    onClick={() => handleDelete(item.id, item.image_url)}
                    className={styles.deleteBtn}
                    title="Delete photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className={styles.cardBody}>
                  <h4 className={styles.cardTitle}>{item.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: item.server === 'samp' ? 'rgba(178, 34, 52, 0.15)' : item.server === 'fivem' ? 'rgba(40, 167, 69, 0.15)' : 'rgba(28, 41, 81, 0.3)',
                        color: item.server === 'samp' ? '#ff4d6d' : item.server === 'fivem' ? '#4ade80' : '#7ba7f7',
                        border: '1px solid currentColor',
                      }}
                    >
                      {item.server === 'samp' ? 'SAMP' : item.server === 'fivem' ? 'FiveM' : 'Both'}
                    </span>
                    <span className={styles.cardDate}>
                      {new Date(item.uploaded_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Modal Form */}
      {isFormOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>Upload Photo to Gallery</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.modalClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.uploadBox}>
                {imageUrl ? (
                  <div className={styles.previewWrapper}>
                    <Image
                      src={imageUrl}
                      alt="Uploaded preview"
                      fill
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={styles.dropzone}
                  >
                    <span className={styles.dropzoneIcon}>
                      <Camera size={32} strokeWidth={1.5} color="var(--white-dim)" />
                    </span>
                    <span className={styles.dropzoneText}>
                      {uploading ? 'Uploading image...' : 'Click to select image file'}
                    </span>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                />

                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="btn btn-outline"
                    style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    Replace Photo
                  </button>
                )}
              </div>

              <div className={styles.formField}>
                <label>Photo Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Hostile Takeover in Los Santos"
                />
              </div>

              <div className={styles.formField}>
                <label>Server Platform</label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value as 'samp' | 'fivem' | 'both')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--white)',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <option value="samp">GTA SAMP</option>
                  <option value="fivem">GTA FiveM</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={!imageUrl}>
                  Save to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
