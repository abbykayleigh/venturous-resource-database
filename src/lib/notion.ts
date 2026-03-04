import { supabase } from "@/integrations/supabase/client";

export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  link: string;
  description: string;
  demographics: string[];
  categoryTags: string[];
  image: string;
}

export interface FilterOptions {
  demographics: string[];
  categoryTags: string[];
  resourceTypes: string[];
}

export interface QuizFilters {
  demographics?: string[];
  categoryTags?: string[];
  resourceTypes?: string[];
}

export async function getFilterOptions(): Promise<FilterOptions> {
  const { data, error } = await supabase.functions.invoke('notion-resources', {
    body: { action: 'get-filter-options' },
  });
  if (error) throw error;
  return data as FilterOptions;
}

export async function queryResources(
  filters?: QuizFilters,
  searchQuery?: string
): Promise<Resource[]> {
  const { data, error } = await supabase.functions.invoke('notion-resources', {
    body: { action: 'query', filters, searchQuery },
  });
  if (error) throw error;
  return data.results as Resource[];
}
