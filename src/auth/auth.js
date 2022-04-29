import api from '../services/api.js';
import cookie from '../components/cookie/cookie.js';
import renderHeader from "../components/header/renderHeader.js";
import renderPopupForms from "../components/popupForms/renderPopup.js";
import renderPopupEditProfile from '../components/popupProfile/renderPopup.js';

const createAuthProvider = () => {
   const state = {
      authenticated: false,
      loading: document.querySelector('body > .container-loading')
   }

   const removeLoading = () => {
      setTimeout(() => state.loading.classList.remove('show'), 300);
   }

   const redirectUserAsLoggedOut = () => {
      cookie.deleteCookies();
   
      renderHeader(false);
      renderPopupForms({ api, cookie });
   
      cookie.shouldShowThePopup();
      removeLoading();
   }

   const redirectUserAsLoggedIn = () => {
      renderHeader(true);
      renderPopupEditProfile({ api, cookie });
   
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
      verifyAuth
   }
}

const auth = createAuthProvider();

export default auth