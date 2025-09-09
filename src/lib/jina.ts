interface PerplexityOptions {
  model?: string;
  stream?: boolean;
  reasoning_effort?: "low" | "medium" | "high";
}

export async function callPerplexityAPI(query: string, options: PerplexityOptions = {}) {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing PERPLEXITY_API_KEY environment variable");
  }

  const requestData = JSON.stringify({
    model: options.model ?? "sonar-deep-research",
    messages: [
      {
        role: "user",
        content: query,
      },
    ],
    stream: options.stream ?? false,
    reasoning_effort: options.reasoning_effort ?? "medium",
  });

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "User-Agent": "PerplexityDeepSearchApp/1.0",
      },
      body: requestData,
    });

    if (!response.ok) {
      let errorMessage = `Perplexity API request failed: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error?.message || errorMessage;
      } catch {
        // If we can't parse the error response, use the default message
      }

      switch (response.status) {
        case 401:
          errorMessage = "Authentication failed: Invalid API key";
          break;
        case 402:
          errorMessage = "Payment required: API quota exceeded or billing issue.";
          break;
        case 403:
          errorMessage = "Forbidden: Access denied to the API";
          break;
        case 429:
          errorMessage = "Rate limit exceeded: Too many requests. Please wait and try again.";
          break;
        case 500:
          errorMessage = "Server error: The API service is experiencing issues";
          break;
        case 503:
          errorMessage = "Service unavailable: The API service is temporarily down";
          break;
      }
      
      const err = new Error(errorMessage) as Error & { status?: number };
      err.status = response.status;
      throw err;
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to Perplexity API service. Please check your internet connection.");
    }
    throw error;
  }
}


