import Image from 'next/image';
import loginLogo from '@/VisualIdentity/loginLogo.png';
import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="login-background min-h-screen flex items-center justify-center px-6 py-12">
      <div className="login-panel w-full max-w-md rounded-2xl px-6 py-8">
        <div className="flex flex-col items-center text-center gap-3">
          <Image
            src={loginLogo}
            alt="QuizView login logo"
            width={160}
            height={160}
            className="login-logo"
            priority
          />
          <h1 className="text-2xl font-semibold text-[#f0f6fc]">QuizView</h1>
          <p className="text-sm text-[#8b949e]">Access your cyberpractice console.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
