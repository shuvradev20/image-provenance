'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Link from 'next/link';


const MetaMaskLogo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Metamask-Icon--Streamline-Svg-Logos" height="24" width="24">
    <desc>Metamask Icon Streamline Icon: https://streamlinehq.com</desc>
    <path fill="#e17726" d="M23.205225 0.9874275 13.121575 8.448625l1.87515 -4.397125 8.2085 -3.0640725Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="M0.818115 0.996155 9.00465 4.052l1.780525 4.454775L0.818115 0.996155Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m19.147225 16.855225 4.4568 0.084825 -1.5576 5.291375 -5.438275 -1.49735 2.539075 -3.87885Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m4.852525 16.855225 2.529675 3.878875 -5.429175 1.497425 -1.5481175 -5.291475 4.4476175 -0.084825Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m10.543275 7.372 0.1822 5.882675 -5.450075 -0.247975 1.550225 -2.33875 0.019625 -0.02255L10.543275 7.372Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m13.4003 7.30645 3.75445 3.33925 0.019425 0.022375 1.550275 2.33875 -5.448825 0.247925 0.124675 -5.9483Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m7.541775 16.87225 2.9759 2.318675 -3.456875 1.669025 0.480975 -3.9877Z" strokeWidth="0.25"></path>
    <path fill="#e27625" d="m16.458725 16.871875 0.471 3.988075 -3.447175 -1.669175 2.976175 -2.3189Z" strokeWidth="0.25"></path>
    <path fill="#d5bfb2" d="m13.558475 18.9724 3.4981 1.69385 -3.253925 1.546475 0.033775 -1.022125 -0.27795 -2.2182Z" strokeWidth="0.25"></path>
    <path fill="#d5bfb2" d="m10.44055 18.97315 -0.26705 2.2007 0.0219 1.037625 -3.26155 -1.54525 3.5067 -1.693075Z" strokeWidth="0.25"></path>
    <path fill="#233447" d="m9.430425 14.02245 0.914125 1.921125 -3.11225 -0.911675 2.198125 -1.00945Z" strokeWidth="0.25"></path>
    <path fill="#233447" d="m14.56965 14.02265 2.20845 1.009175 -3.12235 0.91145 0.9139 -1.920625Z" strokeWidth="0.25"></path>
    <path fill="#cc6228" d="m7.779875 16.852725 -0.5031 4.1345 -2.696325 -4.044125 3.199425 -0.090375Z" strokeWidth="0.25"></path>
    <path fill="#cc6228" d="m16.22045 16.852775 3.199525 0.0904L16.7135 20.9874l-0.49305 -4.134625Z" strokeWidth="0.25"></path>
    <path fill="#cc6228" d="m18.803175 12.773 -2.328475 2.37305 -1.795225 -0.820375 -0.85955 1.8069 -0.56345 -3.1072 5.5467 -0.252375Z" strokeWidth="0.25"></path>
    <path fill="#cc6228" d="m5.19555 12.77295 5.547675 0.2524 -0.563475 3.107225 -0.8597 -1.8067 -1.785775 0.8202 -2.338725 -2.373125Z" strokeWidth="0.25"></path>
    <path fill="#e27525" d="m5.038825 12.286075 2.6344 2.6732 0.0913 2.63905 -2.7257 -5.31225Z" strokeWidth="0.25"></path>
    <path fill="#e27525" d="M18.963975 12.28125 16.2334 17.603l0.1028 -2.643775L18.963975 12.28125Z" strokeWidth="0.25"></path>
    <path fill="#e27525" d="m10.6146 12.448725 0.106025 0.667375 0.262 1.6625 -0.168425 5.10625 -0.79635 -4.1019 -0.000275 -0.0424 0.597025 -3.291825Z" strokeWidth="0.25"></path>
    <path fill="#e27525" d="m13.384 12.439575 0.5986 3.301025 -0.00025 0.0424 -0.79835 4.11215 -0.0316 -1.028525 -0.124575 -4.1182 0.356175 -2.30885Z" strokeWidth="0.25"></path>
    <path fill="#f5841f" d="m16.5705 14.8529 -0.08915 2.2929 -2.77905 2.16525 -0.5618 -0.39695 0.62975 -3.243675 2.80025 -0.817525Z" strokeWidth="0.25"></path>
    <path fill="#f5841f" d="m7.439075 14.852975 2.790625 0.817525 0.629725 3.243625 -0.561825 0.396925 -2.7792 -2.165425 -0.079325 -2.29265Z" strokeWidth="0.25"></path>
    <path fill="#c0ac9d" d="m6.4021 20.15985 3.555475 1.68465 -0.01505 -0.719375L10.24 20.864h3.51895l0.30825 0.26025 -0.0227 0.718875 3.532925 -1.679025 -1.719125 1.420625L13.7795 23.0125H10.211525l-2.07745 -1.433625 -1.731975 -1.419025Z" strokeWidth="0.25"></path>
    <path fill="#161616" d="m13.303775 18.748225 0.5027 0.3551 0.2946 2.35045 -0.426325 -0.36H10.326425l-0.418225 0.36725 0.284925 -2.357525 0.502875 -0.355275h2.607775Z" strokeWidth="0.25"></path>
    <path fill="#763e1a" d="m22.539625 1.19397 1.2104 3.631255 -0.7559 3.67155 0.538275 0.41525 -0.728375 0.555725 0.547375 0.42275 -0.72485 0.660175 0.445025 0.322275 -1.181025 1.379325 -4.844125 -1.4104 -0.041975 -0.0225 -3.490775 -2.9447L22.539625 1.19397Z" strokeWidth="0.25"></path>
    <path fill="#763e1a" d="M1.460435 1.19397 10.4864 7.874675l-3.49075 2.9447 -0.042 0.0225 -4.844145 1.4104 -1.181015 -1.379325 0.44467 -0.322025 -0.72453 -0.6604 0.5463775 -0.422325 -0.73926 -0.5573 0.55858 -0.4155L0.25 4.82535 1.460435 1.19397Z" strokeWidth="0.25"></path>
    <path fill="#f5841f" d="m16.809475 10.533375 5.132675 1.49435 1.667525 5.1393 -4.39925 0 -3.031225 0.03825 2.204425 -4.296825 -1.57415 -2.375075Z" strokeWidth="0.25"></path>
    <path fill="#f5841f" d="m7.19055 10.533375 -1.574425 2.375075 2.204725 4.296825 -3.029725 -0.03825H0.3996575l1.65816 -5.13925 5.1327325 -1.4944Z" strokeWidth="0.25"></path>
    <path fill="#f5841f" d="m15.248075 4.026975 -1.43565 3.8774 -0.30465 5.238 -0.116575 1.64175 -0.00925 4.193975H10.617825l-0.008975 -4.1861 -0.11695 -1.651075 -0.3048 -5.23655 -1.4354 -3.8774h6.496375Z" strokeWidth="0.25"></path>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle);
  const loginWithWallet = useAuthStore((state) => state.loginWithWallet);
  const isConnectingWallet = useAuthStore((state) => state.isConnectingWallet);
  const router = useRouter();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading(true);
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await res.json();

        await loginWithGoogle({
          email: userInfo.email,
          fullName: userInfo.name,
          googleId: userInfo.sub,
        });

        router.push('/dashboard');
      } catch (error) {
        console.error("Authentication failed:", error);
        alert("Authentication failed. Please try again.");
        setIsLoading(false);
      }
    },
    onError: () => {
      console.log('Google Auth Failed');
      setIsLoading(false);
    }
  });

  const handleMetaMaskLogin = async () => {
    try {
      await loginWithWallet();

      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const walletError = useAuthStore.getState().walletError;
 
      if(isAuthenticated) {
        router.push('/dashboard');
      }  else if (walletError) {
        alert(walletError);
      }
    } catch (error) {
      console.error("MetaMask execution failed", error);
    }
  }

  const isAnyLoading = isLoading || isConnectingWallet;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start sm:items-center justify-center px-4 pt-24 sm:pt-0">
      <div 
        className="absolute inset-0 bg-white/80 dark:bg-black/90 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-100 rounded-2xl p-12 
          bg-white border border-slate-200 shadow-2xl
          dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]
        "
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 z-20 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-white dark:hover:bg-zinc-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-10 text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Welcome Back
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              Choose your preferred way to sign in.
            </p>
          </div>

          <div className="flex flex-col gap-6 w-full min-h-42.5">
            <div className="grid gap-6">
              <button 
                onClick={() => handleGoogleLogin()}
                disabled={isAnyLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-xl py-4 px-4 text-sm font-semibold transition-all duration-200
                  bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-md
                  dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800
                  disabled:opacity-50 disabled:cursor-wait"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg" className="shrink-0 mr-1">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {isLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="relative flex items-center py-1">
                <div className="grow border-t border-slate-100 dark:border-zinc-800"></div>
                <span className="mx-3 shrink-0 text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                  OR
                </span>
                <div className="grow border-t border-slate-100 dark:border-zinc-800"></div>
              </div>

              <button 
                onClick={handleMetaMaskLogin}
                disabled={isAnyLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-xl py-4 px-4 text-sm font-semibold transition-all duration-200
                  bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:shadow-md
                  dark:bg-zinc-900 dark:text-white dark:border-zinc-800 dark:hover:bg-zinc-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MetaMaskLogo />
                {isConnectingWallet ? "Connecting Wallet..." : "Continue with MetaMask"}
              </button>
            </div>
          </div>
          
          <div className="mt-10 text-center text-[11px] text-slate-500 dark:text-zinc-500 space-y-1.5">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="font-medium text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-medium text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}