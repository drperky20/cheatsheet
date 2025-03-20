
import { AuthForm } from "@/components/auth/AuthForm";

const Index = () => {
  return (
    <div className="fixed inset-0 min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-black">
      {/* Background gradients */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A1F2C] to-black" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#9b87f5]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#D6BCFA]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-br from-white via-white/90 to-[#D6BCFA] bg-clip-text text-transparent">
            CheatSheet
          </h1>
          <p className="text-lg md:text-xl text-[#E5DEFF] mb-8 font-light">
            Connect your Canvas account to get started
          </p>
        </div>

        {/* Auth form with enhanced glass effect */}
        <div className="max-w-md mx-auto animate-float">
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Index;
