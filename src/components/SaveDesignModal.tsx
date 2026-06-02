import React, { useState, useEffect } from 'react';
import './SaveDesignModal.css';

interface SaveDesignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  initialName?: string;
}

const SaveDesignModal: React.FC<SaveDesignModalProps> = ({ isOpen, onClose, onSave, initialName = '' }) => {
  const [name, setName] = useState(initialName);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  useEffect(() => {
    if (isOpen) { setName(initialName); setStatus('idle'); }
  }, [isOpen, initialName]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setStatus('saving');
    await new Promise(r => setTimeout(r, 600));
    onSave(name.trim());
    setStatus('saved');
    setTimeout(onClose, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="sdm-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sdm-dialog" role="dialog" aria-modal="true" aria-label="Save your design">
        {/* Header */}
        <div className="sdm-header">
          <h2 className="sdm-title">Save Your Design</h2>
          <button className="sdm-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Status message */}
        {status === 'saved' && (
          <div className="sdm-success">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#155724" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Design saved successfully!
          </div>
        )}

        {/* Input */}
        <div className="sdm-field">
          <label htmlFor="sdm-name-input" className="sdm-label">Design name</label>
          <input
            id="sdm-name-input"
            className="sdm-input"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            placeholder="e.g. Master Bedroom Wardrobe"
            autoFocus
          />
        </div>

        {/* Actions */}
        <button
          className={`sdm-btn sdm-btn-primary ${status === 'saving' ? 'loading' : ''}`}
          onClick={handleSave}
          disabled={!name.trim() || status === 'saving' || status === 'saved'}
        >
          {status === 'saving' ? 'Saving…' : status === 'saved' ? '✓ Saved' : 'Save Design'}
        </button>

        <p className="sdm-note">
          Your design will be saved and you can continue editing at any time.
        </p>
      </div>
    </div>
  );
};

export default SaveDesignModal;
