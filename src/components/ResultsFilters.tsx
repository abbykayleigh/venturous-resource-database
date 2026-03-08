import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { FilterOptions, QuizFilters } from "@/lib/notion";
import { useIsCompact } from "@/hooks/use-compact";
import { getShortLabel } from "@/lib/labels";

interface ResultsFiltersProps {
  filterOptions: FilterOptions;
  activeFilters: QuizFilters;
  onFiltersChange: (filters: QuizFilters) => void;
}

export function ResultsFilters({ filterOptions, activeFilters, onFiltersChange }: ResultsFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const isCompact = useIsCompact();

  const toggle = (key: keyof QuizFilters, value: string) => {
    const current = activeFilters[key] || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({
      ...activeFilters,
      [key]: updated.length > 0 ? updated : undefined,
    });
  };

  const clearAll = () => onFiltersChange({});

  const hasFilters = Object.values(activeFilters).some((v) => v && v.length > 0);

  const displayLabel = (label: string) => isCompact ? getShortLabel(label) : label;

  return (
    <div className="px-6 md:px-16 lg:px-24 pb-0">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 font-body text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            Filters
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 font-body text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {expanded && (
          <div className="border border-border rounded-2xl p-6 space-y-5" style={{ backgroundColor: '#FAFAF1' }}>
            <FilterSection
              label="Demographics"
              options={filterOptions.demographics}
              selected={activeFilters.demographics || []}
              onToggle={(v) => toggle("demographics", v)}
              displayLabel={displayLabel}
            />
            <FilterSection
              label="Category"
              options={filterOptions.categoryTags}
              selected={activeFilters.categoryTags || []}
              onToggle={(v) => toggle("categoryTags", v)}
              displayLabel={displayLabel}
            />
            <FilterSection
              label="Resource Type"
              options={filterOptions.resourceTypes}
              selected={activeFilters.resourceTypes || []}
              onToggle={(v) => toggle("resourceTypes", v)}
              displayLabel={displayLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({
  label,
  options,
  selected,
  onToggle,
  displayLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  displayLabel: (label: string) => string;
}) {
  if (options.length === 0) return null;

  return (
    <div>
      <p className="font-body text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onToggle(option)}
            className={cn(
              "border border-border px-3 py-1.5 font-body text-xs font-medium rounded-full transition-all",
              selected.includes(option)
                ? "bg-primary text-primary-foreground"
                : "bg-card hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none shadow-brutal-sm"
            )}
          >
            {displayLabel(option)}
          </button>
        ))}
      </div>
    </div>
  );
}
