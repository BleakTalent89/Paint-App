import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import OpenAI from 'openai'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '20mb' }))

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// POST /api/detect-regions
// Takes { imageUrl } (base64 data URL), calls GPT-4o vision
// Returns { regions: [{name, description}], model_description }
app.post('/api/detect-regions', async (req, res) => {
  try {
    const { imageUrl } = req.body
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' })

    // Strip data URL prefix to get pure base64 if needed
    const base64Image = imageUrl.startsWith('data:')
      ? imageUrl
      : `data:image/png;base64,${imageUrl}`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are an expert Warhammer 40K miniature painter. Analyze the provided image of an unpainted miniature and identify all paintable regions. Return a JSON object with:
- "regions": an array of 5-10 objects, each with "name" (short label like "Power Armor", "Shoulder Pauldrons", "Bolter", "Base Rim") and "description" (brief description of that part)
- "model_description": a brief 1-2 sentence description of what the miniature appears to be (faction, type, etc.)
Only return valid JSON.`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: base64Image, detail: 'high' }
            },
            {
              type: 'text',
              text: 'Identify all paintable regions on this Warhammer 40K miniature. Return JSON with regions array and model_description.'
            }
          ]
        }
      ],
      max_tokens: 1024,
    })

    const content = response.choices[0].message.content
    const parsed = JSON.parse(content)
    res.json(parsed)
  } catch (err) {
    console.error('detect-regions error:', err)
    res.status(500).json({ error: err.message || 'Detection failed' })
  }
})

// POST /api/generate-preview
// Takes { imageUrl, colorScheme, modelDescription }
// Returns { url } (base64 or hosted URL)
app.post('/api/generate-preview', async (req, res) => {
  try {
    const { imageUrl, colorScheme, modelDescription } = req.body
    if (!colorScheme) return res.status(400).json({ error: 'colorScheme is required' })

    // Build color scheme description
    const colorLines = Array.isArray(colorScheme)
      ? colorScheme.map(c => `- ${c.region}: ${c.color_name || c.color}`).join('\n')
      : Object.entries(colorScheme).map(([region, color]) => `- ${region}: ${color}`).join('\n')

    const colorSchemeList = Array.isArray(colorScheme)
      ? colorScheme.map(c => `- ${c.region}: ${c.color_name || c.color}`).join('\n')
      : colorLines

    const prompt = `This is an image of an unpainted plastic miniature model. Keep the exact same miniature, same pose, same angle, same background, same lighting, same composition. Do NOT change the shape, form, or structure of the miniature in any way. Only add paint colors to the model.

Apply this exact paint scheme:
${colorSchemeList}

Paint it as a professional Warhammer 40K painter would: thin coats, smooth blending, edge highlights on raised surfaces, subtle shading in recesses. The result should look like the exact same physical miniature photographed after being painted. Photorealistic tabletop miniature painting.`

    let resultUrl = null

    // Try images.edit first if we have an image (img2img)
    if (imageUrl) {
      try {
        const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, '')
        const imgBuffer = Buffer.from(base64Data, 'base64')

        // Write temp file for the API
        const tmpPath = join(__dirname, '_tmp_input.png')
        fs.writeFileSync(tmpPath, imgBuffer)

        const editResponse = await openai.images.edit({
          model: 'gpt-image-1',
          image: fs.createReadStream(tmpPath),
          prompt,
          n: 1,
          size: '1024x1024',
        })

        fs.unlinkSync(tmpPath)

        const imageData = editResponse.data[0]
        if (imageData.b64_json) {
          resultUrl = `data:image/png;base64,${imageData.b64_json}`
        } else if (imageData.url) {
          resultUrl = imageData.url
        }
      } catch (editErr) {
        console.warn('images.edit failed, falling back to generate:', editErr.message)
      }
    }

    // Fallback: pure generation
    if (!resultUrl) {
      const genResponse = await openai.images.generate({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      })

      const imageData = genResponse.data[0]
      if (imageData.b64_json) {
        resultUrl = `data:image/png;base64,${imageData.b64_json}`
      } else if (imageData.url) {
        resultUrl = imageData.url
      }
    }

    if (!resultUrl) throw new Error('No image returned from OpenAI')
    res.json({ url: resultUrl })
  } catch (err) {
    console.error('generate-preview error:', err)
    res.status(500).json({ error: err.message || 'Generation failed' })
  }
})

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')))
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`Obsidian Forge API server running on http://localhost:${PORT}`)
})
