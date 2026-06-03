import { Outlet, NavLink } from 'react-router-dom'
import { Skull, Image, Settings, Paintbrush } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Layout() {
  const navItems = [
    { to: '/studio', label: 'Paint Studio', icon: Paintbrush },
    { to: '/gallery', label: 'Gallery', icon: Image },
    { to: '/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0f' }}>
      {/* Navbar */}
      <header className="border-b border-white/5 sticky top-0 z-50 backdrop-blur-md"
        style={{ background: 'rgba(10,10,15,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NavLink to="/studio" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                <Skull className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                Obsidian<span className="text-purple-400"> Forge</span>
              </span>
            </NavLink>

            {/* Nav links */}
            <nav className="flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}
