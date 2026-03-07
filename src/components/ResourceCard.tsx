import { useState, useEffect, useRef } from "react";
import type { Resource } from "@/lib/notion";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";

import fallbackDefault from "@/assets/fallback/default.jpg";
import fallbackBook from "@/assets/fallback/book.jpg";
import fallbackPodcast from "@/assets/fallback/podcast.jpg";
import fallbackVideo from "@/assets/fallback/video.jpg";
import fallbackOnlineResource from "@/assets/fallback/online-resource.jpg";
import fallbackExercises from "@/assets/fallback/exercises.jpg";
import fallbackOneOnOne from "@/assets/fallback/one-on-one.jpg";
import fallbackCommunity from "@/assets/fallback/community.jpg";

const FALLBACK_IMAGES: Record<string, string> = {
  "Book": fallbackBook,
  "Podcast": fallbackPodcast,
  "Video": fallbackVideo,
  "Online Resources / App": fallbackOnlineResource,
  "Exercises + Reflection Prompts": fallbackExercises,
  "One-on-One Support with a Practitioner": fallbackOneOnOne,
  "Community Connection Support": fallbackCommunity,
};

function getFallbackImage(tags: string[]): string {
  for (const tag of tags) {
    if (FALLBACK_IMAGES[tag]) return FALLBACK_IMAGES[tag];
  }
  return fallbackDefault;
}

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
  const [modalOpen, setModalOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [microlinkImage, setMicrolinkImage] = useState<string | null>(null);
  const [microlinkLoaded, setMicrolinkLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);


  // IntersectionObserver: only fetch Microlink when visible
  useEffect(() => {
    if (!cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { rootMargin: '200px' }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (resource.image) { setMicrolinkLoaded(true); return; }
    if (!resource.link) { setMicrolinkLoaded(true); return; }

    fetch(`https://api.microlink.io?url=${encodeURIComponent(resource.link)}&screenshot=true&meta=true`)
      .then(res => res.json())
      .then(data => {
        const img = data?.data?.image?.url || data?.data?.screenshot?.url || null;
        if (img) setMicrolinkImage(img);
        setMicrolinkLoaded(true);
      })
      .catch(() => setMicrolinkLoaded(true));
  }, [isVisible, resource.image, resource.link]);

  const imageUrl = resource.image && !imgError
    ? resource.image
    : microlinkImage && !imgError
      ? microlinkImage
      : null;

  const tags = resource.resourceTypes || [];
  const primaryTag = tags[0] || resource.name.charAt(0);

  return (
    <>
      <div
        ref={cardRef}
        onClick={() => setModalOpen(true)}
        className={`cursor-pointer group border bg-card flex flex-col overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-[3px] active:scale-[0.97]`}
        style={{
          borderColor: '#3f3c18',
          boxShadow: '4px 4px 0px #3f3c18',
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
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tags.map((tag, i) => {
                const color = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <span
                    key={tag}
                    className="inline-block text-xs font-body font-semibold uppercase tracking-wider rounded-full"
                    style={{ backgroundColor: color.bg, color: color.text, padding: '5px 12px' }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}

          {resource.description && (
            <div className="flex-1">
              <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {resource.description}
              </p>
              {resource.description.length > 100 && (
                <span className="font-body text-xs font-semibold text-primary mt-1 hover:underline">
                  Read more
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl p-0 border bg-card" style={{ borderColor: '#3f3c18', borderRadius: '16px', boxShadow: '4px 4px 0px #3f3c18', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#FAFAF1' }}>
          <DialogTitle className="sr-only">{resource.name}</DialogTitle>
          {imageUrl ? (
            <img src={imageUrl} alt={resource.name} className="w-full h-56 md:h-72 object-cover" style={{ borderRadius: '16px 16px 0 0' }} />
          ) : (
            <div className="w-full h-56 md:h-72 flex items-center justify-center" style={{ backgroundColor: '#a6afc5', borderRadius: '16px 16px 0 0' }}>
              <span className="font-body text-lg font-semibold text-white uppercase tracking-wider">{primaryTag}</span>
            </div>
          )}
          <div className="p-6 space-y-4">
            <h2 className="font-display text-2xl md:text-3xl font-medium tracking-[-0.02em]">{resource.name}</h2>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => {
                  const color = TAG_COLORS[i % TAG_COLORS.length];
                  return (
                    <span key={tag} className="inline-block text-xs font-body font-semibold uppercase tracking-wider rounded-full" style={{ backgroundColor: color.bg, color: color.text, padding: '5px 12px' }}>
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
            {resource.description && (
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{resource.description}</p>
            )}
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-body text-sm font-semibold shadow-brutal bg-primary text-primary-foreground hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all rounded-full active:scale-[0.97]"
            >
              View Resource <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
