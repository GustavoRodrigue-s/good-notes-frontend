import api from '../services/api.js';
import renderHeader from "../components/header/renderHeader.js";
import renderPopupForms from "../components/popupForms/renderPopup.js";
import renderPopupCookie from '../components/cookie/cookie.js'; 
import renderPopupEditProfile from '../components/popupProfile/renderPopup.js';

// create, get and delete cookies.
export const getCookies = () => {
   const cookies = document.cookie.split('; ').join('=').split('=');

   const accessToken = cookies[cookies.indexOf('accessToken') + 1];
   const refreshToken = cookies[cookies.indexOf('refreshToken') + 1];
   const apiKey = '' || cookies[cookies.indexOf('apiKey') + 1];

   return { accessToken, refreshToken, apiKey }
}

export const createCookie = ({ accessToken, refreshToken }, apiKey) => {
   document.cookie = `apiKey = ${apiKey} ; path=/`;
   document.cookie = `accessToken = ${accessToken} ; path=/`;
   document.cookie = `refreshToken = ${refreshToken} ; path=/`;

   window.open('./index.html', '_self');
}

export const deleteCookies = () => {
   document.cookie = `accessToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
   document.cookie = `refreshToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
   document.cookie = `apiKey = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

   localStorage.clear();
   sessionStorage.clear();
}

const redirectUserAsLoggedOut = () => {
   deleteCookies();

   renderHeader(false);
   renderPopupForms(api);
   renderPopupCookie();

   setTimeout(() => {
      document.querySelector('.container-loading').classList.toggle('show');
      document.querySelector('.popup-wrapper-cookie').classList.add('show');
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
         renderPopupEditProfile(api);

         setTimeout(() => 
            document.querySelector('.container-loading').classList.toggle('show'), 300
         );
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