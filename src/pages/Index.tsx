import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quiz } from "@/components/Quiz";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { getFilterOptions, queryResources, type QuizFilters } from "@/lib/notion";

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
      <div className="grain-overlay min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto w-full">
          <h1 className="font-display text-6xl md:text-8xl lg:text-[120px] font-medium tracking-[-0.05em] leading-[0.9] mb-8">
            Find the
            <br />
            right resource
          </h1>

          <p className="font-body text-lg md:text-xl text-muted-foreground max-w-xl mb-16 leading-relaxed">
            Discover curated resources tailored to your needs. Take the quiz for
            personalized recommendations, or search directly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <button
              onClick={() => setMode("quiz")}
              disabled={filtersLoading}
              className="border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50"
            >
              {filtersLoading ? "Loading..." : "Take the Quiz"}
            </button>
            <button
              onClick={() => setMode("search")}
              className="border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
            >
              Search Resources
            </button>
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
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.03em] hover:text-primary transition-colors"
          >
            Resources
          </button>
          <button
            onClick={() => {
              setMode("quiz");
              setSearchQuery("");
            }}
            className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            Take Quiz
          </button>
        </header>

        <div className="px-6 md:px-16 lg:px-24 pb-8">
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
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.03em] hover:text-primary transition-colors"
          >
            Resources
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setMode("search");
                setQuizFilters({});
              }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Search
            </button>
            <button
              onClick={() => {
                setMode("quiz");
                setQuizFilters({});
              }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
            >
              Retake Quiz
            </button>
          </div>
        </header>

        <div className="px-6 md:px-16 lg:px-24 pb-8">
          <h2 className="font-display text-4xl md:text-6xl font-medium tracking-[-0.04em] mb-2">
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
