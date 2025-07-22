'use server'

import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export type GenerateJobDescriptionResult = {
  success: boolean
  description?: string
  error?: string
}

export async function generateJobDescriptionAction({
  jobTitle,
  company,
  location,
  jobType,
}: {
  jobTitle: string
  company?: string
  location?: string
  jobType?: string
}): Promise<GenerateJobDescriptionResult> {
  if (!jobTitle) {
    return { success: false, error: 'Job title is required' }
  }

  const prompt = `Generate a comprehensive and professional job description for the following position:

Job Title: ${jobTitle}
Company: ${company || 'a leading company'}
Location: ${location || 'Various locations'}
Job Type: ${jobType || 'Full-Time'}

Please create a detailed job description that includes:
1. A compelling overview of the role
2. Key responsibilities (3-5 bullet points)
3. Required qualifications and skills
4. Preferred qualifications
5. What the company offers (benefits/culture)

Make it engaging, professional, and tailored to attract qualified candidates. The description should be 300-800 words and formatted with clear sections. Use a professional but welcoming tone.

Focus on making this specific to the ${jobTitle} role and highlight the most important aspects that would appeal to potential candidates.`

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content:
            'You are an expert HR professional and recruiter who writes compelling job descriptions that attract top talent. Your descriptions are detailed, professional, and highlight both the role requirements and company benefits.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      temperature: 0.7,
      max_tokens: 1000,
    })
    

    const generatedDescription = completion.choices[0]?.message?.content

    if (!generatedDescription) {
      return { success: false, error: 'Failed to generate description' }
    }

    return { success: true, description: generatedDescription }
  } catch (error) {
    console.error('Groq API error:', error)
    return { success: false, error: 'Failed to generate job description. Please try again.' }
  }
} 