import { useState } from 'react'
import { Wand2, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

const LOADING_MESSAGES = [
  'Mixing paints…',
  'Applying base coat…',
  'Adding shading…',
  'Highlighting edges…',
  'Finishing details…',
  'Almost done…',
]

export default function PaintPreviewGenerator({
  imageUrl,
  colorScheme,
  modelDescription,
  onImageGenerated,
  disabled,
}) {
  const [loading, setLoading] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const hasColors = colorScheme && Object.keys(colorScheme).length > 0

  const generate = async () => {
    if (!hasColors || disabled) return
    setLoading(true)
    setMsgIndex(0)

    // Cycle through loading messages
    const interval = setInterval(() => {
      setMsgIndex(i => (i + 1) % LOADING_MESSAGES.length)
    }, 2500)

    try {
      const res = await fetch('/api/generate-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl, colorScheme, modelDescription }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Generation failed')
      }
      const data = await res.json()
      if (!data.url) throw new Error('No image returned')
      toast.success('Preview generated!')
      onImageGenerated(data.url)
    } catch (err) {
      toast.error(err.message || 'Failed to generate preview')
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }

  const isDisabled = disabled || loading || !hasColors

  return (
    <div className="space-y-2">
      <motion.button
        onClick={generate}
        disabled={isDisabled}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        className={`w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
          isDisabled
            ? 'bg-white/5 text-slate-500 cursor-not-allowed'
            : 'text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30'
        }`}
        style={!isDisabled ? {
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #6d28d9 100%)',
        } : undefined}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{LOADING_MESSAGES[msgIndex]}</span>
          </>
        ) : (
          <>
            <Wand2 className="w-4 h-4 flex-shrink-0" />
            <span>Generate Painted Preview</span>
            <Sparkles className="w-3.5 h-3.5 opacity-70 flex-shrink-0" />
          </>
        )}
      </motion.button>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full rounded-full overflow-hidden h-1"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7c3aed, #4f46e5)' }}
            animate={{ width: ['0%', '90%'] }}
            transition={{ duration: 14, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {!hasColors && !loading && (
        <p className="text-xs text-slate-500 text-center">
          Select colors for at least one region to generate a preview
        </p>
      )}
    </div>
  )
}
