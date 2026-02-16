import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { getAvailableTopics } from '@/lib/questions-data';
import { ThemeSelect } from '@/components/theme/ThemeSelect';
import { LogoutButton } from '@/components/auth/LogoutButton';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  const topics = getAvailableTopics();

  return (
    <div className="app-shell">
      <ThemeSelect />
      <LogoutButton />
      <div className="container" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div
          className="glass-banner"
          style={{
            width: '320px',
            minWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '2rem 1.5rem',
            position: 'sticky',
            top: '2rem',
          }}
        >
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
              Your prep for IT interviews. Do not just hoot, execute.
            </p>
          </div>
          <div className="ui-badge mono" style={{ marginTop: '.5rem' }}>
            Tier Path: Junior {'->'} Architect
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="grid-topics">
            {topics.map((topic) => (
              <div className="ui-card" key={topic}>
                <div className="ui-card-header">
                  <h3 className="ui-card-title mono" style={{ fontSize: '1.05rem' }}>
                    {topic}
                  </h3>
                  <p className="ui-card-description">
                    Adaptive interview drills with active recall and spaced repetition.
                  </p>
                </div>
                <div className="ui-card-content">
                  <Link
                    href={`/quiz/${encodeURIComponent(topic)}`}
                    className="ui-button ui-button-default ui-button-lg ui-button-block"
                  >
                    Start Practice
                  </Link>
                </div>
              </div>
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
