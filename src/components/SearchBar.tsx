import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

const PLACEHOLDER = "Search resources by name or description...";

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const showMarquee = !focused && query === "";

  return (
    <form onSubmit={handleSubmit} className="w-full mx-auto">
      <div className="flex border border-border shadow-brutal bg-card rounded-full overflow-hidden relative">
        {/* Mobile marquee placeholder — only shown when input is empty & unfocused */}
        {showMarquee && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 overflow-hidden font-body text-base text-muted-foreground sm:hidden"
            style={{ maxWidth: "calc(100% - 70px)" }}
          >
            <span className="animate-marquee">
              {PLACEHOLDER}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{PLACEHOLDER}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
          </span>
        )}

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          /* Hide native placeholder on mobile (marquee takes over); show on sm+ */
          placeholder={PLACEHOLDER}
          className="flex-1 px-6 py-4 bg-transparent font-body text-base focus:outline-none
            placeholder:text-transparent sm:placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="px-5 border-l border-border bg-primary text-primary-foreground hover:opacity-90 transition-opacity rounded-r-full"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}
