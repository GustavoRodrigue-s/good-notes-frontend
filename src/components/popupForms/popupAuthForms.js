function createPopupAuthForms(confirmationCode, recoverAccount) {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-auth')
   }

   const hidePopup = () => {
      state.popupWrapper.classList.remove('show');
   }

   const showPopup = () => {
      state.popupWrapper.classList.add('show');
   }

   function createForm({ api, cookie }) {
      const state = {
         formSignIn: document.querySelector('.form-signIn'),
         formSignUp: document.querySelector('.form-signUp')
      }

      const handleErrors = {
         showInputError(input, message, containerInput) {
            const span = containerInput.querySelector('.container-error > span');

            span.innerText = "" || message;

            containerInput.classList.add('error');
         
            input.onkeydown = () => containerInput.classList.remove('error');
         },
         hideErrors(form) {
            const errorForm = form.querySelector('.generic-container');
            const inputErrors = form.querySelectorAll('.input-and-message.error');
   
            errorForm.classList.remove('error');

            inputErrors.forEach(error => error.classList.remove('error'));
         },
         showError(error, currentForm) {
            const acceptedErrors = {
               "empty input"({ input }) {
                  const currentInput = state[currentForm][input];
   
                  handleErrors.showInputError(
                     currentInput,
                     'Preencha este campo!',
                     currentInput.parentElement.parentElement
                  );
               },
               "empty inputs"() {
                  const { inputPassword, inputConfirmPassword } = state.formSignUp;
         
                  handleErrors.showInputError(
                     inputPassword,
                     'Preencha os dois campos!',
                     inputPassword.parentElement.parentElement   
                  );

                  handleErrors.showInputError(
                     inputConfirmPassword,
                     'Preencha os dois campos!',
                     inputConfirmPassword.parentElement.parentElement   
                  );
               },
               "wrong credentials"() {
                  const { inputEmail, inputPassword } = state.formSignIn;
         
                  state.formSignIn.classList.add('error');

                  handleErrors.showInputError(
                     inputPassword,
                     'Email ou senha incorretos!',
                     inputPassword.parentElement.parentElement
                  );
         
                  const removeError = () => {
                     state.formSignIn.classList.remove('error');
                     inputEmail.parentElement.parentElement.classList.remove('error');
                     inputPassword.parentElement.parentElement.classList.remove('error');
                  }
         
                  inputEmail.onkeydown = removeError;
                  inputPassword.onkeydown = removeError;
               },
               "invalid email"() {
                  handleErrors.showInputError(
                     state.formSignUp.inputEmail,
                     'Digite um e-mail válido!',
                     state.formSignUp.inputEmail.parentElement.parentElement
                  );
               },
               "username already exists"() {
                  handleErrors.showInputError(
                     state.formSignUp.inputUsername,
                     'Este nome já existe!',
                     state.formSignUp.inputUsername.parentElement.parentElement
                  );
               },
               "email already exists"() {
                  handleErrors.showInputError(
                     state.formSignUp.inputEmail,
                     "Este email já existe!",
                     state.formSignUp.inputEmail.parentElement.parentElement
                  );
               },
               "differents passwords"() {
                  const { inputPassword, inputConfirmPassword } = state.formSignUp;
         
                  handleErrors.showInputError(
                     inputPassword,
                     'Senhas diferentes!',
                     inputPassword.parentElement.parentElement
                  );

                  handleErrors.showInputError(
                     inputConfirmPassword,
                     'Senhas diferentes!',
                     inputConfirmPassword.parentElement.parentElement
                  );
               },
               "request error"() {
                  const error = state[currentForm].querySelector('.generic-container');
                  error.classList.add('error');
               }
            }
   
            error.forEach(data => {
               acceptedErrors[data.reason] 
                  ? acceptedErrors[data.reason](data)
                  : acceptedErrors['request error']();
            });
         }
      }

      const loadings = {
         btnSignIn(showOrHide) {
            state.formSignIn.querySelector('button[type="submit"]').classList[showOrHide]('loading');
         },
         btnSignUp(showOrHide) {
            state.formSignUp.querySelector('button[type="submit"]').classList[showOrHide]('loading');
         }
      }
   
      const formsData = {
         getFormSignInData() {
            const { inputEmail, inputPassword, inputCheckbox } = state.formSignIn;

            return {
               email: inputEmail.value.trim(),
               password: inputPassword.value.trim(),
               keepConnected: inputCheckbox.checked
            }
         },
         getFormSignUpData() {
            const { 
               inputUsername, inputEmail, inputPassword, inputConfirmPassword 
            } = state.formSignUp;

            return {
               username: inputUsername.value.trim(),
               email: inputEmail.value.trim(),
               password: inputPassword.value.trim(),
               confirmPassword:  inputConfirmPassword.value.trim(),
               keepConnected: true
            }
         }
      }

      const setUserSession = data => {
         localStorage.removeItem('sessionEmail');

         sessionStorage.setItem('USER_FIRST_SESSION', true);

         cookie.setAuthCookies(data);
      }

      const setUserNotActivated = data => {
         cookie.setCookie('emailConfirmationToken', data.emailConfirmationToken);
   
         confirmationCode.setMessage('activate account');

         hidePopup();
         setTimeout(confirmationCode.showPopup, 300);

         confirmationCode.subscribe('submit', sendEmailCode => {
            const keepConnected = JSON.parse(localStorage.getItem('keepConnected'));

            sendEmailCode({ 
               endpoint: 'activateAccount',
               body: { keepConnected } 
            });
         });

         confirmationCode.subscribe('resend', resendEmailCode => 
            resendEmailCode({
               endpoint: 'sendEmailToActivateAccount',
               body: { email: data.sessionEmail }
            })
         );

         confirmationCode.subscribe('success', data => setUserSession(data.userData));
         confirmationCode.subscribe('hidden popup', () => setTimeout(showPopup, 300));
      }

      const submitForm = async ({ route, body, form, loading }) => {
         try {
            loading('add');
   
            const [data, status] = await api.request({
               method: "POST",
               route,
               body
            });

            loading('remove');

            if (data.errors) {
               handleErrors.showError(data.errors, form);
               return
            }

            if (status !== 200 && status !== 301) {
               throw `Http error, status: ${status}`;
            }

            localStorage.setItem('keepConnected', JSON.stringify(body.keepConnected));
            dispatch.shouldLogUser(data);

         } catch (e) {
            loading('remove');
            handleErrors.showError([{ state: 'error', reason: 'request error' }], form);
         }
      }

      const prepareSignInRequest = e => {
         e.preventDefault();

         state.formSignIn.classList.remove('error');
         handleErrors.hideErrors(state.formSignIn);

         const data = formsData.getFormSignInData();
   
         submitForm({ 
            route: 'login',
            form: 'formSignIn',
            body: data,
            loading: loadings.btnSignIn 
         });
      }

      const prepareSignUpRequest = e => {
         e.preventDefault();
   
         handleErrors.hideErrors(state.formSignUp);

         const data = formsData.getFormSignUpData();
   
         submitForm({ 
            route: 'register',
            form: 'formSignUp',
            body: data,
            loading: loadings.btnSignUp
         });
      }

      state.formSignIn.addEventListener('submit', prepareSignInRequest);
      state.formSignUp.addEventListener('submit', prepareSignUpRequest);

      state.formSignUp.inputEmail.addEventListener('invalid', e => {
         e.preventDefault();

         const isNotValidEmail = e.target.validity.typeMismatch;

         if (isNotValidEmail) {
            handleErrors.showError([{ state: 'error', reason: 'invalid email' }]);
         }
      });

      const dispatch = {
         shouldLogUser(data) {
            data.userData?.emailConfirmationToken
               ? setUserNotActivated(data.userData)
               : setUserSession(data.userData);
         }
      }
   }

   function createPopup() {
      const state = {
         containerButtons: document.querySelector('.container-buttonsToThePopup'),
         popupWrapper: document.querySelector('.popup-wrapper-auth'),
         avalibleToOpen: true
      }

      const togglePasswordEye = btn => {
         const inputPassword = btn.parentElement.firstElementChild;
         
         const typeInput = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
         inputPassword.setAttribute('type', typeInput);

         btn.classList.toggle('show');
      }

      const inputFocus = () => {
         const inputAutoFocus = document.querySelector('[autofocus]');
         setTimeout(() => inputAutoFocus.focus(), 400);
      }

      const setCurrentOverlay = targetForm => {
         const [signInOverlay, signUpOverlay] = state.popupWrapper.children;

         const acceptedOverlayActions = {
            showSignInForm() {
               signInOverlay.classList.add('show');
               inputFocus();
            },
            showSignUpForm() {
               signUpOverlay.classList.add('show');
            }
         }

         if (!acceptedOverlayActions[targetForm]) {
            return
         }

         signInOverlay.classList.remove('show');
         signUpOverlay.classList.remove('show');

         state.popupWrapper.classList.contains('show')
            ? setTimeout(acceptedOverlayActions[targetForm], 300)
            : acceptedOverlayActions[targetForm]();
      }

      const resetPopup = () => {
         const [signInForm, signUpForm] = state.popupWrapper.querySelectorAll('form');
         const containerError = state.popupWrapper.querySelectorAll('.input-and-message');
         const btnEyes = state.popupWrapper.querySelectorAll('.btn-eyes');

         signInForm.reset();
         signUpForm.reset();

         signInForm.classList.remove('error');

         containerError.forEach(container => container.classList.remove('error'));

         btnEyes.forEach(btn => {
            const inputPassword =  btn.parentElement.firstElementChild;
            inputPassword.setAttribute('type', 'password');
            
            btn.classList.remove('show');
         });
      }

      const resetTimeToOpen = () => {
         state.avalibleToOpen = false;

         if (!state.avalibleToOpen) {
            setTimeout(() => state.avalibleToOpen = true, 650);
         }
      }

      const setAccessibilityProps = targetButton => {
         const [btnSignIn, btnSignUp] = state.containerButtons.children;

         const setAtributesForBtn = (btn, label, expanded) => {
            btn.setAttribute('aria-label', label);
            btn.setAttribute('aria-expanded', expanded);
         }

         setAtributesForBtn(btnSignIn, 'Abrir Menu', false);
         setAtributesForBtn(btnSignUp, 'Abrir Menu', false);

         if (targetButton.dataset.js) {
            setAtributesForBtn(targetButton, 'Fechar Menu', true);
         }
      }

      const showOrHidePopup = () => {
         state.popupWrapper.classList.toggle('show');

         resetTimeToOpen();
      }

      const acceptedPopupActions = {
         changeOverlay(target) {
            setCurrentOverlay(target.dataset.js);
            setAccessibilityProps(target);
         },
         togglePasswordEye(target) {
            togglePasswordEye(target.parentElement);
         },
         showRecoverAccount() {
            hidePopup();
            recoverAccount.showPopup({ showPopup }, true);
         }
      }

      const dispatch = {
         shouldShowOrHidePopup(target) {
            if (!state.avalibleToOpen) return

            acceptedPopupActions.changeOverlay(target);

            const shouldResetThePopup = !(state.popupWrapper.classList.contains('show'));

            shouldResetThePopup && resetPopup();

            showOrHidePopup();
         },
         shouldShowSignInPopup() {
            const shouldShowThePopup = localStorage.getItem('unauthorized');

            if (shouldShowThePopup) {
               localStorage.removeItem('unauthorized');

               const shouldResetThePopup = !(state.popupWrapper.classList.contains('show'));

               shouldResetThePopup && resetPopup();

               showOrHidePopup();
               setCurrentOverlay('showSignInForm');
            }
         }
      }

      const popupListener = e => {
         const action = e.target.dataset.action;

         dispatch[action]?.(e.target);
         acceptedPopupActions[action]?.(e.target);
      }

      dispatch.shouldShowSignInPopup();

      state.containerButtons.addEventListener('pointerup', popupListener);
      state.popupWrapper.addEventListener('pointerup', popupListener);
   }

   const render = someHooks => {
      const template = `
      <div class="popup-overlay overlay-signIn">
         <div class="popup-signIn popup popup-forms" data-form="formSignIn">
            <div class="popup-content">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="shouldShowOrHidePopup">
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
                     <div class="container-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg>
                        <span></span>
                     </div>
                  </div>
                  
                  <div class="input-and-message">
                     <div class="container-inputPassword container-inputs">
                        <input type="password" name="inputPassword" id="inputPassword" placeholder=" " class="input-password input-form input-default" autocomplete="off" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password" data-action="togglePasswordEye"></i>
                           <i class="no-eye-password" data-action="togglePasswordEye"></i>
                        </a>
                     </div>
                     <div class="container-error last">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg>
                        <span></span>
                     </div>
                  </div>
   
                  <div class="orthers-form-options">
                     <div class="container-inputCheckbox">
                        <label>
                           <input type="checkbox" checked class="center-flex checkbox-default" name="inputCheckbox">
                           Manter conectado
                        </label>
                     </div>
                     <div class="container-forgot-password">
                        <span class="prominent-span" tabindex="0" data-action="showRecoverAccount">Esqueceu a senha?</span>
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
                     <button type="submit" class="btn-default btn-default-hover">
                        Entrar
                        <div class="container-btn-loading center-flex">
                           <div class="loading"></div>
                        </div>
                     </button>
                  </div>
               </form>
               <div class="container-hasAccount">
                  <p>
                     Não tem uma conta? 
                     <span class="create-account-span prominent-span toggle-form" data-js="showSignUpForm" data-action="changeOverlay" role="Change Form" arial-label="Trocar para o formulário Cadastrar" tabindex="0">Criar Conta</span>
                  </p>
               </div>
            </div>
         </div>
      </div>
   
      <div class="popup-overlay overlay-signUp">
         <div class="popup-signUp popup popup-forms" data-form="formSignUp">
            <div class="popup-content">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="shouldShowOrHidePopup">
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
                     <div class="container-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg>
                        <span></span>
                     </div>
                  </div>
   
                  <div class="input-and-message">
                     <div class="container-inputEmail container-inputs">
                        <input type="email" name="inputEmail" placeholder=" " class="input-email input-form input-default" autocomplete="off">
                        <label for="inputEmail" class="label-input-default">E-mail</label>
                     </div>
                     <div class="container-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg>
                        <span></span>
                     </div>
                  </div>
   
                  <div class="container-inputs-password input-and-message">
                     <div class="container-inputs">
                        <input type="password" name="inputPassword" placeholder=" " class="input-password input-form input-default inputs-passwords" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password" data-action="togglePasswordEye"></i>
                           <i class="no-eye-password" data-action="togglePasswordEye"></i>
                        </a>
                     </div>
                     <div class="container-inputs">
                        <input type="password" name="inputConfirmPassword" placeholder=" " class="input-password input-form input-default inputs-passwords" spellcheck="false">
                        <label for="inputPassword" class="label-input-default">Confirmar Senha</label>
                        <a class="btn-eyes">
                           <i class="eye-password" data-action="togglePasswordEye"></i>
                           <i class="no-eye-password" data-action="togglePasswordEye"></i>
                        </a>
                     </div>
                     <div class="container-error">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg>
                        <span></span>
                     </div>
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
                     <button type="submit" class="btn-default btn-default-hover">
                        Criar Conta
                        <div class="container-btn-loading center-flex">
                           <div class="loading"></div>
                        </div>
                     </button>
                  </div>
               </form>
               <div class="container-hasAccount">
                  <p>
                     Eu já tenho uma conta.
                     <span class="access-account-span prominent-span toggle-form" data-js="showSignInForm" data-action="changeOverlay" role="Change Form" arial-label="Trocar para o formulário Entrar" tabindex="0">Entrar</span>
                  </p>
               </div>
            </div>
         </div>
      </div>
      `;

      state.popupWrapper.innerHTML = template;

      createPopup();
      createForm(someHooks);
   }

   return { 
      render 
   }
}

export default createPopupAuthForms