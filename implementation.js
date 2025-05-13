async function jina_web_reader(params, userSettings) {
  const { url, includeImages = false, importToChat = true } = params;
  const { jinaApiKey } = userSettings;

  if (!url) {
    throw new Error('URL is required');
  }

  try {
    const response = await fetch(`https://r.jina.ai/${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`,
        'X-With-Links-Summary': 'true',
        'X-Retain-Images': includeImages.toString()
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}` );
    }

    const contentType = response.headers.get('content-type');

    let content;
    if (contentType.includes('application/json')) {
      content = await response.json();
    } else if (contentType.includes('text/html') || contentType.includes('text/plain')) {
      content = await response.text();
    } else {
      content = await response.blob();  // Handle binary data types or other formats
    }

    return content;

  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

// Basic SERP (no content, just links/titles)
async function jina_serp_search(params, userSettings) {
  const { query } = params;
  const { jinaApiKey } = userSettings;
  if (!query) throw new Error('Query is required');
  try {
    const response = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`,
        'X-Respond-With': 'no-content'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch SERP: ${response.statusText}`);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

// SERP with full results crawling
async function jina_serp_full_results(params, userSettings) {
  const { query } = params;
  const { jinaApiKey } = userSettings;
  if (!query) throw new Error('Query is required');
  try {
    const response = await fetch(`https://s.jina.ai/?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${jinaApiKey}`,
        'X-Engine': 'direct'
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch full SERP: ${response.statusText}`);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

// Deep Search
async function jina_deep_search(params, userSettings) {
  const { messages, reasoning_effort = "medium" } = params;
  const { jinaApiKey } = userSettings;
  if (!messages || !Array.isArray(messages)) throw new Error('Messages array is required');
  try {
    const response = await fetch('https://deepsearch.jina.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jinaApiKey}`
      },
      body: JSON.stringify({
        model: "jina-deepsearch-v1",
        messages,
        stream: false,
        reasoning_effort,
        max_attempts: 1,
        no_direct_answer: false
      })
    });
    if (!response.ok) throw new Error(`Failed to fetch deep search: ${response.statusText}`);
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text();
    }
  } catch (error) {
    throw new Error(`An error occurred: ${error.message}`);
  }
}

