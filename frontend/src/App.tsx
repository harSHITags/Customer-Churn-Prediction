import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { Dashboard } from './pages/Dashboard';
import { SinglePredict } from './pages/SinglePredict';
import { BatchUploadPage } from './pages/BatchUploadPage';
import { ModelInfoPage } from './pages/ModelInfoPage';

function App() {
  return (
    <BrowserRouter>
      <div className="flex w-screen h-screen overflow-hidden bg-bg-primary">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Right Dashboard Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Telemetry Header */}
          <TopBar />

          {/* Main Scrollable Workspace */}
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/predict" element={<SinglePredict />} />
              <Route path="/batch" element={<BatchUploadPage />} />
              <Route path="/model" element={<ModelInfoPage />} />
              {/* Fallback to Dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      
      {/* Dynamic system notifications */}
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'font-mono text-xs border border-border bg-bg-elevated text-text-primary rounded-lg shadow-xl',
          style: {
            backgroundColor: 'var(--bg-elevated)',
            color: 'var(--text-primary)',
            borderColor: 'var(--border)'
          }
        }}
      />
    </BrowserRouter>
  );
}

export default App;
