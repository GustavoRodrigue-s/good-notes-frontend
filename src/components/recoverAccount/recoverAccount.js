export default function createRecoverAccount(confirmationCode) {
   const state = {
      wrapper: document.querySelector('.popup-wrapper-reset-password'),
      formForgotPassword: null,
      previousPopup: null
   }
   

   function createForm({ api, cookie }) {
      const state = {
         form: document.querySelector('.popup-wrapper-reset-password form')
      }

      const showOrHideLoading = showOrHide => {
         state.form.btnSubmit.classList[showOrHide]('loading');
      }

      const handleErrors = {
         showInputError(input, message, containerInput) {
            const span = containerInput.querySelector('.container-error > span');

            span.innerText = "" || message;

            containerInput.classList.add('error');

            input.onkeydown = () => containerInput.classList.remove('error');
         },
         hideErrors() {
            const formError = state.form.querySelector('.container-recover-account-error');

            const [
               errorEmail, errorPassword
            ] = state.form.querySelectorAll('.input-and-message');

            errorEmail.classList.remove('error');
            errorPassword.classList.remove('error');

            formError.classList.remove('show');
         },
         showError(errors) {
            const acceptedErrors = {
               "empty input"({ input }) {
                  const currentInput = state.form[input];

                  handleErrors.showInputError(
                     currentInput,
                     'Preencha este campo!',
                     currentInput.parentElement.parentElement
                  );
               },
               "user not exists"() {
                  const currentInput = state.form.inputEmail;

                  handleErrors.showInputError(
                     currentInput,
                     'E-mail não encontrado!',
                     currentInput.parentElement.parentElement
                  )
               },
               "request error"() {
                  const errorMessage = state.form.querySelector('.container-recover-account-error');
                  errorMessage.classList.add('show');
               }
            }

            errors.forEach(data => {
               acceptedErrors[data.reason]
                  ? acceptedErrors[data.reason](data)
                  : acceptedErrors['request error']();
            });
         }
      }  

      const handleSuccess = {
         showOrHideSuccess(showOrHide) {
            const containerSuccess = state.form.querySelector('.container-recover-account-success');

            containerSuccess.classList[showOrHide]('show');
         }
      }

      const handleConfirmEmail = (token, credentials) => {
         cookie.setCookie('emailConfirmationToken', token);

         confirmationCode.setMessage('reset password');

         hidePopup();
         setTimeout(confirmationCode.showPopup, 300);

         confirmationCode.subscribe('submit', sendEmailCode => 
            sendEmailCode({
               endpoint: 'resetPassword',
               body: {} 
            })
         );
            
         confirmationCode.subscribe('resend', resendEmailCode => 
            resendEmailCode({
               endpoint: 'forgotPassword',
               body: credentials 
            })
         );

         confirmationCode.subscribe('success', () => {
            handleSuccess.showOrHideSuccess('add');
            setTimeout(showPopup, 300);
         });

         confirmationCode.subscribe('hidden popup', showPopup);
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

            if (status !== 200) {
               handleErrors.showError(data.errors);
               return
            }
            
            handleConfirmEmail(data.userData.emailConfirmationToken, credentials);

         } catch (e) {
            handleErrors.showError([{ reason: 'request error' }]);
            showOrHideLoading('remove');
         }
      }

      const handleSubmitForm = e => {
         e.preventDefault();
         
         handleSuccess.showOrHideSuccess('remove');
         handleErrors.hideErrors();

         const { inputEmail, inputPassword } = state.form;

         const email = inputEmail.value.trim();
         const newPassword = inputPassword.value.trim();

         forgotPassword({ email, password: newPassword });
      }
      
      state.form.addEventListener('submit', handleSubmitForm);

      return {
         hideErrors: handleErrors.hideErrors,
         hideSuccess: handleSuccess.showOrHideSuccess
      }
   }

   const resetPopup = () => {
      const formForgotPassword = state.wrapper.querySelector('form');

      const btnEye = formForgotPassword.querySelector('.btn-eyes');
      const inputPassword = formForgotPassword.inputPassword;

      formForgotPassword.reset();
      
      btnEye.classList.remove('show');
      inputPassword.setAttribute('type', 'password');

      state.formForgotPassword.hideErrors();
      state.formForgotPassword.hideSuccess('remove');
   }

   const showPopup = (previousPopup, shouldReset) => {
      state.previousPopup ??= previousPopup;

      shouldReset && resetPopup();

      const profileData = sessionStorage.getItem('profileData');

      if (profileData && shouldReset) {
         const { inputEmail } = state.wrapper.querySelector('form');
         const { email } = JSON.parse(profileData);
         
         inputEmail.value = email;
      }

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
                     Nós enviaremos um e-mail para confirmar sua nova senha.
                  </p>
               </div>
            </div>
            <div class="container-form">
               <form>
                  <div class="containers-inputs">
                     <div class="input-and-message">
                        <div class="container-inputs">
                           <input type="email" name="inputEmail" class="input-default" placeholder=" " autocomplete="off" />
                           <label for="input-email" class="label-input-default">E-mail</label>
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                     <div class="input-and-message">
                        <div class="container-inputs">
                           <input type="password" name="inputPassword" class="input-default input-password" placeholder=" " autocomplete="off" />
                           <label for="input-password" class="label-input-default">Nova senha</label>
                           <a class="btn-eyes" data-action="togglePasswordEye">
                              <i class="eye-password" data-action="togglePasswordEye"></i>
                              <i class="no-eye-password" data-action="togglePasswordEye"></i>
                           </a>
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                  </div>
                  <div class="container-recover-account-error container-message">
                     <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                     </svg>
                     <span>Houve um erro, tente novamente!</span>
                  </div>
                  <div class="container-recover-account-success container-message">
                     <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                     </svg>
                     <span>Sua senha foi alterada!</span>
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

      state.formForgotPassword = createForm(hooks);
   }

   const acceptedPopupAction = {
      hide() {
         hidePopup();

         if (state.previousPopup) {
            setTimeout(state.previousPopup.showPopup, 300);
         }
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