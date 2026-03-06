import { useState, useRef, useEffect } from "react";
import { QuizQuestion } from "./QuizQuestion";
import type { FilterOptions, QuizFilters } from "@/lib/notion";

interface QuizProps {
  filterOptions: FilterOptions;
  onComplete: (filters: QuizFilters) => void;
  onExit: () => void;
}

export function Quiz({ filterOptions, onComplete, onExit }: QuizProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animating, setAnimating] = useState(false);
  const [demographics, setDemographics] = useState<string[]>([]);
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  const toggle = (list: string[], setter: (v: string[]) => void, item: string) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  };

  const selectAll = (options: string[], current: string[], setter: (v: string[]) => void) => {
    setter(current.length === options.length ? [] : [...options]);
  };

  const goTo = (next: number) => {
    setDirection(next > step ? "forward" : "back");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
    }, 250);
  };

  const handleComplete = () => {
    const filters: QuizFilters = {};
    if (demographics.length > 0) filters.demographics = demographics;
    if (categoryTags.length > 0) filters.categoryTags = categoryTags;
    if (resourceTypes.length > 0) filters.resourceTypes = resourceTypes;
    onComplete(filters);
  };

  const slideClass = animating
    ? direction === "forward"
      ? "animate-slide-out-left"
      : "animate-slide-out-right"
    : direction === "forward"
      ? "animate-slide-in-right"
      : "animate-slide-in-left";

  const questions = [
    {
      title: "Which best describes who this resource is for?",
      subtitle: "Select all that apply, or skip to see everything.",
      options: filterOptions.demographics,
      selected: demographics,
      onToggle: (o: string) => toggle(demographics, setDemographics, o),
      onSelectAll: () => selectAll(filterOptions.demographics, demographics, setDemographics),
      onNext: () => goTo(1),
      onBack: onExit,
    },
    {
      title: "What are you seeking support for?",
      subtitle: "Select all that apply — choose as many as you need.",
      options: filterOptions.categoryTags,
      selected: categoryTags,
      onToggle: (o: string) => toggle(categoryTags, setCategoryTags, o),
      onSelectAll: () => selectAll(filterOptions.categoryTags, categoryTags, setCategoryTags),
      onNext: () => goTo(2),
      onBack: () => goTo(0),
      multiSelect: true,
    },
    {
      title: "What kind of resources are you looking for?",
      subtitle: "Select all that apply — choose as many as you need.",
      options: filterOptions.resourceTypes,
      selected: resourceTypes,
      onToggle: (o: string) => toggle(resourceTypes, setResourceTypes, o),
      onSelectAll: () => selectAll(filterOptions.resourceTypes, resourceTypes, setResourceTypes),
      onNext: handleComplete,
      onBack: () => goTo(1),
      isLast: true,
      multiSelect: true,
    },
  ];

  const q = questions[step];

  return (
    <div className="overflow-hidden">
      <div key={step} className={slideClass}>
        <QuizQuestion
          questionNumber={step + 1}
          totalQuestions={3}
          title={q.title}
          subtitle={q.subtitle}
          options={q.options}
          selected={q.selected}
          onToggle={q.onToggle}
          onSelectAll={q.onSelectAll}
          onNext={q.onNext}
          onBack={q.onBack}
          isLast={q.isLast}
          multiSelect={q.multiSelect}
        />
      </div>
    </div>
  );
}
