import { useState, useEffect } from "react";
import type { Resource } from "@/lib/notion";
import { X, ExternalLink } from "lucide-react";

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

function ResourceModal({ resource, imageUrl, onClose }: {
  resource: Resource;
  imageUrl: string | null;
  onClose: () => void;
}) {
  const tags = resource.resourceTypes || [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      style={{ backgroundColor: 'rgba(63, 60, 24, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{
          backgroundColor: '#FAFAF1',
          borderColor: '#3f3c18',
          boxShadow: '8px 8px 0px #3f3c18',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full border flex items-center justify-center hover:bg-card transition-colors"
          style={{ borderColor: '#3f3c18', backgroundColor: '#eeefdf' }}
        >
          <X className="w-4 h-4" style={{ color: '#3f3c18' }} />
        </button>

        {imageUrl ? (
          <div className="w-full h-56 sm:h-72 overflow-hidden rounded-t-2xl border-b" style={{ borderColor: '#3f3c18' }}>
            <img src={imageUrl} alt={resource.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div
            className="w-full h-40 rounded-t-2xl border-b flex items-center justify-center"
            style={{ backgroundColor: '#a6afc5', borderColor: '#3f3c18' }}
          >
            <span className="font-body text-sm font-semibold text-white uppercase tracking-wider">
              {tags[0] || resource.name.charAt(0)}
            </span>
          </div>
        )}

        <div className="p-6 sm:p-8">
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-[-0.03em] leading-tight mb-4" style={{ color: '#3f3c18' }}>
            {resource.name}
          </h2>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag, i) => {
                const color = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <span
                    key={tag}
                    className="inline-block font-body font-semibold uppercase tracking-wider rounded-full"
                    style={{ backgroundColor: color.bg, color: color.text, fontSize: '0.7rem', padding: '4px 12px' }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {resource.description && (
            <p className="font-body text-base leading-relaxed mb-6" style={{ color: '#3f3c18' }}>
              {resource.description}
            </p>
          )}

          <a
            href={resource.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border px-6 py-3 font-body text-sm font-semibold rounded-full transition-all hover:translate-x-[2px] hover:translate-y-[2px] active:scale-[0.97]"
            style={{ borderColor: '#3f3c18', backgroundColor: '#55558d', color: '#ffffff', boxShadow: '3px 3px 0px #3f3c18' }}
          >
            <ExternalLink className="w-4 h-4" />
            View Resource
          </a>
        </div>
      </div>
    </div>
  );
}

export function ResourceCard({ resource, size = "normal", index = 0 }: ResourceCardProps) {
  const [imgError, setImgError] = useState(false);
  const [microlinkImage, setMicrolinkImage] = useState<string | null>(null);
  const [microlinkLoaded, setMicrolinkLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const sizeClasses = {
    normal: "",
    wide: "md:col-span-2",
    tall: "md:row-span-2",
    large: "md:col-span-2 md:row-span-2",
  };

  useEffect(() => {
    if (!resource.image && resource.link) {
      fetch(`https://api.microlink.io?url=${encodeURIComponent(resource.link)}&screenshot=true&meta=true`)
        .then(res => res.json())
        .then(data => {
          const img = data?.data?.image?.url || data?.data?.screenshot?.url;
          if (img) setMicrolinkImage(img);
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
    <>
      {modalOpen && (
        <ResourceModal resource={resource} imageUrl={imageUrl} onClose={() => setModalOpen(false)} />
      )}

      <div
        className={`group border bg-card flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-[3px] cursor-pointer ${sizeClasses[size]}`}
        style={{
          borderColor: '#3f3c18',
          boxShadow: '4px 4px 0px #3f3c18',
          animationDelay: `${index * 80}ms`,
          animationFillMode: 'both',
        }}
        onClick={() => setModalOpen(true)}
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
          <h3 className="font-display text-lg md:text-xl font-medium leading-tight tracking-[-0.02em] mb-3">
            {resource.name}
          </h3>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag, i) => {
                const color = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <span
                    key={tag}
                    className="inline-block font-body font-semibold uppercase tracking-wider rounded-full"
                    style={{ backgroundColor: color.bg, color: color.text, fontSize: '0.7rem', padding: '4px 12px' }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {resource.description && (
            <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {resource.description}
            </p>
          )}

          <span className="font-body text-xs font-semibold text-primary mt-2 hover:underline self-start">
            Read more
          </span>
        </div>
      </div>
    </>
  );
}import { useState, useEffect } from "react";
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
    <a
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
