import { useState } from "react";
import { QuizQuestion } from "./QuizQuestion";
import type { FilterOptions, QuizFilters } from "@/lib/notion";

interface QuizProps {
  filterOptions: FilterOptions;
  onComplete: (filters: QuizFilters) => void;
}

export function Quiz({ filterOptions, onComplete }: QuizProps) {
  const [step, setStep] = useState(0);
  const [demographics, setDemographics] = useState<string[]>([]);
  const [categoryTags, setCategoryTags] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  const toggle = (
    list: string[],
    setter: (v: string[]) => void,
    item: string
  ) => {
    setter(
      list.includes(item) ? list.filter((i) => i !== item) : [...list, item]
    );
  };

  const selectAll = (
    options: string[],
    current: string[],
    setter: (v: string[]) => void
  ) => {
    if (current.length === options.length) {
      setter([]);
    } else {
      setter([...options]);
    }
  };

  const handleComplete = () => {
    const filters: QuizFilters = {};
    if (demographics.length > 0) filters.demographics = demographics;
    if (categoryTags.length > 0) filters.categoryTags = categoryTags;
    if (resourceTypes.length > 0) filters.resourceTypes = resourceTypes;
    onComplete(filters);
  };

  if (step === 0) {
    return (
      <QuizQuestion
        questionNumber={1}
        totalQuestions={3}
        title="Which best describes who this resource is for?"
        subtitle="Select all that apply, or skip to see everything."
        options={filterOptions.demographics}
        selected={demographics}
        onToggle={(o) => toggle(demographics, setDemographics, o)}
        onSelectAll={() => selectAll(filterOptions.demographics, demographics, setDemographics)}
        onNext={() => setStep(1)}
      />
    );
  }

  if (step === 1) {
    return (
      <QuizQuestion
        questionNumber={2}
        totalQuestions={3}
        title="What are you seeking support for?"
        subtitle="Select all that apply — choose as many as you need."
        options={filterOptions.categoryTags}
        selected={categoryTags}
        onToggle={(o) => toggle(categoryTags, setCategoryTags, o)}
        onSelectAll={() => selectAll(filterOptions.categoryTags, categoryTags, setCategoryTags)}
        onNext={() => setStep(2)}
        onBack={() => setStep(0)}
        multiSelect
      />
    );
  }

  return (
    <QuizQuestion
      questionNumber={3}
      totalQuestions={3}
      title="What kind of resources are you looking for?"
      subtitle="Select all that apply — choose as many as you need."
      options={filterOptions.resourceTypes}
      selected={resourceTypes}
      onToggle={(o) => toggle(resourceTypes, setResourceTypes, o)}
      onSelectAll={() => selectAll(filterOptions.resourceTypes, resourceTypes, setResourceTypes)}
      onNext={handleComplete}
      onBack={() => setStep(1)}
      isLast
      multiSelect
    />
  );
}
