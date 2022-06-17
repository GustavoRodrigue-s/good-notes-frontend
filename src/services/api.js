import cookie from "../components/cookie/cookie.js";

function createApiNetwork() {
   const state = {
      baseUrl: 'http://192.168.0.3:5000/',
      headers: {
         "Content-Type": "application/json"
      }
   }

   const setSessionAuthorization = () => {
      const { accessToken, refreshToken } = cookie.getAuthCookies();
   
      state.headers["Authorization"] = `${accessToken};${refreshToken}`;
   }

   const requestTemplate = async ({ auth, method, route, body }) => {
      if (auth) {
         setSessionAuthorization();
      }

      const currentUrl = `${state.baseUrl}${route}`;

      const options = {
         method: method,
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
         try {
            const [data, status] = await requestTemplate(props);

            dispatch.shouldGetTheDataAgain({ data, status, res, rej, getData });

         } catch (e) {
            rej(e);
         }
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