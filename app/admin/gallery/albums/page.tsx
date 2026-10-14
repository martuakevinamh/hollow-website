'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase, type GalleryAlbum, type GalleryItem, type GalleryVideo } from '@/lib/supabase';
import Image from 'next/image';
import {
  FolderPlus,
  Trash2,
  ChevronLeft,
  ImagePlus,
  Video,
  X,
  Pencil,
  Save,
  Play,
} from 'lucide-react';
import styles from './albums-admin.module.css';

type AlbumView = 'list' | 'detail';

function extractTikTokId(url: string): string | null {
  const match = url.match(/video\/(\d+)/);
  return match ? match[1] : null;
}

export default function AlbumsAdmin() {
  const [view, setView] = useState<AlbumView>('list');
  const [albums, setAlbums] = useState<GalleryAlbum[]>([]);
  const [activeAlbum, setActiveAlbum] = useState<GalleryAlbum | null>(null);
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<GalleryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Album form
  const [albumFormOpen, setAlbumFormOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [albumTitle, setAlbumTitle] = useState('');
  const [albumDesc, setAlbumDesc] = useState('');
  const [albumServer, setAlbumServer] = useState<'samp' | 'fivem' | 'both'>('both');
  const [albumDate, setAlbumDate] = useState('');
  const [albumSaving, setAlbumSaving] = useState(false);

  // Photo upload
  const [photoFormOpen, setPhotoFormOpen] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoFiles, setPhotoFiles] = useState<{ file: File; preview: string }[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Video form
  const [videoFormOpen, setVideoFormOpen] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoServer, setVideoServer] = useState<'samp' | 'fivem' | 'both'>('both');
  const [videoSaving, setVideoSaving] = useState(false);

  const fetchAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('event_date', { ascending: false });
      if (error) throw error;

      // Hitung jumlah foto & video per album
      const albumsWithCounts = await Promise.all(
        (data ?? []).map(async (album) => {
          const [{ count: photoCount }, { count: videoCount }] = await Promise.all([
            supabase.from('gallery').select('id', { count: 'exact', head: true }).eq('album_id', album.id),
            supabase.from('gallery_videos').select('id', { count: 'exact', head: true }).eq('album_id', album.id),
          ]);
          return { ...album, photo_count: photoCount ?? 0, video_count: videoCount ?? 0 };
        })
      );
      setAlbums(albumsWithCounts);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch albums');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbumContent = useCallback(async (albumId: string) => {
    const [{ data: photoData }, { data: videoData }] = await Promise.all([
      supabase.from('gallery').select('*').eq('album_id', albumId).order('uploaded_at', { ascending: false }),
      supabase.from('gallery_videos').select('*').eq('album_id', albumId).order('created_at', { ascending: false }),
    ]);
    setPhotos(photoData ?? []);
    setVideos(videoData ?? []);
  }, []);

  useEffect(() => { fetchAlbums(); }, [fetchAlbums]);

  const openAlbum = (album: GalleryAlbum) => {
    setActiveAlbum(album);
    setView('detail');
    fetchAlbumContent(album.id);
  };

  const openAlbumForm = (album?: GalleryAlbum) => {
    if (album) {
      setEditingAlbum(album);
      setAlbumTitle(album.title);
      setAlbumDesc(album.description ?? '');
      setAlbumServer(album.server);
      setAlbumDate(album.event_date ? album.event_date.substring(0, 10) : '');
    } else {
      setEditingAlbum(null);
      setAlbumTitle('');
      setAlbumDesc('');
      setAlbumServer('both');
      setAlbumDate(new Date().toISOString().substring(0, 10));
    }
    setAlbumFormOpen(true);
  };

  const saveAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumTitle.trim()) return;
    setAlbumSaving(true);
    setError('');
    try {
      const payload = {
        title: albumTitle.trim(),
        description: albumDesc.trim() || null,
        server: albumServer,
        event_date: albumDate || new Date().toISOString(),
      };
      if (editingAlbum) {
        const { error } = await supabase.from('gallery_albums').update(payload).eq('id', editingAlbum.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('gallery_albums').insert(payload);
        if (error) throw error;
      }
      setAlbumFormOpen(false);
      fetchAlbums();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save album');
    } finally {
      setAlbumSaving(false);
    }
  };

  const deleteAlbum = async (album: GalleryAlbum) => {
    if (!confirm(`Hapus album "${album.title}"? Semua foto & video di dalamnya juga akan terhapus.`)) return;
    try {
      const { error } = await supabase.from('gallery_albums').delete().eq('id', album.id);
      if (error) throw error;
      fetchAlbums();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete album');
    }
  };

  // Photo upload
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files).map(file => ({ file, preview: URL.createObjectURL(file) }));
    setPhotoFiles(prev => [...prev, ...newFiles]);
  };

  const uploadPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlbum || photoFiles.length === 0) return;
    setPhotoUploading(true);
    setError('');
    try {
      const records: { title: string; image_url: string; server: string; album_id: string }[] = [];
      for (const { file } of photoFiles) {
        const ext = file.name.split('.').pop();
        const path = `albums/${activeAlbum.id}/${Math.random().toString(36).slice(2)}.${ext}`;
        const { error: upErr } = await supabase.storage.from('gallery-images').upload(path, file);
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('gallery-images').getPublicUrl(path);
        records.push({ title: photoTitle.trim() || file.name, image_url: data.publicUrl, server: activeAlbum.server, album_id: activeAlbum.id });
      }
      const { error: dbErr } = await supabase.from('gallery').insert(records);
      if (dbErr) throw dbErr;
      setPhotoFormOpen(false);
      setPhotoTitle('');
      setPhotoFiles([]);
      fetchAlbumContent(activeAlbum.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setPhotoUploading(false);
    }
  };

  const deletePhoto = async (photo: GalleryItem) => {
    if (!confirm('Hapus foto ini?')) return;
    try {
      await supabase.from('gallery').delete().eq('id', photo.id);
      const urlParts = photo.image_url.split('/gallery-images/');
      if (urlParts.length > 1) {
        await supabase.storage.from('gallery-images').remove([urlParts[1]]);
      }
      if (activeAlbum) fetchAlbumContent(activeAlbum.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete photo');
    }
  };

  const addVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAlbum || !videoTitle.trim() || !videoUrl.trim()) return;
    setVideoSaving(true);
    setError('');
    try {
      const { error } = await supabase.from('gallery_videos').insert({
        title: videoTitle.trim(),
        tiktok_url: videoUrl.trim(),
        album_id: activeAlbum.id,
        server: videoServer,
      });
      if (error) throw error;
      setVideoFormOpen(false);
      setVideoTitle('');
      setVideoUrl('');
      fetchAlbumContent(activeAlbum.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add video');
    } finally {
      setVideoSaving(false);
    }
  };

  const deleteVideo = async (video: GalleryVideo) => {
    if (!confirm('Hapus video ini?')) return;
    try {
      await supabase.from('gallery_videos').delete().eq('id', video.id);
      if (activeAlbum) fetchAlbumContent(activeAlbum.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete video');
    }
  };

  // Cover update: gunakan foto pertama yang diupload jika cover_url kosong
  const setCover = async (photo: GalleryItem) => {
    if (!activeAlbum) return;
    try {
      await supabase.from('gallery_albums').update({ cover_url: photo.image_url }).eq('id', activeAlbum.id);
      setActiveAlbum(prev => prev ? { ...prev, cover_url: photo.image_url } : prev);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to set cover');
    }
  };

  // ────────── RENDER ──────────

  if (view === 'detail' && activeAlbum) {
    return (
      <div className={styles.container}>
        <div className={styles.detailHeader}>
          <button className={styles.backBtn} onClick={() => { setView('list'); fetchAlbums(); }}>
            <ChevronLeft size={16} /> Kembali ke Albums
          </button>
          <div className={styles.detailMeta}>
            <h2 className={styles.detailTitle}>{activeAlbum.title}</h2>
            {activeAlbum.description && <p className={styles.detailDesc}>{activeAlbum.description}</p>}
          </div>
          <div className={styles.detailActions}>
            <button className={styles.btnSecondary} onClick={() => setPhotoFormOpen(true)}>
              <ImagePlus size={16} /> Tambah Foto
            </button>
            <button className={styles.btnSecondary} onClick={() => setVideoFormOpen(true)}>
              <Video size={16} /> Tambah Video
            </button>
          </div>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* Photos grid */}
        {photos.length > 0 && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionLabel}>Foto ({photos.length})</h3>
            <div className={styles.photoGrid}>
              {photos.map(photo => (
                <div key={photo.id} className={styles.photoCard}>
                  <div className={styles.photoThumb}>
                    <Image src={photo.image_url} alt={photo.title} fill style={{ objectFit: 'cover' }} />
                    <div className={styles.photoOverlay}>
                      <button className={styles.setCoverBtn} onClick={() => setCover(photo)} title="Jadikan cover album">
                        <Save size={13} />
                      </button>
                      <button className={styles.deletePhotoBtn} onClick={() => deletePhoto(photo)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <span className={styles.photoTitle}>{photo.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <div className={styles.sectionBlock}>
            <h3 className={styles.sectionLabel}>Video TikTok ({videos.length})</h3>
            <div className={styles.videoGrid}>
              {videos.map(video => {
                const tikId = extractTikTokId(video.tiktok_url);
                return (
                  <div key={video.id} className={styles.videoCard}>
                    <div className={styles.videoEmbed}>
                      {tikId ? (
                        <iframe
                          src={`https://www.tiktok.com/embed/v2/${tikId}`}
                          allowFullScreen
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                          style={{ border: 0, width: '100%', height: '100%' }}
                        />
                      ) : (
                        <div className={styles.videoPlaceholder}>
                          <Play size={28} />
                          <span>Preview tidak tersedia</span>
                        </div>
                      )}
                    </div>
                    <div className={styles.videoMeta}>
                      <span className={styles.videoTitle}>{video.title}</span>
                      <button className={styles.deleteVideoBtn} onClick={() => deleteVideo(video)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {photos.length === 0 && videos.length === 0 && (
          <div className={styles.emptyAlbum}>
            <ImagePlus size={40} strokeWidth={1.2} />
            <p>Album ini masih kosong. Tambah foto atau video TikTok.</p>
          </div>
        )}

        {/* Photo upload modal */}
        {photoFormOpen && (
          <div className={styles.modalOverlay} onClick={() => setPhotoFormOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Tambah Foto ke Album</h3>
                <button onClick={() => setPhotoFormOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={uploadPhotos} className={styles.form}>
                <input className={styles.input} placeholder="Label foto (opsional)" value={photoTitle} onChange={e => setPhotoTitle(e.target.value)} />
                <div
                  className={styles.dropZone}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <ImagePlus size={28} strokeWidth={1.2} />
                  <span>Klik untuk pilih foto (bisa banyak)</span>
                  <input ref={photoInputRef} type="file" multiple accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                </div>
                {photoFiles.length > 0 && (
                  <div className={styles.previewGrid}>
                    {photoFiles.map((f, i) => (
                      <div key={i} className={styles.previewThumb}>
                        <Image src={f.preview} alt="" fill style={{ objectFit: 'cover' }} />
                        <button type="button" className={styles.removePreview} onClick={() => {
                          URL.revokeObjectURL(f.preview);
                          setPhotoFiles(prev => prev.filter((_, j) => j !== i));
                        }}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                )}
                {error && <p className={styles.formError}>{error}</p>}
                <button type="submit" className={styles.btnPrimary} disabled={photoUploading || photoFiles.length === 0}>
                  {photoUploading ? 'Uploading...' : `Upload ${photoFiles.length} Foto`}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Video form modal */}
        {videoFormOpen && (
          <div className={styles.modalOverlay} onClick={() => setVideoFormOpen(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>Tambah Video TikTok</h3>
                <button onClick={() => setVideoFormOpen(false)}><X size={18} /></button>
              </div>
              <form onSubmit={addVideo} className={styles.form}>
                <input className={styles.input} placeholder="Judul video *" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} required />
                <input className={styles.input} placeholder="URL TikTok (https://www.tiktok.com/...) *" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required />
                <select className={styles.select} value={videoServer} onChange={e => setVideoServer(e.target.value as 'samp' | 'fivem' | 'both')}>
                  <option value="samp">GTA SAMP</option>
                  <option value="fivem">GTA FiveM</option>
                  <option value="both">Keduanya</option>
                </select>
                {error && <p className={styles.formError}>{error}</p>}
                <button type="submit" className={styles.btnPrimary} disabled={videoSaving}>
                  {videoSaving ? 'Menyimpan...' : 'Tambah Video'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ────────── ALBUM LIST VIEW ──────────
  return (
    <div className={styles.container}>
      <div className={styles.controlBar}>
        <h2 className={styles.pageTitle}>Gallery Albums</h2>
        <button className={styles.btnPrimary} onClick={() => openAlbumForm()}>
          <FolderPlus size={16} /> Buat Album
        </button>
      </div>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.loadingRow}>Memuat albums...</div>
      ) : albums.length === 0 ? (
        <div className={styles.emptyAlbum}>
          <FolderPlus size={40} strokeWidth={1.2} />
          <p>Belum ada album. Buat album pertama dan isi dengan foto & video.</p>
        </div>
      ) : (
        <div className={styles.albumGrid}>
          {albums.map(album => (
            <div key={album.id} className={styles.albumCard} onClick={() => openAlbum(album)}>
              <div className={styles.albumCover}>
                {album.cover_url ? (
                  <Image src={album.cover_url} alt={album.title} fill style={{ objectFit: 'cover' }} />
                ) : (
                  <div className={styles.albumCoverPlaceholder}>
                    <ImagePlus size={32} strokeWidth={1.2} />
                  </div>
                )}
                <div className={styles.albumBadges}>
                  <span className={styles.badge}>{album.server.toUpperCase()}</span>
                </div>
              </div>
              <div className={styles.albumInfo}>
                <span className={styles.albumTitle}>{album.title}</span>
                <span className={styles.albumMeta}>
                  {album.photo_count} foto · {album.video_count} video
                </span>
                <span className={styles.albumDate}>
                  {new Date(album.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className={styles.albumCardActions} onClick={e => e.stopPropagation()}>
                <button className={styles.editAlbumBtn} onClick={() => openAlbumForm(album)}>
                  <Pencil size={14} />
                </button>
                <button className={styles.deleteAlbumBtn} onClick={() => deleteAlbum(album)}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Album create/edit modal */}
      {albumFormOpen && (
        <div className={styles.modalOverlay} onClick={() => setAlbumFormOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{editingAlbum ? 'Edit Album' : 'Buat Album Baru'}</h3>
              <button onClick={() => setAlbumFormOpen(false)}><X size={18} /></button>
            </div>
            <form onSubmit={saveAlbum} className={styles.form}>
              <input className={styles.input} placeholder="Judul album *" value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} required />
              <textarea className={styles.textarea} placeholder="Deskripsi (opsional)" value={albumDesc} onChange={e => setAlbumDesc(e.target.value)} rows={3} />
              <select className={styles.select} value={albumServer} onChange={e => setAlbumServer(e.target.value as 'samp' | 'fivem' | 'both')}>
                <option value="samp">GTA SAMP</option>
                <option value="fivem">GTA FiveM</option>
                <option value="both">Keduanya</option>
              </select>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Tanggal Event</label>
                <input type="date" className={styles.input} value={albumDate} onChange={e => setAlbumDate(e.target.value)} />
              </div>
              {error && <p className={styles.formError}>{error}</p>}
              <button type="submit" className={styles.btnPrimary} disabled={albumSaving}>
                {albumSaving ? 'Menyimpan...' : editingAlbum ? 'Simpan Perubahan' : 'Buat Album'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
