"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignUpModal } from "@/components/auth/SignUpModal";

export function SignUpSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="signup-prompt">
        <span className="signup-prompt-text">New to QuizView?</span>
        <Button
          type="button"
          variant="outline"
          className="signup-button"
          onClick={() => setIsModalOpen(true)}
        >
          Sign Up
        </Button>
      </div>
      <SignUpModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
