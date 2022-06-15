export default function createConfirmationCode() {
   const state = {
      observers: [],
      popupWrapper: document.querySelector('.popup-wrapper-confirmation-code')
   }

   const subscribe = observerFunction => {
      state.observers.push(observerFunction);
   }

   const notifyAll = data => {
      for (const observerFunction of state.observers) {
         observerFunction(data);
      }
   }

   function createForm(api) {
      const state = {
         confirmationForm: document.querySelector('form.confirmation-code-form')
      }

      const submitActivationCode = async activationCode => {
         try {
            const [data, status] = await api.request({
               activationAuth: true,
               method: 'POST',
               route: 'checkActivationCode',
               body: { activationCode }
            })
   
            console.log(data, status);

            if (status === 200) {
               notifyAll(data.userData);
            }
   
         } catch(e) {
            console.log(e);
         }
      }
   
      const handleSubmit = e => {
         e.preventDefault();
   
         const inputs = [...state.confirmationForm.inputCode];

         const code = inputs.reduce((acc, input) => acc += input.value, '');
   
         submitActivationCode(code);
      }

      state.confirmationForm.addEventListener('submit', handleSubmit);

      return {  }
   }

   const showPopup = () => {
      state.popupWrapper.classList.add('show');
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
                     <div class="container-btn-code">
                        <button type="submit" class="btn-default btn-default-hover">Confirmar</button>
                     </div>
                  </form>
               </div>
               <div class="footer">
                  <p>
                     Não recebeu o e-mail de confirmação?
                     <span>Reenviar código de confirmação</span>
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