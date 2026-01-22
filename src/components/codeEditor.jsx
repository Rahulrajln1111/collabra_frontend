import React, { useEffect, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import { MonacoBinding } from 'y-monaco';
import * as monaco from 'monaco-editor';

// Import workers for Vite
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

// Configure Monaco Environment for Vite
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

// Configure loader to use the local monaco instance
// This prevents the "Invoking deltaDecorations recursively" error
loader.config({ monaco });

/**
 * CodeEditor Component
 * Monaco Editor integrated with Yjs for real-time collaboration
 */
// Generate random color for cursor
const getRandomColor = () => {
  const colors = [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', 
    '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const CodeEditor = ({ roomId, activeFileId, yDoc, provider, currentUser, onFileChange }) => {
  const editorRef = useRef(null);
  const bindingRef = useRef(null);
  const containerRef = useRef(null);
  const [isEditorReady, setIsEditorReady] = useState(false);

  // Handle editor mount
  const handleEditorDidMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    setIsEditorReady(true);
    
    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      wordWrap: 'on',
      automaticLayout: true,
      theme: 'vs-dark',
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      formatOnPaste: true,
      formatOnType: true
    });

    // Set up awareness for cursor tracking
    if (provider?.awareness) {
      provider.awareness.setLocalStateField('user', {
        name: currentUser?.name || currentUser?.email || 'Anonymous',
        color: getRandomColor(),
        cursor: null
      });
    }
  };

  // Bind Yjs to Monaco when active file changes
  useEffect(() => {
    if (!isEditorReady || !yDoc || !provider || !activeFileId || !editorRef.current) {
      return;
    }

    // Clean up previous binding
    if (bindingRef.current) {
      bindingRef.current.destroy();
      bindingRef.current = null;
    }

    try {
      // Get the Y.Text for this file
      const yText = yDoc.getText(`file-${activeFileId}`);
      if (!yText) {
        console.warn(`Y.Text not found for file: ${activeFileId}`);
        return;
      }

      // Get file metadata to determine language
      const projectFiles = yDoc.getMap('project-files');
      const fileMeta = projectFiles.get(activeFileId);
      const language = fileMeta?.get('language') || 'plaintext';

      // Set Monaco editor language
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }

      // Create Monaco binding
      const binding = new MonacoBinding(
        yText,
        editorRef.current.getModel(),
        new Set([editorRef.current]),
        provider.awareness
      );

      bindingRef.current = binding;

      // Notify parent of file change
      if (onFileChange) {
        const content = yText.toString();
        onFileChange(activeFileId, content);
      }

      // Listen for content changes
      yText.observe(() => {
        if (onFileChange) {
          const content = yText.toString();
          onFileChange(activeFileId, content);
        }
      });

    } catch (error) {
      console.error('Error setting up Monaco binding:', error);
    }

    // Cleanup
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [activeFileId, isEditorReady, yDoc, provider, currentUser, onFileChange]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, []);

  if (!activeFileId) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="text-center">
          <p className="text-slate-400 text-lg mb-2">No file selected</p>
          <p className="text-slate-500 text-sm">Select a file from the file tree to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="plaintext"
        theme="vs-dark"
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          formatOnPaste: true,
          formatOnType: true,
          readOnly: !isEditorReady || !provider
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
          </div>
        }
      />
    </div>
  );
};

export default CodeEditor;
