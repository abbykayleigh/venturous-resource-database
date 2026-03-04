import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quiz } from "@/components/Quiz";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { getFilterOptions, queryResources, type QuizFilters } from "@/lib/notion";
import { ArrowRight, Compass, Search, Sparkles } from "lucide-react";

type AppMode = "landing" | "quiz" | "results" | "search";

const Index = () => {
  const [mode, setMode] = useState<AppMode>("landing");
  const [quizFilters, setQuizFilters] = useState<QuizFilters>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["filter-options"],
    queryFn: getFilterOptions,
  });

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources", quizFilters, searchQuery],
    queryFn: () => queryResources(
      Object.keys(quizFilters).length > 0 ? quizFilters : undefined,
      searchQuery || undefined
    ),
    enabled: mode === "results" || mode === "search",
  });

  const handleQuizComplete = (filters: QuizFilters) => {
    setQuizFilters(filters);
    setSearchQuery("");
    setMode("results");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setQuizFilters({});
    setMode("search");
  };

  const handleReset = () => {
    setMode("landing");
    setQuizFilters({});
    setSearchQuery("");
  };

  // Landing
  if (mode === "landing") {
    return (
      <div className="grain-overlay min-h-screen flex flex-col">
        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8 font-body text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5" />
            Curated with care
          </div>

          <h1 className="font-display text-6xl md:text-8xl lg:text-[130px] font-medium tracking-[-0.06em] leading-[0.88] mb-6 max-w-5xl">
            Find the
            <br />
            right resource
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-lg mb-12 leading-relaxed">
            Discover curated resources tailored to your needs. Take the quiz for
            personalized recommendations, or search directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button
              onClick={() => setMode("quiz")}
              disabled={filtersLoading}
              className="group border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 rounded-full flex items-center gap-2"
            >
              {filtersLoading ? "Loading..." : "Take the Quiz"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setMode("search")}
              className="border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Search Resources
            </button>
          </div>
        </div>

        {/* Feature tiles */}
        <div className="px-6 md:px-16 lg:px-24 pb-24">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="border border-border rounded-2xl p-7 bg-secondary shadow-brutal-sm text-center">
              <div className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center mx-auto mb-4">
                <Compass className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg mb-2">Guided Quiz</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                Answer three quick questions and get matched with resources built for you.
              </p>
            </div>

            <div className="border border-border rounded-2xl p-7 bg-accent text-accent-foreground shadow-brutal-sm text-center">
              <div className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center mx-auto mb-4">
                <Search className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg mb-2 text-accent-foreground">Direct Search</h3>
              <p className="font-body text-sm opacity-90 leading-relaxed">
                Know what you're looking for? Search by name or description instantly.
              </p>
            </div>

            <div className="border border-border rounded-2xl p-7 bg-primary text-primary-foreground shadow-brutal-sm text-center">
              <div className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg mb-2 text-primary-foreground">Curated Quality</h3>
              <p className="font-body text-sm opacity-90 leading-relaxed">
                Every resource is hand-picked, verified, and ready to help.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz
  if (mode === "quiz" && filterOptions) {
    return (
      <div className="grain-overlay">
        <Quiz filterOptions={filterOptions} onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Search mode
  if (mode === "search") {
    return (
      <div className="grain-overlay min-h-screen">
        <header className="px-6 md:px-16 lg:px-24 pt-12 pb-8 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.05em] hover:text-primary transition-colors"
          >
            Resources
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              setSearchQuery("");
            }}
            className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full"
          >
            Take Quiz
          </button>
        </header>

        <div className="px-6 md:px-16 lg:px-24 pb-8 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        {resourcesLoading ? (
          <div className="flex justify-center py-24">
            <p className="font-body text-muted-foreground animate-pulse">Loading resources...</p>
          </div>
        ) : (
          <ResourceGrid resources={resources || []} />
        )}
      </div>
    );
  }

  // Results mode
  if (mode === "results") {
    return (
      <div className="grain-overlay min-h-screen">
        <header className="px-6 md:px-16 lg:px-24 pt-12 pb-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.05em] hover:text-primary transition-colors"
          >
            Resources
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setMode("search");
                setQuizFilters({});
              }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full"
            >
              Search
            </button>
            <button
              onClick={() => {
                setMode("quiz");
                setQuizFilters({});
              }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full"
            >
              Retake Quiz
            </button>
          </div>
        </header>

        <div className="px-6 md:px-16 lg:px-24 pb-8 text-center">
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-[-0.05em] mb-2">
            Your Results
          </h2>
          <p className="font-body text-muted-foreground">
            {resources?.length || 0} resource{(resources?.length || 0) !== 1 ? "s" : ""} matched your selections
          </p>
        </div>

        {resourcesLoading ? (
          <div className="flex justify-center py-24">
            <p className="font-body text-muted-foreground animate-pulse">Loading resources...</p>
          </div>
        ) : (
          <ResourceGrid resources={resources || []} />
        )}
      </div>
    );
  }

  return null;
};

export default Index;
