const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NOTION_API_KEY = Deno.env.get('NOTION_API_KEY');
    if (!NOTION_API_KEY) {
      return new Response(JSON.stringify({ error: 'Notion API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const DATABASE_ID = '10c672f2adc04f3a9d3b272251bafd77';
    const { action, filters, searchQuery } = await req.json();

    // Base filter: Capture=true AND To Be Confirmed=false
    const baseFilter = {
      and: [
        { property: 'Capture', checkbox: { equals: true } },
        { property: 'To Be Confirmed', checkbox: { equals: false } },
      ] as any[],
    };

    if (action === 'get-filter-options') {
      const allEntries = await fetchAllEntries(NOTION_API_KEY, DATABASE_ID, baseFilter);
      const demographics = new Set<string>();
      const categoryTags = new Set<string>();
      const resourceTypes = new Set<string>();

      for (const page of allEntries) {
        const props = page.properties;
        if (props.Demographics?.multi_select) {
          for (const item of props.Demographics.multi_select) {
            demographics.add(item.name);
          }
        }
        if (props['Category Tags']?.multi_select) {
          for (const item of props['Category Tags'].multi_select) {
            categoryTags.add(item.name);
          }
        }
        if (props['Resource Type']?.multi_select) {
          for (const item of props['Resource Type'].multi_select) {
            resourceTypes.add(item.name);
          }
        }
      }

      return new Response(JSON.stringify({
        demographics: [...demographics].sort(),
        categoryTags: [...categoryTags].sort(),
        resourceTypes: [...resourceTypes].sort(),
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'query') {
      // Build Notion filter with quiz selections pushed server-side
      const notionFilter = { and: [...baseFilter.and] };

      if (filters) {
        if (filters.demographics?.length > 0) {
          notionFilter.and.push({
            or: filters.demographics.map((d: string) => ({
              property: 'Demographics',
              multi_select: { contains: d },
            })),
          } as any);
        }
        if (filters.categoryTags?.length > 0) {
          notionFilter.and.push({
            or: filters.categoryTags.map((c: string) => ({
              property: 'Category Tags',
              multi_select: { contains: c },
            })),
          } as any);
        }
        if (filters.resourceTypes?.length > 0) {
          notionFilter.and.push({
            or: filters.resourceTypes.map((r: string) => ({
              property: 'Resource Type',
              multi_select: { contains: r },
            })),
          } as any);
        }
      }

      const allEntries = await fetchAllEntries(NOTION_API_KEY, DATABASE_ID, notionFilter);
      let results = allEntries;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter((page: any) => {
          const name = getTitle(page.properties.Name) || '';
          const desc = getRichText(page.properties.Description) || '';
          return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
        });
      }

      const mapped = results.map((page: any) => ({
        id: page.id,
        name: getTitle(page.properties.Name),
        resourceTypes: page.properties['Resource Type']?.multi_select?.map((s: any) => s.name) || [],
        link: page.properties.Link?.url || getRichText(page.properties.Link) || '',
        description: getRichText(page.properties.Description),
        demographics: page.properties.Demographics?.multi_select?.map((s: any) => s.name) || [],
        categoryTags: page.properties['Category Tags']?.multi_select?.map((s: any) => s.name) || [],
        image: getFileUrl(page.properties.Image),
      }));

      return new Response(JSON.stringify({ results: mapped }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchAllEntries(apiKey: string, dbId: string, filter: any) {
  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const body: any = {
      filter,
      page_size: 100,
    };
    if (startCursor) body.start_cursor = startCursor;

    const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Notion API error: ${res.status} ${text}`);
    }

    const data = await res.json();
    allResults.push(...data.results);
    startCursor = data.has_more ? data.next_cursor : undefined;
  } while (startCursor);

  return allResults;
}

function getTitle(prop: any): string {
  if (!prop?.title) return '';
  return prop.title.map((t: any) => t.plain_text).join('');
}

function getRichText(prop: any): string {
  if (!prop?.rich_text) return '';
  return prop.rich_text.map((t: any) => t.plain_text).join('');
}

function getFileUrl(prop: any): string {
  if (!prop?.files?.length) return '';
  const file = prop.files[0];
  if (file.type === 'external') return file.external?.url || '';
  if (file.type === 'file') return file.file?.url || '';
  return '';
}
