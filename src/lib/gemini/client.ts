import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const generateStory = async (prompt: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const result = await model.generateContent(
      `Write a short, creative story based on this prompt: ${prompt}. 
      The story should be engaging and well-structured, with a clear beginning, middle, and end.
      Keep it under 500 words.`
    );
    
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating story:', error);
    throw new Error('Failed to generate story');
  }
}; 