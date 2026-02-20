import Image from "next/image";
import loginLogo from "@/VisualIdentity/loginLogo.png";
import { LoginForm } from "@/components/auth/LoginForm";
import { SignUpSection } from "@/components/auth/SignUpSection";

export function LoginPage() {
  return (
    <div className="login-background min-h-screen flex items-center justify-center px-4 py-8">
      <div className="login-split">
        {/* Left — branding hero */}
        <div className="login-left">
          <div className="login-left-inner">
            <Image
              src={loginLogo}
              alt="QuizView login logo"
              width={280}
              height={280}
              className="login-logo"
              priority
            />
            <h1 className="login-brand-title">QuizView</h1>
            <p className="login-brand-sub">
              <span className="login-brand-sub-highlight">IT</span> interviews
              Studying Tool
            </p>
          </div>
        </div>

        {/* Right — form */}
        <div className="login-right">
          <div className="login-right-inner">
            <h2 className="login-form-heading">Sign In</h2>
            <p className="login-form-sub">Access your training session.</p>
            <LoginForm />
            <SignUpSection />
          </div>
        </div>
      </div>
    </div>
  );
}
