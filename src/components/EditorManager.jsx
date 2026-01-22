import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

/**
 * EditorManager Component
 * Manages Yjs document, WebSocket connection, and file state.
 * Acts as a "Passive Client" - strictly observing state from the server.
 */
export const useEditorManager = (roomId, currentUser) => {
  // Refactor: Use useState for yDoc to ensure UI updates on room switch
  const [yDoc, setYDoc] = useState(null);
  const [provider, setProvider] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const projectFilesRef = useRef(null);

  // Initialize WebSocket provider and Sync Logic
  useEffect(() => {
    if (!roomId) return;

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    // 1. MANUALLY CREATE FRESH DOC
    const doc = new Y.Doc();
    setYDoc(doc);

    // Get WebSocket URL from environment or use same origin
    const apiUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.host}`;
    // Convert http to ws or https to wss
    const wsUrl = apiUrl.replace(/^http/, 'ws');
    
    // WebSocket URL with query params
    // Note: We strip query params in the server, but pass them here for potential auth middleware
    const wsConnectionUrl = `${wsUrl}/yjs`;
    console.log('🔌 Connecting to Yjs WebSocket:', wsConnectionUrl);
    
    // Connect to Yjs WebSocket server
    const wsProvider = new WebsocketProvider(
      wsConnectionUrl,
      roomId, // Room name (will be appended to URL as /roomId)
      doc,    // Pass the fresh doc
      {
        params: {
          token: token
        }
      }
    );

    wsProvider.on('status', (event) => {
      setIsConnected(event.status === 'connected');
    });

    wsProvider.on('connection-error', (error) => {
      console.error('❌ Yjs WebSocket connection error:', error);
    });

    wsProvider.on('connection-close', (event) => {
      setIsConnected(false);
      // Stop reconnection if the token is invalid (Policy Violation)
      if (event && event.code === 1008) {
        console.error('❌ Auth failed (Invalid Token). Stopping reconnection.');
        wsProvider.shouldConnect = false;
      }
    });

    wsProvider.on('sync', (isSynced) => {
      if (isSynced) {
        console.log('✅ Documents are synced');
      }
    });

    setProvider(wsProvider);

    // Initialize project-files map
    const projectFiles = doc.getMap('project-files');
    projectFilesRef.current = projectFiles;

    // Observe changes to the files map
    // This is the ONLY way files are loaded into the frontend.
    // No REST API calls are made to fetch files.
    const observer = (event) => {
      const filesArray = [];
      projectFiles.forEach((fileMeta, fileId) => {
        try {
          const fileName = fileMeta.get('name');
          const fileLanguage = fileMeta.get('language');
          const filePath = fileMeta.get('path');
          
          filesArray.push({
            id: fileId,
            name: fileName || fileId,
            language: fileLanguage || 'plaintext',
            path: filePath || fileId
          });
        } catch (error) {
          console.warn(`⚠️  Error reading file metadata for ${fileId}:`, error);
        }
      });
      
      // Sort files alphabetically
      filesArray.sort((a, b) => a.name.localeCompare(b.name));
      
      setFiles(filesArray);
      
      // Auto-select first file if none is selected
      setActiveFileId(prev => {
        if (filesArray.length > 0 && !prev) {
          return filesArray[0].id;
        }
        return prev;
      });
    };

    observer(); // Initial load
    projectFiles.observe(observer);

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up Yjs Doc and Provider');
      projectFiles.unobserve(observer);
      wsProvider.destroy();
      doc.destroy();
      setYDoc(null);
      projectFilesRef.current = null;
      setFiles([]);
      setIsConnected(false);
      setProvider(null);
    };
  }, [roomId]); // Strict dependency on roomId

  // Create a new file
  const createFile = useCallback((name, language = 'plaintext', path = null) => {
    const projectFiles = projectFilesRef.current;
    
    if (!yDoc || !projectFiles) return null;

    const fileId = path || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Use Yjs transaction to ensure atomic updates and proper syncing
    yDoc.transact(() => {
      // Create file metadata in the map
      const fileMeta = new Y.Map();
      fileMeta.set('name', name);
      fileMeta.set('language', language);
      fileMeta.set('path', path || fileId);
      fileMeta.set('createdAt', new Date().toISOString());
      fileMeta.set('createdBy', currentUser?._id || 'unknown');

      projectFiles.set(fileId, fileMeta);

      // Initialize file content as Y.Text
      const fileText = yDoc.getText(`file-${fileId}`);
      if (fileText.length === 0) {
        fileText.insert(0, ''); // Initialize with empty string
      }
    }, 'create-file');

    // Switch to the new file
    setActiveFileId(fileId);
    return fileId;
  }, [yDoc, currentUser?._id]);

  // Get file content Y.Text
  const getFileText = useCallback((fileId) => {
    if (!fileId || !yDoc) return null;
    return yDoc.getText(`file-${fileId}`);
  }, [yDoc]);

  // Get file metadata
  const getFileMeta = useCallback((fileId) => {
    if (!projectFilesRef.current || !fileId) return null;
    const fileMeta = projectFilesRef.current.get(fileId);
    if (!fileMeta) return null;

    return {
      id: fileId,
      name: fileMeta.get('name'),
      language: fileMeta.get('language') || 'plaintext',
      path: fileMeta.get('path'),
      createdAt: fileMeta.get('createdAt'),
      createdBy: fileMeta.get('createdBy')
    };
  }, []);

  // Delete a file
  const deleteFile = useCallback((fileId) => {
    if (!projectFilesRef.current) return;
    
    // Remove from map
    projectFilesRef.current.delete(fileId);
    
    // Note: Y.Text will be garbage collected automatically
    if (activeFileId === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId);
      setActiveFileId(remainingFiles.length > 0 ? remainingFiles[0].id : null);
    }
  }, [files, activeFileId]);

  // Update file metadata
  const updateFileMeta = useCallback((fileId, updates) => {
    if (!projectFilesRef.current) return;
    const fileMeta = projectFilesRef.current.get(fileId);
    if (!fileMeta) return;

    Object.entries(updates).forEach(([key, value]) => {
      fileMeta.set(key, value);
    });
  }, []);

  // Switch active file
  const switchFile = useCallback((fileId) => {
    if (files.find(f => f.id === fileId)) {
      setActiveFileId(fileId);
    }
  }, [files]);

  return {
    yDoc,
    provider,
    files,
    activeFileId,
    isConnected,
    createFile,
    deleteFile,
    updateFileMeta,
    getFileText,
    getFileMeta,
    switchFile
  };
};
