import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './pages/Layout'
import PaintStudio from './pages/PaintStudio'
import Gallery from './pages/Gallery'
import Settings from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/studio" replace />} />
        <Route path="studio" element={<PaintStudio />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}
