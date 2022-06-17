export default function createConfirmationCode() {
   const state = {
      observers: [],
      popupWrapper: document.querySelector('.popup-wrapper-confirmation-code')
   }

   function createForm(api) {
      const state = {
         confirmationForm: document.querySelector('form.confirmation-code-form'),
         inputs: [...document.querySelectorAll('form.confirmation-code-form input')],
         btnResendEmailCode: document.querySelector('.popup-confirmation-code .btn-resending-email-code'),
         btnSendEmailCode: document.querySelector('form.confirmation-code-form .btn-send-email-code')
      }

      const handleErrors = {
         hideError() {
            state.confirmationForm.classList.remove('error', 'input');
            state.confirmationForm.querySelector('.container-email-code-error').classList.remove('show');
         },
         showError(message) {
            handleSuccess.hideSuccess();

            const containerError = state.confirmationForm.querySelector('.container-email-code-error');
            const error = containerError.querySelector('span');

            const acceptedErrors = {
               "code incomplete"() {
                  error.innerText = 'Preencha todos os campos!';
                  state.confirmationForm.classList.add('input');
               },
               'invalid code'() {
                  error.innerText = 'Código inválido!';
                  state.confirmationForm.classList.add('input');
               },
               'no session email'() {
                  error.innerText = 'Erro! Faça o login novamente.';
               },
               'request error'() {
                  error.innerText = 'Houve um erro, tente novamente!';
               }
            }

            containerError.classList.add('show');
            state.confirmationForm.classList.add('error');

            acceptedErrors[message] 
               ? acceptedErrors[message]() 
               : acceptedErrors['request error']();
         }
      }

      const handleSuccess = {
         hideSuccess() {
            state.confirmationForm.classList.remove('success');
            state.confirmationForm.querySelector('.container-email-code-success').classList.remove('show');
         },
         showSuccess() {
            handleErrors.hideError();

            const containerSuccess = state.confirmationForm.querySelector('.container-email-code-success');

            containerSuccess.classList.add('show');
            state.confirmationForm.classList.add('success');
         }
      }

      const showAndHideBtnLoading = () => {
         state.btnSendEmailCode.classList.toggle('loading');
         state.btnResendEmailCode.classList.toggle('loading');
      }

      const sendEmailCode = async e => {
         e.preventDefault();

         showAndHideBtnLoading();
         
         const activationCode = state.inputs.reduce((acc, input) => acc += input.value, '');
         const activationToken = document.cookie.split('=')[1];
         const keepConnected = JSON.parse(localStorage.getItem('keepConnected'));

         try {
            const [data, status] = await api.request({
               method: 'POST',
               route: `checkEmailCode?activationToken=${activationToken}`,
               body: { activationCode, keepConnected }
            })
            
            showAndHideBtnLoading();

            if (status !== 200) {
               handleErrors.showError(data.reason);
               return
            }

            notifyAll(data.userData);
            
            
         } catch(e) {
            console.log(e);
            showAndHideBtnLoading();
         }
      }
      
      const resendEmailCode = async e => {
         if (e.type === 'touchstart') e.preventDefault();

         const userEmail = localStorage.getItem('sessionEmail');

         showAndHideBtnLoading();

         try {
            const [data, status] = await api.request({
               method: 'GET',
               route: `resendEmailCode?sessionEmail=${userEmail}`
            })

            showAndHideBtnLoading();

            if (status !== 200) {
               handleErrors.showError(data.reason);
               return
            }

            document.cookie = `activationToken = ${data.userData.activationToken}; path=/`;
            handleSuccess.showSuccess();

         } catch(e) {
            console.log(e);
            showAndHideBtnLoading();
         }
      }

      const pasteAll = code => {
         state.inputs.forEach((input, index) => {
            input.value = code[index];
            input.setAttribute('value', code[index]);
         });
      }

      const focusOnEmptyInput = () => {
         const firstEmptyInput = state.inputs.find(input => input.value === '');

         firstEmptyInput.focus();
      }

      const resetInput = input => {
         input.value = input.getAttribute('value');
      }
      
      const focusOnInput = input => {
         input.focus();
      }

      const dispatch = {
         shouldPasteAll(e) {
            const code = e.clipboardData.getData('text');

            if (code.length !== 5 || !+code) {
               e.preventDefault();
               return
            }

            pasteAll(code);
         },
         shouldFocusOnInput(e) {
            if (e.target.tagName !== 'INPUT' || e.target.value) return

            focusOnEmptyInput();
         },
         shouldWriteOnInput(e) {
            const input = e.target;

            if (input.value.length > 1) {
               resetInput(input);

               return
            }

            input.setAttribute('value', input.value);

            const shouldFocusOnInput = input.nextElementSibling && input.value && !input.nextElementSibling.value;

            shouldFocusOnInput && focusOnInput(input.nextElementSibling);
         },
         shouldDeletionOnInput(e) {
            handleErrors.hideError();
            handleSuccess.hideSuccess();

            if (e.key !== 'Backspace') return

            const input = e.target

            const shouldFocusOnInput = input.previousElementSibling && input.value === '';

            shouldFocusOnInput && focusOnInput(input.previousElementSibling);
         }
      }

      state.confirmationForm.addEventListener('submit', sendEmailCode);
      state.btnSendEmailCode.addEventListener('touchstart', sendEmailCode);

      state.btnResendEmailCode.addEventListener('click', resendEmailCode);
      state.btnResendEmailCode.addEventListener('touchstart', resendEmailCode);

      state.confirmationForm.addEventListener('input', dispatch.shouldWriteOnInput);
      state.confirmationForm.addEventListener('keydown', dispatch.shouldDeletionOnInput);
      state.confirmationForm.addEventListener('click', dispatch.shouldFocusOnInput);
      state.confirmationForm.addEventListener('paste', dispatch.shouldPasteAll);

      return {  }
   }

   const subscribe = observerFunction => {
      state.observers.push(observerFunction);
   }

   const notifyAll = data => {
      for (const observerFunction of state.observers) {
         observerFunction(data);
      }
   }

   const resetpopup = () => {
      const [error, success] = state.popupWrapper.querySelectorAll('.container-message');
      const form = state.popupWrapper.querySelector('form');
      const inputs = form.querySelectorAll('input[type="number"]');

      error.classList.remove('show')
      success.classList.remove('show');

      form.classList.remove('error', 'success', 'input');
   
      inputs.forEach(input => input.removeAttribute('value'));

      form.reset();
   }

   const showPopup = () => {
      state.popupWrapper.classList.add('show');
      resetpopup();
   }

   const hidePopup = () =>{
      state.popupWrapper.classList.remove('show');
   }

   const render = ({ api }) => {
      const template = `
         <div class="popup-overlay overlay-confirmation-code" data-action="shouldHidePopup">
            <div class="popup popup-confirmation-code">
               <div class="close">
                  <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="shouldHidePopup">
                     <img class="close-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
                  </button>
               </div>
               <div class="title">
                  <div>
                     <h1>Confirmar E-mail</h1>
                  </div>
                  <div>
                     <p>
                        Para confirmar o seu cadastro, digite o código de confirmação enviado para o seu e-mail.
                     </p>
                  </div>
               </div>
               <div class="form">
                  <form class="confirmation-code-form">
                     <div class="container-inputs-code">
                        <input type="number" maxlength="1" name="inputCode" />
                        <input type="number" maxlength="1" name="inputCode" />
                        <input type="number" maxlength="1" name="inputCode" />
                        <input type="number" maxlength="1" name="inputCode" />
                        <input type="number" maxlength="1" name="inputCode" />
                     </div>
                     <div class="container-email-code-error container-message">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                        </svg>
                        <span></span>
                     </div>
                     <div class="container-email-code-success container-message">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                           <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                        </svg>
                        <span>O novo código foi enviado!</span>
                     </div>
                     <div class="container-btn-code">
                        <button type="submit" class="btn-default btn-default-hover btn-send-email-code">
                           Confirmar
                           <div class="container-btn-loading center-flex">
                              <div class="loading"></div>
                           </div>
                        </button>
                     </div>
                  </form>
               </div>
               <div class="footer">
                  <p>
                     Não recebeu o e-mail de confirmação?
                     <button type="button" class="btn-resending-email-code">Reenviar código de confirmação</button>
                  </p>
               </div>
            </div>
         </div>
      `;

      state.popupWrapper.innerHTML = template;

      createForm(api);
   }

   const dispath = {
      shouldHidePopup() {
         hidePopup();
      }
   }

   const wrapperListener = e => {
      const action = e.target.dataset.action;

      if (!dispath[action]) {
         return
      }

      if (e.type === 'touchstart') e.preventDefault();

      dispath[action]();
   }

   state.popupWrapper.addEventListener('mousedown', wrapperListener);
   state.popupWrapper.addEventListener('touchstart', wrapperListener);

   return {
      render,
      showPopup,
      subscribe
   }
}