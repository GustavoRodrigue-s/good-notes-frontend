function createPopupConfirmAccountDeletion() {
   // adicionar formulário nesse popup
   
   const state = {
      inputConfirmDeletion: document.querySelector('.input-confirm-delete')
   }

   const btnDeleteConfirm = document.querySelector('.btn-delete-confirm');
   const popupDeleteAccount = document.querySelector('.popup-confirm-to-delete-account');

   const resetPopupConfirmToDeleteAccount = () => {
      inputConfirm.value = "";
      btnDeleteConfirm.className = 'btn-default btn-delete-confirm';
   }

   // accepted popupDeleteion actions
   const confirmToDeleteAccountOptions = {
      async "btn-delete-confirm-active"() {
         this["close-sub-popup-target"]();
         
         try {
            toggleLoading();
   
            await api.request({ auth: true, route: "deleteAccount" });
   
            cookies.deleteCookies();
            window.open('./index.html', '_self');
   
         } catch(e) {
            toggleLoading();
         }
      },
      "close-sub-popup-target"() {
         // close popup deletion
         popupDeleteAccount.parentElement.classList.remove('show');
         resetPopupConfirmToDeleteAccount();
         
         setTimeout(() => 
         popupDeleteAccount.parentElement.classList.add('show'), 300);
      }
   }

   popupDeleteAccount.addEventListener('click', e => {
      const firstClassOfTarget = e.target.classList[0];
      confirmToDeleteAccountOptions[firstClassOfTarget] && confirmToDeleteAccountOptions[firstClassOfTarget](e);
   });

   const dispatch = {
      shouldBeSetValidToDeleteTheAccount() {
         const { username } = JSON.parse(sessionStorage.getItem('credentials'));
   
         // pq n usar classList???
         btnDeleteConfirm.className = username === inputConfirm.value
            ? 'btn-delete-confirm-active btn-default btn-delete-confirm'
            : 'btn-default btn-delete-confirm';
      }
   } 

   state.inputConfirmDeletion.addEventListener('input', dispatch.shouldBeSetValidToDeleteTheAccount);

}

function createPopupProfile() {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-profile')
   }

   // lembrar de adicionar um form para seção de envio de foto
   // talvez separar uma camada chamada createForms (desacoplando um pouco as func)
   // o hide do popup profile e deletion se repetem (ver isso)

   function createForms({ api }) {
      const state = {
         profileForm: document.querySelector('.edit-profile-form'),
         loading: document.querySelector('.popup-profile .container-loading')
      }

      const toggleLoading = () => {
         state.loading.classList.toggle('show');
      }

      const showAndHideSuccessMessage = () => {
         const successMessage = state.profileForm.querySelector('.container-success-profile');
         successMessage.classList.add('show');

         setTimeout(() => successMessage.classList.remove('show'), 5000);
      }

      const setCredentials = ({ email, username }) => {
         const { inputEmail, inputUsername } = state.profileForm;

         inputEmail.setAttribute('value', email);
         inputUsername.setAttribute('value', username);

         inputEmail.value = email;
         inputUsername.value = username;
      }

      const setSavedCredentials = () => {
         const credentials = JSON.parse(sessionStorage.getItem('credentials'));

         setCredentials(credentials);
      }

      const saveCredentials = ({ username, email }) => {
         sessionStorage.setItem('credentials',
            JSON.stringify({ username, email }) 
         ); 

         setCredentials({ username, email });
      }

      const getCredentials = async () => {
         try {
            toggleLoading();

            const [data, status] = await api.request({ auth: true, route: "getCredentials" });

            if (status !== 200) {
               throw 'The tokens is not valid.';
            }

            saveCredentials(data);

            toggleLoading();

         }catch(e) {
            console.log(e);

            toggleLoading();
            // show generic error?? na layer handle errors??
            containerError.classList.add('show');
         }
      }

      const updateCredentials = async newCredentials => {
         try {
            toggleLoading();
   
            const [data, status] = await api.request({ 
               auth: true,
               method: "POST",
               route: "updateCredentials",
               body: newCredentials 
            });

            toggleLoading();
   
            if (status !== 200) {
               chooseErrors(data.reason);

               return
            }

            saveCredentials(data.newDatas);
            showAndHideSuccessMessage();
   
         }catch(e) {
            toggleLoading();
         }
      }

      const dispatch = {
         shouldRequestCredentials() {
            sessionStorage.getItem('credentials')
               ? setSavedCredentials()
               : getCredentials();
         },
         shouldUpdateCredentials(e) {
            e.preventDefault();
   
            const { inputUsername, inputEmail } = state.profileForm;
   
            const newCredentials = {
               email: inputEmail.value.trim(),
               username: inputUsername.value.trim()
            };
            
            const lastCredentials = JSON.parse(sessionStorage.getItem('credentials'));
   
            const keysOfNewCredentials = Object.keys(newCredentials);
   
            const shouldUpdate = keysOfNewCredentials.every(key => lastCredentials[key] === newCredentials[key]);
   
            if (!shouldUpdate) {
               updateCredentials(newCredentials);
            }
         }
      }

      state.profileForm.addEventListener('submit', dispatch.shouldUpdateCredentials);

      return { 
         shouldRequestCredentials: dispatch.shouldRequestCredentials
      }
   }

   function createPopup(forms) {
      const state = {
         popupWrapper: document.querySelector('.popup-wrapper-profile'),
         btnShowPopup: document.querySelector('header .user-edit'),
         avalibleToOpen: true,
         show: false
      }

      // já existe um show e hide popup (este será usado para outras camadas??)
      const showPopup = () => {
         const overlay = document.querySelector('.overlay-profile');
         overlay.classList.add('show');
      }

      const hidePopup = () => {
         const overlay = document.querySelector('.overlay-profile');
         overlay.classList.remove('show');
      }

      const resetPopup = () => {
         const [usernameMessage, emailMessage] = state.popupWrapper.querySelectorAll('.input-and-message');
         const [genericError, successMessage] = state.popupWrapper.querySelectorAll('.container-message');

         usernameMessage.classList.remove('error');
         emailMessage.classList.remove('error');

         genericError.classList.remove('show');
         successMessage.classList.remove('show');

         // ver se precisa remover o confirm deletion (talvez na camada de confirm deletion??)
         state.popupWrapper.lastElementChild.classList.remove('show');
         state.popupWrapper.firstElementChild.classList.remove('show');
      }

      const setAccessibilityProps = () => {
         state.show = !state.show;

         state.btnShowPopup.setAttribute('aria-expanded', state.show);

         state.btnShowPopup.setAttribute(
            'aria-label', 
            state.show ? 'Fechar popup de editar perfil' : 'Abrir popup de editar perfil'
         );
      }

      const setTimeToOpen = () => {
         state.avalibleToOpen = false;

         if (!state.avalibleToOpen) {
            setTimeout(() => state.avalibleToOpen = true, 650);
         }
      }

      const showAndHidePopup = () => {
         resetPopup();

         setTimeToOpen();
         setAccessibilityProps();

         state.popupWrapper.classList.toggle('show');
         
         // acho que tem haver com popup confirm deletion (pq tá aqui??)
         if(!state.popupWrapper.classList.contains('show')) {
            return
         } 

         // que código é esse??confirm deletion??
         state.popupWrapper.lastElementChild.classList.toggle('show');
      }

      const dispatch = {
         shouldShowOrHidePopup(targetClass) {
            if(!state.avalibleToOpen) return

            const listOfElementsToToggle = ['close-popup-target', 'popup-overlay', 'user-edit'];
            const shouldToggle = listOfElementsToToggle.includes(targetClass);

            if (shouldToggle) {
               showAndHidePopup();
               forms.shouldRequestCredentials();
            }
         }
      }

      const popupListener = e => {
         if (e.type === 'touchstart') e.preventDefault();

         const targetClass = e.target.classList[0];

         dispatch.shouldShowOrHidePopup(targetClass);
      }

      state.popupWrapper.addEventListener('mousedown', popupListener);
      state.btnShowPopup.addEventListener('click', popupListener);
      state.btnShowPopup.addEventListener('touchstart', popupListener);

      return { 
         showPopup,
         hidePopup
      }
   }
   
   const instantiateLayers = someLayers => {
      const forms = createForms(someLayers);
      const popup = createPopup(forms);

      // createPopupConfirmAccountDeletion();
   }

   const render = someLayers => {
      const template = `
      <div class="popup-overlay overlay-confirm-delete">
         <div class="popup-confirm-to-delete-account popup">
            <div class="close">
               <button class="close-sub-popup-target close-popup center-flex" tabindex="0">
                  <img class="close-sub-popup-target close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
               </button>
            </div>
            <div class="popup-content">
               <div class="header">
                  <h1>Excluir conta</h1>
               </div>
               <div class="body">
                  <div class="texts">
                     <p>
                        A exclusão da conta é irreversível, seus dados e notas serão completamente apagados. Ao excluir sua conta, você será redirecionado para a página principal.
                     </p>
                     <p>
                        Tem certeza que deseja excluir sua conta? Para confirmar digite o seu (<strong>Nome de usuário</strong>) abaixo.
                     </p>
                  </div>
                  <div class="controls">
                     <div class="container-input">
                        <input type="text" name="input-username" class="input-confirm-delete input-default" autocomplete="off">
                     </div>
                     <div class="buttons">
                        <button class="close-sub-popup-target btn-default btn-cancel-confirm">Cancelar</button>
                        <button type="submit" class="btn-default btn-delete-confirm">Excluir Conta</button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

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
                  <img src="./images/avatar_icon.svg" alt="avatar icon" />
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
                  <div class="input-and-message">
                     <div class="container-input">
                        <label for="input-username">Nome de usuário</label>
                        <input type="text" class="input-username input-default" id="input-username" value="" name="inputUsername" autocomplete="off">
                     </div>
                     <div class="container-error"></div>
                  </div>
                  <div class="input-and-message">
                     <div class="container-input">
                        <label for="input-email">Endereço de email</label>
                        <input type="email" class="input-email input-default" id="input-email" value="" name="inputEmail" autocomplete="off">  
                     </div>
                     <div class="container-error"></div>
                  </div>
                  <div class="container-messages">
                     <div class="container-success-profile container-message">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                           <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                        </svg>
                        Tudo certo! Seus dados foram atualizados.
                     </div>
                     <div class="container-error-profile container-message">
                        <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                           <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                           </path>
                        </svg> 
                        Houve um erro, faça o login novamente!
                     </div>
                  </div>
                  <div class="container-buttons">
                     <button type="submit" class="btn-update-credentials btn-default btn-default-hover">Salvar</button>
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
                  <button class="btn-delete btn-default">Desativar</button>
               </div>
            </div>
         </div>
      </div>
      ` ;

      state.popupWrapper.innerHTML = template;

      instantiateLayers(someLayers);
   }

   return { render }
} 

const popupProfile = createPopupProfile();

export default popupProfile;

/* ---------------------------------------- */

// const tools = { 
//    api,
//    cookie,
//    toggleLoading,
//    containerSuccessMessage: containerSuccessMessage
// }

// initProfileOptions(tools);

// const initProfileOptions = ({ api, containerSuccessMessage, toggleLoading, cookies }) => {
   
// }