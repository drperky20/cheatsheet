
import { AuthForm } from "@/components/auth/AuthForm";

const Index = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-gradient">
            CheatSheet
          </h1>
          <p className="text-lg md:text-xl text-gray-400 mb-8">
            Connect your Canvas account to get started
          </p>
        </div>

        {/* Auth form with glass effect */}
        <div className="glass p-8 md:p-12 max-w-lg mx-auto animate-float">
          <AuthForm />
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
    </div>
  );
};

export default Index;
