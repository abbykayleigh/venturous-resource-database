const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const DATABASE_ID = 'f9fad373547c4a73896fe9c3149a5b51';
    const { action, filters, searchQuery } = await req.json();

    if (action === 'get-filter-options') {
      // Fetch all valid entries to extract unique filter values
      const allEntries = await fetchAllEntries(NOTION_API_KEY, DATABASE_ID);
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
        if (props['Resource Type']?.select?.name) {
          resourceTypes.add(props['Resource Type'].select.name);
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
      const allEntries = await fetchAllEntries(NOTION_API_KEY, DATABASE_ID);
      let results = allEntries;

      // Apply quiz filters (AND across questions, OR within)
      if (filters) {
        if (filters.demographics?.length > 0) {
          results = results.filter((page: any) => {
            const vals = page.properties.Demographics?.multi_select?.map((s: any) => s.name) || [];
            return filters.demographics.some((d: string) => vals.includes(d));
          });
        }
        if (filters.categoryTags?.length > 0) {
          results = results.filter((page: any) => {
            const vals = page.properties['Category Tags']?.multi_select?.map((s: any) => s.name) || [];
            return filters.categoryTags.some((c: string) => vals.includes(c));
          });
        }
        if (filters.resourceTypes?.length > 0) {
          results = results.filter((page: any) => {
            const val = page.properties['Resource Type']?.select?.name || '';
            return filters.resourceTypes.includes(val);
          });
        }
      }

      // Apply search
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
        resourceType: page.properties['Resource Type']?.select?.name || '',
        link: page.properties.Link?.url || '',
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

async function fetchAllEntries(apiKey: string, dbId: string) {
  const allResults: any[] = [];
  let startCursor: string | undefined;

  do {
    const body: any = {
      filter: {
        and: [
          { property: 'Capture', checkbox: { equals: true } },
          { property: 'To Be Confirmed', checkbox: { equals: false } },
        ],
      },
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
