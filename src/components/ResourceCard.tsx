import { useState } from "react";
import type { Resource } from "@/lib/notion";

interface ResourceCardProps {
  resource: Resource;
  size?: "normal" | "wide" | "tall" | "large";
}

export function ResourceCard({ resource, size = "normal" }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    normal: "",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  };

  const imageUrl = resource.image && !imgError ? resource.image : null;

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group border bg-card hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-150 flex flex-col overflow-hidden rounded-2xl ${sizeClasses[size]}`}
      style={{ borderColor: '#3f3c18', boxShadow: '4px 4px 0px #3f3c18' }}
      onClick={(e) => {
        if (expanded) {
          e.preventDefault();
        }
      }}
    >
      {imageUrl && (
        <div className="w-full h-40 md:h-48 overflow-hidden border-b" style={{ borderColor: '#3f3c18' }}>
          <img
            src={imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      )}

      {!imageUrl && (
        <div className="w-full h-40 md:h-48 border-b flex items-center justify-center" style={{ backgroundColor: '#a6afc5', borderColor: '#3f3c18' }}>
          <span className="font-body text-sm font-semibold text-white uppercase tracking-wider text-center px-4">
            {resource.resourceType || resource.name.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display text-lg md:text-xl font-medium leading-tight tracking-[-0.02em]">
            {resource.name}
          </h3>
        </div>

        {resource.resourceType && (
          <span className="inline-block self-start border px-2 py-0.5 text-xs font-body font-semibold uppercase tracking-wider mb-3 rounded-full bg-accent text-accent-foreground" style={{ borderColor: '#3f3c18' }}>
            {resource.resourceType}
          </span>
        )}

        {resource.description && (
          <div className="flex-1">
            <p
              className={`font-body text-sm text-muted-foreground leading-relaxed ${
                !expanded ? "line-clamp-2" : ""
              }`}
            >
              {resource.description}
            </p>
            {resource.description.length > 100 && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpanded(!expanded);
                }}
                className="font-body text-xs font-semibold text-primary mt-1 hover:underline"
              >
                {expanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
