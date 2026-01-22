import React, { useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { MonacoBinding } from "y-monaco";

// Pass the roomId from your existing chat state
const CollaborativeEditor = ({ roomId }) => {
  const editorRef = useRef(null);

  // 1. Initialize the Editor
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    
    // 2. Initialize Yjs Doc
    const doc = new Y.Doc();

    // 3. Connect to the backend (See Backend section below)
    // using the SAME roomId as your chat
    const provider = new WebsocketProvider(
      "ws://localhost:1234", // Your Yjs specific port/route
      roomId, 
      doc
    );

    // 4. Define the shared text type
    const type = doc.getText("monaco"); 

    // 5. Bind Yjs to Monaco
    // This handles all the "User A types X, User B sees X" magic
    const binding = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      provider.awareness // Handles cursors (who is currently selecting what)
    );
  }

  return (
    <Editor
      height="100vh"
      defaultLanguage="javascript"
      theme="vs-dark"
      onMount={handleEditorDidMount}
    />
  );
};

export default CollaborativeEditor;