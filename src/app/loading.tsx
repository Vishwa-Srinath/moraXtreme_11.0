import Image from "next/image"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex min-h-screen flex-col items-center justify-center bg-[#000000] overflow-hidden">
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#163E70_1px,transparent_1px),linear-gradient(to_bottom,#163E70_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 animate-[panGrid_20s_linear_infinite]"></div>

      {/* Deep Blue ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#163E70_0,_transparent_50%)] opacity-40 mix-blend-screen"></div>
      
      {/* Sweeping scanline effect */}
      <div className="absolute inset-0 h-[2px] w-full bg-[#0074FF] shadow-[0_0_15px_#0074FF] opacity-30 animate-[scanline_4s_linear_infinite]"></div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-16 w-full max-w-2xl px-6">
        
        {/* Logo Container with 3D Float & Reveal */}
        <div className="relative flex items-center justify-center animate-[revealLogo_1.2s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="relative flex items-center justify-center animate-[float_4s_ease-in-out_infinite]">
            {/* Deep blue pulsing backdrop */}
            <div className="absolute h-[120%] w-[120%] animate-[pulseGlow_3s_ease-in-out_infinite] rounded-[100%] bg-[#163E70] blur-3xl opacity-60"></div>
            
            <Image 
              src="/logo.png" 
              alt="MoraXtreme 11" 
              width={480} 
              height={240} 
              className="relative object-contain drop-shadow-[0_0_20px_rgba(0,116,255,0.6)]"
              priority
            />
          </div>
        </div>

        {/* Futuristic Loading Interface */}
        <div className="flex w-full flex-col gap-4 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
          {/* Top meta info */}
          <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-[#163E70]">
            <span>System.Boot</span>
            <span className="text-[#0074FF] animate-pulse">Online</span>
          </div>

          {/* Progress Bar Container */}
          <div className="relative h-[2px] w-full bg-[#163E70]/40 overflow-hidden">
            {/* Animated Fill */}
            <div className="absolute top-0 left-0 h-full bg-[#0074FF] shadow-[0_0_15px_#0074FF] w-[10%] animate-[fillBar_2s_ease-in-out_forwards]"></div>
          </div>
          
          {/* Bottom meta info */}
          <div className="flex justify-between items-center text-[11px] font-mono tracking-[0.2em] uppercase">
            <span className="text-[#0074FF] flex items-center gap-3">
              {/* Mini radar spinner */}
              <div className="relative flex h-3 w-3 items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#163E70]"></div>
                <div className="absolute inset-0 rounded-full border border-[#0074FF] border-t-transparent animate-spin"></div>
              </div>
              Initializing Workspace...
            </span>
            <span className="text-[#163E70] font-bold">
              v11.0
            </span>
          </div>
        </div>
      </div>
      
      {/* Inject custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes panGrid {
          0% { background-position: 0% 0%; }
          100% { background-position: 4rem 4rem; }
        }
        @keyframes scanline {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes revealLogo {
          0% { transform: scale(0.7) translateY(30px); opacity: 0; filter: blur(12px); }
          100% { transform: scale(1) translateY(0px); opacity: 1; filter: blur(0px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.3; transform: scale(0.95); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes fillBar {
          0% { width: 0%; }
          20% { width: 15%; }
          50% { width: 65%; }
          80% { width: 85%; }
          100% { width: 100%; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
