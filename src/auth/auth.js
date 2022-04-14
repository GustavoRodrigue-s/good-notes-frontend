import api from '../services/api.js';
import renderHeader from "../components/header/renderHeader.js";
import renderPopupForms from "../components/popupForms/renderPopup.js";
import renderPopupCookie from '../components/popupCookie/cookie.js'; 
import renderPopupEditProfile from '../components/popupProfile/renderPopup.js';
import { getCookies, createCookies, deleteCookies } from '../services/cookie.js';

class AuthProvider {
   constructor() {
      this.authenticated = false;
   }

   async verifyAuth() {
      const containerLoading = document.querySelector('body > .container-loading');

      const redirectUserAsLoggedOut = () => {
         deleteCookies();
      
         renderHeader(false);
         renderPopupForms({ api, createCookies });
         
         const cookieConfirm = localStorage.getItem('cookieConfirm');
      
         !cookieConfirm && renderPopupCookie();
      
         setTimeout(() => {
            containerLoading.classList.remove('show');
            
            if (!cookieConfirm) {
               document.querySelector('.popup-wrapper-cookie').classList.add('show');
            }
         }, 300);
      }
      
      const redirectUserAsLoggedIn = () => {
         this.authenticated = true;

         renderHeader(true);
         renderPopupEditProfile({ api, deleteCookies });
      
         setTimeout(() => containerLoading.classList.remove('show'), 300);
      }
      
      const validateTokens = async () => {
         try {
            const { accessToken, refreshToken, apiKey } = getCookies();
      
            api.headers["Authorization"] = `${accessToken};${refreshToken}`;
            api.apiKey = `?key=${apiKey}`;
      
            const [data, status] = await api.request({ auth: true, route: "auth" });
      
            if(status === 401 || status === 403) {
               throw 'The tokens is not valid.';
            }
      
            if (data.newAccessToken) {
               document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;

               return true
            }

            redirectUserAsLoggedIn();
            
         } catch (e) {
            redirectUserAsLoggedOut();
         }
      }
      
      const { accessToken, refreshToken, apiKey } = getCookies();
      
      const itemConnected = localStorage.getItem('keepConnected');
      const keepConnected = itemConnected && JSON.parse(itemConnected);
      
      const itemSession = sessionStorage.getItem('USER_FIRST_SESSION');
      const user_first_session = itemSession && JSON.parse(itemSession);
      
      
      // if not has tokens and api key or is not first session of user and he doesn't want to keep connected...
      if (!accessToken && !refreshToken && !apiKey || !user_first_session && !keepConnected) {
         redirectUserAsLoggedOut();
      } else {
         const hasNewAccessToken = await validateTokens();
         hasNewAccessToken && await validateTokens();
      }

      return
   }
}

export default AuthProvider