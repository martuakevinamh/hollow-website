'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, type NewsItem } from '@/lib/supabase';
import Image from 'next/image';
import { FilePlus, Edit2, Trash2, Newspaper, ImagePlus } from 'lucide-react';
import styles from './news-admin.module.css';

export default function NewsAdmin() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [serverFilter, setServerFilter] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    author: '',
    published_at: new Date().toISOString().split('T')[0],
    is_published: false,
    server: 'samp' as 'samp' | 'fivem' | 'both',
  });

  // Cover Upload State
  const [uploading, setUploading] = useState(false);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Members list for author selection
  const [members, setMembers] = useState<{ name_rp: string; rank: string }[]>([]);

  useEffect(() => {
    fetchNews();
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const { data } = await supabase
        .from('members')
        .select('name_rp, rank')
        .order('name_rp');
      if (data) {
        setMembers(data);
      }
    } catch (err) {
      console.error('Error fetching members list:', err);
    }
  }

  async function fetchNews() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setNews(data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching news');
    } finally {
      setLoading(false);
    }
  }

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // remove special characters
      .replace(/\s+/g, '-'); // replace spaces with hyphens

    setForm((prev) => ({
      ...prev,
      title: val,
      slug: generatedSlug,
    }));
  };

  const handleAddOpen = () => {
    setEditingId(null);
    setForm({
      title: '',
      slug: '',
      content: '',
      author: '',
      published_at: new Date().toISOString().split('T')[0],
      is_published: false,
      server: 'samp',
    });
    setCoverUrl(null);
    setIsFormOpen(true);
  };

  const handleEditOpen = (item: NewsItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      slug: item.slug,
      content: item.content,
      author: item.author,
      published_at: new Date(item.published_at).toISOString().split('T')[0],
      is_published: item.is_published,
      server: item.server || 'both',
    });
    setCoverUrl(item.cover_image_url);
    setIsFormOpen(true);
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      setCoverUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload cover image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      title: form.title,
      slug: form.slug,
      content: form.content,
      author: form.author,
      cover_image_url: coverUrl,
      published_at: new Date(form.published_at).toISOString(),
      is_published: form.is_published,
      server: form.server,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('news')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('news')
          .insert([payload]);

        if (error) throw error;
      }

      setIsFormOpen(false);
      fetchNews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save news article');
    }
  };

  const togglePublish = async (item: NewsItem) => {
    try {
      const { error } = await supabase
        .from('news')
        .update({ is_published: !item.is_published })
        .eq('id', item.id);

      if (error) throw error;
      fetchNews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publication status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this article?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchNews();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete article');
    }
  };

  const filteredNews = news.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                          item.author.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'published' ? item.is_published : 
                          statusFilter === 'draft' ? !item.is_published : true;
    const matchesServer = serverFilter ? item.server === serverFilter : true;
    return matchesSearch && matchesStatus && matchesServer;
  });

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.controlBar}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <select
            value={serverFilter}
            onChange={(e) => setServerFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">All Servers</option>
            <option value="samp">GTA SAMP</option>
            <option value="fivem">GTA FiveM</option>
            <option value="both">Both</option>
          </select>
        </div>
        <button onClick={handleAddOpen} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FilePlus size={18} /> Publish Article
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Fetching news roster...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Slug</th>
                <th>Server</th>
                <th>Author</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={8} className={styles.noData}>
                    No articles found. Write some news about gang event announcements.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className={styles.tableCover}>
                        {item.cover_image_url ? (
                          <Image
                            src={item.cover_image_url}
                            alt={item.title}
                            fill
                            style={{ objectFit: 'cover', borderRadius: '4px' }}
                            sizes="60px"
                          />
                        ) : (
                          <div className={styles.coverFallback}>
                            <Newspaper size={20} strokeWidth={1.5} color="var(--white-dim)" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.newsTitle}>{item.title}</td>
                    <td className={styles.slugCell}><code>/{item.slug}</code></td>
                    <td>
                      <span className={styles.serverBadge}>{item.server}</span>
                    </td>
                    <td>{item.author}</td>
                    <td className={styles.dateCell}>
                      {new Date(item.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => togglePublish(item)}
                        className={`${styles.statusToggle} ${
                          item.is_published ? styles.statusActive : styles.statusInactive
                        }`}
                        title="Click to toggle publication"
                      >
                        {item.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleEditOpen(item)} className={styles.editBtn}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Overlay Modal Form */}
      {isFormOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3>{editingId ? 'Edit News Article' : 'Publish News Article'}</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.modalClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.uploadSection}>
                <div className={styles.coverPreview}>
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt="Cover Preview"
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="160px"
                    />
                  ) : (
                    <div className={styles.previewFallback}>
                      <Newspaper size={32} strokeWidth={1.5} color="var(--white-dim)" />
                    </div>
                  )}
                </div>
                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleCoverUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline"
                    style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                    disabled={uploading}
                  >
                    <ImagePlus size={16} /> {uploading ? 'Uploading...' : 'Upload Cover Image'}
                  </button>
                  <p className={styles.uploadHint}>Recommmended 16:9 ratio. JPG or PNG. Max size 2MB.</p>
                </div>
              </div>

              <div className={styles.formField}>
                <label>Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Hollow Territory Expansion"
                />
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Slug URL (Auto-generated)</label>
                  <input
                    type="text"
                    required
                    value={form.slug}
                    onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                    placeholder="hollow-territory-expansion"
                  />
                </div>

                <div className={styles.formField}>
                  <label>Author</label>
                  <select
                    required
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
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
                    <option value="">-- Select Member --</option>
                    {form.author && !members.some(m => `${m.rank} || ${m.name_rp}` === form.author) && (
                      <option value={form.author}>{form.author}</option>
                    )}
                    {members.map((m) => {
                      const val = `${m.rank} || ${m.name_rp}`;
                      return (
                        <option key={val} value={val}>
                          {val}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Server</label>
                  <select
                    value={form.server}
                    onChange={(e) => setForm({ ...form, server: e.target.value as 'samp' | 'fivem' | 'both' })}
                  >
                    <option value="samp">GTA SAMP</option>
                    <option value="fivem">GTA FiveM</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Publish Date</label>
                  <input
                    type="date"
                    required
                    value={form.published_at}
                    onChange={(e) => setForm({ ...form, published_at: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label>Content</label>
                <textarea
                  rows={8}
                  required
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Write the article content body here. Separate paragraphs with a blank line for readability."
                />
              </div>

              <div className={styles.checkboxField}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  />
                  <span>Publish immediately (Show on public news feed)</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
