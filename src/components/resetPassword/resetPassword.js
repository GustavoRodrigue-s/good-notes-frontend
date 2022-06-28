export default function createResetPassword(confirmationCode) {
   const state = {
      wrapper: document.querySelector('.popup-wrapper-reset-password')
   }

   function createForm({ api, cookie }) {
      const state = {
         form: document.querySelector('.popup-wrapper-reset-password form'),
         btnSubmit: document.querySelector('.popup-wrapper-reset-password .container-btn > button')
      }

      const showOrHideLoading = showOrHide => {
         state.btnSubmit.classList[showOrHide]('loading');
      }

      const sendEmailConfirmation = async email => {
         showOrHideLoading('add');

         try {
            const [data, status] = await api.request({
               method: 'PUT',
               route: 'sendEmailConfirmation',
               body: { email }
            })

            console.log(data, status);

            if (status !== 200) {
               throw data
            }

            cookie.setCookie('emailConfirmationToken', data.userData.emailConfirmationToken);

         } catch (e) {
            console.log(e);
         }
      }

      // por algum motivo a request está duplicando
      const handleSubmitForm = e => {
         console.log(e.type);

         e.preventDefault();

         const { inputEmail, inputPassword } = state.form;

         const email = inputEmail.value.trim();

         sendEmailConfirmation(email);
      }
      
      state.form.addEventListener('submit', handleSubmitForm);
      // state.btnSubmit.addEventListener('pointerup', handleSubmitForm);
   }

   const showPopup = () => {
      state.wrapper.classList.add('show');
   }

   const hidePopup = () => {
      state.wrapper.classList.remove('show');
   }

   const render = hooks => {
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
                     <button type="submit" name="btnSubmit" class="btn-default btn-default-hover">
                        Redefinir senha
                        <div class="container-btn-loading center-flex">
                           <div class="loading"></div>
                        </div>
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
      `;

      state.wrapper.innerHTML = template;

      createForm(hooks);
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