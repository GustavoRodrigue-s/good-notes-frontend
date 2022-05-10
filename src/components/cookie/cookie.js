function createCookieHandler() {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-cookie')
   }

   const setNewAccessToken = newToken => {
      document.cookie = `accessToken = ${newToken} ; path=/`;
   }

   const setCookies = ({ accessToken, refreshToken, apiKey }) => {
      document.cookie = `apiKey = ${apiKey} ; path=/`;
      document.cookie = `accessToken = ${accessToken} ; path=/`;
      document.cookie = `refreshToken = ${refreshToken} ; path=/`;
   
      window.open('./index.html', '_self');
   }

   const getCookies = () => {
      const cookies = document.cookie.split('; ').join('=').split('=');
   
      const accessToken = cookies[cookies.indexOf('accessToken') + 1];
      const refreshToken = cookies[cookies.indexOf('refreshToken') + 1];
      const apiKey = '' || cookies[cookies.indexOf('apiKey') + 1];
   
      return { accessToken, refreshToken, apiKey }
   }

   const deleteCookies = () => {
      document.cookie = `accessToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `refreshToken = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      document.cookie = `apiKey = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

      localStorage.removeItem('keepConnected');
      sessionStorage.clear();
   }

   const renderPopup = () => {
      const cookieContent = `
         <div class="popup-overlay">
            <div class="popup-cookie popup">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0">
                     <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
                  </button>
               </div>
               <div class="header">
                  <div class="title">
                     <h1>Cookies</h1>
                     <img src="./images/cookie_icon.svg" alt="ícone de cookie">
                  </div>
               </div>
               <div class="main-content">
                  <div>
                     <p>
                        Nós utilizamos cookies para melhorar a sua experiência em nossa plataforma. Os cookies armazenam informações sobre a sua conta, não se preocupe, seus dados não são visíveis e estão seguros.
                     </p>
                  </div>
                  <div class="more-information">
                     <p>
                        Para mais informações, considere ler a nossa <a href="#" tabindex="0" class="contrast">Política de Cookies.</a>
                     </p>
                  </div>
               </div>
               <div class="container-btn" tabindex="-1">
                  <button class="accept-cookies btn-default btn-default-hover" tabindex="0">Aceitar Cookies</button>
               </div>
            </div>
         </div>
      `;

      state.popupWrapper.innerHTML = cookieContent;
   }

   const hidePopup = () => {
      state.popupWrapper.classList.remove('show');

      localStorage.setItem('cookieConfirm', 'ok');
   }

   const showPopup = () => {
      renderPopup();

      requestAnimationFrame(() => state.popupWrapper.classList.add('show'));
   }

   const popupActionListener = e => {
      const targetClass = e.target.classList[0];

      dispatch.shouldHideThePopup(targetClass);
   }

   const dispatch = {
      shouldShowThePopup() {
         const cookieConfirm = localStorage.getItem('cookieConfirm');
         
         !cookieConfirm && showPopup();
      },
      shouldHideThePopup(targetClass) {
         const listToClosePopup = ['close-popup-target', 'accept-cookies'];
         const shouldHide = listToClosePopup.includes(targetClass);

         shouldHide && hidePopup();
      }
   }

   state.popupWrapper.addEventListener('click', popupActionListener);

   return {
      setCookies,
      setNewAccessToken,
      getCookies,
      deleteCookies,
      shouldShowThePopup: dispatch.shouldShowThePopup
   }
}

const cookie = createCookieHandler();

export default cookie