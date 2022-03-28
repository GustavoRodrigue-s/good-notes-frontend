import api from '../services/api.js';
import renderHeader from "../components/header/renderHeader.js";
import renderPopupForms from "../components/popupForms/renderPopup.js";
import renderPopupCookie from '../components/popupCookie/cookie.js'; 
import renderPopupEditProfile from '../components/popupProfile/renderPopup.js';
import { getCookies, createCookies, deleteCookies } from '../services/cookie.js';

const containerLoading = document.querySelector('.container-loading');


const redirectUserAsLoggedOut = () => {
   deleteCookies();

   renderHeader(false);
   renderPopupForms({ api, createCookies });
   
   const cookieConfirm = localStorage.getItem('cookieConfirm');

   !cookieConfirm && renderPopupCookie();

   setTimeout(() => {
      containerLoading.classList.toggle('show');
      
      if (!cookieConfirm) {
         document.querySelector('.popup-wrapper-cookie').classList.add('show');
      }
   }, 300);
}

const verifyTheTokens = async () => {
   try {
      const { accessToken, refreshToken, apiKey } = getCookies();

      api.headers["Authorization"] = `${accessToken};${refreshToken}`;
      api.apiKey = `?key=${apiKey}`;

      const [data, status] = await api.request({ auth: true, route: "required" });

      if(status === 401 || status === 403) {
         throw 'The tokens is not valid.';
      }

      if(data.newAccessToken) {
         document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
         
         verifyTheTokens();
      }

      if(status === 200) {
         renderHeader(true);
         renderPopupEditProfile({ api, deleteCookies });

         setTimeout(() => containerLoading.classList.toggle('show'), 300);
      }
      
   }catch(e) {
      redirectUserAsLoggedOut();
   }
}

const { accessToken, refreshToken } = getCookies();


const itemConnected = localStorage.getItem('keepConnected');
const keepConnected = itemConnected && JSON.parse(itemConnected);

const itemSession = sessionStorage.getItem('USER_FIRST_SESSION');
const user_first_session = itemSession && JSON.parse(itemSession);


!accessToken && !refreshToken || !user_first_session && !keepConnected
   ? redirectUserAsLoggedOut()
   : verifyTheTokens();