import Link from "next/link";
import { ProveNodeLogoLight, ProveNodeLogoDark } from '@/components/icons/ProveNodeLogo';

export const metadata = {
    title: "Verify Asset | ProveNode",
    description: "Audit and verify digital asset authenticity on ProveNode.",
};

export default function VerifyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="h-screen w-full flex flex-col font-sans overflow-hidden">
            <header className="sticky top-0 z-50 w-full shrink-0 border-b border-border bg-background backdrop-blur-md">
                <div className="w-full px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
                    <div className="flex items-center gap-6">   
                        <Link 
                            href="/" 
                            title="ProveNode Home"
                            className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
                            <ProveNodeLogoLight className="w-5 h-5 block dark:hidden" />
                            <ProveNodeLogoDark className="w-5 h-5 hidden dark:block" />
                            <span className="font-heading font-semibold text-xl tracking-tight text-foreground">ProveNode</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center items-center bg-zinc-200/30 dark:bg-zinc-900/50 overflow-y-auto md:overflow-hidden p-4">
                {children}
            </main>
        </div>
    );
}