import cookie from "../components/cookie/cookie.js";

const createApiNetwork = () => {
   const state = {
      baseUrl: 'http://192.168.0.2:5000/',
      headers: {
         "Content-Type": "application/json"
      }
   }

   const setAuthorization = () => {
      const { accessToken, refreshToken, apiKey } = cookie.getCookies();
   
      state.headers["Authorization"] = `${accessToken};${refreshToken}`;
      state.apiKey = `?key=${apiKey}`;
   }

   const getData = async ({ auth, method, route, body }) => {
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
      props.auth = !props.auth ? false : true;

      const shouldGetDatas = async (resolve, reject) => {
         const [data, status] = await getData(props);

         if (!data.newAccessToken) {
            resolve([data, status]);
         } else {
            cookie.setNewAccessToken(data.newAccessToken);
            shouldGetDatas(resolve, reject)
         }
      }

      return new Promise(shouldGetDatas);
   }

   return {
      request
   }
}

const api = createApiNetwork();

export default api