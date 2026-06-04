'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, type GalleryItem } from '@/lib/supabase';
import Image from 'next/image';
import { ImagePlus, Trash2, Camera, X } from 'lucide-react';
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
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
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
    setSelectedFiles([]);
    setIsFormOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const newFiles = Array.from(e.target.files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const uploadedRecords = [];

      // Loop through all selected files and upload them
      for (const { file } of selectedFiles) {
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

        uploadedRecords.push({
          title,
          image_url: data.publicUrl,
          server
        });
      }

      // Insert all records at once into the database
      const { error: dbError } = await supabase
        .from('gallery')
        .insert(uploadedRecords);

      if (dbError) throw dbError;

      setIsFormOpen(false);
      fetchGallery();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save gallery items');
    } finally {
      setUploading(false);
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
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={styles.dropzone}
                >
                  <span className={styles.dropzoneIcon}>
                    <Camera size={32} strokeWidth={1.5} color="var(--white-dim)" />
                  </span>
                  <span className={styles.dropzoneText}>
                    {uploading ? 'Uploading images...' : 'Click to select multiple images'}
                  </span>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />

                {selectedFiles.length > 0 && (
                  <div className={styles.previewGrid}>
                    {selectedFiles.map((sf, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <Image
                          src={sf.preview}
                          alt="preview"
                          fill
                          style={{ objectFit: 'cover' }}
                        />
                        <button
                          type="button"
                          onClick={() => removeSelectedFile(idx)}
                          className={styles.removePreviewBtn}
                          disabled={uploading}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
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
                <button type="submit" className="btn btn-primary" disabled={selectedFiles.length === 0 || uploading}>
                  {uploading ? 'Uploading...' : 'Upload All Photos'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
