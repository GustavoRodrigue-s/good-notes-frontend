import api from '../services/api.js';
import cookie from '../components/cookie/cookie.js';

function createAuthProvider() {
   const state = {
      observers: [],
      authenticated: false,
      loading: document.querySelector('body > .container-loading')
   }

   const subscribe = (event, listener) => {
      state.observers.push({ event, listener });
   }

   const notifyAll = (event, data) => {
      const listeners = state.observers.filter(observer => observer.event === event);

      for (const { listener } of listeners) {
         listener(data);
      }
   }

   const removeLoading = () => {
      setTimeout(() => state.loading.classList.remove('show'), 300);
   }

   const redirectUserAsLoggedOut = () => {
      cookie.deleteCookies();
   
      notifyAll('redirectingUserAsLoggedOut', { api, cookie, authenticated: false });
   
      cookie.shouldShowThePopup();

      removeLoading();
   }

   const redirectUserAsLoggedIn = () => {
      notifyAll('redirectingUserAsLoggedIn', { api, cookie, authenticated: true });

      removeLoading();
   }

   const validateTokens = async () => {
      try {
         const [data, status] = await api.request({ auth: true, route: "auth" });

         if(status === 401 || status === 403) {
            throw 'The tokens is not valid.';
         }

         state.authenticated = true;
         redirectUserAsLoggedIn();

      } catch (e) {
         console.log(e);
         redirectUserAsLoggedOut();
      }
   }

   const verifyAuth = async () => {
      const shouldLog = dispatch.shouldLogTheUser();

      shouldLog
         ? redirectUserAsLoggedOut()
         : await validateTokens();

      return state.authenticated 
   }

   const dispatch = {
      shouldLogTheUser() {
         const { accessToken, refreshToken, apiKey } = cookie.getCookies();
      
         const itemConnected = localStorage.getItem('keepConnected');
         const keepConnected = itemConnected && JSON.parse(itemConnected);
         
         const itemSession = sessionStorage.getItem('USER_FIRST_SESSION');
         const userFirstSession = itemSession && JSON.parse(itemSession);

         // if not has tokens and api key or is not first session of user and he doesn't want to keep connected...
         return !accessToken && !refreshToken && !apiKey || !userFirstSession && !keepConnected
      }
   }

   return {
      subscribe,
      verifyAuth
   }
}

export default createAuthProvider