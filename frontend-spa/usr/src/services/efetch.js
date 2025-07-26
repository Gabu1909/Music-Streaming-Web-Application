export async function efetch(url, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
    }

    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error('API Request Failed:', { url, error });
    throw error;
  }
}
