// Default request api

const api = {
   baseUrl: 'https://good-notes-backend.herokuapp.com/',

   headers: {
      "Content-Type": "application/json"
   },

   async request({ method, route, body }) {

      const currentUrl = `${api.baseUrl}${route}${api.apiKey ? api.apiKey : ''}`;

      const options = {
         "method": method || "GET",
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