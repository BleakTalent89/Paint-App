import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Key, Trash2, Info, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('obsidian-forge-api-url') || 'http://localhost:3001'
  )

  const saveSettings = () => {
    localStorage.setItem('obsidian-forge-api-url', apiUrl)
    toast.success('Settings saved')
  }

  const clearGallery = () => {
    localStorage.removeItem('obsidian-forge-projects')
    toast.success('Gallery cleared')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Configure Obsidian Forge</p>
      </div>

      <div className="space-y-4">
        {/* API Config */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: '#12121a' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Key className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-slate-200">API Configuration</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={e => setApiUrl(e.target.value)}
                placeholder="http://localhost:3001"
                className="w-full px-3 py-2 rounded-lg text-sm text-slate-200 border border-white/10 focus:border-purple-500/50 focus:outline-none transition-colors"
                style={{ background: '#0a0a0f' }}
              />
              <p className="text-xs text-slate-600 mt-1">
                The URL where the Express backend is running
              </p>
            </div>

            <div className="p-3 rounded-lg border border-amber-500/20"
              style={{ background: 'rgba(245,158,11,0.05)' }}>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-300 font-medium">OpenAI API Key</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Set your OpenAI API key in a <code className="text-slate-400">.env</code> file
                    in the project root as <code className="text-slate-400">OPENAI_API_KEY</code>.
                    This key is never exposed to the frontend.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={saveSettings}
              className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
            >
              Save Settings
            </button>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: '#12121a' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Trash2 className="w-4 h-4 text-red-400" />
            <h2 className="text-sm font-semibold text-slate-200">Data Management</h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm text-slate-300">Clear Gallery</p>
                <p className="text-xs text-slate-500">Delete all saved projects from localStorage</p>
              </div>
              <button
                onClick={clearGallery}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/5 p-6"
          style={{ background: '#12121a' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <SettingsIcon className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-200">About</h2>
          </div>
          <div className="space-y-2 text-xs text-slate-500">
            <p><span className="text-slate-300 font-medium">Obsidian Forge</span> v0.1.0</p>
            <p>AI-powered Warhammer 40K miniature painting preview tool.</p>
            <p>Built with React, Vite, Tailwind CSS, and OpenAI GPT-4o + gpt-image-1.</p>
            <a
              href="https://platform.openai.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors mt-1"
            >
              OpenAI API Docs
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
