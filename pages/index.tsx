import { useRouter } from 'next/router';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAvailableTopics } from '@/lib/questions-data';

export default function Home() {
  const router = useRouter();
  const topics = getAvailableTopics();

  return (
    <div className="app-shell">
      <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Sidebar with Logo */}
        <div className="glass-banner" style={{ 
          width: '320px', 
          minWidth: '320px',
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: '1.5rem',
          padding: '2rem 1.5rem',
          position: 'sticky',
          top: '2rem'
        }}>
          <Image 
            src="/logo.png" 
            alt="Interview Trainer Logo" 
            width={150} 
            height={150} 
            priority 
            style={{ borderRadius: '12px' }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 className="mono" style={{ margin: 0, fontSize: '1.75rem', marginBottom: '.5rem' }}>
              QuizView
            </h1>
            <p className="text-muted" style={{ margin: 0, fontSize: '.9rem' }}>
              your Prep for IT interviews, Don't just hoot, execute
            </p>
          </div>
          <div className="ui-badge mono" style={{ marginTop: '.5rem' }}>
            Tier Path: Junior → Architect
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="grid-topics">
            {topics.map((topic) => (
              <Card key={topic}>
                <CardHeader>
                  <CardTitle className="mono" style={{ fontSize: '1.05rem' }}>{topic}</CardTitle>
                  <CardDescription>Adaptive interview drills with active recall + spaced repetition.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => router.push(`/quiz/${encodeURIComponent(topic)}`)} className="ui-button-block" size="lg">
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {topics.length === 0 ? (
            <div className="glass-banner" style={{ marginTop: '1rem', textAlign: 'center' }}>
              <p className="text-muted">No topics available yet. Add question sets in prisma/data/sets.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
