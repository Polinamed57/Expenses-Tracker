import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { description, categories } = req.body as {
    description: string
    categories: { id: string; name: string }[]
  }

  if (!description?.trim() || !categories?.length) {
    return res.status(400).json({ error: 'Missing description or categories' })
  }

  const categoryList = categories.map((c) => `- ${c.id}: ${c.name}`).join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 64,
    messages: [
      {
        role: 'user',
        content: `Given this expense description: "${description}"

Pick the most fitting category from this list:
${categoryList}

Reply with only the category ID, nothing else.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text.trim() : ''
  const matched = categories.find((c) => c.id === text)

  if (!matched) {
    return res.status(200).json({ category_id: null })
  }

  return res.status(200).json({ category_id: matched.id })
}
