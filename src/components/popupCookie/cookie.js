const popupWrapper = document.querySelector('.popup-wrapper-cookie');

const closePopupCookie = () => {
   popupWrapper.addEventListener('click', e => {
      const firstClassOfTheTargetElement = e.target.classList[0];

      const listToClosePopup = ['close-popup-target', 'accept-cookies'];

      const toClose = listToClosePopup.includes(firstClassOfTheTargetElement);

      if(toClose) {
         popupWrapper.classList.remove('show');

         setTimeout(() => popupWrapper.remove(), 500);

         localStorage.setItem('cookieConfirm', 'ok');
      }
   });
}

const renderPopupCookie = () => {
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
   `
   popupWrapper.innerHTML = cookieContent;

   closePopupCookie();

   setTimeout(() => popupWrapper.classList.add('show'), 0);
}

export default renderPopupCookie;