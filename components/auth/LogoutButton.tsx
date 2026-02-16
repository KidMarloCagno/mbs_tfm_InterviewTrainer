"use client";

import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const handleLogout = () => {
    const confirmed = window.confirm('Log out from QuizView?');
    if (!confirmed) return;
    signOut({ callbackUrl: '/' });
  };

  return (
    <div className="logout-button">
      <Button type="button" variant="outline" onClick={handleLogout}>
        Log out
      </Button>
    </div>
  );
}
