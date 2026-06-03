import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, FolderOpen, Clock, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from 'react-router-dom'

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  } catch {
    return '—'
  }
}

export default function Gallery() {
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('obsidian-forge-projects') || '[]')
    setProjects(stored)
  }, [])

  const deleteProject = (id) => {
    const updated = projects.filter(p => p.id !== id)
    setProjects(updated)
    localStorage.setItem('obsidian-forge-projects', JSON.stringify(updated))
    toast.success('Project deleted')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Gallery</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {projects.length > 0
              ? `${projects.length} saved project${projects.length !== 1 ? 's' : ''}`
              : 'Your saved paint projects'}
          </p>
        </div>
      </div>

      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)' }}>
            <FolderOpen className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-slate-300 mb-2">No projects yet</h2>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            Paint a miniature in the studio and save it to see your projects here.
          </p>
          <Link
            to="/studio"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            <Palette className="w-4 h-4" />
            Go to Paint Studio
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence>
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="rounded-2xl border border-white/5 overflow-hidden group hover:border-purple-500/20 transition-all duration-300"
                style={{ background: '#12121a' }}
              >
                {/* Image comparison */}
                <div className="relative aspect-square overflow-hidden">
                  {/* Preview image */}
                  <img
                    src={project.previewImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Original overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <img
                      src={project.originalImage}
                      alt="Original"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs text-white font-medium"
                      style={{ background: 'rgba(0,0,0,0.7)' }}>
                      Original
                    </div>
                  </div>
                  {/* Painted badge */}
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium text-white group-hover:opacity-0 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #7c3aed88, #4f46e588)', backdropFilter: 'blur(4px)' }}>
                    AI Painted
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all bg-red-500/80 hover:bg-red-500 text-white"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="text-sm font-medium text-slate-200 truncate" title={project.name}>
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-600" />
                    <span className="text-xs text-slate-500">{formatDate(project.createdAt)}</span>
                  </div>
                  {/* Color swatches */}
                  {project.colorScheme && Object.keys(project.colorScheme).length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      {Object.values(project.colorScheme).slice(0, 6).map((color, ci) => (
                        <div
                          key={ci}
                          className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                      {Object.keys(project.colorScheme).length > 6 && (
                        <span className="text-xs text-slate-600">
                          +{Object.keys(project.colorScheme).length - 6}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
