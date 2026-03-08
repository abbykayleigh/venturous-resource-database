import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Quiz } from "@/components/Quiz";
import { SearchBar } from "@/components/SearchBar";
import { ResourceGrid } from "@/components/ResourceGrid";
import { ResultsFilters } from "@/components/ResultsFilters";
import { BackToTop } from "@/components/BackToTop";
import { getFilterOptions, queryResources, type QuizFilters, type FilterOptions } from "@/lib/notion";
import { Search, Loader2, Heart, MessageCircle } from "lucide-react";
import venturousLogo from "@/assets/venturous-logo.png";
import venturousLogoLight from "@/assets/venturous-logo-light.png";
import { Skeleton } from "@/components/ui/skeleton";

type AppMode = "landing" | "quiz" | "results" | "search";

const LoadingCards = () =>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-6 md:px-16 lg:px-24 py-8">
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

function useCountUp(start: number, target: number, duration: number = 1200) {
  const [count, setCount] = useState(start);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {if (entries[0].isIntersecting && !started) setStarted(true);},
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

  // Scroll to top on mode change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [mode]);

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ["filter-options"],
    queryFn: getFilterOptions,
    staleTime: 60 * 60 * 1000
  });

  const mergedFilters = { ...quizFilters, ...activeResultFilters };

  const hasSearched = searchQuery.length > 0;

  const { data: resources, isLoading: resourcesLoading } = useQuery({
    queryKey: ["resources", mergedFilters, searchQuery],
    queryFn: () => queryResources(
      Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
      searchQuery || undefined
    ),
    enabled: mode === "results" || (mode === "search" && hasSearched),
    staleTime: 60 * 60 * 1000
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
      <div className="grain-overlay min-h-screen flex flex-col" style={{ backgroundColor: '#111110' }}>
        <BackToTop />
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-16 lg:px-24 pt-12 pb-10">
          <div
            className="max-w-6xl w-full rounded-2xl p-6 sm:p-8 md:p-10 lg:p-14"
            style={{ backgroundColor: '#111110', border: '1px solid #eeefdf' }}>
            
            {/* Logo */}
            <div className="mb-10 animate-fade-in">
              <a href="https://www.venturouscounselling.com" target="_blank" rel="noopener noreferrer">
                <img src={venturousLogoLight} alt="Venturous Counselling + Consulting" className="h-8 md:h-10 w-auto" />
              </a>
            </div>

            {/* Hero heading */}
            <div className="animate-fade-in mb-10">
              <h1
                className="font-display font-medium text-left"
                style={{
                  color: '#eeefdf',
                  fontSize: 'clamp(3.5rem, 10vw, 130px)',
                  lineHeight: '0.82',
                  letterSpacing: '-0.07em',
                  marginBottom: '1.5rem'
                }}>
                
                Venturous Resource Library
              </h1>
              <p
                 className="font-body leading-relaxed max-w-xl font-semibold"
                style={{ color: '#a6afc5', fontSize: '1.25rem' }}>
                
                Curated resources to support you outside of session.
              </p>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #eeefdf', opacity: 0.2 }} className="mb-8" />

            {/* 860 Resources section */}
            <div
              className="flex flex-col md:flex-row gap-6 md:gap-12 items-start mb-8 animate-fade-in"
              style={{ animationDelay: '150ms', animationFillMode: 'both' }}>
              
              <div className="flex-1 text-left">
                <span
                  ref={counterRef}
                  className="font-display font-medium block mb-3"
                  style={{
                    color: '#eeefdf',
                    fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: '0.9'
                  }}>
                  
                  Over {resourceCount}+ resources + growing!
                </span>
                <p className="font-body leading-relaxed" style={{ color: '#a6afc5', fontSize: '0.875rem' }}>
                  Whether you're working through difficult emotions, supporting a loved one, or deepening your self-understanding, the <strong style={{ color: '#eeefdf' }}>Venturous Resource Library</strong> connects you with thoughtfully curated resources we trust, selected by Registered Clinical Counsellors.
                </p>
                <p className="font-body leading-relaxed mt-3" style={{ color: '#a6afc5', fontSize: '0.875rem' }}>
                  And if you're looking for more personalized support, our team is here when you're ready.
                </p>
              </div>
              <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto">
                <button
                  onClick={() => setMode("quiz")}
                  disabled={filtersLoading}
                  className="font-body font-semibold rounded-full flex items-center gap-2 justify-center active:scale-[0.97] transition-all disabled:opacity-50"
                  style={{
                    border: '1px solid #eeefdf',
                    backgroundColor: '#eeefdf',
                    color: '#111110',
                    padding: '14px 36px',
                    fontSize: '0.875rem',
                    boxShadow: '4px 4px 0px #a6afc5'
                  }}>
                  
                  {filtersLoading ?
                  <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> :
                  "Get Matched with Resources"}
                </button>
                <button
                  onClick={() => setMode("search")}
                  className="font-body font-semibold rounded-full flex items-center gap-2 justify-center active:scale-[0.97] transition-all"
                  style={{
                    border: '1px solid #eeefdf',
                    backgroundColor: 'transparent',
                    color: '#eeefdf',
                    padding: '14px 36px',
                    fontSize: '0.875rem',
                    boxShadow: '4px 4px 0px rgba(238,239,223,0.2)'
                  }}>
                  
                  <Search className="w-4 h-4" />
                  Search Resources
                </button>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #eeefdf', opacity: 0.2 }} className="mb-6" />

            {/* Personalized Support section */}
            <div
              className="animate-fade-in"
              style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
              
              <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
                <div className="flex flex-col gap-3 shrink-0 w-full md:w-auto order-2 md:order-1">
                  <a
                    href="https://www.venturouscounselling.com/about/find-a-therapist/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-body font-semibold rounded-full justify-center active:scale-[0.97] transition-all"
                    style={{
                      border: '1px solid #55558d',
                      backgroundColor: '#55558d',
                      color: '#eeefdf',
                      padding: '12px 28px',
                      fontSize: '0.875rem',
                      boxShadow: '3px 3px 0px rgba(238,239,223,0.15)'
                    }}>
                    
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    Connect with a Counsellor
                  </a>
                  <a
                    href="https://form.questionscout.com/662832229f4173275fe73547"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 font-body font-semibold rounded-full justify-center active:scale-[0.97] transition-all"
                    style={{
                      border: '1px solid #eeefdf',
                      backgroundColor: 'transparent',
                      color: '#eeefdf',
                      padding: '12px 28px',
                      fontSize: '0.875rem',
                      boxShadow: '3px 3px 0px rgba(238,239,223,0.15)'
                    }}>
                    
                    <Heart className="w-4 h-4 shrink-0" />
                    Get Matched with a Counsellor
                  </a>
                </div>

                <div className="flex-1 text-left order-1 md:order-2">
                  <h3
                    className="font-display font-medium mb-3"
                    style={{
                      color: '#eeefdf',
                      fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)',
                      letterSpacing: '-0.05em',
                      lineHeight: '0.9'
                    }}>
                    
                    Looking for personalized support?
                  </h3>
                  <p className="font-body leading-relaxed" style={{ color: '#a6afc5', fontSize: '0.875rem' }}>
                    Finding the right counsellor isn't a small thing. It's the thing.
                  </p>
                  <p className="font-body leading-relaxed mt-3" style={{ color: '#a6afc5', fontSize: '0.875rem' }}>
                    Take our 3-minute counsellor matching quiz and we'll suggest the counsellor who may be the best fit for what you're carrying. It's simply a way to explore what support might feel right.
                  </p>
                  <p className="font-body leading-relaxed mt-3" style={{ color: '#a6afc5', fontSize: '0.875rem' }}>
                    You can also browse our team, read about each counsellor's approach, watch short video introductions for a vibe check, and trust your gut about who feels right.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #eeefdf', opacity: 0.2 }} className="mt-8 mb-5" />

            {/* Disclaimer */}
            <p className="font-body leading-relaxed" style={{ color: '#a6afc5', fontSize: '0.7rem' }}>
              Your answers and personal information are not collected or stored on this app. Using this app is not a replacement for individualized mental health care, counselling or therapy. If you are in need of professional support, please{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#eeefdf' }}
                className="underline hover:opacity-80 transition-opacity"
                href="https://venturous.janeapp.com/">
                
                book a free consultation with one of our counsellors
              </a>.
              {" "}If you are in crisis, please phone an emergency contact or agency you trust. Concerned about privacy? Check out our{" "}
              <a
                href="https://database.venturouscounselling.com/privacy_policy"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#eeefdf' }}
                className="underline hover:opacity-80 transition-opacity">
                
                privacy policy here
              </a>.
            </p>
          </div>
        </div>
      </div>);

  }

  // Quiz
  if (mode === "quiz" && filterOptions) {
    return (
      <div className="grain-overlay" style={{ backgroundColor: '#FAFAF1' }}>
        <Quiz filterOptions={filterOptions} onComplete={handleQuizComplete} onExit={handleReset} />
      </div>);

  }

  // Search mode
  if (mode === "search") {
    return (
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <BackToTop />
        {/* Mobile header: logo centered, buttons below */}
        <header className="md:hidden px-4 pt-8 pb-4 flex flex-col items-center gap-4">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-14 w-auto" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="border border-border px-5 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Back to Start
            </button>
            <a
              href="https://www.venturouscounselling.com/about/find-a-therapist/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-5 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97] inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Counsellor
            </a>
          </div>
        </header>
        {/* Desktop/tablet header */}
        <header className="hidden md:flex px-6 md:px-16 lg:px-24 pt-12 pb-4 items-center justify-between">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-10 w-auto" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
              Back to Start
            </button>
            <a
              href="https://www.venturouscounselling.com/about/find-a-therapist/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-border px-6 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97] inline-flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Connect with a Counsellor
            </a>
          </div>
        </header>

        <div className="px-4 sm:px-6 md:px-16 lg:px-24 pt-6 md:pt-12 pb-6 md:pb-8 flex justify-center">
          <div className="w-full max-w-[500px]">
            <SearchBar onSearch={handleSearch} initialQuery={searchQuery} />
          </div>
        </div>

        {filterOptions &&
        <ResultsFilters filterOptions={filterOptions} activeFilters={activeResultFilters} onFiltersChange={setActiveResultFilters} />
        }

        {!hasSearched ? (
          <div className="text-center py-16 font-body text-muted-foreground">
            Enter a search term to find resources
          </div>
        ) : resourcesLoading ? <LoadingCards /> : <ResourceGrid resources={resources || []} />}
      </div>);

  }

  // Results mode
  if (mode === "results") {
    return (
      <div className="grain-overlay min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
        <BackToTop />
        {/* Mobile header: logo only */}
        <header className="md:hidden px-4 pt-8 pb-4 flex flex-col items-center">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-14 w-auto" />
          </button>
        </header>
        {/* Desktop/tablet header */}
        <header className="hidden md:flex px-6 md:px-16 lg:px-24 pt-12 pb-4 items-center justify-between">
          <button onClick={handleReset}>
            <img src={venturousLogo} alt="Venturous Counselling" className="h-10 w-auto" />
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => {setMode("search");setQuizFilters({});}}
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

        <div className="px-4 sm:px-6 md:px-16 lg:px-24 pt-2 md:pt-12 pb-2 md:pb-8 text-center animate-fade-in">
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.05em] mb-2">
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

        {/* Mobile buttons below "Your Results" */}
        <div className="md:hidden flex justify-center gap-3 pt-2 pb-3">
          <button
            onClick={() => {setMode("search");setQuizFilters({});}}
            className="border border-border px-5 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
            Search
          </button>
          <button
            onClick={handleReset}
            className="border border-border px-5 py-2 font-body text-sm font-semibold shadow-brutal-sm bg-primary text-primary-foreground hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]">
            Get Rematched
          </button>
        </div>

        {filterOptions &&
        <ResultsFilters filterOptions={filterOptions} activeFilters={activeResultFilters} onFiltersChange={setActiveResultFilters} />
        }

        {resourcesLoading ? <LoadingCards /> : <ResourceGrid resources={resources || []} />}
      </div>);

  }

  return null;
};

export default Index;
