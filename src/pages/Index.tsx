
import { useState } from "react";
import { AuthForm } from "@/components/auth/AuthForm";
import { SignUpForm } from "@/components/auth/SignUpForm";

const Index = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0">
      <div className="w-full max-w-md">
        {isSignUp ? <SignUpForm /> : <AuthForm />}
      </div>
    </div>
  );
};

export default Index;
