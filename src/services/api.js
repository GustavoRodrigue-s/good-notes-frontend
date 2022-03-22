import { getCookies } from "../auth/auth.js";


const api = {
   baseUrl: 'https://good-notes-backend.herokuapp.com/',

   async request({ method, route, body, auth }) {

      const cookies = auth ? getCookies() : "";

      const currentUrl = auth ? `${api.baseUrl}${route}?key=${cookies.apiKey}` : api.baseUrl + route;

      const requestOptions = {
         "method": method || "GET",
         headers: {
            "Content-Type": "application/json"
         }
      }

      if(body) requestOptions.body = JSON.stringify(body);

      if(auth) {
         requestOptions.headers["Authorization"] = `${cookies.accessToken};${cookies.refreshToken}`;
      } 

      const response = await fetch(currentUrl, requestOptions);

      if(!response.ok) {
         throw `Http error, status: ${response.status}`;
      }

      return response.json();
   }
}

export default api