/** Short display labels for resource type tags on mobile/tablet */
export const SHORT_LABELS: Record<string, string> = {
  "Exercises + Reflection Prompts": "Exercises",
  "Community Connection Support": "Community",
  "Online Resources / App": "Online / App",
  "One-on-One Support with a Practitioner": "1:1 Support",
};

export function getShortLabel(tag: string): string {
  return SHORT_LABELS[tag] || tag;
}
