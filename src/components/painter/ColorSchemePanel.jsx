import { useState } from 'react'
import { Palette, ChevronDown, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const PRESETS = [
  {
    name: 'Ultramarines',
    colors: {
      'Power Armor': '#1a3a7a',
      'Shoulder Pauldrons': '#1a3a7a',
      'Helmet': '#1a3a7a',
      'Bolter': '#2a2a2a',
      'Trim': '#c9a84c',
      'Eyes': '#ff3300',
      'Base Rim': '#3a2a1a',
    }
  },
  {
    name: 'Blood Angels',
    colors: {
      'Power Armor': '#8b0000',
      'Shoulder Pauldrons': '#8b0000',
      'Helmet': '#8b0000',
      'Bolter': '#2a2a2a',
      'Trim': '#c9a84c',
      'Eyes': '#ffcc00',
      'Base Rim': '#3a2a1a',
    }
  },
  {
    name: 'Dark Angels',
    colors: {
      'Power Armor': '#1a3a1a',
      'Shoulder Pauldrons': '#1a3a1a',
      'Helmet': '#1a3a1a',
      'Bolter': '#2a2a2a',
      'Trim': '#c9a84c',
      'Eyes': '#ff6600',
      'Base Rim': '#3a2a1a',
    }
  },
  {
    name: 'Death Guard',
    colors: {
      'Power Armor': '#7a8a5a',
      'Shoulder Pauldrons': '#7a8a5a',
      'Helmet': '#7a8a5a',
      'Bolter': '#5a4a3a',
      'Trim': '#8a7a5a',
      'Eyes': '#33cc33',
      'Base Rim': '#3a2a1a',
    }
  },
  {
    name: 'Thousand Sons',
    colors: {
      'Power Armor': '#1a4a6a',
      'Shoulder Pauldrons': '#1a4a6a',
      'Helmet': '#1a4a6a',
      'Bolter': '#c9a84c',
      'Trim': '#c9a84c',
      'Eyes': '#ff3300',
      'Base Rim': '#3a2a1a',
    }
  },
]

// Simple color name lookup
function getColorName(hex) {
  const map = {
    '#ff0000': 'Red', '#00ff00': 'Lime', '#0000ff': 'Blue',
    '#ffff00': 'Yellow', '#ff00ff': 'Magenta', '#00ffff': 'Cyan',
    '#ffffff': 'White', '#000000': 'Black', '#808080': 'Gray',
    '#8b0000': 'Dark Red', '#1a3a7a': 'Ultramarine Blue', '#1a3a1a': 'Dark Green',
    '#7a8a5a': 'Plague Green', '#c9a84c': 'Gold', '#2a2a2a': 'Dark Iron',
    '#1a4a6a': 'Teal Blue', '#ff6600': 'Orange', '#33cc33': 'Nurgle Green',
    '#3a2a1a': 'Earth Brown', '#5a4a3a': 'Leather Brown',
  }
  const lower = hex.toLowerCase()
  return map[lower] || hex.toUpperCase()
}

export default function ColorSchemePanel({ regions, colorScheme, onColorChange }) {
  const [showPresets, setShowPresets] = useState(false)

  const applyPreset = (preset) => {
    regions.forEach(region => {
      const key = Object.keys(preset.colors).find(k =>
        region.name.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(region.name.toLowerCase())
      )
      if (key) {
        onColorChange(region.name, preset.colors[key])
      }
    })
    setShowPresets(false)
  }

  if (!regions || regions.length === 0) return null

  return (
    <div className="space-y-4">
      {/* Preset selector */}
      <div>
        <button
          onClick={() => setShowPresets(v => !v)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-purple-300 transition-colors"
        >
          <Palette className="w-4 h-4" />
          <span>Chapter Presets</span>
          {showPresets ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => applyPreset(preset)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 text-slate-300 hover:text-purple-300 transition-all"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Region color pickers */}
      <div className="space-y-2">
        {regions.map((region, i) => {
          const color = colorScheme[region.name] || '#7c3aed'
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors"
              style={{ background: '#12121a' }}
            >
              {/* Color swatch + picker */}
              <div className="relative flex-shrink-0">
                <div
                  className="w-8 h-8 rounded-lg border-2 border-white/20 cursor-pointer overflow-hidden"
                  style={{ background: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={e => onColorChange(region.name, e.target.value)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                    title={`Pick color for ${region.name}`}
                  />
                </div>
              </div>

              {/* Region info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{region.name}</p>
                {region.description && (
                  <p className="text-xs text-slate-500 truncate">{region.description}</p>
                )}
              </div>

              {/* Hex value */}
              <div className="flex-shrink-0 text-right">
                <p className="text-xs font-mono text-slate-400">{color.toUpperCase()}</p>
                <p className="text-xs text-slate-600">{getColorName(color)}</p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
