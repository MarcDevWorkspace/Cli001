import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Bio } from './pages/Bio';
import { Publications } from './pages/Publications';
import { PostView } from './pages/PostView';
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Editor } from './pages/admin/Editor';
import { ProtectedRoute } from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes wrapped in Layout */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/bio" element={<Layout><Bio /></Layout>} />
        <Route path="/publications" element={<Layout><Publications /></Layout>} />
        <Route path="/post/:slug" element={<Layout><PostView /></Layout>} />

        {/* Admin Routes - Some without Layout for focus */}
        <Route path="/admin" element={<Login />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
        <Route path="/admin/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;