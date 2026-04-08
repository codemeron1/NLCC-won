'use client';

import React, { useState } from 'react';

interface EnhancedBahagiCardProps {
  bahagi: any;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onTogglePublish: (isPublished: boolean) => void;
  onCreateYunit: () => void;
  children?: React.ReactNode;
}

export const EnhancedBahagiCard: React.FC<EnhancedBahagiCardProps> = ({
  bahagi,
  isExpanded,
  onToggleExpand,
  onEdit,
  onArchive,
  onDelete,
  onTogglePublish,
  onCreateYunit,
  children
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const handleDeleteClick = () => {
    if (showDeleteConfirm) {
      onDelete();
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleArchiveClick = () => {
    if (showArchiveConfirm) {
      onArchive();
      setShowArchiveConfirm(false);
    } else {
      setShowArchiveConfirm(true);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/50 rounded-4xl overflow-hidden group hover:border-brand-purple/30 transition-all">
      {/* Bahagi Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
      >
        <div className="flex items-center gap-4 text-left flex-1">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-xl border border-slate-700 group-hover:border-brand-purple/30 transition-all">
            📕
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-black text-white group-hover:text-brand-purple transition-colors">
              {bahagi.title}
            </h4>
            <p className="text-sm text-slate-500 font-bold mt-1">
              {bahagi.description || 'No description'}
            </p>
            <div className="flex gap-4 mt-3">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                  bahagi.is_published
                    ? 'bg-green-900/30 text-green-400'
                    : 'bg-orange-900/30 text-orange-400'
                }`}
              >
                {bahagi.is_published ? '✓ Published' : '○ Draft'}
              </span>
              {bahagi.is_archived && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-800/50 px-2 py-1 rounded">
                  🗂️ Archived
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="text-2xl transition-transform" style={{
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>
          ▼
        </div>
      </button>

      {/* Action Buttons */}
      <div className="border-t border-slate-800/50 px-6 py-4 bg-slate-950/30 flex flex-wrap gap-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-2 px-3 py-2 bg-blue-900/30 hover:bg-blue-900/50 text-blue-400 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
          title="Edit Bahagi details"
        >
          ✏️ Edit
        </button>

        <button
          onClick={onCreateYunit}
          className="flex items-center gap-2 px-3 py-2 bg-brand-sky/30 hover:bg-brand-sky/50 text-brand-sky rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
          title="Create new Yunit"
        >
          📖 Add Yunit
        </button>

        <button
          onClick={() => onTogglePublish(!bahagi.is_published)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
            bahagi.is_published
              ? 'bg-green-900/30 hover:bg-green-900/50 text-green-400'
              : 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-400'
          }`}
          title={bahagi.is_published ? 'Unpublish' : 'Publish'}
        >
          {bahagi.is_published ? '🔓 Unpublish' : '🔒 Publish'}
        </button>

        <button
          onClick={handleArchiveClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
            showArchiveConfirm
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-orange-900/30 hover:bg-orange-900/50 text-orange-400'
          }`}
          title={bahagi.is_archived ? 'Restore' : 'Archive'}
        >
          {showArchiveConfirm ? '⚠️ Confirm Archive?' : '🗂️ Archive'}
        </button>

        <button
          onClick={handleDeleteClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
            showDeleteConfirm
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
          }`}
          title="Permanently delete (cannot be undone)"
        >
          {showDeleteConfirm ? '⚠️ Confirm Delete?' : '🗑️ Delete'}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-slate-800/50 bg-slate-950/50 p-6 space-y-4">
          {children || (
            <p className="text-xs text-slate-600 text-center italic">
              Yunits and Assessments for this Bahagi will appear here after being created.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
