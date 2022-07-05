function createCookieHandler() {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-cookie')
   }

   const setCookie = (name, value) => {
      document.cookie = `${name} = ${value} ; path=/`;
   }

   const deleteCookie = name => {
      document.cookie = `${name} = ; Path=/ ; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
   }

   const getCookie = name => {
      const cookies = document.cookie.split('; ').join('=').split('=');

      return cookies.includes(name) ? cookies[cookies.indexOf(name) + 1] : undefined
   }

   const setAuthCookies = ({ accessToken, refreshToken }) => {
      setCookie('accessToken', accessToken);
      setCookie('refreshToken', refreshToken);

      window.open('./index.html', '_self');
   }

   const getAuthCookies = () => {
      const cookies = document.cookie.split('; ').join('=').split('=');

      const accessToken = cookies[cookies.indexOf('accessToken') + 1];
      const refreshToken = cookies[cookies.indexOf('refreshToken') + 1];
   
      return { accessToken, refreshToken }
   }

   const deleteCookies = () => {
      deleteCookie('accessToken');
      deleteCookie('refreshToken');

      localStorage.removeItem('keepConnected');
      localStorage.removeItem('sessionEmail');
      sessionStorage.clear();
   }

   const renderPopup = () => {
      const cookieContent = `
         <div class="popup-overlay">
            <div class="popup-cookie popup">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="shouldHideThePopup">
                     <img class="close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
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
                  <button class="accept-cookies btn-default btn-default-hover" tabindex="0" data-action="shouldHideThePopup">Aceitar Cookies</button>
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

   const dispatch = {
      shouldShowThePopup() {
         const cookieConfirm = localStorage.getItem('cookieConfirm');
         
         !cookieConfirm && showPopup();
      },
      shouldHideThePopup() {
         hidePopup();
      }
   }

   const popupActionListener = e => {
      const action = e.target.dataset.action;

      dispatch[action]?.();
   }

   state.popupWrapper.addEventListener('pointerup', popupActionListener);

   return {
      getCookie,
      setCookie,
      deleteCookie,
      setAuthCookies,
      getAuthCookies,
      deleteCookies,
      shouldShowThePopup: dispatch.shouldShowThePopup
   }
}

const cookie = createCookieHandler();

export default cookie