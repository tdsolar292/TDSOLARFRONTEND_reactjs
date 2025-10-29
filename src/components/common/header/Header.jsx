import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../auth';
import axios from 'axios';
import config from '../../../config';
import './Header.css'; // Create this CSS file for custom styles

const Header = () => {
  const { user, logout, canAccessFinancialReports } = useAuth();
  const navigate = useNavigate();
  const [showBackupStatus, setShowBackupStatus] = useState(false);
  const [showBackupList, setShowBackupList] = useState(false);
  const [backupStatus, setBackupStatus] = useState(null);
  const [backupList, setBackupList] = useState([]);
  const [loading, setLoading] = useState(false);
  // PWA install (minimal)
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // --- Simple Screen Zoom Controls ---
  const applyZoom = (percent) => {
    try {
      const factor = Math.max(50, Math.min(200, Number(percent))) / 100; // clamp 50%-200%
      document.body.style.zoom = String(factor);
      try {
        if (Number(percent) === 100) {
          localStorage.removeItem('tds_zoom_percent');
        } else {
          localStorage.setItem('tds_zoom_percent', String(percent));
        }
      } catch (_) {}
    } catch (e) {
      // no-op
    }
  };

  const handleZoomClick = (percent) => (e) => {
    e?.preventDefault?.();
    applyZoom(percent);
  };

  // Restore saved zoom on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem('tds_zoom_percent');
      if (saved) {
        applyZoom(Number(saved));
      } else {
        const w = window.innerWidth;
        if (w >= 1360 && w < 1400) {
          applyZoom(90);
        }
      }
    } catch (_) {}
  }, []);

  // Minimal PWA hooks: detect install prompt and standalone
  useEffect(() => {
    const handleBIP = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };
    const mm = window.matchMedia && window.matchMedia('(display-mode: standalone)');
    const updateStandalone = () => {
      try {
        setIsStandalone((mm && mm.matches) || window.navigator.standalone === true);
      } catch (_) {
        setIsStandalone(false);
      }
    };
    updateStandalone();
    window.addEventListener('beforeinstallprompt', handleBIP);
    mm && mm.addEventListener && mm.addEventListener('change', updateStandalone);
    window.addEventListener('appinstalled', updateStandalone);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBIP);
      mm && mm.removeEventListener && mm.removeEventListener('change', updateStandalone);
      window.removeEventListener('appinstalled', updateStandalone);
    };
  }, []);

  const handleInstallApp = async (e) => {
    e?.preventDefault?.();
    if (isStandalone) {
      alert('App is already installed on this device.');
      return;
    }
    if (installPromptEvent && installPromptEvent.prompt) {
      installPromptEvent.prompt();
      try { await installPromptEvent.userChoice; } catch (_) {}
      setInstallPromptEvent(null);
    } else {
      alert('Install prompt is not available. Please use your browser\'s "Install app" or "Add to Home screen" option.');
    }
  };

  const handleTriggerBackup = async () => {
    if (!window.confirm('Are you sure you want to trigger a database backup?')) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${config.MernBaseURL}/backup/trigger`);
      alert(response.data.message || 'Backup triggered successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to trigger backup: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowBackupStatus = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.MernBaseURL}/backup/status`);
      setBackupStatus(response.data.data || response.data);
      setShowBackupStatus(true);
    } catch (error) {
      console.error('Failed to fetch backup status:', error);
      alert('Failed to fetch backup status: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleShowBackupList = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${config.MernBaseURL}/backup/list`);
      setBackupList(response.data.backups || []);
      setShowBackupList(true);
    } catch (error) {
      console.error('Failed to fetch backup list:', error);
      alert('Failed to fetch backup list: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBackup = async (backupName) => {
    if (!backupName) {
      alert('Invalid backup name');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${config.MernBaseURL}/backup/download`,
        { backupName },
        { responseType: 'blob' }
      );
      
      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${backupName}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      alert('Backup downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download backup: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Clears client-side caches and performs a hard reload with a cache-busting param
  const handleHardReload = async () => {
    const confirmMsg = 'This will clear cached data (Cache Storage, Local/Session Storage, IndexedDB) and unregister Service Workers, then reload the app. Continue?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setLoading(true);

      // 1) Cache Storage
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((name) => caches.delete(name)));
        } catch (e) {
          console.warn('Cache clearing failed:', e);
        }
      }

      // 2) Local and Session Storage
      try { localStorage.clear(); } catch (e) { /* noop */ }
      try { sessionStorage.clear(); } catch (e) { /* noop */ }

      // 3) Service Workers
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map(async (reg) => {
              try { await reg.unregister(); } catch (e) { /* noop */ }
            })
          );
        } catch (e) {
          console.warn('Service worker unregister failed:', e);
        }
      }

      // 4) IndexedDB
      try {
        if (typeof indexedDB !== 'undefined') {
          // Prefer supported databases() API when available
          if (typeof indexedDB.databases === 'function') {
            const dbs = await indexedDB.databases();
            await Promise.all(
              (dbs || []).map((db) => {
                if (!db || !db.name) return Promise.resolve();
                return new Promise((resolve) => {
                  const req = indexedDB.deleteDatabase(db.name);
                  req.onsuccess = req.onerror = req.onblocked = () => resolve();
                });
              })
            );
          } else {
            // Fallback: try deleting some common DB names
            const fallbackDBs = ['keyval-store', 'localforage'];
            await Promise.all(
              fallbackDBs.map((name) => new Promise((resolve) => {
                const req = indexedDB.deleteDatabase(name);
                req.onsuccess = req.onerror = req.onblocked = () => resolve();
              }))
            );
          }
        }
      } catch (e) {
        console.warn('IndexedDB clearing failed:', e);
      }

      // Small delay to allow async cleanup to settle
      setTimeout(() => {
        try {
          const url = new URL(window.location.href);
          url.searchParams.set('hardReload', Date.now().toString());
          window.location.replace(url.toString());
        } catch (_e) {
          // Fallback
          window.location.reload();
        }
      }, 100);
    } finally {
      // We may be navigating away; but reset just in case
      try { setLoading(false); } catch (_) {}
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark td-blue-bg py-0">
      <div className="container px-lg-5">
        <Link className="navbar-brand" to="/">
          <span className="brand-td-solar">
          <img src="/tslogo.png" className='active-clients-logo-spin' alt="logo" width="60" />
             TD SOLAR
          </span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarSupportedContent" 
          aria-controls="navbarSupportedContent" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#!">About</a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/credit-details">
                Credit App
              </Link>
            </li>
            {canAccessFinancialReports() && (
              <li className="nav-item">
                <Link className="nav-link" to="/financial-reports">
                  Financial Reports
                </Link>
              </li>
            )}
            <li className="nav-item">
              <a className="nav-link" href="#!">Contact</a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link text-red fw-bold"
                onClick={handleHardReload}
                title="Clear cache and hard reload"
                disabled={loading}
                href="#!"
              >
                <i className="bi bi-arrow-clockwise"></i> Hard Reload
              </a>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#!" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-person-circle pe-1"></i>
                {user?.name || user?.username || 'User'}
              </a>
              <ul className="dropdown-menu">
                <li>
                  <div className="dropdown-item-text">
                    <small className="text-muted">Role: {user?.role}</small>
                  </div>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <a className="dropdown-item" href="#!">
                    <i className="bi bi-person"></i> Profile
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!">
                    <i className="bi bi-gear"></i> Settings
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleInstallApp}>
                    <i className="bi bi-download"></i> Download App
                  </a>
                </li>
                {/* Screen View (Zoom) */}
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <div className="dropdown-item-text">
                    <small className="text-muted">Screen View</small>
                  </div>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleZoomClick(75)}>
                    75% Screen View
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleZoomClick(80)}>
                    80% Screen View
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleZoomClick(85)}>
                    85% Screen View
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleZoomClick(90)}>
                    90% Screen View
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#!" onClick={handleZoomClick(100)}>
                    100% Screen View
                  </a>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={handleTriggerBackup}
                    disabled={loading}
                  >
                    <i className="bi bi-database-fill-add"></i> DB Backup
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={handleShowBackupStatus}
                    disabled={loading}
                  >
                    <i className="bi bi-info-circle"></i> DB Backup Status
                  </button>
                </li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={handleShowBackupList}
                    disabled={loading}
                  >
                    <i className="bi bi-list-ul"></i> DB Backup List
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item text-danger" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>

      {/* Backup Status Modal */}
      {showBackupStatus && (
        <div className="backup-modal-overlay" onClick={() => setShowBackupStatus(false)}>
          <div className="backup-modal" onClick={(e) => e.stopPropagation()}>
            <div className="backup-modal-header">
              <h3><i className="bi bi-info-circle"></i> Database Backup Status</h3>
              <button className="close-btn" onClick={() => setShowBackupStatus(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="backup-modal-body">
              {backupStatus ? (
                <div>
                  <table className="backup-table">
                    <tbody>
                      <tr>
                        <td className="backup-key">Total Backups</td>
                        <td className="backup-value">{backupStatus.totalBackups || 0}</td>
                      </tr>
                      <tr>
                        <td className="backup-key">Retention Period</td>
                        <td className="backup-value">{backupStatus.retentionDays || 7} days</td>
                      </tr>
                      <tr>
                        <td className="backup-key">Backup Directory</td>
                        <td className="backup-value">{backupStatus.backupDirectory || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td className="backup-key">Next Scheduled</td>
                        <td className="backup-value">2:00 AM Daily</td>
                      </tr>
                    </tbody>
                  </table>
                  {backupStatus.backups && backupStatus.backups.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#1e293b' }}>Recent Backups:</h4>
                      <table className="backup-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Size</th>
                            <th>Created</th>
                          </tr>
                        </thead>
                        <tbody>
                          {backupStatus.backups.map((backup, index) => (
                            <tr key={index}>
                              <td>{backup.name}</td>
                              <td>{backup.size}</td>
                              <td>{new Date(backup.created).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading status...</p>
              )}
            </div>
            <div className="backup-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBackupStatus(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backup List Modal */}
      {showBackupList && (
        <div className="backup-modal-overlay" onClick={() => setShowBackupList(false)}>
          <div className="backup-modal backup-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="backup-modal-header">
              <h3><i className="bi bi-list-ul"></i> Database Backup List</h3>
              <button className="close-btn" onClick={() => setShowBackupList(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="backup-modal-body">
              {backupList.length > 0 ? (
                <div>
                  {backupList.map((backup, index) => (
                    <div key={index} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <h4 style={{ fontSize: '0.95rem', margin: 0, color: '#1e293b', fontWeight: '600', flex: 1 }}>
                          <i className="bi bi-folder-fill" style={{ color: '#2563eb' }}></i> {backup.name}
                        </h4>
                        <button
                          className="backup-download-btn"
                          onClick={() => handleDownloadBackup(backup.name)}
                          disabled={loading}
                          title="Download Backup"
                        >
                          <i className="bi bi-download"></i>
                        </button>
                      </div>
                      <table className="backup-table" style={{ marginBottom: '0.75rem' }}>
                        <tbody>
                          <tr>
                            <td className="backup-key">Created</td>
                            <td className="backup-value">{new Date(backup.created).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="backup-key">Size</td>
                            <td className="backup-value">{(backup.size / 1024).toFixed(2)} KB</td>
                          </tr>
                          <tr>
                            <td className="backup-key">Database</td>
                            <td className="backup-value">{backup.metadata?.database || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td className="backup-key">Backup Date</td>
                            <td className="backup-value">{backup.metadata?.backupDate ? new Date(backup.metadata.backupDate).toLocaleString() : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                      {backup.metadata?.collections && backup.metadata.collections.length > 0 && (
                        <div>
                          <h5 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', color: '#475569', fontWeight: '600' }}>Collections:</h5>
                          <table className="backup-table">
                            <thead>
                              <tr>
                                <th>Collection Name</th>
                                <th>Documents</th>
                                <th>File Size</th>
                              </tr>
                            </thead>
                            <tbody>
                              {backup.metadata.collections.map((collection, idx) => (
                                <tr key={idx}>
                                  <td>{collection.name}</td>
                                  <td>{collection.documentCount}</td>
                                  <td>{(collection.fileSize / 1024).toFixed(2)} KB</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center" style={{ padding: '2rem', color: '#64748b' }}>No backups found.</p>
              )}
            </div>
            <div className="backup-modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowBackupList(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;