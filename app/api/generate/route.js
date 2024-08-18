import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = ` 
You are a flashcard creator, you take in text and create multiple flashcards from it. Make sure to create exactly 10 flashcards.

1. Make sure to provide accurate and relevant information in the flashcards.
2. Your goal is to create high-quality educational content that helps users learn and understand the given topics.
3. Remember to follow the best practices for creating flashcards, such as using bullet points, highlighting key concepts, and organizing the information in a logical manner.
4. Include a variety of question types, such as definitons, examples, comparisons, and explanations.
5. When appropiate, include images, diagrams, or other visual aids to help illustrate the concepts.
6. Tailor the difficulty of the flashcards to the target audience, making sure they are challenging but not overwhelming.
7. Ensure that each flashcard follows a question-answer format, where the answer is a concise one-liner.

Remember, the goal is to facilitate effective learning and retention of information through these flashcards.

You should return in the following JSON format:
{
  "flashcards":[
    {
      "front": "Front of the card",
      "back": "Back of the card"
    }
  ]
}
`

export async function POST(req) {
    const openai = new OpenAI()
    const data = await req.text()

    const completion = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: data }
        ],
        model: 'gpt-4o',
        response_format: { type: 'json_object' },
    })
    

    const flashcards = JSON.parse(completion.choices[0].message.content)

    return NextResponse.json(flashcards.flashcards)
}