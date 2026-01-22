'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

interface Partnership {
  _id: string;
  fullname: string;
  zone?: string;
  num_groups?: string;
  overall_target: string;
  print_target: string;
  digital_target: string;
  campaigns?: string;
  createdAt: string;
}

const parseCopies = (value: string | undefined): number => {
  if (!value) return 0;
  const cleaned = String(value).replace(/[,\s]/g, '');
  return parseInt(cleaned) || 0;
};

const formatCopies = (value: string | undefined): string => {
  const num = parseCopies(value);
  return num.toLocaleString('en-US');
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [submissions, setSubmissions] = useState<Partnership[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'overall_target' | 'fullname'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedSubmission, setSelectedSubmission] = useState<Partnership | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/auth');
      if (response.ok) {
        setIsAuthenticated(true);
        await fetchSubmissions();
      }
    } catch (err) {
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        await fetchSubmissions();
      } else {
        setLoginError('Invalid username or password');
      }
    } catch (err) {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    setSubmissions([]);
    setUsername('');
    setPassword('');
  };

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/submissions');
      const result = await response.json();

      if (result.success) {
        setSubmissions(result.data);
      } else {
        setDataError('Failed to fetch submissions');
      }
    } catch (err) {
      setDataError('Network error. Please check your connection.');
    }
  };

  const handleSort = (column: 'createdAt' | 'overall_target' | 'fullname') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const openModal = (submission: Partnership) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  const filteredAndSortedSubmissions = submissions
    .filter((s) =>
      s.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.zone && s.zone.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === 'overall_target') {
        comparison = parseCopies(a.overall_target) - parseCopies(b.overall_target);
      } else if (sortBy === 'fullname') {
        comparison = a.fullname.localeCompare(b.fullname);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totals = submissions.reduce(
    (acc, s) => ({
      overall: acc.overall + parseCopies(s.overall_target),
      print: acc.print + parseCopies(s.print_target),
      digital: acc.digital + parseCopies(s.digital_target),
      groups: acc.groups + parseCopies(s.num_groups),
    }),
    { overall: 0, print: 0, digital: 0, groups: 0 }
  );

  if (isLoading) {
    return (
      <>
        <style jsx global>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        `}</style>
        <div className={inter.variable}>Loading...</div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <style jsx global>{`
          :root {
            --primary: #0f172a;
            --accent: #ffd700;
            --border: #e2e8f0;
            --bg-light: #f8fafc;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: var(--font-inter), 'Inter', sans-serif; color: var(--primary); background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
          .login-container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
          .login-header h1 { font-size: 24px; margin-bottom: 8px; color: var(--primary); }
          .login-header p { color: #64748b; font-size: 14px; margin-bottom: 24px; }
          .form-group { margin-bottom: 20px; }
          .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
          .form-group input { width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 4px; font-size: 14px; }
          .form-group input:focus { outline: none; border-color: var(--primary); }
          .btn-login { width: 100%; padding: 14px; background: var(--primary); color: white; font-weight: 600; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
          .btn-login:hover { background: #1e293b; }
          .login-error { background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 4px; font-size: 13px; margin-bottom: 20px; }
          .back-link { display: block; text-align: center; color: #94a3b8; text-decoration: none; font-size: 13px; margin-top: 20px; }
          .back-link:hover { color: white; }
        `}</style>

        <div className={inter.variable}>
          <div className="login-container">
            <div className="login-header">
              <h1>Admin Login</h1>
              <p>Enter your credentials to access the admin panel</p>
            </div>

            {loginError && <div className="login-error">{loginError}</div>}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn-login">Login</button>
            </form>

            <a href="/" className="back-link">← Back to Partnership Form</a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style jsx global>{`
        :root {
          --primary: #0f172a;
          --accent: #ffd700;
          --border: #e2e8f0;
          --bg-light: #f8fafc;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--font-inter), 'Inter', sans-serif;
          color: var(--primary);
          background-color: var(--bg-light);
          line-height: 1.6;
        }

        .admin-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 40px 20px;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .admin-header h1 {
          font-size: 28px;
          color: var(--primary);
          margin-bottom: 8px;
        }

        .admin-header p {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .btn-logout {
          padding: 10px 20px;
          background-color: #94a3b8;
          color: white;
          font-weight: 600;
          font-size: 13px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-logout:hover {
          background-color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--primary);
        }

        .stat-sub {
          font-size: 13px;
          color: #64748b;
          margin-top: 4px;
        }

        .controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 15px;
        }

        .search-box {
          position: relative;
        }

        .search-box input {
          padding: 12px 16px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 14px;
          width: 300px;
        }

        .btn-refresh {
          padding: 12px 20px;
          background-color: var(--primary);
          color: white;
          font-weight: 600;
          font-size: 13px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-refresh:hover {
          background-color: #1e293b;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 16px;
          background-color: #f1f5f9;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #475569;
          font-weight: 700;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          user-select: none;
        }

        .data-table th:hover {
          background-color: #e2e8f0;
        }

        .data-table th:last-child {
          cursor: default;
        }

        .data-table th:last-child:hover {
          background-color: #f1f5f9;
        }

        .data-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        .data-table tr:hover {
          background-color: #f8fafc;
        }

        .data-table tr:last-child td {
          border-bottom: none;
        }

        .copies-cell {
          font-family: 'Courier New', monospace;
          font-weight: 600;
        }

        .name-cell {
          font-weight: 600;
          color: var(--primary);
        }

        .zone-badge {
          display: inline-block;
          background-color: #f1f5f9;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          color: #475569;
        }

        .btn-view {
          padding: 8px 16px;
          background-color: var(--primary);
          color: white;
          font-weight: 600;
          font-size: 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-view:hover {
          background-color: #1e293b;
        }

        .empty-state {
          padding: 60px;
          text-align: center;
          color: #64748b;
        }

        .loading-state {
          padding: 60px;
          text-align: center;
          color: #64748b;
        }

        .error-state {
          background-color: #fee2e2;
          color: #991b1b;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .sort-indicator {
          margin-left: 6px;
          opacity: 0.3;
        }

        .sort-indicator.active {
          opacity: 1;
        }

        .back-link {
          display: inline-block;
          color: var(--primary);
          text-decoration: none;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .back-link:hover {
          text-decoration: underline;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          font-size: 20px;
          color: var(--primary);
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 24px;
          color: #64748b;
          cursor: pointer;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .btn-close:hover {
          background: #f1f5f9;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-section {
          margin-bottom: 24px;
        }

        .modal-section:last-child {
          margin-bottom: 0;
        }

        .modal-section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #64748b;
          font-weight: 700;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }

        .modal-row {
          display: flex;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .modal-row:last-child {
          border-bottom: none;
        }

        .modal-label {
          width: 40%;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
        }

        .modal-value {
          width: 60%;
          font-size: 14px;
          color: var(--primary);
          font-weight: 600;
        }

        .modal-value-highlight {
          color: var(--accent);
          background: #fffbeb;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .modal-value-large {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .admin-container {
            padding: 20px 10px;
          }

          .controls-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box input {
            width: 100%;
          }

          .table-container {
            overflow-x: auto;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .admin-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
          }

          .modal-row {
            flex-direction: column;
          }

          .modal-label, .modal-value {
            width: 100%;
          }
        }
      `}</style>

      <div className={inter.variable}>
        <div className="admin-container">
          <a href="/" className="back-link">← Back to Partnership Form</a>

          <div className="admin-header">
            <div>
              <h1>Rhapsody Partnership Admin</h1>
              <p>View and manage partnership submissions</p>
            </div>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>

          {dataError && (
            <div className="error-state">
              {dataError}
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Submissions</div>
              <div className="stat-value">{submissions.length}</div>
              <div className="stat-sub">Partners registered</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Overall Total</div>
              <div className="stat-value">{totals.overall.toLocaleString()}</div>
              <div className="stat-sub">Total copies</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Print Copies</div>
              <div className="stat-value">{totals.print.toLocaleString()}</div>
              <div className="stat-sub">{totals.overall > 0 ? ((totals.print / totals.overall) * 100).toFixed(1) : 0}% of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Digital Copies</div>
              <div className="stat-value">{totals.digital.toLocaleString()}</div>
              <div className="stat-sub">{totals.overall > 0 ? ((totals.digital / totals.overall) * 100).toFixed(1) : 0}% of total</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Groups</div>
              <div className="stat-value">{totals.groups.toLocaleString()}</div>
              <div className="stat-sub">Groups across all zones</div>
            </div>
          </div>

          <div className="controls-bar">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by name or zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-refresh" onClick={fetchSubmissions}>
              Refresh Data
            </button>
          </div>

          <div className="table-container">
            {submissions.length === 0 ? (
              <div className="empty-state">No submissions yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('fullname')}>
                      Name
                      <span className={`sort-indicator ${sortBy === 'fullname' ? 'active' : ''}`}>
                        {sortBy === 'fullname' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </th>
                    <th>Zone</th>
                    <th>Groups</th>
                    <th onClick={() => handleSort('overall_target')}>
                      Overall Target
                      <span className={`sort-indicator ${sortBy === 'overall_target' ? 'active' : ''}`}>
                        {sortBy === 'overall_target' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </th>
                    <th>Print</th>
                    <th>Digital</th>
                    <th>Campaigns</th>
                    <th onClick={() => handleSort('createdAt')}>
                      Date
                      <span className={`sort-indicator ${sortBy === 'createdAt' ? 'active' : ''}`}>
                        {sortBy === 'createdAt' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}
                      </span>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedSubmissions.map((submission) => (
                    <tr key={submission._id}>
                      <td className="name-cell">{submission.fullname}</td>
                      <td>{submission.zone ? <span className="zone-badge">{submission.zone}</span> : '-'}</td>
                      <td className="copies-cell">{submission.num_groups || '-'}</td>
                      <td className="copies-cell">{formatCopies(submission.overall_target)}</td>
                      <td className="copies-cell">{formatCopies(submission.print_target)}</td>
                      <td className="copies-cell">{formatCopies(submission.digital_target)}</td>
                      <td>{submission.campaigns || '-'}</td>
                      <td style={{ color: '#64748b', fontSize: '13px' }}>
                        {formatDate(submission.createdAt)}
                      </td>
                      <td>
                        <button className="btn-view" onClick={() => openModal(submission)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {showModal && selectedSubmission && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Partnership Details</h2>
                <button className="btn-close" onClick={closeModal}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="modal-section">
                  <div className="modal-section-title">Partner Information</div>
                  <div className="modal-row">
                    <div className="modal-label">Full Name</div>
                    <div className="modal-value modal-value-large">{selectedSubmission.fullname}</div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Zone</div>
                    <div className="modal-value">{selectedSubmission.zone || 'Not specified'}</div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Number of Groups</div>
                    <div className="modal-value">{selectedSubmission.num_groups || '0'}</div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="modal-section-title">Target Breakdown</div>
                  <div className="modal-row">
                    <div className="modal-label">Overall Target</div>
                    <div className="modal-value modal-value-highlight modal-value-large">
                      {formatCopies(selectedSubmission.overall_target)} copies
                    </div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Print Copies</div>
                    <div className="modal-value">{formatCopies(selectedSubmission.print_target)} copies</div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">Digital Copies</div>
                    <div className="modal-value">{formatCopies(selectedSubmission.digital_target)} copies</div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="modal-section-title">Campaigns</div>
                  <div className="modal-row">
                    <div className="modal-label">Campaigns (Wonder, Crusades)</div>
                    <div className="modal-value">
                      {selectedSubmission.campaigns || '-'}
                    </div>
                  </div>
                </div>

                <div className="modal-section">
                  <div className="modal-section-title">Submission Info</div>
                  <div className="modal-row">
                    <div className="modal-label">Submission Date</div>
                    <div className="modal-value">{formatDate(selectedSubmission.createdAt)}</div>
                  </div>
                  <div className="modal-row">
                    <div className="modal-label">ID</div>
                    <div className="modal-value" style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                      {selectedSubmission._id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
