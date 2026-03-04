import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quiz } from "@/components/Quiz";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResultsFilters } from "@/components/ResultsFilters";
import { getFilterOptions, queryResources, type QuizFilters, type FilterOptions } from "@/lib/notion";
import { ArrowRight, Search } from "lucide-react";

type AppMode = "landing" | "quiz" | "results" | "search";

const Index = () => {
  const [mode, setMode] = useState<AppMode>("landing");
  const [quizFilters, setQuizFilters] = useState<QuizFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResultFilters, setActiveResultFilters] = useState<QuizFilters>({});

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["filter-options"],
    queryFn: getFilterOptions,
  });

  const mergedFilters = {
    ...quizFilters,
    ...activeResultFilters,
  };

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources", mergedFilters, searchQuery],
    queryFn: () => queryResources(
      Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
      searchQuery || undefined
    ),
    enabled: mode === "results" || mode === "search",
  });

  const handleQuizComplete = (filters: QuizFilters) => {
    setQuizFilters(filters);
    setActiveResultFilters({});
    setSearchQuery("");
    setMode("results");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setQuizFilters({});
    setActiveResultFilters({});
    setMode("search");
  };

  const handleReset = () => {
    setMode("landing");
    setQuizFilters({});
    setActiveResultFilters({});
    setSearchQuery("");
  };

  // Landing
  if (mode === "landing") {
    return (
      <div className="grain-overlay min-h-screen flex flex-col" style={{ backgroundColor: '#eeefdf' }}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 md:px-16 lg:px-24 pt-12 pb-10">
          <div className="max-w-5xl w-full border border-border rounded-2xl p-8 md:p-10 lg:p-14 text-center" style={{ backgroundColor: '#FAFAF1' }}>
            <h1 className="font-display text-4xl md:text-6xl lg:text-[90px] font-medium tracking-[-0.06em] leading-[0.78] mb-4">
              Get support with
              <br />
              difficult emotions + situations
            </h1>

            <p className="font-body text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-5 leading-relaxed">
              With 24/7 access to the latest professional recommendations of Registered Clinical Counsellors.
            </p>

            <p className="font-body text-base md:text-lg text-foreground leading-relaxed mb-6 max-w-3xl mx-auto">
              <span className="font-display text-xl md:text-2xl font-medium tracking-[-0.06em] leading-[0.82] block mb-3">Over 860 resources + growing!</span>
              Whether you're wanting to work through difficult emotions, trying to support a loved one, or looking to expand your self-understanding, <strong>Support Link</strong> by Venturous Counselling connects you with evidence-based + research-backed resources curated by Registered Clinical Counsellors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
              <button
                onClick={() => setMode("quiz")}
                disabled={filtersLoading}
                className="group border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 rounded-full flex items-center gap-2"
              >
                {filtersLoading ? "Loading..." : "Get Matched with Resources"}
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

            <div className="border-t border-border pt-5 mb-5">
              <h3 className="font-display text-lg md:text-xl font-medium tracking-[-0.06em] leading-[0.82] mb-2">Want personalized support?</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-3">
                We'll match you with your best-fit counsellor so you can address whatever is keeping you from your wellness.
              </p>
              <a
                href="https://form.questionscout.com/662832229f4173275fe73547"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block border border-border px-6 py-2.5 font-body text-sm font-semibold shadow-brutal-sm bg-accent text-accent-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full"
              >
                Get Matched with a Counsellor
              </a>
            </div>

            <div className="border-t border-border pt-5">
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                Your answers and personal information are not collected or stored on this app. Using this app is not a replacement for individualized mental health care, counselling or therapy. If you are in need of professional support, please book a free consultation with one of our counsellors at{" "}
                <a href="https://venturouscounselling.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">VenturousCounselling.com</a>.
                {" "}If you are in crisis, please phone an emergency contact or agency you trust. Concerned about privacy? Check out our{" "}
                <a href="https://database.venturouscounselling.com/privacy_policy" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground transition-colors">privacy policy here</a>.
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
      <div className="grain-overlay" style={{ backgroundColor: '#FAFAF1' }}>
        <Quiz filterOptions={filterOptions} onComplete={handleQuizComplete} />
      </div>
    );
  }

  // Search mode
  if (mode === "search") {
    return (
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <header className="px-6 md:px-16 lg:px-24 pt-12 pb-8 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.05em] hover:text-primary transition-colors"
          >
            Support Link
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

        {filterOptions && (
          <ResultsFilters
            filterOptions={filterOptions}
            activeFilters={activeResultFilters}
            onFiltersChange={setActiveResultFilters}
          />
        )}

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
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <header className="px-6 md:px-16 lg:px-24 pt-12 pb-4 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="font-display text-2xl md:text-3xl font-medium tracking-[-0.05em] hover:text-primary transition-colors"
          >
            Support Link
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

        {filterOptions && (
          <ResultsFilters
            filterOptions={filterOptions}
            activeFilters={activeResultFilters}
            onFiltersChange={setActiveResultFilters}
          />
        )}

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
