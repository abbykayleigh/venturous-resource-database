import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  questionNumber: number;
  totalQuestions: number;
  title: string;
  subtitle: string;
  options: string[];
  selected: string[];
  onToggle: (option: string) => void;
  onNext: () => void;
  onBack?: () => void;
  isLast?: boolean;
}

export function QuizQuestion({
  questionNumber,
  totalQuestions,
  title,
  subtitle,
  options,
  selected,
  onToggle,
  onNext,
  onBack,
  isLast = false,
}: QuizQuestionProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 py-16 md:px-16 lg:px-24 text-center">
      <div className="max-w-5xl mx-auto w-full">
        <p className="font-body text-sm uppercase tracking-widest text-muted-foreground mb-4">
          {questionNumber} / {totalQuestions}
        </p>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-medium tracking-[-0.06em] mb-4 leading-[0.95]">
          {title}
        </h1>

        <p className="font-body text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
          {options.map((option) => {
            const isSelected = selected.includes(option);
            return (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className={cn(
                  "border border-border p-5 md:p-6 text-center font-body text-sm md:text-base font-medium shadow-brutal transition-all duration-150 rounded-2xl",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
                )}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 justify-center">
          {onBack && (
            <button
              onClick={onBack}
              className="border border-border px-8 py-3 font-body text-sm font-semibold shadow-brutal-sm bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all rounded-full"
            >
              Back
            </button>
          )}
          <button
            onClick={onNext}
            className="border border-border px-8 py-3 font-body text-sm font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full"
          >
            {isLast ? "Show Results" : selected.length > 0 ? "Next" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}
