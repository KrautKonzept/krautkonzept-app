import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import Impressum from './pages/Impressum';
import KrautDesk from './pages/KrautDesk';
import AGB from './pages/AGB';
import Datenschutz from './pages/Datenschutz';
import Login from './pages/Login';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;
const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;

const PROTECTED_PAGES = ['EmployeeDashboard', 'CustomerDashboard', 'Admin'];

const ProtectedPage = ({ Page, pageName }) => {
  const { isAuthenticated, isLoadingAuth } = useAuth();
  if (isLoadingAuth) return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-green-700 rounded-full animate-spin"></div>
    </div>
  );
  if (!isAuthenticated) { window.location.href = '/login'; return null; }
  return <LayoutWrapper currentPageName={pageName}><Page /></LayoutWrapper>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LayoutWrapper currentPageName={mainPageKey}><MainPage /></LayoutWrapper>} />
    {Object.entries(Pages).map(([path, Page]) => (
      <Route key={path} path={`/${path}`} element={
        PROTECTED_PAGES.includes(path)
          ? <ProtectedPage Page={Page} pageName={path} />
          : <LayoutWrapper currentPageName={path}><Page /></LayoutWrapper>
      } />
    ))}
    <Route path="/login" element={<Login />} />
    <Route path="/Impressum" element={<LayoutWrapper currentPageName="Impressum"><Impressum /></LayoutWrapper>} />
    <Route path="/AGB" element={<LayoutWrapper currentPageName="AGB"><AGB /></LayoutWrapper>} />
    <Route path="/Datenschutz" element={<LayoutWrapper currentPageName="Datenschutz"><Datenschutz /></LayoutWrapper>} />
    <Route path="/KrautDesk" element={<KrautDesk />} />
    <Route path="*" element={<PageNotFound />} />
  </Routes>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router><AppRoutes /></Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}
export default App;
