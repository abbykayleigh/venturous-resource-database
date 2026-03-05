import { useState, useEffect } from "react";
import type { Resource } from "@/lib/notion";

interface ResourceCardProps {
  resource: Resource;
  size?: "normal" | "wide" | "tall" | "large";
  index?: number;
}

const TAG_COLORS = [
  { bg: '#55558d', text: '#ffffff' },
  { bg: '#bc4322', text: '#ffffff' },
  { bg: '#a6afc5', text: '#3f3c18' },
  { bg: '#3f3c18', text: '#ffffff' },
];

export function ResourceCard({ resource, size = "normal", index = 0 }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [microlinkImage, setMicrolinkImage] = useState<string | null>(null);
  const [microlinkLoaded, setMicrolinkLoaded] = useState(false);

  const sizeClasses = {
    normal: "",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  };

  useEffect(() => {
    if (!resource.image && resource.link) {
      fetch(`https://api.microlink.io?url=${encodeURIComponent(resource.link)}`)
        .then(res => res.json())
        .then(data => {
          if (data?.data?.image?.url) {
            setMicrolinkImage(data.data.image.url);
          }
          setMicrolinkLoaded(true);
        })
        .catch(() => setMicrolinkLoaded(true));
    } else {
      setMicrolinkLoaded(true);
    }
  }, [resource.image, resource.link]);

  const imageUrl = resource.image && !imgError
    ? resource.image
    : microlinkImage && !imgError
      ? microlinkImage
      : null;

  const tags = resource.resourceTypes || [];
  const primaryTag = tags[0] || resource.name.charAt(0);

  return (
    
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className={`group border bg-card flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-[3px] active:scale-[0.97] ${sizeClasses[size]}`}
      style={{
        borderColor: '#3f3c18',
        boxShadow: '4px 4px 0px #3f3c18',
        animationDelay: `${index * 80}ms`,
        animationFillMode: 'both',
      }}
      onClick={(e) => {
        if (expanded) e.preventDefault();
      }}
    >
      {imageUrl ? (
        <div className="w-full h-40 md:h-48 overflow-hidden border-b" style={{ borderColor: '#3f3c18' }}>
          <img
            src={imageUrl}
            alt={resource.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full h-40 md:h-48 border-b flex items-center justify-center" style={{ backgroundColor: '#a6afc5', borderColor: '#3f3c18' }}>
          <span className="font-body text-sm font-semibold text-white uppercase tracking-wider text-center px-4">
            {primaryTag}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-display text-lg md:text-xl font-medium leading-tight tracking-[-0.02em]">
            {resource.name}
          </h3>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag, i) => {
              const color = TAG_COLORS[i % TAG_COLORS.length];
              return (
                <span
                  key={tag}
                  className="inline-block font-body font-semibold uppercase tracking-wider rounded-full"
                  style={{
                    backgroundColor: color.bg,
                    color: color.text,
                    fontSize: '0.7rem',
                    padding: '4px 12px',
                  }}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {resource.description && (
          <div className="flex-1">
            <p className={`font-body text-sm text-muted-foreground leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
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
