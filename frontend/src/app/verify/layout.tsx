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
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur">
                <div className="w-full px-4 sm:px-8 flex h-18 items-center">
                    <div className="flex items-center gap-6">   
                        <Link href="/" className="flex items-center gap-2">
                            <ProveNodeLogoLight className="w-5 h-5 block dark:hidden" />
                            <ProveNodeLogoDark className="w-5 h-5 hidden dark:block" />
                            <span className="font-bold text-2xl tracking-tight text-foreground">ProveNode</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col">
                {children}
            </main>
        </div>
    );
}