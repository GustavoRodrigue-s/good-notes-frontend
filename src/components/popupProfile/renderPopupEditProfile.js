import optionsMenuUser from "../userLoggedIn/optionsMenuUser.js";

const renderPopupEditProfile = apiUrl => {
   const popupWrapper = document.querySelector('.popup-wrapper-profile');

   const popup = `
      <div class="popup-overlay overlay-confirm-delete">
         <div class="popup-confirm-to-delete-account popup">
            <div class="close">
               <button class="close-sub-popup-target close-popup center-flex" tabindex="0">
                  <img class="close-sub-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
               </button>
            </div>
            <div class="popup-content">
               <div class="header">
                  <h1>Excluir conta</h1>
               </div>
               <div class="body">
                  <div class="texts">
                     <p>
                        A exclusão da conta é irreversível, seus dados e notas serão completamente apagados. Ao excluir sua conta, você será redirecionado para a página principal.
                     </p>
                     <p>
                        Tem certeza que você deseja excluir sua conta? Para confirmar digite o seu (<strong>Nome de usuário</strong>) abaixo.
                     </p>
                  </div>
                  <div class="controls">
                     <div class="container-input">
                        <input type="text" name="input-username" class="input-confirm-delete input-default" autocomplete="off">
                     </div>
                     <div class="buttons">
                        <button class="close-sub-popup-target btn-default btn-cancel-confirm">Cancelar</button>
                        <button type="submit" class="btn-default btn-delete-confirm">Excluir Conta</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="popup-overlay overlay-profile">
         <div class="popup-profile popup">
            <div class="close">
               <button class="close-popup-target close-popup center-flex" tabindex="0">
                  <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
               </button>
            </div>
            <div class="container-loading center-flex">
               <div></div>
            </div>
            <div class="popup-title">
               <h1>Configurações da conta</h1>
            </div>
            <div class="popup-edit-photo">
               <div class="container-photo">
                  <lord-icon
                     src="https://cdn.lordicon.com/dxjqoygy.json"
                     trigger="loop"
                     delay="3000"
                     colors="primary:#646369,secondary:#646369">
                  </lord-icon>
               </div>
               <div class="container-photo-contents">
                  <div class="photo-texts">
                     <div class="title-photo">
                        <h1>Foto de perfil
                     </div>
                     <div class="paragraph-photo">
                        <p>Arquivo aceito do tipo .png menos que 1MB.</p>
                     </div>
                  </div>
                  <div class="button-photo">
                     <button class="btn-submit btn-default">Enviar</button>
                  </div>
               </div>
            </div>
            <div class="popup-credentials">
               <form class="edit-profile-form">
                  <div class="input-and-message">
                     <div class="container-input">
                        <label for="input-username">Nome de usuário</label>
                        <input type="text" class="input-username input-default" id="input-username" value="" name="inputUsername" autocomplete="off">
                     </div>
                     <div class="container-error"></div>
                  </div>
                  <div class="input-and-message">
                     <div class="container-input">
                        <label for="input-email">Endereço de email</label>
                        <input type="email" class="input-email input-default" id="input-email" value="" name="inputEmail" autocomplete="off">  
                     </div>
                     <div class="container-error"></div>
                  </div>
                  <div>
                     <div class="container-success-profile container-message">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                           <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                        </svg>
                        Tudo certo! Seus dados foram atualizados.
                     </div>
                     <div class="container-error-profile container-message">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg> 
                        Houve um erro, faça o login novamente!
                     </div>
                  </div>
                  <div class="container-buttons">
                     <button type="submit" class="btn-update-credentials btn-default btn-default-hover">Salvar</button>
                     <button type="reset" class="btn-cancel btn-default">Cancelar</button>
                  </div>
               </form>
            </div>
            <div class="popup-disable-account">
               <div class="container-texts-popup">
                  <h1>Desative sua conta</h1>
                  <p>Informações sobre a sua conta serão apagadas.</p>
               </div>
               <div class="container-button-disable">
                  <button class="btn-delete btn-default">Desativar</button>
               </div>
            </div>
         </div>
      </div>
   ` ;

   popupWrapper.innerHTML = popup;

   optionsMenuUser(apiUrl);
}

export default renderPopupEditProfile;