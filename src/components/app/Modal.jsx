import { X } from 'lucide-react';

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, size = 'md', children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}
        className={`rounded-lg w-full ${SIZES[size]} max-h-[90vh] flex flex-col`}
        style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--line-soft)' }}>
          <h3 className="text-lg font-black" style={{ color: 'var(--ink)' }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 overflow-auto flex-1">{children}</div>
        {footer && <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--line-soft)' }}>{footer}</div>}
      </div>
    </div>
  );
}

