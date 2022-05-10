function createPopupAuthForms() {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-auth')
   }

   function createForm({ api, cookie }) {
      const state = {
         formSignIn: document.querySelector('.form-signIn'),
         formSignUp: document.querySelector('.form-signUp')
      }

      const formsData = {
         getFormSignInDatas() {
            const { inputEmail, inputPassword, inputCheckbox } = state.formSignIn;

            return {
               email: inputEmail.value.trim(),
               password: inputPassword.value.trim(),
               keepConnected: inputCheckbox.checked
            }
         },
         getFormSignUpDatas() {
            const { 
               inputUsername, inputEmail, inputPassword, inputConfirmPassword 
            } = state.formSignUp;

            return {
               username: inputUsername.value.trim(),
               email: inputEmail.value.trim(),
               password: [
                  inputPassword.value.trim(),
                  inputConfirmPassword.value.trim()
               ],
               keepConnected: false
            }
         }
      }

      const showAndHideLoading = index => {
         document.querySelectorAll('.popup-content')[index].classList.toggle('hideToLoading');
         document.querySelectorAll('.popup .container-loading')[index].classList.toggle('show');
      }
   
      const setUserSession = (data, keepConnected) => {
         sessionStorage.setItem('USER_FIRST_SESSION', true);
         localStorage.setItem('keepConnected', JSON.stringify(keepConnected));

         cookie.setCookies({ ...data.userData });
      }

      const submitForm = async ({ route, index, body }) => {
         try {
            showAndHideLoading(index);
   
            const [data, status] = await api.request({ method: "POST", route, body });
   
            if (data.state !== 'success') {
               chooseRequestMessage(data.errors, index);

               return
            }

            showAndHideLoading(index);
            setUserSession(data, body.keepConnected)
   
         } catch (e) {
            showAndHideLoading(index);
            chooseRequestMessage([{ state: 'error', reason: 'request error' }], index);
         }
      }
   
      const { inputEmail } = state.formSignUp;
   
      // isso tinha que está aqui?? na camada handle errors?? (INVALID)??
      inputEmail.addEventListener('invalid', e => {
         e.preventDefault();
   
         const thisInput = e.target;
   
         thisInput.validity.typeMismatch && showMessageError(
            thisInput, 'Digite um e-mail válido!'
         );
      });
   
      state.formSignIn.addEventListener('submit', e => {
         e.preventDefault();

         const datas = formsData.getFormSignInDatas();
   
         submitForm({ route: 'login', index: 0, body: datas });
      });
   
      state.formSignUp.addEventListener('submit', e => {
         e.preventDefault();
   
         const datas = formsData.getFormSignUpDatas();
   
         submitForm({ route: 'register', index: 1, body: datas });
      });
   }

   function createPopup() {
      const state = {
         containerButtons: document.querySelector('.container-buttonsToThePopup'),
         popupWrapper: document.querySelector('.popup-wrapper-auth'),
         avalibleToOpen: true
      }

      const togglePasswordEye = btn => {
         const [eyePassword, noEyePassword, inputPassword] = [
            ...btn.children, btn.parentElement.firstElementChild
         ];
         
         const typeInput = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';

         inputPassword.setAttribute('type', typeInput);
         eyePassword.classList.toggle('show');
         noEyePassword.classList.toggle('show');
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

         containerError.forEach(container => container.classList.remove('error'));

         btnEyes.forEach(btns => {
            const [eyePassword, noEyePassword, inputPassword] = [
               ...btns.children, btns.parentElement.firstElementChild
            ];

            inputPassword.setAttribute('type', 'password');
            eyePassword.classList.add('show');
            noEyePassword.classList.remove('show');
         });
      }

      const setTimeToOpen = () => {
         state.avalibleToOpen = false;

         if (!state.avalibleToOpen) {
            setTimeout(() => state.avalibleToOpen = true, 650);
         }
      }

      const setAccessibilityProps = e => {
         const targetDataJs = e.target.dataset.js;
         const [btnSignIn, btnSignUp] = state.containerButtons.children;

         const currentBtn = state.containerButtons.querySelector(`button[data-js="${targetDataJs}"]`);

         const setAtributesForBtn = (btn, label, expanded) => {
            btn.setAttribute('aria-label', label);
            btn.setAttribute('aria-expanded', expanded);
         }

         setAtributesForBtn(btnSignIn, 'Abrir Menu', false);
         setAtributesForBtn(btnSignUp, 'Abrir Menu', false);

         if (currentBtn) {
            setAtributesForBtn(currentBtn, 'Fechar Menu', true);
         }
      }

      const showAndHidePopup = () => {
         resetPopup();
         
         state.popupWrapper.classList.toggle('show');

         setTimeToOpen();
      }

      const popupWrapperListener = e => {
         if (e.type === 'touchstart') e.preventDefault();

         dispatch.shouldSetOverlay(e);
         dispatch.shouldShowOrHidePopup(e);
         dispatch.shouldToggleCurrentEyePassword(e);
      }

      const dispatch = {
         shouldShowOrHidePopup(e) {
            if (!state.avalibleToOpen) return

            const targetClass = e.target.classList[0];

            const listOfElementsToToggle = ['close-popup-target', 'popup-overlay', 'button-signIn', 'button-signUp'];
            const shouldToggle = listOfElementsToToggle.includes(targetClass);

            if (shouldToggle) {
               showAndHidePopup();
               setAccessibilityProps(e);
            }
         },
         shouldSetOverlay(e) {
            const targetForm = e.target.dataset.js;

            if (targetForm) {
               setCurrentOverlay(targetForm);
               setAccessibilityProps(e);
            }
         },
         shouldToggleCurrentEyePassword(e) {
            const targetElement = e.target.parentElement;

            if (targetElement.classList.contains('btn-eyes')) {
               togglePasswordEye(targetElement);
            }
         }
      }

      state.containerButtons.addEventListener('click', popupWrapperListener);
      state.containerButtons.addEventListener('touchstart', popupWrapperListener);
      state.popupWrapper.addEventListener('mousedown', popupWrapperListener);
   }

   const render = someLayers => {
      const template = `
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
                     <span class="create-account-span prominent-span toggle-form" data-js="showSignUpForm" role="Change Form" arial-label="Trocar para o formulário Cadastrar" tabindex="0">Criar Conta</span>
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
                     <span class="access-account-span prominent-span toggle-form" data-js="showSignInForm" role="Change Form" arial-label="Trocar para o formulário Entrar" tabindex="0">Entrar</span>
                  </p>
               </div>
            </div>
         </div>
      </div>
      `;

      state.popupWrapper.innerHTML = template;

      createPopup();
      createForm(someLayers);
   }

   return { 
      render 
   }
}

const authPopupForms = createPopupAuthForms();

export default authPopupForms

/* --------------------------------------------------------------------------- */ 

// descidir sobre criar uma camada para handleFormErros ou juntar à camada de form

const showMessageError = (input, message) => {
   const containerGenericError = document.querySelectorAll('form > .generic-container')

   const containerErrorAndInput = input.parentElement.parentElement;
   const containerError = containerErrorAndInput.lastElementChild;

   const template = `
      <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
         </path>
      </svg>
      ${message}
   `;

   containerError.innerHTML = message === '' ? '' : template;

   containerErrorAndInput.classList.add('error');

   input.addEventListener('keydown', () => {
      containerErrorAndInput.classList.remove('error');
      containerGenericError.forEach(container => container.classList.remove('error'));
   });
}

const chooseRequestMessage = (response, index) => {
   const containerGenericError = document.querySelectorAll('form > .generic-container')

   const formSignIn = document.querySelector('.form-signIn');
   const formSignUp = document.querySelector('.form-signUp');

   const acceptedErrors = {
      "empty input"({ input }) {
         console.log(input);

         const thisForm = index === 0 ? 'form-signIn' : 'form-signUp';
         const currentInput = document.querySelector(`.${thisForm} .${input}`);
         
         if(input === 'inputs-passwords') {
            const { inputPassword, inputConfirmPassword } = formSignUp;

            showMessageError(inputPassword, 'Preencha os dois campos!');
            showMessageError(inputConfirmPassword, 'Preencha os dois campos!');
         } else {
            showMessageError(currentInput, 'Preencha este campo!');
         }
      },
      "wrong credentials"() {
         const { inputEmail, inputPassword } = formSignIn;

         showMessageError(inputEmail, '');
         showMessageError(inputPassword, 'Email ou senha incorretos!');

         const removeError = () => {
            inputEmail.parentElement.parentElement.classList.remove('error');
            inputPassword.parentElement.parentElement.classList.remove('error');
         }

         inputEmail.addEventListener('keydown', removeError);
         inputPassword.addEventListener('keydown', removeError);
      },
      "username already exists"() {
         showMessageError(formSignUp.inputUsername, 'Este nome já existe!');
      },
      "email already exists"() {
         showMessageError(formSignUp.inputEmail, "Este email já existe!");
      },
      "differents passwords"() {
         const { inputPassword, inputConfirmPassword } = formSignUp;

         showMessageError(inputPassword, 'Senhas diferentes!');
         showMessageError(inputConfirmPassword, 'Senhas diferentes!');
      },
      "request error"() {
         containerGenericError[index].classList.add('error');
      }
   }

   response.forEach(data => {
      acceptedErrors[data.reason] 
         ? acceptedErrors[data.reason](data)
         : acceptedErrors['request error']();
   })
}