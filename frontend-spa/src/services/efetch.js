
export async function efetch(url, options = {}) {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    let isFormData = options.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
      if (options.body && typeof options.body === 'object' && !(options.body instanceof String)) {
        options.body = JSON.stringify(options.body);
      }
    }

    const defaultOptions = {
      method: 'GET',
      headers,
      ...options,
    };

    const response = await fetch(url, defaultOptions);

    if (!response.ok) {
      if (response.status === 401 && token) {
        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') }),
          });
          if (refreshResponse.ok) {
            const { token: newToken } = await refreshResponse.json();
            localStorage.setItem('token', newToken);
            defaultOptions.headers.Authorization = `Bearer ${newToken}`;
            return await fetch(url, defaultOptions).then((res) => {
              if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}, body: ${JSON.stringify(res.json())}`);
              }
              return res.json();
            });
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status}, body: ${JSON.stringify(errorBody)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request Failed: ', error);
    throw error;
  }
}
