'use client';

import React, { useEffect, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
  readOnly = false,
  height = '300px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  // Initialize Quill editor
  useEffect(() => {
    // Check if Quill is already loaded (from CDN)
    if ((window as any).Quill && editorRef.current && !quillRef.current) {
      const Quill = (window as any).Quill;

      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder,
        readOnly,
        modules: {
          toolbar: readOnly ? false : [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['blockquote', 'code-block'],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      // Set initial content
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      // Listen for changes
      quillRef.current.on('text-change', () => {
        onChange(quillRef.current.root.innerHTML);
      });
    }

    return () => {
      // Cleanup
      if (quillRef.current) {
        quillRef.current.off('text-change');
      }
    };
  }, []);

  // Update content when value prop changes (if not from editor)
  useEffect(() => {
    if (quillRef.current && value && quillRef.current.root.innerHTML !== value) {
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = value;
      if (selection) {
        quillRef.current.setSelection(selection);
      }
    }
  }, [value]);

  return (
    <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900">
      {/* Quill will be mounted here */}
      <div
        ref={editorRef}
        style={{ height, backgroundColor: '#0f172a' }}
        className="text-white [&_.ql-toolbar]:bg-slate-800 [&_.ql-toolbar]:border-slate-700 [&_.ql-container]:bg-slate-900 [&_.ql-editor]:text-white [&_.ql-editor.ql-blank::before]:text-slate-600"
      />
    </div>
  );
};

// Simple Plain Text Editor for fallback (if Quill is not available)
export const SimpleTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
  readOnly = false,
  height = '300px'
}) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      readOnly={readOnly}
      style={{ height }}
      className="w-full bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold focus:border-brand-purple outline-none transition-all placeholder:text-slate-700 resize-none"
    />
  );
};

// Export a hook to make it easier to use
export const useRichTextEditor = (initialValue: string = '') => {
  const [value, setValue] = React.useState(initialValue);

  return {
    value,
    onChange: setValue,
    clear: () => setValue(''),
    setValue
  };
};
