import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAvailableTopics } from '@/lib/questions-data';

export default function Home() {
  const router = useRouter();
  const topics = getAvailableTopics();

  const handleTopicSelect = (topic: string) => {
    router.push(`/quiz/${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">
            🚀 Interview Trainer
          </h1>
          <p className="text-lg text-slate-300">
            Master technical interviews with spaced repetition learning
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <Card key={topic} className="cursor-pointer transition-all hover:shadow-lg hover:scale-105">
              <CardHeader>
                <CardTitle className="text-xl">{topic}</CardTitle>
                <CardDescription>Practice common interview questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleTopicSelect(topic)}
                  className="w-full"
                  size="lg"
                >
                  Start Learning
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {topics.length === 0 && (
          <div className="rounded-lg border border-dashed border-slate-600 bg-slate-800/50 p-12 text-center">
            <p className="text-slate-400">No topics available yet. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}
