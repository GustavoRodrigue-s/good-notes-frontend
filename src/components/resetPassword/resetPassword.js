export default function createResetPassword() {
   const state = {
      wrapper: document.querySelector('.popup-wrapper-reset-password')
   }

   const showPopup = () => {
      state.wrapper.classList.add('show');
   }

   const hidePopup = () => {
      state.wrapper.classList.remove('show');
   }

   const render = () => {
      const template = `
      <div class="popup-overlay overlay-reset-password" data-action="hide">
         <div class="popup popup-reset-password">
            <div class="close">
               <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="hide">
                  <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
               </button>
            </div>
            <div>
               <div>
                  <h1>Recuperar Conta</h1>
               </div>
               <div>
                  <p>
                     Nós enviaremos um e-mail de confirmação para redefinir a senha.
                  </p>
               </div>
            </div>
            <div class="container-form">
               <form>
                  <div class="containers-inputs">
                     <div class="container-inputs">
                        <input type="email" name="inputEmail" class="input-default" id="input-email" placeholder=" " autocomplete="off" />
                        <label for="input-email" class="label-input-default">E-mail</label>
                     </div>
                     <div class="container-inputs">
                        <input type="password" name="inputPassword" class="input-default input-password" id="input-password" placeholder=" " autocomplete="off" />
                        <label for="input-password" class="label-input-default">Nova senha</label>
                        <a class="btn-eyes" data-action="togglePasswordEye">
                           <i class="eye-password" data-action="togglePasswordEye"></i>
                           <i class="no-eye-password" data-action="togglePasswordEye"></i>
                        </a>
                     </div>
                  </div>
                  <div class="container-btn">
                     <button type="submit" class="btn-default btn-default-hover">Redefinir senha</button>
                  </div>
               </form>
            </div>
         </div>
      </div>
      `;

      state.wrapper.innerHTML = template;
   }

   const acceptedPopupAction = {
      hide() {
         hidePopup();
      },
      togglePasswordEye(btn) {
         const inputPassword = btn.parentElement.parentElement.firstElementChild;
         
         const typeInput = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
         inputPassword.setAttribute('type', typeInput);

         btn.parentElement.classList.toggle('show');
      }
   }

   const wrapperListener = e => {
      const action = e.target.dataset.action;

      acceptedPopupAction[action]?.(e.target);
   }

   state.wrapper.addEventListener('pointerup', wrapperListener);

   return { 
      render,
      showPopup
   }
}