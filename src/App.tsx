import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Sidebar } from './components/layout/Sidebar';
import { TopicList } from './components/topics/TopicList';
import { ProfessorList } from './components/professors/ProfessorList';
import { TopicModal } from './components/topics/TopicModal';
import { ProfessorModal } from './components/professors/ProfessorModal';
import { SchoolSelectModal } from './components/common/SchoolSelectModal';
import { AuthModal } from './components/common/AuthModal';
import { ToastRegion } from './components/common/ToastRegion';
import { ApplicationsView } from './components/workspace/ApplicationsView';
import { RoadmapView } from './components/workspace/RoadmapView';
import { ProfileView } from './components/workspace/ProfileView';

export const App: React.FC = () => {
  const { activeView } = useApp();
  const catalogView = activeView === 'topics' || activeView === 'professors';

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f7f9] text-slate-900 dark:bg-[#0f131a] dark:text-slate-100 transition-colors duration-150">
      <Header />
      <main id="main-content" className={`flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 ${catalogView ? 'grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]' : ''}`}>
        {catalogView && <Sidebar />}
        <section className="min-w-0" aria-live="polite">
          {activeView === 'topics' && <TopicList />}
          {activeView === 'professors' && <ProfessorList />}
          {activeView === 'applications' && <ApplicationsView />}
          {activeView === 'roadmap' && <RoadmapView />}
          {activeView === 'profile' && <ProfileView />}
        </section>
      </main>
      <Footer />
      <TopicModal />
      <ProfessorModal />
      <SchoolSelectModal />
      <AuthModal />
      <ToastRegion />
    </div>
  );
};
