import { useUnifiedWalletContext, useWallet } from '@jup-ag/wallet-adapter';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from './ui/button';
import { CreatePoolButton } from './CreatePoolButton';
import { ThemeToggle } from './ThemeToggle';
import { useMemo } from 'react';
import { shortenAddress } from '@/lib/utils';
import { Video, ExternalLink } from 'lucide-react';

const GithubIcon = () => (
  <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const Header = () => {
  const { setShowModal } = useUnifiedWalletContext();

  const { disconnect, publicKey } = useWallet();
  const address = useMemo(() => publicKey?.toBase58(), [publicKey]);

  const handleConnectWallet = () => {
    setShowModal(true);
  };

  return (
    <header className="w-full border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex h-14 w-full items-center justify-between gap-2 px-3 md:h-16 md:px-4 max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 group"
        >
          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-xl border border-cyan-500/40 shadow-lg shadow-cyan-500/20 transition-transform group-hover:scale-105">
            <img
              src="/curvelab-logo.jpg"
              alt="CurveLab Studio"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="truncate whitespace-nowrap text-base font-bold tracking-tight md:text-lg text-neutral-100 flex items-center gap-1.5">
              CurveLab
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-cyan-400">
                STUDIO
              </span>
            </span>
            <span className="text-[10px] text-neutral-400 hidden sm:block">
              Meteora DBC Designer & Validator
            </span>
          </div>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {/* Quick External Links for Judges */}
          <a
            href="https://youtu.be/Cmcw-5n8sv0"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-rose-400 border border-neutral-800 text-xs font-medium transition-all"
            title="Watch 2-Minute Demo Video"
          >
            <Video className="h-3.5 w-3.5" />
            <span>Demo Video</span>
          </a>

          <a
            href="https://github.com/sanjay3226/curvelab"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium transition-all"
            title="View Public GitHub Repository"
          >
            <GithubIcon />
            <span>GitHub</span>
          </a>

          <Link
            href="/create-pool"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 text-xs font-medium transition-all"
          >
            <span>Pools</span>
          </Link>
          <CreatePoolButton />
          {address ? (
            <Button variant="secondary" onClick={() => disconnect()}>
              <span className="iconify h-4 w-4 ph--wallet-bold" />
              {shortenAddress(address)}
            </Button>
          ) : (
            <Button
              onClick={() => {
                handleConnectWallet();
              }}
            >
              <span className="hidden md:block">Connect Wallet</span>
              <span className="block md:hidden">Connect</span>
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
