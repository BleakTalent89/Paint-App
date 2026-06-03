import { useCallback, useState } from 'react'
import { Upload, ImageIcon, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'

export default function ModelUploader({ onImageUploaded }) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState(null)

  const handleFile = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)
      onImageUploaded(dataUrl)
    }
    reader.readAsDataURL(file)
  }, [onImageUploaded])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }, [handleFile])

  const handleChange = (e) => handleFile(e.target.files[0])

  const clearImage = () => {
    setPreview(null)
    onImageUploaded(null)
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative rounded-xl overflow-hidden border border-white/10"
            style={{ background: '#12121a' }}
          >
            <img
              src={preview}
              alt="Uploaded miniature"
              className="w-full object-contain max-h-80"
            />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-red-500/80 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 px-3 py-2 text-xs text-slate-400"
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
              Click <span className="text-white font-medium">X</span> to upload a different image
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="uploader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="model-upload"
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-purple-400 bg-purple-500/10'
                : 'border-white/10 hover:border-purple-500/50 hover:bg-purple-500/5'
            }`}
            style={{ minHeight: '240px', background: isDragging ? undefined : '#12121a' }}
          >
            <div className={`p-4 rounded-full transition-colors ${isDragging ? 'bg-purple-500/20' : 'bg-white/5'}`}>
              {isDragging
                ? <ImageIcon className="w-8 h-8 text-purple-400" />
                : <Upload className="w-8 h-8 text-slate-400" />
              }
            </div>
            <div className="text-center">
              <p className="text-slate-200 font-medium">
                {isDragging ? 'Drop your miniature here' : 'Upload your miniature'}
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-slate-600 text-xs mt-2">PNG, JPG, WEBP up to 20MB</p>
            </div>
            <input
              id="model-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
            />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  )
}
