import { useRouter } from 'next/router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAvailableTopics } from '@/lib/questions-data';

function BrainCircuitLogo() {
  return (
    <svg width="38" height="38" viewBox="0 0 38 38" fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="35" height="35" rx="10" stroke="url(#logo)" />
      <path d="M13 13a4 4 0 1 1 4 4v8a4 4 0 1 1-4 4" stroke="#2DD4BF" strokeWidth="1.7" />
      <circle cx="25" cy="14" r="3" stroke="#388BFD" strokeWidth="1.7" />
      <circle cx="25" cy="24" r="3" stroke="#388BFD" strokeWidth="1.7" />
      <path d="M20 17h2a3 3 0 0 1 3 3v1" stroke="#388BFD" strokeWidth="1.7" />
      <defs>
        <linearGradient id="logo" x1="2" y1="2" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop stopColor="#388BFD" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const topics = getAvailableTopics();

  return (
    <div className="app-shell">
      <div className="container">
        <div className="glass-banner" style={{ marginBottom: '1.1rem' }}>
          <div className="header-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '.8rem' }}>
              <BrainCircuitLogo />
              <div>
                <h1 className="mono" style={{ margin: 0, fontSize: '1.75rem' }}>Interview Trainer</h1>
                <p className="text-muted" style={{ margin: '.2rem 0 0' }}>Cyber-productive prep for IT interviews</p>
              </div>
            </div>
            <div className="ui-badge mono">Tier Path: Junior → Architect</div>
          </div>
        </div>

        <div className="grid-topics">
          {topics.map((topic) => (
            <Card key={topic}>
              <CardHeader>
                <CardTitle className="mono" style={{ fontSize: '1.05rem' }}>{topic}</CardTitle>
                <CardDescription>Adaptive interview drills with active recall + spaced repetition.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => router.push(`/quiz/${encodeURIComponent(topic)}`)} className="ui-button-block" size="lg">
                  Start Session
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
  );
}
