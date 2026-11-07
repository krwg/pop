import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/shell/AppShell'
import { AboutPage } from '@/pages/AboutPage'
import { GamePage } from '@/pages/GamePage'
import { HomePage } from '@/pages/HomePage'
import { LibraryPage } from '@/pages/LibraryPage'
import { PlayPage } from '@/pages/PlayPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { StorePage } from '@/pages/StorePage'
import { StoreTitlePage } from '@/pages/StoreTitlePage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="play/:slug" element={<PlayPage />} />
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="library" element={<LibraryPage />} />
        <Route path="store" element={<StorePage />} />
        <Route path="store/:slug" element={<StoreTitlePage />} />
        <Route path="settings/*" element={<SettingsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="game/:slug" element={<GamePage />} />
        <Route path="collections" element={<Navigate to="/library" replace />} />
        <Route path="discover" element={<Navigate to="/store" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
