'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { generateStory } from '@/lib/gemini/client';

interface Story {
  id: string;
  prompt: string;
  content: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate story using Gemini
      const generatedContent = await generateStory(prompt);

      // Create a new story object
      const newStory = {
        id: Date.now().toString(),
        prompt,
        content: generatedContent,
        createdAt: new Date().toISOString(),
      };

      // Save to Supabase
      const { error: dbError } = await supabase
        .from('stories')
        .insert([
          {
            user_id: user.id,
            prompt,
            content: generatedContent,
          },
        ]);

      if (dbError) throw dbError;

      // Update local state
      setStories([newStory, ...stories]);
      setPrompt('');
    } catch (error: any) {
      console.error('Error generating story:', error);
      setError(error.message || 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-900">Generate a Story</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-900">
                Enter your prompt
              </label>
              <textarea
                id="prompt"
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                placeholder="Once upon a time..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate Story'}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Stories</h2>
          {stories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow p-6">
              <div className="text-sm text-gray-600 mb-2">
                {new Date(story.createdAt).toLocaleDateString()}
              </div>
              <div className="text-sm font-medium text-gray-900 mb-2">
                Prompt: {story.prompt}
              </div>
              <div className="prose max-w-none text-gray-800">
                {story.content}
              </div>
            </div>
          ))}
          {stories.length === 0 && (
            <div className="text-center text-gray-600 py-8 bg-white rounded-lg shadow">
              No stories generated yet. Start by entering a prompt above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 