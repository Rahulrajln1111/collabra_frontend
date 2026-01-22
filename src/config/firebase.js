// firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  updateDoc,
  serverTimestamp,
  arrayUnion,
  runTransaction
} from 'firebase/firestore';

// Your Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app =  initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== CORE FUNCTIONS ==========

/**
 * Create a new project with empty file tree structure
 */
export const createProject = async (mongoProjectId, projectData = {}) => {
  try {
    console.log('Creating project with ID:', mongoProjectId);

    const projectRef = doc(db, 'projects', mongoProjectId);

    // Check if project already exists

    const existingProject = await getDoc(projectRef);

    if (existingProject.exists()) {
      throw new Error(`Project with ID ${mongoProjectId} already exists`);
    }
    // Create default empty file tree structure
    const defaultFileTree = createDefaultFileTree(projectData.template);
    
    const newProject = {
      projectId: mongoProjectId,
      name: projectData.name || 'Untitled Project',
      description: projectData.description || '',
      template: projectData.template || 'empty',
      fileTree: defaultFileTree,
      settings: projectData.settings || {},
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
      lastModifiedFiles: {},
      aiModifiedFiles: [],
      collaborators: projectData.collaborators || [],
      isPublic: projectData.isPublic || false,
      tags: projectData.tags || [],
      ...projectData
    };
    
    try {
      await setDoc(projectRef, newProject);
      console.log('Project document created successfully');
    } catch (error) {
      console.error(' Error creating project document:', error);

      // Optional: handle specific Firebase errors
      // if (error.code === 'permission-denied') { ... }

      throw error; // rethrow if caller must handle it
    }
    
    console.log(`Project ${mongoProjectId} created successfully`);
    return { 
      success: true, 
      projectId: mongoProjectId,
      data: newProject
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

/**
 * Save/Create a project's file tree in Firestore
 */
export const saveProjectFileTree = async (mongoProjectId, fileTree, metadata = {}) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    await setDoc(projectRef, {
      fileTree,
      lastModified: serverTimestamp(),
      projectId: mongoProjectId,
      ...metadata
    });
    
    console.log('Project file tree saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving project file tree:', error);
    throw error;
  }
};

/**
 * Get a project's file tree from Firestore
 */
export const getProjectFileTree = async (mongoProjectId) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    const projectSnap = await getDoc(projectRef);
    
    if (projectSnap.exists()) {
      return projectSnap.data();
    } else {
      console.log('No project found with this ID');
      return null;
    }
  } catch (error) {
    console.error('Error getting project file tree:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for project changes
 */
export const subscribeToProjectChanges = (mongoProjectId, callback) => {
  const projectRef = doc(db, 'projects', mongoProjectId);
  
  return onSnapshot(projectRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error in real-time listener:', error);
  });
};

/**
 * Update a specific file's content in the file tree - FIXED VERSION
 */
export const updateFileContent = async (mongoProjectId, filePath, newContent) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    // Use transaction to safely update the file tree
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      
      const currentData = projectDoc.data();
      const updatedFileTree = updateFileInTree(currentData.fileTree, filePath, newContent);
      
      // Create safe key for lastModifiedFiles (replace dots and slashes)
      const safeFilePath = filePath.replace(/[./]/g, '_');
      
      transaction.update(projectRef, {
        fileTree: updatedFileTree,
        lastModified: serverTimestamp(),
        [`lastModifiedFiles.${safeFilePath}`]: serverTimestamp()
      });
    });
    
    console.log(`File ${filePath} updated successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error updating file content:', error);
    throw error;
  }
};

/**
 * Update file content using transaction (for concurrent edits) - SAME AS ABOVE NOW
 */
export const updateFileContentTransaction = async (mongoProjectId, filePath, newContent) => {
  return updateFileContent(mongoProjectId, filePath, newContent);
};

/**
 * Add a new file to the file tree
 */
export const addNewFile = async (mongoProjectId, filePath, content = '') => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      
      const currentData = projectDoc.data();
      const updatedFileTree = addFileToTree(currentData.fileTree, filePath, content);
      
      transaction.update(projectRef, {
        fileTree: updatedFileTree,
        lastModified: serverTimestamp()
      });
    });
    
    console.log(`New file ${filePath} added successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error adding new file:', error);
    throw error;
  }
};

/**
 * Delete a file from the file tree
 */
export const deleteFile = async (mongoProjectId, filePath) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      
      const currentData = projectDoc.data();
      const updatedFileTree = removeFileFromTree(currentData.fileTree, filePath);
      
      transaction.update(projectRef, {
        fileTree: updatedFileTree,
        lastModified: serverTimestamp()
      });
    });
    
    console.log(`File ${filePath} deleted successfully`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Handle AI agent code updates
 */
export const handleAICodeUpdate = async (mongoProjectId, filePath, aiGeneratedCode) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      
      const currentData = projectDoc.data();
      const updatedFileTree = updateFileInTree(currentData.fileTree, filePath, aiGeneratedCode);
      
      transaction.update(projectRef, {
        fileTree: updatedFileTree,
        lastModified: serverTimestamp(),
        lastAIModification: serverTimestamp(),
        aiModifiedFiles: arrayUnion(filePath)
      });
    });
    
    console.log(`AI code updated in ${filePath}`);
    return { success: true };
  } catch (error) {
    console.error('Error handling AI code update:', error);
    throw error;
  }
};

// ========== UTILITY FUNCTIONS ==========

/**
 * Create default file tree based on template
 */
function createDefaultFileTree(template = 'empty') {
  const templates = {
    empty: {},
    
    react: {
      'src': {
        type: 'folder',
        children: {
          'App.js': {
            type: 'file',
            content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to React</h1>
        <p>Start editing to see some magic happen!</p>
      </header>
    </div>
  );
}

export default App;`
          },
          'App.css': {
            type: 'file',
            content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  padding: 20px;
  color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
}`
          },
          'index.js': {
            type: 'file',
            content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);`
          }
        }
      },
      'public': {
        type: 'folder',
        children: {
          'index.html': {
            type: 'file',
            content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
</head>
<body>
    <div id="root"></div>
</body>
</html>`
          }
        }
      },
      'package.json': {
        type: 'file',
        content: `{
  "name": "react-project",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build"
  }
}`
      }
    },
    
    node: {
      'src': {
        type: 'folder',
        children: {
          'index.js': {
            type: 'file',
            content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
          }
        }
      },
      'package.json': {
        type: 'file',
        content: `{
  "name": "node-project",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}`
      }
    },
    
    html: {
      'index.html': {
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>Welcome to My Website</h1>
    </header>
    <main>
        <p>Start building your amazing website here!</p>
    </main>
    <script src="script.js"></script>
</body>
</html>`
      },
      'styles.css': {
        type: 'file',
        content: `body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f4f4f4;
}

header {
    background-color: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`
      },
      'script.js': {
        type: 'file',
        content: `document.addEventListener('DOMContentLoaded', function() {
    console.log('Website loaded successfully!');
    
    // Add your JavaScript code here
});`
      }
    }
  };
  
  return templates[template] || templates.empty;
}

/**
 * REMOVED - This function was causing the problem
 * Don't use field paths for nested updates in Firestore
 */

/**
 * Update a file in the file tree object - IMPROVED VERSION
 */
function updateFileInTree(fileTree, filePath, newContent) {
  const pathParts = filePath.split('/');
  const updatedTree = JSON.parse(JSON.stringify(fileTree)); // Deep clone
  
  let current = updatedTree;
  
  // Navigate to the file location
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (current[part] && current[part].type === 'folder' && current[part].children) {
      current = current[part].children;
    } else {
      // Create folder structure if it doesn't exist
      if (!current[part]) {
        current[part] = { type: 'folder', children: {} };
      }
      current = current[part].children;
    }
  }
  
  // Update the file content
  const fileName = pathParts[pathParts.length - 1];
  if (current[fileName] && current[fileName].type === 'file') {
    current[fileName].content = newContent;
  } else if (!current[fileName]) {
    // Create file if it doesn't exist
    current[fileName] = { type: 'file', content: newContent };
  } else {
    throw new Error(`${fileName} is not a file`);
  }
  
  return updatedTree;
}

/**
 * Add a new file to the file tree
 */
function addFileToTree(fileTree, filePath, content) {
  const pathParts = filePath.split('/');
  const updatedTree = JSON.parse(JSON.stringify(fileTree)); // Deep clone
  
  let current = updatedTree;
  
  // Navigate/create folders as needed
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (!current[part]) {
      current[part] = { type: 'folder', children: {} };
    }
    if (current[part].type !== 'folder') {
      throw new Error(`${part} is not a folder`);
    }
    if (!current[part].children) {
      current[part].children = {};
    }
    current = current[part].children;
  }
  
  // Add the file
  const fileName = pathParts[pathParts.length - 1];
  if (current[fileName]) {
    throw new Error(`${fileName} already exists`);
  }
  current[fileName] = { type: 'file', content };
  
  return updatedTree;
}

/**
 * Remove a file from the file tree
 */
function removeFileFromTree(fileTree, filePath) {
  const pathParts = filePath.split('/');
  const updatedTree = JSON.parse(JSON.stringify(fileTree)); // Deep clone
  
  let current = updatedTree;
  
  // Navigate to the parent folder
  for (let i = 0; i < pathParts.length - 1; i++) {
    const part = pathParts[i];
    if (current[part] && current[part].type === 'folder' && current[part].children) {
      current = current[part].children;
    } else {
      throw new Error(`Path ${filePath} not found in file tree`);
    }
  }
  
  // Remove the file
  const fileName = pathParts[pathParts.length - 1];
  if (current[fileName]) {
    delete current[fileName];
  } else {
    throw new Error(`File ${fileName} not found`);
  }
  
  return updatedTree;
}

// ========== REAL-TIME COLLABORATION HELPERS ==========

/**
 * Batch multiple file updates (useful for AI agents making multiple changes)
 */
export const batchUpdateFiles = async (mongoProjectId, fileUpdates) => {
  try {
    const projectRef = doc(db, 'projects', mongoProjectId);
    
    await runTransaction(db, async (transaction) => {
      const projectDoc = await transaction.get(projectRef);
      
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      
      let currentData = projectDoc.data();
      let updatedFileTree = currentData.fileTree;
      
      // Apply all updates
      for (const update of fileUpdates) {
        updatedFileTree = updateFileInTree(updatedFileTree, update.filePath, update.content);
      }
      
      transaction.update(projectRef, {
        fileTree: updatedFileTree,
        lastModified: serverTimestamp(),
        lastBatchUpdate: serverTimestamp()
      });
    });
    
    console.log(`Batch updated ${fileUpdates.length} files`);
    return { success: true };
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};

export { db };