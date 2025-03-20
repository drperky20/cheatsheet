
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
          <p className="text-lg md:text-xl text-[#E5DEFF] mb-6 font-light">
            Connect your Canvas account to get started
          </p>
          <div className="text-sm text-white/60 max-w-xl mx-auto">
            <p className="mb-2">You'll need to create a Canvas API token from your Canvas account settings:</p>
            <ol className="list-decimal list-inside text-left space-y-1 mb-4">
              <li>Log in to your Canvas LMS account</li>
              <li>Go to Account &gt; Settings</li>
              <li>Scroll down to "Approved Integrations"</li>
              <li>Click "New Access Token"</li>
              <li>Enter "CheatSheet" as the purpose and set an appropriate expiry date</li>
              <li>Copy the token that appears</li>
            </ol>
          </div>
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
