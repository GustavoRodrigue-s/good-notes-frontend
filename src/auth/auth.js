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

   const unauthenticated = () => {
      cookie.deleteCookies();
   
      notifyAll('unauthenticated', { api, cookie, authenticated: false });
   
      cookie.shouldShowThePopup();

      removeLoading();
   }

   const authenticated = () => {
      notifyAll('authenticated', { api, cookie, authenticated: true });

      removeLoading();
   }

   const validateTokens = async () => {
      try {
         const [data, status] = await api.request({ auth: true, route: "auth" });

         if(status === 401 || status === 403) {
            throw 'The tokens is not valid.';
         }

         state.authenticated = true;
         authenticated();

      } catch (e) {
         console.log(e);
         unauthenticated();
      }
   }

   const verifyAuth = async () => {
      const shouldLog = dispatch.shouldLogTheUser();

      shouldLog
         ? await validateTokens()
         : unauthenticated();

      return state.authenticated 
   }

   const dispatch = {
      shouldLogTheUser() {
         const { accessToken, refreshToken } = cookie.getCookies();
      
         const itemConnected = localStorage.getItem('keepConnected');
         const keepConnected = itemConnected && JSON.parse(itemConnected);
         
         const itemSession = sessionStorage.getItem('USER_FIRST_SESSION');
         const userFirstSession = itemSession && JSON.parse(itemSession);

         // rever essa regra de negócio
         const shouldLog = accessToken && refreshToken || userFirstSession && keepConnected

         return shouldLog
      }
   }

   return {
      subscribe,
      verifyAuth
   }
}

export default createAuthProvider