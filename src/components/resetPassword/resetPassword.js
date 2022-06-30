export default function createResetPassword(confirmationCode) {
   const state = {
      wrapper: document.querySelector('.popup-wrapper-reset-password')
   }

   function createForm({ api, cookie }) {
      const state = {
         form: document.querySelector('.popup-wrapper-reset-password form')
      }

      const showOrHideLoading = showOrHide => {
         state.form.btnSubmit.classList[showOrHide]('loading');
      }

      const handleError = {
         showError(message) {
            // handleSuccess.hideSuccess();

            const containerError = state.form.querySelector('.container-recover-account-error');
            const error = containerError.querySelector('span');

            const acceptedErrors = {
               'request error'() {
                  error.innerText = 'Houve um erro, tente novamente!';
               }
            }

            containerError.classList.add('show');
            state.emailConfirmationForm.classList.add('error');

            acceptedErrors[message] 
               ? acceptedErrors[message]() 
               : acceptedErrors['request error']();
         }
      }  

      const handleSuccess = {

      }

      const handleConfirmEmail = token => {
         cookie.setCookie('emailConfirmationToken', token);

         hidePopup();
         setTimeout(confirmationCode.showPopup, 300);

         confirmationCode.subscribe('submit', ({ resetPassword }) => resetPassword());
         // confirmationCode.subscribe('resend', resendEmailCode => resendEmailCode({ email }));
         confirmationCode.subscribe('success', () => setTimeout(showPopup, 300));

         confirmationCode.subscribe('hidden popup', () => setTimeout(showPopup, 300));
      }

      const forgotPassword = async credentials => {
         showOrHideLoading('add');

         try {
            const [data, status] = await api.request({
               method: 'PUT',
               route: 'forgotPassword',
               body: credentials
            })

            showOrHideLoading('remove');

            console.log(data, status);

            if (status !== 200) {
               // handleError.showError(data.reason);
               return
            }
            
            handleConfirmEmail(data.userData.emailConfirmationToken, credentials);

         } catch (e) {
            console.log(e);
            showOrHideLoading('remove');
         }
      }

      const handleSubmitForm = e => {
         e.preventDefault();
         
         const { inputEmail, inputPassword } = state.form;

         const email = inputEmail.value.trim();
         const newPassword = inputPassword.value.trim();

         forgotPassword({ email, password: newPassword });
      }
      
      state.form.addEventListener('submit', handleSubmitForm);
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
                        <input type="email" name="inputEmail" class="input-default" placeholder=" " autocomplete="off" />
                        <label for="input-email" class="label-input-default">E-mail</label>
                     </div>
                     <div class="container-inputs">
                        <input type="password" name="inputPassword" class="input-default input-password" placeholder=" " autocomplete="off" />
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