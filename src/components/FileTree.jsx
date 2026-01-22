import React, { useState } from 'react';
import { 
  File, 
  Folder, 
  FolderOpen, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronDown,
  FileText,
  Code2,
  Image,
  Archive,
  Database
} from 'lucide-react';

/**
 * FileTree Component
 * Displays and manages files in a tree structure for the collaborative editor
 */
const FileTree = ({ 
  files, 
  activeFileId, 
  onFileSelect, 
  onCreateFile, 
  onDeleteFile,
  currentUser 
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src']));
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState('plaintext');
  const [selectedPath, setSelectedPath] = useState('');

  // Get file icon based on language/extension
  const getFileIcon = (fileName, language) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const iconClass = "w-4 h-4";

    switch (language) {
      case 'javascript':
      case 'typescript':
        return <Code2 className={`${iconClass} text-yellow-400`} />;
      case 'css':
      case 'scss':
        return <FileText className={`${iconClass} text-blue-400`} />;
      case 'html':
        return <FileText className={`${iconClass} text-orange-400`} />;
      case 'json':
        return <Database className={`${iconClass} text-green-400`} />;
      case 'markdown':
        return <FileText className={`${iconClass} text-slate-400`} />;
      default:
        if (extension === 'png' || extension === 'jpg' || extension === 'svg') {
          return <Image className={`${iconClass} text-purple-400`} />;
        }
        if (extension === 'zip' || extension === 'tar') {
          return <Archive className={`${iconClass} text-red-400`} />;
        }
        return <File className={`${iconClass} text-slate-400`} />;
    }
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    
    const filePath = selectedPath ? `${selectedPath}/${newFileName}` : newFileName;
    onCreateFile(newFileName, newFileLanguage, filePath);
    
    setShowAddModal(false);
    setNewFileName('');
    setNewFileLanguage('plaintext');
    setSelectedPath('');
  };

  const handleDeleteFile = (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      onDeleteFile(fileId);
    }
  };

  // Organize files into a tree structure
  const buildFileTree = () => {
    const tree = {};
    
    files.forEach(file => {
      const pathParts = file.path.split('/');
      let current = tree;
      
      pathParts.forEach((part, index) => {
        if (index === pathParts.length - 1) {
          // Last part is the file
          current[part] = { type: 'file', ...file };
        } else {
          // Folder
          if (!current[part]) {
            current[part] = { type: 'folder', children: {} };
          }
          current = current[part].children;
        }
      });
    });
    
    return tree;
  };

  const renderTree = (tree, path = '', depth = 0) => {
    return Object.entries(tree)
      .sort(([a, itemA], [b, itemB]) => {
        // Folders first, then files, then alphabetically
        if (itemA.type === 'folder' && itemB.type !== 'folder') return -1;
        if (itemA.type !== 'folder' && itemB.type === 'folder') return 1;
        return a.localeCompare(b);
      })
      .map(([name, item]) => {
        const currentPath = path ? `${path}/${name}` : name;
        const isFolder = item.type === 'folder';
        const isExpanded = expandedFolders.has(currentPath);
        const isActive = item.id === activeFileId;

        return (
          <div key={currentPath}>
            <div
              className={`flex items-center space-x-2 px-2 py-1.5 hover:bg-white/5 cursor-pointer rounded group ${
                isActive ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : ''
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (isFolder) {
                  toggleFolder(currentPath);
                } else {
                  onFileSelect(item.id);
                }
              }}
            >
              {isFolder && (
                <div className="w-4 h-4 flex items-center justify-center">
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  )}
                </div>
              )}

              {isFolder ? (
                isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-blue-400" />
                ) : (
                  <Folder className="w-4 h-4 text-blue-400" />
                )
              ) : (
                getFileIcon(name, item.language)
              )}

              <span className={`text-sm flex-1 truncate ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                {name}
              </span>

              <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                {isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPath(currentPath);
                      setShowAddModal(true);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Add file"
                  >
                    <Plus className="w-3 h-3 text-slate-400" />
                  </button>
                )}
                {!isFolder && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(item.id, name);
                    }}
                    className="p-1 hover:bg-white/10 rounded"
                    title="Delete file"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                )}
              </div>
            </div>

            {isFolder && isExpanded && item.children && (
              <div>
                {renderTree(item.children, currentPath, depth + 1)}
              </div>
            )}
          </div>
        );
      });
  };

  const fileTree = buildFileTree();

  return (
    <div className="h-full flex flex-col bg-white/5 border-r border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <h3 className="text-white font-semibold text-sm">Explorer</h3>
        <button
          onClick={() => {
            setSelectedPath('');
            setShowAddModal(true);
          }}
          className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
          title="New File"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <FileText className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-slate-400 text-sm mb-3">No files yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add File</span>
            </button>
          </div>
        ) : (
          renderTree(fileTree)
        )}
      </div>

      {/* Add File Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Create New File</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewFileName('');
                  setSelectedPath('');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="example.js, style.css, etc."
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Language
                </label>
                <select
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                >
                  <option value="plaintext" className="bg-slate-800">Plain Text</option>
                  <option value="javascript" className="bg-slate-800">JavaScript</option>
                  <option value="typescript" className="bg-slate-800">TypeScript</option>
                  <option value="html" className="bg-slate-800">HTML</option>
                  <option value="css" className="bg-slate-800">CSS</option>
                  <option value="json" className="bg-slate-800">JSON</option>
                  <option value="markdown" className="bg-slate-800">Markdown</option>
                  <option value="python" className="bg-slate-800">Python</option>
                  <option value="java" className="bg-slate-800">Java</option>
                </select>
              </div>

              {selectedPath && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Location
                  </label>
                  <div className="px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-slate-400 text-sm">
                    {selectedPath}/
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewFileName('');
                  setSelectedPath('');
                }}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFile}
                disabled={!newFileName.trim()}
                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileTree;

