import type { Resource } from "@/lib/notion";
import { ResourceCard } from "./ResourceCard";

interface ResourceGridProps {
  resources: Resource[];
}

const sizePattern: Array<"normal" | "wide" | "tall" | "large"> = [
  "wide",
  "normal",
  "normal",
  "tall",
  "normal",
  "normal",
  "wide",
  "normal",
  "normal",
  "normal",
];

export function ResourceGrid({ resources }: ResourceGridProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 md:px-16 lg:px-24 py-16">
      {resources.map((resource, i) => (
        <ResourceCard
          key={resource.id}
          resource={resource}
          size={sizePattern[i % sizePattern.length]}
        />
      ))}
    </div>
  );
}
