'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase, type Member } from '@/lib/supabase';
import Image from 'next/image';
import { UserPlus, Edit2, Trash2, User, Camera } from 'lucide-react';
import styles from './members-admin.module.css';

const RANKS = ['TOP OG/KING', 'OG', 'Top Boy', 'Brudda', 'Rude Boy', 'The Youth', 'Muscle'];
const SERVERS = [
  { value: 'samp', label: 'GTA SAMP' },
  { value: 'fivem', label: 'GTA FiveM' },
  { value: 'both', label: 'Both' },
];

export default function MembersAdmin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search / Filters
  const [search, setSearch] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [serverFilter, setServerFilter] = useState('');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name_rp: '',
    rank: 'Muscle',
    server: 'samp' as 'samp' | 'fivem' | 'both',
    bio: '',
    joined_at: new Date().toISOString().split('T')[0],
    is_active: true,
  });
  
  // Image Upload State
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('joined_at', { ascending: false });

      if (error) {
        if (error.message === 'Not configured') {
          setError('Supabase is not configured yet. Please set your credentials in .env.local');
        } else {
          setError(error.message);
        }
      } else {
        setMembers(data || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred fetching members');
    } finally {
      setLoading(false);
    }
  }

  // Open form for adding
  const handleAddOpen = () => {
    setEditingId(null);
    setForm({
      name_rp: '',
      rank: 'Muscle',
      server: 'samp',
      bio: '',
      joined_at: new Date().toISOString().split('T')[0],
      is_active: true,
    });
    setPhotoUrl(null);
    setIsFormOpen(true);
  };

  // Open form for editing
  const handleEditOpen = (member: Member) => {
    setEditingId(member.id);
    setForm({
      name_rp: member.name_rp,
      rank: member.rank,
      server: member.server,
      bio: member.bio || '',
      joined_at: new Date(member.joined_at).toISOString().split('T')[0],
      is_active: member.is_active,
    });
    setPhotoUrl(member.photo_url);
    setIsFormOpen(true);
  };

  // Handle Photo Upload
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

      // Upload file to Supabase Storage bucket 'member-photos'
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from('member-photos')
        .getPublicUrl(filePath);

      setPhotoUrl(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Handle submit (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const payload = {
      name_rp: form.name_rp,
      rank: form.rank,
      server: form.server,
      bio: form.bio || null,
      photo_url: photoUrl,
      joined_at: new Date(form.joined_at).toISOString(),
      is_active: form.is_active,
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from('members')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('members')
          .insert([payload]);

        if (error) throw error;
      }

      setIsFormOpen(false);
      fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    }
  };

  // Toggle active/inactive directly from the list
  const toggleActive = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: !member.is_active })
        .eq('id', member.id);

      if (error) throw error;
      fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update member status');
    }
  };

  // Delete Member
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this member?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMembers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete member');
    }
  };

  // Filter members
  const filteredMembers = members.filter((member) => {
    const matchesSearch = member.name_rp.toLowerCase().includes(search.toLowerCase());
    const matchesRank   = rankFilter   ? member.rank   === rankFilter   : true;
    const matchesServer = serverFilter ? member.server === serverFilter : true;
    return matchesSearch && matchesRank && matchesServer;
  });

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className={styles.selectInput}
          >
            <option value="">All Ranks</option>
            {RANKS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
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
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {/* Roster Listing Table */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Fetching members roster...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>RP Name</th>
                <th>Rank</th>
                <th>Server</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className={styles.noData}>
                    No members found. Add some members to build your gang roster.
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className={styles.tableAvatar}>
                        {member.photo_url ? (
                          <Image
                            src={member.photo_url}
                            alt={member.name_rp}
                            fill
                            style={{ objectFit: 'cover', borderRadius: '50%' }}
                            sizes="40px"
                          />
                        ) : (
                          <div className={styles.avatarFallback}>
                            {member.name_rp.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className={styles.memberName}>{member.name_rp}</td>
                    <td>
                      <span className={styles.rankBadge}>{member.rank}</span>
                    </td>
                    <td>
                      <span className={styles.serverBadge}>{member.server}</span>
                    </td>
                    <td className={styles.dateCell}>
                      {new Date(member.joined_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        onClick={() => toggleActive(member)}
                        className={`${styles.statusToggle} ${
                          member.is_active ? styles.statusActive : styles.statusInactive
                        }`}
                        title="Click to toggle active status"
                      >
                        {member.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button onClick={() => handleEditOpen(member)} className={styles.editBtn}>
                          <Edit2 size={16} /> Edit
                        </button>
                        <button onClick={() => handleDelete(member.id)} className={styles.deleteBtn}>
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
              <h3>{editingId ? 'Edit Roster Member' : 'Add Roster Member'}</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.modalClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.uploadSection}>
                <div className={styles.avatarPreview}>
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt="Avatar Preview"
                      fill
                      style={{ objectFit: 'cover', borderRadius: '50%' }}
                      sizes="80px"
                    />
                  ) : (
                    <div className={styles.previewFallback}>
                      <User size={32} strokeWidth={1.5} color="var(--white-dim)" />
                    </div>
                  )}
                </div>
                <div className={styles.uploadControls}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
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
                    <Camera size={16} /> {uploading ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  <p className={styles.uploadHint}>JPG or PNG. Max size 2MB.</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>RP Name</label>
                  <input
                    type="text"
                    required
                    value={form.name_rp}
                    onChange={(e) => setForm({ ...form, name_rp: e.target.value })}
                    placeholder="e.g. Ghost Reaper"
                  />
                </div>

                <div className={styles.formField}>
                  <label>Rank</label>
                  <select
                    value={form.rank}
                    onChange={(e) => setForm({ ...form, rank: e.target.value })}
                  >
                    {RANKS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Server</label>
                  <select
                    value={form.server}
                    onChange={(e) =>
                      setForm({ ...form, server: e.target.value as 'samp' | 'fivem' | 'both' })
                    }
                  >
                    {SERVERS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formField}>
                  <label>Joined Date</label>
                  <input
                    type="date"
                    required
                    value={form.joined_at}
                    onChange={(e) => setForm({ ...form, joined_at: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formField}>
                <label>Bio (Optional)</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell a brief history or description of the member in the gang..."
                />
              </div>

              <div className={styles.checkboxField}>
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span>Active Member (Show on public website roster)</span>
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
                  {editingId ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
