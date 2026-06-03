import { useState } from 'react'
import { Scan, Loader2, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function RegionDetector({ imageUrl, onRegionsDetected, disabled }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const detect = async () => {
    if (!imageUrl) return
    setLoading(true)
    setDone(false)
    try {
      const res = await fetch('/api/detect-regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Detection failed')
      }
      const data = await res.json()
      const regions = data.regions || []
      if (regions.length === 0) throw new Error('No regions detected')
      setDone(true)
      toast.success(`Detected ${regions.length} paintable regions!`)
      onRegionsDetected(regions, data.model_description || '')
    } catch (err) {
      toast.error(err.message || 'Failed to detect regions')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.button
      onClick={detect}
      disabled={disabled || loading}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={`w-full flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
        disabled || loading
          ? 'bg-white/5 text-slate-500 cursor-not-allowed'
          : done
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30'
            : 'text-white border border-purple-500/50 hover:border-purple-400'
      }`}
      style={!disabled && !loading && !done ? {
        background: 'linear-gradient(135deg, #7c3aed, #4f46e5)'
      } : undefined}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing miniature…
        </>
      ) : done ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Regions detected — re-detect
        </>
      ) : (
        <>
          <Scan className="w-4 h-4" />
          Detect Paintable Regions
        </>
      )}
    </motion.button>
  )
}
