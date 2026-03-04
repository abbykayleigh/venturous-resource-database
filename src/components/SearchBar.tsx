import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export function SearchBar({ onSearch, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="flex border border-border shadow-brutal bg-card rounded-full overflow-hidden">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search resources by name or description..."
          className="flex-1 px-6 py-4 bg-transparent font-body text-base placeholder:text-muted-foreground focus:outline-none"
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
