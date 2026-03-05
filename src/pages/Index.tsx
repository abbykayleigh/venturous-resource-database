import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quiz } from "@/components/Quiz";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResultsFilters } from "@/components/ResultsFilters";
import { getFilterOptions, queryResources, type QuizFilters, type FilterOptions } from "@/lib/notion";
import { Search, Loader2, Users, Heart, MessageCircle } from "lucide-react";
import venturousLogo from "@/assets/venturous-logo.png";
import { Skeleton } from "@/components/ui/skeleton";

type AppMode = "landing" | "quiz" | "results" | "search";

const LoadingCards = () =>
  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 md:px-16 lg:px-24 py-16">
    {Array.from({ length: 8 }).map((_, i) =>
      <div
        key={i}
        className="border rounded-2xl overflow-hidden bg-card animate-pulse"
        style={{ borderColor: '#3f3c18', animationDelay: `${i * 100}ms` }}>
        <div className="w-full h-40 md:h-48" style={{ backgroundColor: '#a6afc5' }} />
        <div className="p-5 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    )}
  </div>;

// Counter animation hook — counts from start to target
function useCountUp(start: number, target: number, duration: number = 1200) {
  const [count, setCount] = useState(start);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    const range = target - start;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(start + progress * range));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, start, duration]);

  return { count, ref };
}

const Index = () => {
  const [mode, setMode] = useState<AppMode>("landing");
  const [quizFilters, setQuizFilters] = useState<QuizFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [activeResultFilters, setActiveResultFilters] = useState<QuizFilters>({});

  const { count: resourceCount, ref: counterRef } = useCountUp(850, 860);

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["filter-options"],
    queryFn: getFilterOptions
  });

  const mergedFilters = {
    ...quizFilters,
    ...activeResultFilters
  };

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources", mergedFilters, searchQuery],
    queryFn: () => queryResources(
      Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
      searchQuery || undefined
    ),
    enabled: mode === "results" || mode === "search"
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
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-16 lg:px-24 pt-12 pb-10">
          <div className="max-w-6xl w-full border border-border rounded-2xl p-6 sm:p-8 md:p-10 lg:p-14" style={{ backgroundColor: '#FAFAF1' }}>

            {/* Hero heading */}
            <div className="animate-fade-in">
              <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-[90px] font-medium tracking-[-0.06em] leading-[0.78] mb-4 text-left">
                Get support with
                <br />
                difficult emotions + situations
              </h1>
              <p className="font-body text-base md:text-lg text-muted-foreground max-w-xl mb-8 leading-relaxed text-left">
                With 24/7 access to the latest professional recommendations of Registered Clinical Counsellors.
              </p>
            </div>

            {/* 860 Resources section - text left, buttons right */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start mb-8 animate-fade-in" style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              <div className="flex-1 text-left">
                <span ref={counterRef} className="font-display text-xl sm:text-2xl md:text-3xl font-medium tracking-[-0.06em] leading-[0.82] block mb-3">
                  Over {resourceCount}+ resources + growing!
                </span>
                <p className="font-body text-base md:text-lg text-foreground leading-relaxed">
                  Whether you're wanting to work through difficult emotions, trying to support a loved one, or looking to expand your self-understanding, <strong>Support Link</strong> by Venturous Counselling connects you with evidence-based + research-backed resources curated by Registered Clinical Counsellors.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setMode("quiz")}
                  disabled={filtersLoading}
                  className="group border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 rounded-full flex items-center gap-2 justify-center active:scale-[0.97]">
                  {filtersLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
                    : "Get Matched with Resources"}
                </button>
                <button
                  onClick={() => setMode("search")}
                  className="border border-border px-10 py-4 font-body text-base font-semibold shadow-brutal bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full flex items-center gap-2 justify-center active:scale-[0.97]">
                  <Search className="w-4 h-4" />
                  Search Resources
                </button>
              </div>
            </div>

            {/* Personalized Support section - buttons left, text right */}
            <div className="border-t border-border pt-6 mb-5 animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                {/* Buttons stacked vertically on the left */}
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto order-2 md:order-1">
                  <a
                    href="https://www.venturouscounselling.com/about/find-a-therapist/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-border px-8 py-3 font-body text-base font-semibold shadow-brutal-sm bg-accent text-accent-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full justify-center active:scale-[0.97]">
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    Connect with a Counsellor
                  </a>
                  <a
                    href="https://form.questionscout.com/662832229f4173275fe73547"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-border px-8 py-3 font-body text-base font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full justify-center active:scale-[0.97]">
                    <Heart className="w-4 h-4 shrink-0" />
                    Get Matched with a Counsellor
                  </a>
                </div>

                {/* Text on the right */}
                <div className="flex-1 text-left order-1 md:order-2">
                  <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-medium tracking-[-0.06em] leading-[0.82] mb-3">Want personalized support?</h3>
                  <p className="font-body text-base md:text-lg text-foreground leading-relaxed">
                    Finding the right counsellor isn't a small thing. It's the thing. Take our 3-minute matching quiz and we'll point you toward the counsellor most suited to what you're carrying. You can also browse our team, read about each counsellor's approach, check out video introductions for a vibe check, and trust your gut.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-5 flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <p className="font-body text-xs text-muted-foreground leading-relaxed text-left flex-1">
                Your answers and personal information are not collected or stored on this app. Using this app is not a replacement for individualized mental health care, counselling or therapy. If you are in need of professional support, please{" "}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors"
                  href="https://venturous.janeapp.com/">
                  book a free consultation with one of our counsellors
                </a>.
                {" "}If you are in crisis, please phone an emergency contact or agency you trust. Concerned about privacy? Check out our{" "}
                <a
                  href="https://database.venturouscounselling.com/privacy_policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground transition-colors">
                  privacy policy here
                </a>.
              </p>
              <a href="https://www.venturouscounselling.com" target="_blank" rel="noopener noreferrer" className="shrink-0">
                <img src={venturousLogo} alt="Venturous Counselling + Consulting" className="h-8 md:h-10 w-auto" />
              </a>
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
        <Quiz filterOptions={filterOptions} onComplete={handleQuizComplete} onBack={handleReset} />
      </div>
    );
  }

  // Search mode
  if (mode === "search") {
    return (
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <header className="px-4 sm:px-6 md:px-16 lg:px-24 pt-8 sm:pt-12 pb-8 flex items-center justify-between">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-8 md:h-10 w-auto" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Back to Start
            </button>
            <button
              onClick={() => { setMode("quiz"); setSearchQuery(""); }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Take Quiz
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-16 lg:px-24 pb-8 max-w-2xl mx-auto">
          <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        {filterOptions &&
          <ResultsFilters filterOptions={filterOptions} activeFilters={activeResultFilters} onFiltersChange={setActiveResultFilters} />
        }

        {resourcesLoading ? <LoadingCards /> : <ResourceGrid resources={resources || []} />}
      </div>
    );
  }

  // Results mode
  if (mode === "results") {
    return (
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <header className="px-4 sm:px-6 md:px-16 lg:px-24 pt-8 sm:pt-12 pb-4 flex items-center justify-between">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-8 md:h-10 w-auto" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => { setMode("search"); setQuizFilters({}); }}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Search
            </button>
            <button
              onClick={handleReset}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Get Rematched
            </button>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-16 lg:px-24 pb-8 text-center animate-fade-in">
          <h2 className="font-display text-3xl sm:text-4xl md:text-6xl font-medium tracking-[-0.05em] mb-2">
            Your Results
          </h2>
          <p className="font-body text-muted-foreground">
            {resourcesLoading ?
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Finding your matches...
              </span> :
              `${resources?.length || 0} resource${(resources?.length || 0) !== 1 ? "s" : ""} matched your selections`
            }
          </p>
        </div>

        {filterOptions &&
          <ResultsFilters filterOptions={filterOptions} activeFilters={activeResultFilters} onFiltersChange={setActiveResultFilters} />
        }

        {resourcesLoading ? <LoadingCards /> : <ResourceGrid resources={resources || []} />}
      </div>
    );
  }

  return null;
};

export default Index;
