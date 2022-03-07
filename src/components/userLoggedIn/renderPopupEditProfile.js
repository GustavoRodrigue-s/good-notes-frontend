const renderPopupEditProfile = () => {
   const popupWrapper = document.querySelector('.popup-wrapper-profile');

   const popup = `
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
                     <div>
                        <label>Nome do usuário</label>
                        <input type="text" class="input-default" value="" name="inputUsername" autocomplete="off">    
                     </div>
                     <div>
                        <label>Endereço de email</label>
                        <input type="email" class="input-default" value="" name="inputEmail" autocomplete="off">  
                     </div>
                     <div class="container-error-profile">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg> 
                        Houve um erro, faça o login novamente!
                     </div>
                     <div class="container-buttons">
                        <button type="submit" class="btn-submit btn-default btn-default-hover">Salvar</button>
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
                     <button class="btn-default">Desativar</button>
                  </div>
            </div>
         </div>
      </div>
   ` ;

   popupWrapper.innerHTML = popup;
}

export default renderPopupEditProfile;