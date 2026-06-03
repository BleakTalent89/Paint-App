import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, RotateCcw, ChevronRight, Upload, Scan, Palette, Image } from 'lucide-react'
import { toast } from 'sonner'
import ModelUploader from '../components/upload/ModelUploader'
import RegionDetector from '../components/painter/RegionDetector'
import ColorSchemePanel from '../components/painter/ColorSchemePanel'
import PaintPreviewGenerator from '../components/painter/PaintPreviewGenerator'

const STEPS = [
  { id: 1, label: 'Upload', icon: Upload },
  { id: 2, label: 'Detect', icon: Scan },
  { id: 3, label: 'Paint', icon: Palette },
  { id: 4, label: 'Preview', icon: Image },
]

function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const isActive = step.id === currentStep
        const isDone = step.id < currentStep
        return (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : isDone
                  ? 'text-emerald-400'
                  : 'text-slate-600'
            }`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{step.label}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">{step.id}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-slate-700 mx-0.5" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function PaintStudio() {
  const [imageUrl, setImageUrl] = useState(null)
  const [regions, setRegions] = useState([])
  const [modelDescription, setModelDescription] = useState('')
  const [colorScheme, setColorScheme] = useState({})
  const [previewUrl, setPreviewUrl] = useState(null)

  // Derived step
  const currentStep = !imageUrl ? 1 : regions.length === 0 ? 2 : !previewUrl ? 3 : 4

  const handleImageUploaded = useCallback((url) => {
    setImageUrl(url)
    setRegions([])
    setModelDescription('')
    setColorScheme({})
    setPreviewUrl(null)
  }, [])

  const handleRegionsDetected = useCallback((detectedRegions, desc) => {
    setRegions(detectedRegions)
    setModelDescription(desc)
    // Init colors
    const initial = {}
    detectedRegions.forEach(r => { initial[r.name] = '#7c3aed' })
    setColorScheme(initial)
    setPreviewUrl(null)
  }, [])

  const handleColorChange = useCallback((regionName, color) => {
    setColorScheme(prev => ({ ...prev, [regionName]: color }))
  }, [])

  const handleImageGenerated = useCallback((url) => {
    setPreviewUrl(url)
  }, [])

  const saveToGallery = () => {
    if (!imageUrl || !previewUrl) return
    const projects = JSON.parse(localStorage.getItem('obsidian-forge-projects') || '[]')
    const project = {
      id: Date.now().toString(),
      name: modelDescription
        ? modelDescription.slice(0, 40)
        : `Project ${projects.length + 1}`,
      originalImage: imageUrl,
      previewImage: previewUrl,
      colorScheme,
      regions,
      modelDescription,
      createdAt: new Date().toISOString(),
    }
    projects.unshift(project)
    localStorage.setItem('obsidian-forge-projects', JSON.stringify(projects))
    toast.success('Project saved to gallery!')
  }

  const reset = () => {
    setImageUrl(null)
    setRegions([])
    setModelDescription('')
    setColorScheme({})
    setPreviewUrl(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Paint Studio</h1>
          <p className="text-slate-500 text-sm mt-0.5">AI-powered Warhammer 40K miniature painter</p>
        </div>
        <div className="flex items-center gap-3">
          <StepIndicator currentStep={currentStep} />
          {(imageUrl || previewUrl) && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-white/5 hover:border-white/10 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Image display */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/5 overflow-hidden"
            style={{ background: '#12121a' }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">
                {previewUrl ? 'Generated Preview' : 'Miniature'}
              </h2>
              {previewUrl && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Show original
                  </button>
                  <button
                    onClick={saveToGallery}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-white transition-all"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                  >
                    <Save className="w-3 h-3" />
                    Save
                  </button>
                </div>
              )}
            </div>
            <div className="p-4">
              <AnimatePresence mode="wait">
                {previewUrl ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative"
                  >
                    <img
                      src={previewUrl}
                      alt="Generated preview"
                      className="w-full rounded-xl object-contain"
                      style={{ maxHeight: '480px' }}
                    />
                    {/* Overlay badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium text-white"
                      style={{ background: 'linear-gradient(135deg, #7c3aed88, #4f46e588)', backdropFilter: 'blur(4px)' }}>
                      AI Preview
                    </div>
                  </motion.div>
                ) : imageUrl ? (
                  <motion.div key="original" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ModelUploader onImageUploaded={handleImageUploaded} />
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ModelUploader onImageUploaded={handleImageUploaded} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Original vs Preview toggle when both exist */}
          {previewUrl && imageUrl && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/5 overflow-hidden"
              style={{ background: '#12121a' }}
            >
              <div className="px-4 py-3 border-b border-white/5">
                <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Original</h3>
              </div>
              <div className="p-4">
                <img
                  src={imageUrl}
                  alt="Original miniature"
                  className="w-full rounded-xl object-contain"
                  style={{ maxHeight: '240px' }}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Right: Controls */}
        <div className="space-y-4">
          {/* Step 2: Detect */}
          <div className="rounded-2xl border border-white/5 p-5"
            style={{ background: '#12121a' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                regions.length > 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
              }`}>
                {regions.length > 0 ? '✓' : '2'}
              </div>
              <h2 className="text-sm font-semibold text-slate-200">Detect Regions</h2>
            </div>
            <RegionDetector
              imageUrl={imageUrl}
              onRegionsDetected={handleRegionsDetected}
              disabled={!imageUrl}
            />
            {modelDescription && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 text-xs text-slate-500 italic border-l-2 border-purple-500/30 pl-3"
              >
                {modelDescription}
              </motion.p>
            )}
          </div>

          {/* Step 3: Color scheme */}
          <AnimatePresence>
            {regions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-white/5 p-5"
                style={{ background: '#12121a' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-purple-500/20 text-purple-400">
                    3
                  </div>
                  <h2 className="text-sm font-semibold text-slate-200">Choose Colors</h2>
                  <span className="text-xs text-slate-500 ml-auto">{regions.length} regions</span>
                </div>
                <ColorSchemePanel
                  regions={regions}
                  colorScheme={colorScheme}
                  onColorChange={handleColorChange}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step 4: Generate */}
          <AnimatePresence>
            {regions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-2xl border border-white/5 p-5"
                style={{ background: '#12121a' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    previewUrl ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {previewUrl ? '✓' : '4'}
                  </div>
                  <h2 className="text-sm font-semibold text-slate-200">Generate Preview</h2>
                </div>
                <PaintPreviewGenerator
                  imageUrl={imageUrl}
                  colorScheme={colorScheme}
                  modelDescription={modelDescription}
                  onImageGenerated={handleImageGenerated}
                  disabled={!imageUrl}
                />
                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-3 flex gap-2"
                  >
                    <button
                      onClick={saveToGallery}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
                    >
                      <Save className="w-4 h-4" />
                      Save to Gallery
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state hint */}
          {!imageUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-2xl border border-dashed border-white/5 p-8 text-center"
            >
              <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed22, #4f46e522)' }}>
                <Upload className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium">Start by uploading a miniature</p>
              <p className="text-slate-600 text-xs mt-1">
                Upload a photo of your unpainted Warhammer 40K miniature to get started
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
