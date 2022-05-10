import cookie from "../components/cookie/cookie.js";

function createApiNetwork() {
   const state = {
      baseUrl: 'http://192.168.0.3:5000/',
      headers: {
         "Content-Type": "application/json"
      }
   }

   const setAuthorization = () => {
      const { accessToken, refreshToken, apiKey } = cookie.getCookies();
   
      state.headers["Authorization"] = `${accessToken};${refreshToken}`;
      state.apiKey = `?key=${apiKey}`;
   }

   const requestTemplate = async ({ auth, method, route, body }) => {
      if (auth) {
         setAuthorization();
      }

      const currentUrl = `${state.baseUrl}${route}${state.apiKey ? state.apiKey : ''}`;

      const options = {
         method: method || "GET",
         headers: state.headers
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

   const request = async props => {
      const getData = async (res, rej) => {
         const [data, status] = await requestTemplate(props);

         dispatch.shouldGetTheDataAgain({ data, status, res, rej, getData });
      }

      return new Promise(getData);
   }

   const dispatch = {
      shouldGetTheDataAgain({ data, status, res, rej, getData }) {
         if (!data.newAccessToken) {
            res([data, status]);
         } else {
            cookie.setNewAccessToken(data.newAccessToken);
            getData(res, rej);
         }
      }
   }

   return {
      request
   }
}

const api = createApiNetwork();

export default api