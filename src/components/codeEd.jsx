import React, { useState, useEffect, useRef } from 'react';
import {
    File,
    Folder,
    FolderOpen,
    Plus,
    X,
    ChevronRight,
    ChevronDown,
    Eye,
    EyeOff,
    Play,
    Settings,
    FileText,
    Code2,
    Image,
    Archive,
    Database,
    Wifi,
    WifiOff,
    Save,
    AlertCircle
} from 'lucide-react';

import CodeArea from "./codeArea.jsx";

// Import Firebase functions
import {
    saveProjectFileTree,
    getProjectFileTree,
    subscribeToProjectChanges,
    updateFileContent,
    addNewFile,
    deleteFile,
    batchUpdateFiles
} from '../config/firebase'; // Make sure this path is correct

import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

const CollaborativeCodeEditor = ({ projectId, currentUser }) => {
    // Layout states
    const [showFileTree, setShowFileTree] = useState(true);
    const [fileTreeWidth, setFileTreeWidth] = useState(200);
    const [isResizing, setIsResizing] = useState(false);

    // File management states
    const [fileTree, setFileTree] = useState({});
    const [openTabs, setOpenTabs] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [fileContents, setFileContents] = useState({});

    // UI states
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemType, setNewItemType] = useState('file');
    const [selectedPath, setSelectedPath] = useState('');
    const [expandedFolders, setExpandedFolders] = useState(new Set());

    // Build/Run states
    const [buildCommand, setBuildCommand] = useState('npm run build');
    const [startCommand, setStartCommand] = useState('npm start');
    const [showCommands, setShowCommands] = useState(false);

    // Firebase/Sync states
    const [isConnected, setIsConnected] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);
    const [syncError, setSyncError] = useState(null);
    const [unsavedChanges, setUnsavedChanges] = useState(new Set());

    const containerRef = useRef(null);
    const editorRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const saveTimeoutRef = useRef(null);

    // File type icons
    const getFileIcon = (fileName) => {
        const extension = fileName.split('.').pop()?.toLowerCase();
        const iconClass = "w-4 h-4";

        switch (extension) {
            case 'js':
            case 'jsx':
            case 'ts':
            case 'tsx':
                return <Code2 className={`${iconClass} text-yellow-400`} />;
            case 'css':
            case 'scss':
            case 'less':
                return <FileText className={`${iconClass} text-blue-400`} />;
            case 'html':
                return <FileText className={`${iconClass} text-orange-400`} />;
            case 'json':
                return <Database className={`${iconClass} text-green-400`} />;
            case 'md':
                return <FileText className={`${iconClass} text-slate-400`} />;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                return <Image className={`${iconClass} text-purple-400`} />;
            case 'zip':
            case 'tar':
            case 'gz':
                return <Archive className={`${iconClass} text-red-400`} />;
            default:
                return <File className={`${iconClass} text-slate-400`} />;
        }
    };

    // Initialize Firebase and load project files
    useEffect(() => {
        console.log('Loading project:', projectId);
        if (projectId) {
            loadProjectFiles();
            setupRealtimeSync();
        }

        // Cleanup on unmount
        return () => {
            if (unsubscribeRef.current) {
                unsubscribeRef.current();
            }
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [projectId]);

    const loadProjectFiles = async () => {
        try {
            setIsConnected(false);
            setSyncError(null);

            // Try to load project from Firebase
            const projectData = await getProjectFileTree(projectId);

            if (projectData && projectData.fileTree) {
                // Load existing project
                setFileTree(projectData.fileTree);
                setIsConnected(true);
                console.log('Project loaded from Firebase');

                // Auto-expand src folder if it exists
                if (projectData.fileTree.src) {
                    setExpandedFolders(new Set(['src']));
                }
            } else {
                // Create new project with default structure
                console.log('Creating new project with default structure');
                await createDefaultProject();
            }

        } catch (error) {
            console.error('Error loading project files:', error);
            setSyncError('Failed to load project');

            // Fall back to mock data
            await createDefaultProject();
        }
    };

    const createDefaultProject = async () => {
        const mockFileTree = {
            'src': {
                type: 'folder',
                children: {
                    'App.js': {
                        type: 'file',
                        content: '// Welcome to your collaborative editor!\n\nfunction App() {\n  return (\n    <div className="App">\n      <h1>Hello World!</h1>\n    </div>\n  );\n}\n\nexport default App;'
                    },
                    'index.js': {
                        type: 'file',
                        content: 'import React from "react";\nimport ReactDOM from "react-dom";\nimport App from "./App";\n\nReactDOM.render(<App />, document.getElementById("root"));'
                    },
                    'components': {
                        type: 'folder',
                        children: {
                            'Header.js': {
                                type: 'file',
                                content: 'import React from "react";\n\nconst Header = () => {\n  return (\n    <header>\n      <h1>My App</h1>\n    </header>\n  );\n};\n\nexport default Header;'
                            },
                            'Footer.js': {
                                type: 'file',
                                content: 'import React from "react";\n\nconst Footer = () => {\n  return (\n    <footer>\n      <p>&copy; 2024 My App</p>\n    </footer>\n  );\n};\n\nexport default Footer;'
                            }
                        }
                    }
                }
            },
            'package.json': {
                type: 'file',
                content: '{\n  "name": "collaborative-project",\n  "version": "1.0.0",\n  "dependencies": {\n    "react": "^18.0.0",\n    "react-dom": "^18.0.0"\n  },\n  "scripts": {\n    "start": "react-scripts start",\n    "build": "react-scripts build"\n  }\n}'
            },
            'README.md': {
                type: 'file',
                content: '# Collaborative Project\n\nThis is a collaborative coding project!\n\n## Getting Started\n\n1. Install dependencies: `npm install`\n2. Start the development server: `npm start`\n\n## Features\n\n- Real-time collaboration\n- File management\n- Code editing\n\nHappy coding! 🚀'
            }
        };

        try {
            // Save to Firebase
            await saveProjectFileTree(projectId, mockFileTree, {
                projectName: 'New Project',
                createdAt: new Date().toISOString(),
                createdBy: currentUser?.email || 'anonymous',
                collaborators: [currentUser?.email || 'anonymous']
            });

            setFileTree(mockFileTree);
            setIsConnected(true);
            setExpandedFolders(new Set(['src']));
            console.log('Default project created and saved');

        } catch (error) {
            console.error('Error creating default project:', error);
            // Set locally even if Firebase fails
            setFileTree(mockFileTree);
            setExpandedFolders(new Set(['src']));
            setSyncError('Working offline - changes won\'t sync');
        }
    };

    const setupRealtimeSync = () => {
        if (!projectId) return;

        try {
            const unsubscribe = subscribeToProjectChanges(projectId, (projectData) => {
                if (!projectData || !projectData.fileTree) return;

                console.log('Real-time update received');

                // 1. Update the tree
                setFileTree(projectData.fileTree);

                // 2. Reconcile contents *only* for open tabs
                setFileContents(prevContents => {
                    const nextContents = { ...prevContents };
                    openTabs.forEach(tab => {
                        const remote = getFileContentFromTree(projectData.fileTree, tab.path);
                        // Only overwrite if truly different
                        if (remote !== null && remote !== prevContents[tab.path]) {
                            nextContents[tab.path] = remote;
                        }
                    });
                    return nextContents;
                });

                // 3. Ensure status flags reflect connectivity
                setIsConnected(true);
                setSyncError(null);
            });

            unsubscribeRef.current = unsubscribe;
        } catch (error) {
            console.error('Error setting up real-time sync:', error);
            setSyncError('Real-time sync unavailable');
        }
    };


    // Helper function to get file content from tree
    const getFileContentFromTree = (tree, path) => {
        const pathParts = path.split('/');
        let current = tree;

        for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i];
            if (current[part] && current[part].type === 'folder') {
                current = current[part].children || {};
            } else {
                return null;
            }
        }

        const fileName = pathParts[pathParts.length - 1];
        return current[fileName]?.content || null;
    };

    // Sync file changes to Firebase
    const syncFileChange = async (filePath, content) => {
        try {
            setIsSaving(true);
            setSyncError(null);

            await updateFileContent(projectId, filePath, content);

            setLastSaved(new Date());
            setUnsavedChanges(prev => {
                const newSet = new Set(prev);
                newSet.delete(filePath);
                return newSet;
            });

            console.log('File synced:', filePath);

        } catch (error) {
            console.error('Error syncing file:', error);
            setSyncError(`Failed to sync ${filePath}`);

            // Mark as unsaved
            setUnsavedChanges(prev => new Set(prev).add(filePath));
        } finally {
            setIsSaving(false);
        }
    };

    // Handle file tree operations
    const toggleFolder = (path) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };

    const openFile = (path, fileName) => {
        const fullPath = path ? `${path}/${fileName}` : fileName;

        // Get file content
        const content = getFileContent(fullPath);

        // Add to open tabs if not already open
        if (!openTabs.find(tab => tab.path === fullPath)) {
            setOpenTabs(prev => [...prev, { path: fullPath, name: fileName, content }]);
        }

        // Set as active tab
        setActiveTab(fullPath);

        // Store content for editing
        setFileContents(prev => ({ ...prev, [fullPath]: content }));
    };

    const closeTab = (path) => {
        setOpenTabs(prev => prev.filter(tab => tab.path !== path));
        if (activeTab === path) {
            const remainingTabs = openTabs.filter(tab => tab.path !== path);
            setActiveTab(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].path : null);
        }

        // Remove from file contents
        setFileContents(prev => {
            const newContents = { ...prev };
            delete newContents[path];
            return newContents;
        });
    };

    const getFileContent = (path) => {
        const pathParts = path.split('/');
        let current = fileTree;

        for (const part of pathParts) {
            if (current[part]) {
                if (current[part].type === 'file') {
                    return current[part].content || '';
                } else {
                    current = current[part].children || {};
                }
            }
        }
        return '';
    };

    const handleFileContentChange = (path, content) => {
        setFileContents(prev => ({ ...prev, [path]: content }));

        // Mark as having unsaved changes
        setUnsavedChanges(prev => new Set(prev).add(path));

        // Debounce the sync operation
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            syncFileChange(path, content);
        }, 1000); // 1 second debounce
    };

    // Add new file/folder
    const handleAddItem = async () => {
        if (!newItemName.trim()) return;

        try {
            const fullPath = selectedPath ? `${selectedPath}/${newItemName}` : newItemName;
            console.log('Adding item:', fullPath, newItemType);

            if (newItemType === 'file') {
                await addNewFile(projectId, fullPath, '// New file\n');

                // Open the new file
                setTimeout(() => {
                    openFile(selectedPath, newItemName);
                }, 100);
            } else {
                // For folders, we'll update the local state and sync
                // Firebase will handle the folder creation when files are added to it
                console.log('Folder creation will be handled when files are added');
            }

            setShowAddModal(false);
            setNewItemName('');
            setSelectedPath('');

        } catch (error) {
            console.error('Error adding item:', error);
            setSyncError(`Failed to create ${newItemType}`);
        }
    };

    // Delete file function
    const handleDeleteFile = async (filePath) => {
        if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;

        try {
            await deleteFile(projectId, filePath);

            // Close tab if it's open
            if (openTabs.find(tab => tab.path === filePath)) {
                closeTab(filePath);
            }

            console.log('File deleted:', filePath);

        } catch (error) {
            console.error('Error deleting file:', error);
            setSyncError(`Failed to delete ${filePath}`);
        }
    };

    // Manual save function
    const handleManualSave = async () => {
        if (!activeTab || !unsavedChanges.has(activeTab)) return;

        const content = fileContents[activeTab];
        if (content !== undefined) {
            await syncFileChange(activeTab, content);
        }
    };

    // Resize functionality for file tree
    const handleMouseDown = (e) => {
        if (!showFileTree) return;
        setIsResizing(true);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e) => {
        if (!isResizing || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;

        // Set min and max width constraints
        if (newWidth >= 200 && newWidth <= containerRect.width * 0.6) {
            setFileTreeWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    // Render file tree recursively
    const renderFileTree = (tree, path = '') => {
        return Object.entries(tree)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([name, item]) => {
                const currentPath = path ? `${path}/${name}` : name;
                const isFolder = item.type === 'folder';
                const isExpanded = expandedFolders.has(currentPath);
                const hasUnsavedChanges = unsavedChanges.has(currentPath);

                return (
                    <div key={currentPath}>
                        <div
                            className={`flex items-center space-x-2 px-2 py-1.5 hover:bg-white/5 cursor-pointer rounded group ${activeTab === currentPath ? 'bg-cyan-500/20 border-l-2 border-cyan-400' : ''
                                }`}
                            onClick={() => isFolder ? toggleFolder(currentPath) : openFile(path, name)}
                            onContextMenu={(e) => {
                                if (!isFolder) {
                                    e.preventDefault();
                                    // You can add context menu for delete here
                                }
                            }}
                            style={{ paddingLeft: `${(path.split('/').length) * 16 + 8}px` }}
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
                                getFileIcon(name)
                            )}

                            <span className={`text-sm flex-1 truncate ${hasUnsavedChanges ? 'text-yellow-300' : 'text-white'}`}>
                                {name}{hasUnsavedChanges && ' •'}
                            </span>

                            <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedPath(isFolder ? currentPath : path);
                                        setShowAddModal(true);
                                    }}
                                    className="p-1 hover:bg-white/10 rounded"
                                    title="Add file/folder"
                                >
                                    <Plus className="w-3 h-3 text-slate-400" />
                                </button>
                                {!isFolder && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFile(currentPath);
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
                                {renderFileTree(item.children, currentPath)}
                            </div>
                        )}
                    </div>
                );
            });
    };

    return (
        <div ref={containerRef} className="flex h-full w-full">
            {/* File Tree */}
            {showFileTree && (
                <div
                    className="bg-white/5 border-r border-white/10 flex flex-col flex-shrink-0"
                    style={{ width: `${fileTreeWidth}px` }}
                >
                    {/* File Tree Header */}
                    <div className="flex items-center justify-between p-3 border-b border-white/10">
                        <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold text-sm">Explorer</h3>
                            {/* Connection Status */}
                            <div className="flex items-center space-x-1">
                                {isConnected ? (
                                    <Wifi className="w-3 h-3 text-green-400" title="Connected" />
                                ) : (
                                    <WifiOff className="w-3 h-3 text-red-400" title="Disconnected" />
                                )}
                                {isSaving && (
                                    <div className="w-3 h-3 border border-cyan-400 border-t-transparent rounded-full animate-spin" title="Saving..." />
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
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
                            <button
                                onClick={() => setShowFileTree(false)}
                                className="p-1.5 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors"
                                title="Hide Explorer"
                            >
                                <EyeOff className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Sync Status */}
                    {syncError && (
                        <div className="px-3 py-2 bg-red-500/20 border-b border-red-500/30">
                            <div className="flex items-center space-x-2">
                                <AlertCircle className="w-4 h-4 text-red-400" />
                                <span className="text-red-300 text-xs">{syncError}</span>
                            </div>
                        </div>
                    )}

                    {lastSaved && (
                        <div className="px-3 py-1 border-b border-white/10">
                            <span className="text-xs text-slate-400">
                                Last saved: {lastSaved.toLocaleTimeString()}
                            </span>
                        </div>
                    )}

                    {/* File Tree Content */}
                    <div className="flex-1 overflow-y-auto p-2">
                        {Object.keys(fileTree).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-32 text-center">
                                <FileText className="w-8 h-8 text-slate-500 mb-2" />
                                <p className="text-slate-400 text-sm mb-3">No files yet</p>
                                <button
                                    onClick={() => {
                                        setSelectedPath('');
                                        setShowAddModal(true);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span>Add File</span>
                                </button>
                            </div>
                        ) : (
                            renderFileTree(fileTree)
                        )}
                    </div>

                    {/* Build Commands */}
                    <div className="border-t border-white/10 p-3">
                        <button
                            onClick={() => setShowCommands(!showCommands)}
                            className="flex items-center justify-between w-full text-left p-2 hover:bg-white/5 rounded"
                        >
                            <div className="flex items-center space-x-2">
                                <Settings className="w-4 h-4 text-slate-400" />
                                <span className="text-white text-sm font-medium">Commands</span>
                            </div>
                            {showCommands ? (
                                <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                        </button>

                        {showCommands && (
                            <div className="mt-2 space-y-2">
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Build Command</label>
                                    <input
                                        type="text"
                                        value={buildCommand}
                                        onChange={(e) => setBuildCommand(e.target.value)}
                                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-400 mb-1">Start Command</label>
                                    <input
                                        type="text"
                                        value={startCommand}
                                        onChange={(e) => setStartCommand(e.target.value)}
                                        className="w-full px-2 py-1 bg-white/5 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500"
                                    />
                                </div>
                                <button className="w-full flex items-center justify-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200">
                                    <Play className="w-3 h-3" />
                                    <span>Run Project</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Resize Handle */}
            {showFileTree && (
                <div
                    onMouseDown={handleMouseDown}
                    className="w-1 bg-white/10 hover:bg-cyan-500/50 cursor-col-resize transition-colors duration-200 relative flex-shrink-0"
                >
                    <div className="absolute inset-y-0 -left-1 -right-1"></div>
                </div>
            )}

            {/* Code Editor Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Editor Header */}
                <div className="flex items-center justify-between bg-transparent border-b border-white/20 min-h-[48px] flex-shrink-0">
                    <div className="flex items-center min-w-0 flex-1">
                        {!showFileTree && (
                            <button
                                onClick={() => setShowFileTree(true)}
                                className="p-2 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors flex-shrink-0"
                                title="Show Explorer"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        )}

                        {/* Tabs */}
                        <div className="flex items-center overflow-x-auto min-w-0 flex-1 tabs-scroll">
                            {openTabs.map((tab) => {
                                const hasUnsavedChanges = unsavedChanges.has(tab.path);
                                return (
                                    <div
                                        key={tab.path}
                                        className={`flex items-center space-x-2 px-4 py-2 border-r border-white/10 cursor-pointer flex-shrink-0 ${activeTab === tab.path ? 'bg-white/10' : 'hover:bg-white/5'
                                            }`}
                                        onClick={() => setActiveTab(tab.path)}
                                    >
                                        {getFileIcon(tab.name)}
                                        <span className={`text-sm truncate max-w-32 ${hasUnsavedChanges ? 'text-yellow-300' : 'text-white'}`}>
                                            {tab.name}{hasUnsavedChanges && ' •'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeTab(tab.path);
                                            }}
                                            className="p-0.5 hover:bg-white/20 rounded text-slate-400 hover:text-white"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Save Button */}
                    {activeTab && unsavedChanges.has(activeTab) && (
                        <button
                            onClick={handleManualSave}
                            disabled={isSaving}
                            className="flex items-center space-x-2 px-3 py-1.5 mr-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded text-sm hover:from-cyan-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50"
                        >
                            <Save className="w-3 h-3" />
                            <span>Save</span>
                        </button>
                    )}
                </div>

                {/* Editor Content */}
                <div className="flex-1 relative overflow-auto tabs-scroll">
                    {activeTab && fileContents[activeTab] !== undefined ? (
                        <CodeArea
                            value={fileContents[activeTab] || ''}
                            onChange={(text) => handleFileContentChange(activeTab, text)}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <Code2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                                <p className="text-slate-400 text-lg">Welcome to the Code Editor</p>
                                <p className="text-slate-500 text-sm">
                                    {Object.keys(fileTree).length === 0
                                        ? "Create your first file to get started!"
                                        : "Select a file from the explorer to start editing"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Add New Item</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewItemName('');
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
                                    Type
                                </label>
                                <div className="flex space-x-4">
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="file"
                                            checked={newItemType === 'file'}
                                            onChange={(e) => setNewItemType(e.target.value)}
                                            className="text-cyan-500 focus:ring-cyan-500"
                                        />
                                        <span className="text-white">File</span>
                                    </label>
                                    <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            value="folder"
                                            checked={newItemType === 'folder'}
                                            onChange={(e) => setNewItemType(e.target.value)}
                                            className="text-cyan-500 focus:ring-cyan-500"
                                        />
                                        <span className="text-white">Folder</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={(e) => setNewItemName(e.target.value)}
                                    placeholder={`Enter ${newItemType} name...`}
                                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                                    autoFocus
                                />
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
                                    setNewItemName('');
                                    setSelectedPath('');
                                }}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddItem}
                                disabled={!newItemName.trim()}
                                className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create {newItemType}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CollaborativeCodeEditor;