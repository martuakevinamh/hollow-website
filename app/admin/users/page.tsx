'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import styles from './users-admin.module.css';

interface FirebaseUserRecord {
  uid: string;
  email: string;
  displayName: string | null;
  disabled: boolean;
  createdAt: string;
  lastLogin: string | null;
  role: 'utama' | 'sekunder';
}

export default function UsersAdmin() {
  const { user: currentUser, token, role: currentRole, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<FirebaseUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  // Add Admin Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleField, setRoleField] = useState<'utama' | 'sekunder'>('sekunder');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (token && currentRole === 'utama') {
      fetchUsers();
    }
  }, [token, currentRole]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch admin users');
      }

      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred fetching admin list');
    } finally {
      setLoading(false);
    }
  }

  const handleAddOpen = () => {
    setEmail('');
    setPassword('');
    setRoleField('sekunder');
    setError('');
    setSuccess('');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, role: roleField }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin user');
      }

      setSuccess(`Admin account ${email} successfully created as Admin ${roleField === 'utama' ? 'Utama' : 'Sekunder'}!`);
      setIsFormOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to save admin user');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (uid: string, emailStr: string) => {
    if (uid === currentUser?.uid) {
      setError('You cannot delete your own admin account!');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete admin account "${emailStr}"?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/admin/users?uid=${uid}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete admin user');
      }

      setSuccess(`Admin account ${emailStr} successfully deleted!`);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete admin account');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // loading state for authorization verification
  if (authLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Verifying access rights...</p>
      </div>
    );
  }

  // restrict access to Admin Utama only
  if (currentRole !== 'utama') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--crimson)', marginBottom: '12px' }}>🔒 Akses Ditolak</h2>
        <p style={{ color: 'var(--white-dim)', fontSize: '0.9rem' }}>
          Hanya <strong>Admin Utama</strong> yang memiliki hak akses untuk mengelola akun administrator lainnya.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && <div className={styles.errorAlert}>⚠️ {error}</div>}
      {success && <div className={styles.successAlert}>✅ {success}</div>}

      <div className={styles.controlBar}>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="🔍 Search admin email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button onClick={handleAddOpen} className="btn btn-primary">
          🔑 Add New Admin
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Fetching administrator list...</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>UID</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.noData}>
                    No admin accounts found matching search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isSelf = u.uid === currentUser?.uid;
                  const isUtama = u.role === 'utama';
                  return (
                    <tr key={u.uid}>
                      <td className={styles.adminEmail}>{u.email}</td>
                      <td>
                        <code>{u.uid}</code>
                      </td>
                      <td className={styles.dateCell}>
                        {new Date(u.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className={styles.dateCell}>
                        {u.lastLogin
                          ? new Date(u.lastLogin).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </td>
                      <td>
                        <span className={`${styles.badge} ${isUtama ? styles.badgeUtama : styles.badgeSekunder}`}>
                          {isUtama ? 'Admin Utama' : 'Admin Sekunder'} {isSelf && '(You)'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            onClick={() => handleDelete(u.uid, u.email)}
                            className={styles.deleteBtn}
                            title="Delete admin account"
                            disabled={isSelf}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <h3>Create New Admin Account</h3>
              <button onClick={() => setIsFormOpen(false)} className={styles.modalClose}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formField}>
                <label>Admin Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. administrator@gmail.com"
                />
              </div>

              <div className={styles.formField}>
                <label>Password (Min 6 Characters)</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className={styles.formField}>
                <label>Role</label>
                <select
                  value={roleField}
                  onChange={(e) => setRoleField(e.target.value as 'utama' | 'sekunder')}
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
                  <option value="sekunder">Admin Sekunder</option>
                  <option value="utama">Admin Utama</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-outline"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating Account...' : 'Create Admin Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
