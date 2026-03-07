import { useState } from "react";
import type { Resource } from "@/lib/notion";
import { ResourceCard } from "./ResourceCard";

interface ResourceGridProps {
  resources: Resource[];
}

const RESULTS_PER_PAGE = 24;

const sizePattern: Array<"normal" | "wide" | "tall" | "large"> = [
  "wide", "normal", "normal", "tall",
  "normal", "normal", "wide", "normal",
  "normal", "normal",
];

export function ResourceGrid({ resources }: ResourceGridProps) {
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE);

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-6">
        <h2 className="font-display text-3xl md:text-5xl font-medium tracking-[-0.04em] mb-4 text-center">
          No resources found
        </h2>
        <p className="font-body text-muted-foreground text-center max-w-md">
          Try adjusting your filters or search query to discover more resources.
        </p>
      </div>
    );
  }

  const visible = resources.slice(0, visibleCount);
  const hasMore = visibleCount < resources.length;

  return (
    <div className="px-6 md:px-16 lg:px-24 py-16">
      <div style={{ columnCount: 2, columnGap: '1.5rem' }} className="md:[column-count:3] lg:[column-count:4]">
        {visible.map((resource, i) => (
          <div
            key={resource.id}
            className="animate-fade-in break-inside-avoid mb-6"
            style={{ animationDelay: `${Math.min(i, 12) * 80}ms`, animationFillMode: 'both' }}
          >
            <ResourceCard
              resource={resource}
              size="normal"
              index={i}
            />
          </div>
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => setVisibleCount(v => v + RESULTS_PER_PAGE)}
            className="border border-border px-8 py-3 font-body text-sm font-semibold shadow-brutal bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full active:scale-[0.97]"
          >
            Load More ({resources.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}
