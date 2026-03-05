import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Display-only label overrides
const DISPLAY_LABELS: Record<string, string> = {
  "Adults": "Adult",
  "Older Adults": "Older Adult",
};

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  subtitle: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  onSelectAll: () => void;
  onNext: () => void;
  onBack?: () => void;
  isLast?: boolean;
  multiSelect?: boolean;
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  options,
  selected,
  onToggle,
  onSelectAll,
  onNext,
  onBack,
  isLast = false,
  multiSelect = false,
}: QuizQuestionProps) {
  const allSelected = options.length > 0 && selected.length === options.length;
  const progressValue = ((questionNumber - 1) / totalQuestions) * 100;

  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-16 md:px-16 lg:px-24 text-center animate-fade-in">
      <div className="max-w-5xl mx-auto w-full">
        {/* Progress bar */}
        <div className="mb-6 max-w-md mx-auto">
          <Progress value={progressValue} className="h-2 bg-muted" />
        </div>

        <p className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-4">
          {questionNumber} / {totalQuestions}
        </p>

        <div className="border border-border rounded-2xl p-8 md:p-12 mb-8" style={{ backgroundColor: '#FAFAF1' }}>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-medium tracking-[-0.06em] mb-3 leading-[0.88]">
            {title}
          </h1>

          <p className="font-body text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>

          <div className="mb-6">
            <button
              onClick={onSelectAll}
              className={cn(
                "border border-border px-6 py-2.5 font-body text-sm font-semibold transition-all duration-150 rounded-full active:scale-[0.97]",
                allSelected
                  ? "bg-primary text-primary-foreground shadow-brutal-sm"
                  : "bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-brutal-sm"
              )}
            >
              {allSelected ? "Deselect All" : "Select All"}
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {options.map((option, i) => {
              const isSelected = selected.includes(option);
              const displayLabel = DISPLAY_LABELS[option] || option;
              // Stagger animation for question 2 (questionNumber === 2)
              const staggerStyle = questionNumber === 2
                ? { animationDelay: `${i * 60}ms`, animationFillMode: 'both' as const }
                : {};

              return (
                <button
                  key={option}
                  onClick={() => onToggle(option)}
                  className={cn(
                    "border border-border p-5 md:p-6 text-center font-body text-sm md:text-base font-medium shadow-brutal transition-all duration-150 rounded-2xl active:scale-[0.97]",
                    questionNumber === 2 ? "animate-fade-in" : "",
                    isSelected
                      ? "bg-primary text-primary-foreground scale-[1.03]"
                      : "bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                  )}
                  style={staggerStyle}
                >
                  {displayLabel}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="border border-border px-8 py-3 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full active:scale-[0.97]"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="border border-border px-8 py-3 font-body text-sm font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full active:scale-[0.97]"
          >
            {isLast ? "Show Results" : selected.length > 0 ? "Next" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
