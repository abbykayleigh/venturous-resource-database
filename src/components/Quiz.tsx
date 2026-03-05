import { useState, useEffect } from "react";
import { QuizQuestion } from "./QuizQuestion";
import type { FilterOptions, QuizFilters } from "@/lib/notion";

interface QuizProps {
  filterOptions: FilterOptions;
  onComplete: (filters: QuizFilters) => void;
  onBack?: () => void;
}

interface ProgressBarProps {
  step: number;
  total: number;
  onBack?: () => void;
}

function ProgressBar({ step, total, onBack }: ProgressBarProps) {
  return (
    <div className="px-4 sm:px-6 md:px-16 lg:px-24 pt-8 pb-2">
      <div className="flex items-center justify-between mb-3">
        {onBack ? (
          <button
            onClick={onBack}
            className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            ← Back
          </button>
        ) : (
          <span />
        )}
        <span className="font-body text-sm text-muted-foreground">
          Step {step + 1} of {total}
        </span>
      </div>
      <div className="w-full h-[2px] rounded-full" style={{ backgroundColor: '#a6afc5' }}>
        <div
          className="h-[2px] rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${((step + 1) / total) * 100}%`,
            backgroundColor: '#55558d'
          }}
        />
      </div>
    </div>
  );
}

export function Quiz({ filterOptions, onComplete, onBack }: QuizProps) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');
  const [demographics, setDemographics] = useState<string[]>([]);
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  const toggle = (list: string[], setter: (v: string[]) => void, item: string) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const selectAll = (options: string[], current: string[], setter: (v: string[]) => void) => {
    if (current.length === options.length) {
      setter([]);
    } else {
      setter([...options]);
    }
  };

  const goToStep = (nextStep: number, direction: 'forward' | 'backward') => {
    setSlideDirection(direction === 'forward' ? 'left' : 'right');
    setVisible(false);
    setTimeout(() => {
      setStep(nextStep);
      setSlideDirection(direction === 'forward' ? 'right' : 'left');
      setVisible(true);
    }, 250);
  };

  const handleBack = () => {
    if (step === 0 && onBack) {
      onBack();
    } else {
      goToStep(step - 1, 'backward');
    }
  };

  const handleComplete = () => {
    const filters: QuizFilters = {};
    if (demographics.length > 0) filters.demographics = demographics;
    if (categoryTags.length > 0) filters.categoryTags = categoryTags;
    if (resourceTypes.length > 0) filters.resourceTypes = resourceTypes;
    onComplete(filters);
  };

  const transitionStyle: React.CSSProperties = {
    transition: 'opacity 250ms ease, transform 250ms ease',
    opacity: visible ? 1 : 0,
    transform: visible
      ? 'translateX(0)'
      : slideDirection === 'left'
        ? 'translateX(-24px)'
        : 'translateX(24px)',
  };

  const questions = [
    {
      questionNumber: 1,
      title: "Which best describes who this resource is for?",
      subtitle: "Select all that apply, or skip to see everything.",
      options: filterOptions.demographics,
      selected: demographics,
      onToggle: (o: string) => toggle(demographics, setDemographics, o),
      onSelectAll: () => selectAll(filterOptions.demographics, demographics, setDemographics),
      onNext: () => goToStep(1, 'forward'),
      multiSelect: false,
      isLast: false,
    },
    {
      questionNumber: 2,
      title: "What are you seeking support for?",
      subtitle: "Select all that apply — choose as many as you need.",
      options: filterOptions.categoryTags,
      selected: categoryTags,
      onToggle: (o: string) => toggle(categoryTags, setCategoryTags, o),
      onSelectAll: () => selectAll(filterOptions.categoryTags, categoryTags, setCategoryTags),
      onNext: () => goToStep(2, 'forward'),
      multiSelect: true,
      isLast: false,
    },
    {
      questionNumber: 3,
      title: "What kind of resources are you looking for?",
      subtitle: "Select all that apply — choose as many as you need.",
      options: filterOptions.resourceTypes,
      selected: resourceTypes,
      onToggle: (o: string) => toggle(resourceTypes, setResourceTypes, o),
      onSelectAll: () => selectAll(filterOptions.resourceTypes, resourceTypes, setResourceTypes),
      onNext: handleComplete,
      multiSelect: true,
      isLast: true,
    },
  ];

  const current = questions[step];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAF1' }}>
      <ProgressBar step={step} total={3} onBack={handleBack} />
      <div style={transitionStyle}>
        <QuizQuestion
          questionNumber={current.questionNumber}
          totalQuestions={3}
          title={current.title}
          subtitle={current.subtitle}
          options={current.options}
          selected={current.selected}
          onToggle={current.onToggle}
          onSelectAll={current.onSelectAll}
          onNext={current.onNext}
          onBack={handleBack}
          multiSelect={current.multiSelect}
          isLast={current.isLast}
        />
      </div>
    </div>
  );
}
