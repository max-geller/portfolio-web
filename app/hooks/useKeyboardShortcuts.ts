import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: () => void;
  onPreview?: () => void;
  onToggleView?: () => void;
  onUpload?: () => void;
}

export function useKeyboardShortcuts({
  onSave,
  onPreview,
  onToggleView,
  onUpload,
}: ShortcutHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      // Command/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.();
      }

      // Command/Ctrl + P to preview
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        onPreview?.();
      }

      // Command/Ctrl + V to toggle view
      if ((e.metaKey || e.ctrlKey) && e.key === 'v') {
        e.preventDefault();
        onToggleView?.();
      }

      // Command/Ctrl + U to trigger upload
      if ((e.metaKey || e.ctrlKey) && e.key === 'u') {
        e.preventDefault();
        onUpload?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onPreview, onToggleView, onUpload]);
}