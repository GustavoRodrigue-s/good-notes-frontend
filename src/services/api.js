// Default request api

const api = {
   baseUrl: 'http://192.168.0.2:5000/',

   headers: {
      "Content-Type": "application/json"
   },

   async request({ method, route, body }) {

      const currentUrl = `${api.baseUrl}${route}${api.apiKey ? api.apiKey : ''}`;

      const options = {
         method: method || "GET",
         headers: api.headers
      }

      if (body) {
         options.body = JSON.stringify(body);
      }

      const response = await fetch(currentUrl, options);

      if (!response.ok) {
         throw `Http error, status: ${response.status}`;
      }

      return response.json();
   }
}

export default api