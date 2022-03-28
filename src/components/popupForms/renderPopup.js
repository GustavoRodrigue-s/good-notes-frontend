import popupFormInit from "./popup.js";

const renderPopupForms = someFunctions => {
   const popupWrapper = document.querySelector('.popup-wrapper-auth');

   const popupContent = `
      <div class="popup-overlay overlay-signIn">
         <div class="popup-signIn popup popup-forms">
            <div class="container-loading center-flex">
               <div></div>
            </div>
            <div class="popup-content">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0">
                     <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
                  </button>
               </div>
               <div class="container-form-title">
                  <h1>Olá!</h1>
                  <h2>Faça seu login aqui.</h2>
               </div>
               <form class="form-signIn">
                  <div class="input-and-message">
                     <div class="container-inputEmail container-inputs">
                        <input type="text" name="inputEmail" id="inputEmail" placeholder=" " class="input-email input-form input-default" autocomplete="off" autofocus>
                        <label for="inputEmail" class="label-input-default">E-mail / Nome</label>
                     </div>
                     <div class="container-error"></div>
                  </div>
                  
                  <div class="input-and-message">
                     <div class="container-inputPassword container-inputs">
                        <input type="password" name="inputPassword" id="inputPassword" placeholder=" " class="input-password input-form input-default" autocomplete="off" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password show"></i>
                           <i class="no-eye-password"></i>
                        </a>
                     </div>
                     <div class="container-error last"></div>
                  </div>

                  <div class="orthers-form-options">
                     <div class="container-inputCheckbox">
                        <label>
                           <input type="checkbox" checked class="center-flex checkbox-default" name="inputCheckbox">
                           Manter conectado
                        </label>
                     </div>
                     <div class="container-forgot-password">
                        <span class="prominent-span" tabindex="0">Esqueceu a senha?</span>
                     </div>
                  </div>

                  <div class="input-and-message generic-container">
                     <div class="container-error generic-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg> 
                        Houve um erro, tente novamente!
                     </div>
                  </div>

                  <div class="container-buttonSubmit">
                     <button type="submit" class="btn-default btn-default-hover">Entrar</button>
                  </div>
               </form>
               <div class="container-hasAccount">
                  <p>
                     Não tem uma conta? 
                     <span class="create-account-span prominent-span toggle-form" data-js="1" role="Change Form" arial-label="Trocar para o formulário Cadastrar" tabindex="0">Criar Conta</span>
                  </p>
               </div>
            </div>
         </div>
      </div>

      <div class="popup-overlay overlay-signUp">
         <div class="popup-signUp popup popup-forms">
            <div class="container-loading center-flex">
               <div></div>
            </div>
            <div class="popup-content">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0">
                     <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
                  </button>
               </div>
               <div class="container-form-title">
                  <h1>Bem-vindo!</h1>
                  <h2>Faça seu registro aqui.</h2>
               </div>
               <form class="form-signUp">
                  <div class="input-and-message">
                     <div class="container-input-username container-inputs">
                        <input type="text" name="inputUsername" placeholder=" " class="input-username input-form input-default" autocomplete="off">
                        <label for="inputUsername" class="label-input-default">Nome do Usuário</label> 
                     </div>
                     <div class="container-error"></div>
                  </div>

                  <div class="input-and-message">
                     <div class="container-inputEmail container-inputs">
                        <input type="email" name="inputEmail" placeholder=" " class="input-email input-form input-default" autocomplete="off">
                        <label for="inputEmail" class="label-input-default">E-mail</label>
                     </div>
                     <div class="container-error"></div>
                  </div>

                  <div class="container-inputs-password input-and-message">
                     <div class="container-inputs">
                        <input type="password" name="inputPassword" placeholder=" " class="input-password input-form input-default inputs-passwords" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password show"></i>
                           <i class="no-eye-password"></i>
                        </a>
                     </div>
                     <div class="container-inputs">
                        <input type="password" name="inputConfirmPassword" placeholder=" " class="input-password input-form input-default inputs-passwords" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Confirmar Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password show"></i>
                           <i class="no-eye-password"></i>
                        </a>
                     </div>
                     <div class="container-error"></div>
                  </div>

                  <div class="container-info-terms">
                     <p>
                        Registrando-se no Good Notes, sua conta é<span>logada automaticamente.</span>
                     </p>
                  </div>

                  <div class="input-and-message generic-container">
                     <div class="container-error generic-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg> 
                        Houve um erro, tente novamente!
                     </div>
                  </div>

                  <div class="container-buttonSubmit">
                     <button type="submit" class="btn-default btn-default-hover">Criar Conta</button>
                  </div>
               </form>
               <div class="container-hasAccount">
                  <p>
                     Eu já tenho uma conta.
                     <span class="access-account-span prominent-span toggle-form" data-js="0" role="Change Form" arial-label="Trocar para o formulário Entrar" tabindex="0">Entrar</span>
                  </p>
               </div>
            </div>
         </div>
      </div>
   `;

   popupWrapper.innerHTML = popupContent;

   popupFormInit(someFunctions);
}

export default renderPopupForms; 