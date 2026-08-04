'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';
import { formatWalletError } from '@/lib/errors/walletErrors';
import { MetaMaskLogo, GoogleLogo } from '@/components/icons/AuthIcons';
import { ProveNodeLogoLight, ProveNodeLogoDark } from '@/components/icons/ProveNodeLogo'


interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
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
      setAuthError(null);
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
        setAuthError("Google authentication failed. Please try again.");
        setIsLoading(false);
      }
    },
    onError: () => {
      setAuthError("Google Sign-In was cancelled or failed.");
      setIsLoading(false);
    }
  });

  const handleMetaMaskLogin = async () => {
    setAuthError(null);
    try {
      await loginWithWallet();
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const walletError = useAuthStore.getState().walletError;
 
      if(isAuthenticated) {
        router.push('/dashboard');
      }  else if (walletError) {
        setAuthError(formatWalletError(walletError));
      }
    } catch (error) {
      setAuthError(formatWalletError(error));
    }
  }

  const isAnyLoading = isLoading || isConnectingWallet;

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-100 flex items-start sm:items-center justify-center px-4 pt-24 sm:pt-0">
      <div 
        className="absolute inset-0 bg-background/80 dark:bg-black/80 backdrop-blur-xl transition-all duration-300 animate-in fade-in"
        onClick={onClose}
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-100 rounded-xl p-8 sm:p-10 bg-card dark:bg-zinc-900/60 shadow-lg
          dark:shadow-[0_0_60px_-15px_rgba(0,0,0,0.8)]"
      >
        <button 
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-5 top-5 z-20 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-zinc-200/80
           dark:hover:bg-zinc-800 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6 flex justify-center">
            <ProveNodeLogoLight className="w-12 h-12 block dark:hidden" />
            <ProveNodeLogoDark className="w-12 h-12 hidden dark:block" />
          </div>

          <div className="mb-8 text-center space-y-1.5">
            <h2 className="text-xl font-semibold text-foreground tracking-tight">
              Welcome back
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Access your account to continue.
            </p>
          </div>

          {authError && (
            <div className="w-full mb-6 p-4 rounded-md flex items-start gap-3 
              bg-destructive/10 text-destructive border border-destructive/20 
              animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium leading-relaxed">
                {authError}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <div className="grid gap-4">
              <button 
                onClick={() => handleGoogleLogin()}
                disabled={isAnyLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-md py-3.5 px-4 text-sm font-medium transition-colors duration-150
                  bg-card text-foreground border border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800
                  disabled:opacity-50 disabled:cursor-wait"
              >
                <GoogleLogo className="w-5 h-5 shrink-0" />
                {isLoading ? "Connecting..." : "Continue with Google"}
              </button>

              <div className="relative flex items-center py-1">
                <div className="grow border-t border-border"></div>
                <span className="mx-3 shrink-0 text-[10px] font-mono text-muted-foreground uppercase">
                  OR
                </span>
                <div className="grow border-t border-border"></div>
              </div>

              <button 
                onClick={handleMetaMaskLogin}
                disabled={isAnyLoading}
                className="group inline-flex items-center justify-center gap-3 rounded-md py-3.5 px-4 text-sm font-medium transition-colors duration-150
                  bg-card text-foreground border border-border hover:bg-zinc-200/80 dark:hover:bg-zinc-800
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MetaMaskLogo />
                {isConnectingWallet ? "Connecting Wallet..." : "Continue with MetaMask"}
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center text-[10px] text-muted-foreground space-y-1.5">
            <p>
              By continuing, you agree to our{' '}
              <Link href="/terms" className="font-medium text-foreground hover:underline transition-all">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="font-medium text-foreground hover:underline transition-all">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}