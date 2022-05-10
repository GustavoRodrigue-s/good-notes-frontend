import api from '../services/api.js';
import cookie from '../components/cookie/cookie.js';
import header from "../components/header/header.js";
import authPopupForms from '../components/popupForms/authPopupForms.js';
import renderPopupEditProfile from '../components/popupProfile/renderPopup.js';

function createAuthProvider() {
   const state = {
      authenticated: false,
      loading: document.querySelector('body > .container-loading')
   }

   const removeLoading = () => {
      setTimeout(() => state.loading.classList.remove('show'), 300);
   }

   // trocar para observers
   const redirectUserAsLoggedOut = () => {
      cookie.deleteCookies();
   
      header.render(false);
      authPopupForms.render({ api, cookie });
   
      cookie.shouldShowThePopup();
      removeLoading();
   }

   const redirectUserAsLoggedIn = () => {
      header.render(true);
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

// depois instacinar o provider no index, para usar o observer
const auth = createAuthProvider();

export default auth