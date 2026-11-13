import React from 'react';

export const DeveloperFooter: React.FC = () => {
  return (
    <footer
      aria-label="Developer Credits"
      className="no-print flex flex-col sm:flex-row items-center justify-center gap-4 py-6 mt-auto px-4"
    >
      {/* Pill 1: Ayesha Nehal */}
      <div className="rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-gray-200 dark:border-stone-800 px-5 py-2.5 shadow-sm flex items-center justify-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs whitespace-nowrap transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-800">
        <span className="font-bold text-stone-900 dark:text-stone-100 tracking-wider uppercase select-none">
          AYESHA NEHAL
        </span>
        <span className="text-gray-300 dark:text-stone-600 select-none font-light">|</span>
        <a
          href="https://www.linkedin.com/in/ayesha-nehal-446586294/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ayesha Nehal LinkedIn Profile"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          LINKEDIN
        </a>
        <span className="text-gray-300 dark:text-stone-600 select-none">•</span>
        <a
          href="https://github.com/AyeshaNehal"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Ayesha Nehal GitHub Profile"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          GITHUB
        </a>
        <span className="text-gray-300 dark:text-stone-600 select-none">•</span>
        <a
          href="mailto:ayeshanehal54321@gmail.com"
          aria-label="Send Email to Ayesha Nehal"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          EMAIL
        </a>
      </div>

      {/* Pill 2: Muhammad Hamdan */}
      <div className="rounded-full bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border border-gray-200 dark:border-stone-800 px-5 py-2.5 shadow-sm flex items-center justify-center gap-2 sm:gap-2.5 text-[11px] sm:text-xs whitespace-nowrap transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-800">
        <span className="font-bold text-stone-900 dark:text-stone-100 tracking-wider uppercase select-none">
          MUHAMMAD HAMDAN
        </span>
        <span className="text-gray-300 dark:text-stone-600 select-none font-light">|</span>
        <a
          href="https://www.linkedin.com/in/muhammad-hamdan-473061392/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Muhammad Hamdan LinkedIn Profile"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          LINKEDIN
        </a>
        <span className="text-gray-300 dark:text-stone-600 select-none">•</span>
        <a
          href="https://github.com/hamdankhan28feb-beep"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Muhammad Hamdan GitHub Profile"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          GITHUB
        </a>
        <span className="text-gray-300 dark:text-stone-600 select-none">•</span>
        <a
          href="mailto:hamdankhan28feb@gmail.com"
          aria-label="Send Email to Muhammad Hamdan"
          className="font-medium text-stone-600 dark:text-stone-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors uppercase tracking-wide"
        >
          EMAIL
        </a>
      </div>
    </footer>
  );
};
