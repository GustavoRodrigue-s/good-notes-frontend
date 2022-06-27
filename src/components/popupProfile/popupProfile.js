function createPopupProfile({ updateUserAvatar }, confirmationCode) {
   const state = {
      popupWrapper: document.querySelector('.popup-wrapper-profile')
   }

   const hidePopup = () => {
      state.popupWrapper.classList.remove('show');

      const [overlayDeletion, overlayProfile] = state.popupWrapper.querySelectorAll('.popup-overlay');

      overlayDeletion.classList.remove('show');
      overlayProfile.classList.remove('show');
   }

   const showPopup = () => {
      state.popupWrapper.classList.add('show');
      state.popupWrapper.querySelector('.overlay-profile').classList.add('show');
   }

   function createForms({ api, cookie }) {
      const state = {
         credentialsForm: document.querySelector('.edit-profile-form'),
         formPhoto: document.querySelector('.profile-photo-form'),
         resetPasswordForm: document.querySelector('.reset-password-form'),
         loading: document.querySelector('.popup-profile .container-loading')
      }

      const MAXIMUM_PHOTO_SIZE = 1 * 1024 * 1024; // 1MB

      const loadings = {
         updateStore(showOrHide) {
            state.credentialsForm.querySelector('.btn-update-credentials').classList[showOrHide]('loading');
         },
         updatePassword(showOrHide) {
            state.resetPasswordForm.querySelector('.btn-update-password').classList[showOrHide]('loading');
         },
         uploadPhoto(showOrHide) {
            const previewLabelBtn = state.formPhoto.querySelector('.container-photo label');
            const sendhotoBtn = state.formPhoto.querySelector('.button-photo > button');

            previewLabelBtn.classList[showOrHide]('loading');
            sendhotoBtn.classList[showOrHide]('loading');
         },
         popup(showOrHide) {
            state.loading.classList[showOrHide]('show');
         }
      }

      const handleErrors = {
         hideInputError(input, containerInput) {
            input.addEventListener('keydown', () => 
               containerInput.classList.remove('error'));
         },
         showInputError(input, message, containerInput) {
            const span = containerInput.querySelector('.container-error > span');

            span.innerText = "" || message;

            containerInput.classList.add('error');

            handleErrors.hideInputError(input, containerInput);
         },
         showPhotoError(message) {
            const containerError = document.querySelector('.container-photo-error');
            const spanError = containerError.querySelector('span');

            const acceptedErrors = {
               "maximum photo size"() {
                  spanError.innerText = 'Esta foto é maior que 1MB.';
               },
               "image type not allowed"() {
                  spanError.innerText = 'Formato não permitido.';
               },
               "request error"() {
                  spanError.innerText = 'Houve um erro, tente novamente mais tarde!';
               }
            }

            containerError.classList.add('show');

            acceptedErrors[message]
               ? acceptedErrors[message]()
               : acceptedErrors['request error'];
         },
         showCredentialsError(errors) {
            handleSuccess.hideCredentialsSuccess();

            const acceptedErrors = {
               "empty input"({ input }) {
                  const currentInput = state.credentialsForm[input];

                  handleErrors.showInputError(
                     currentInput,
                     'Preencha este campo!',
                     currentInput.parentElement.parentElement
                  );
               },
               "email already exists"({ input }) {
                  const currentInput = state.credentialsForm[input];

                  handleErrors.showInputError(
                     currentInput,
                     'Este email já existe!',
                     currentInput.parentElement.parentElement
                  );
               },
               "username already exists"({ input }) {
                  const currentInput = state.credentialsForm[input];

                  handleErrors.showInputError(
                     currentInput,
                     'Este nome já existe!',
                     currentInput.parentElement.parentElement
                  );
               },
               "request error"() {
                  const errorMessage = state.credentialsForm.querySelector('.container-credentials-error');
                  errorMessage.classList.add('show');
               }
            }
   
            errors.forEach(data => {
               acceptedErrors[data.reason]
                  ? acceptedErrors[data.reason](data)
                  : acceptedErrors['request error']();
            });
         },
         showPasswordsError(errors) {
            const acceptedErrors = {
               "empty input"({ input }) {
                  const currentInput = state.resetPasswordForm[input];

                  handleErrors.showInputError(
                     currentInput,
                     'Preencha este campo!',
                     currentInput.parentElement.parentElement.parentElement
                  );
               },
               "wrong old password"() {
                  const currentInput = state.resetPasswordForm.inputOldPassword;

                  handleErrors.showInputError(
                     currentInput,
                     'Senha antiga errada!',
                     currentInput.parentElement.parentElement.parentElement
                  );
               },
               "request error"() {
                  const errorMessage = state.resetPasswordForm.querySelector('.container-reset-password-error');
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
         showPhotoSuccess() {
            const containerSuccess = document.querySelector('.container-photo-success');
            containerSuccess.classList.add('show');
         },
         showCredentialsSuccess() {
            const successMessage = state.credentialsForm.querySelector('.container-credentials-success');
            
            const shouldShow = state.credentialsForm.parentElement.classList.contains('show');

            shouldShow && successMessage.classList.add('show');
         },
         hideCredentialsSuccess() {
            const successMessage = state.credentialsForm.querySelector('.container-credentials-success');
            successMessage.classList.remove('show');
         },
         showPasswordsSuccess() {
            const successMessage = state.resetPasswordForm.querySelector('.container-reset-password-success');
            
            const shouldShow = state.resetPasswordForm.parentElement.classList.contains('show');

            shouldShow && successMessage.classList.add('show');
         }
      }

      const readFileAsDataUrl = (file, callback) => {
         const reader = new FileReader();

         reader.addEventListener('load', () => callback(reader.result));

         reader.readAsDataURL(file);
      }

      const setProfileData = profileData => {
         const { email, username, photo } = profileData || JSON.parse(sessionStorage.getItem('profileData')); 

         const { inputEmail, inputUsername } = state.credentialsForm;
         const preview = state.formPhoto.querySelector('.photoPreview');

         email && inputEmail.setAttribute('value', email);
         username && inputUsername.setAttribute('value', username);
         photo && preview.setAttribute('src', photo);

         state.credentialsForm.reset();
      }

      const saveProfileData = ({ username, email, photo }) => {
         const profileData = JSON.parse(sessionStorage.getItem('profileData'));

         profileData.username = username || profileData.username;
         profileData.email = email || profileData.email;
         profileData.photo = photo || profileData.photo;

         sessionStorage.setItem('profileData', JSON.stringify(profileData));
      }

      const createProfileData = ({ username, email, photo }) => {
         sessionStorage.setItem('profileData',
            JSON.stringify({ username, email, photo }) 
         ); 

         setProfileData({ username, email, photo });
      }

      const handleSuccessUpdate = data => {
         saveProfileData(data);
         setProfileData(data);

         handleSuccess.showCredentialsSuccess();
      }

      const handleConfirmEmail = (token, { email }, { email: oldEmail }) => {
         cookie.setCookie('emailConfirmationToken', token);

         hidePopup();
         setTimeout(confirmationCode.showPopup, 300);

         confirmationCode.subscribe('submit', ({ updateEmail }) => updateEmail(email));
         confirmationCode.subscribe('resend', resendEmailCode => resendEmailCode({ email: oldEmail, emailToUpdate: email }));
         
         confirmationCode.subscribe('success', () => {
            handleSuccessUpdate({ email });

            setTimeout(showPopup, 300);
         });

         confirmationCode.subscribe('hidden popup', () => setTimeout(showPopup, 300));
      }

      const getProfileData = async () => {
         try {
            loadings.popup('add');

            const [data, status] = await api.request({ auth: true, method: 'GET', route: "getProfile" });

            if (status !== 200) {
               throw 'The tokens is not valid.';
            }

            createProfileData(data);
            loadings.popup('remove');

         }catch(e) {
            loadings.popup('remove');
            handleErrors.showCredentialsError([{ reason: 'request error' }]);
         }
      }

      const updatePassword = async passwords => {
         loadings.updatePassword('add');

         try {
            const [data, status] = await api.request({
               auth: true,
               method: 'PUT',
               route: 'updatePassword',
               body: passwords
            });

            loadings.updatePassword('remove');

            status !== 200
               ? handleErrors.showPasswordsError(data.errors)
               : handleSuccess.showPasswordsSuccess();

         } catch (e) {
            loadings.updatePassword('remove');
            handleErrors.showPasswordsError([{ reason: 'request error' }]);
         }
      }

      const updateCredentials = async (newCredentials, lastCredentials) => {
         loadings.updateStore('add');

         try {
            const [data, status] = await api.request({ 
               auth: true,
               method: "PUT",
               route: "updateCredentials",
               body: newCredentials 
            });

            loadings.updateStore('remove');

            if (status !== 200 && status !== 301) {
               handleErrors.showCredentialsError(data.errors);
               return
            }

            if (data.emailConfirmationToken) {
               handleConfirmEmail(data.emailConfirmationToken, newCredentials, lastCredentials);
            }

            if (lastCredentials.username !== newCredentials.username) {
               handleSuccessUpdate({ username: newCredentials.username });
            }
   
         }catch(e) {
            loadings.updateStore('remove');
            handleErrors.showCredentialsError([{ reason: 'request error' }]);
         }
      }

      const uploadPhoto = async fileData => {
         loadings.uploadPhoto('add');

         try {
            const [data, status] = await api.request({ 
               auth: true,
               method: 'POST',
               route: 'uploadPhoto',
               body: fileData
            });

            loadings.uploadPhoto('remove');

            if (status !== 200) {
               handleErrors.showPhotoError(data.reason);
               return
            }

            saveProfileData({ photo: data.photoData });
            updateUserAvatar(data.photoData);

            handleSuccess.showPhotoSuccess();

         } catch (e) {
            loadings.uploadPhoto('remove');
            handleErrors.showPhotoError('request error');
         }
      }

      const handlePreviewChange = e => {
         const preview = state.formPhoto.querySelector('.photoPreview');

         if (!e.target.value) {
            return
         }

         document.querySelector('.container-photo-error').classList.remove('show');
         document.querySelector('.container-photo-success').classList.remove('show');

         readFileAsDataUrl(e.target.files[0], photoUrl => 
            preview.setAttribute('src', photoUrl)); 
      }

      const dispatch = {
         shouldRequestCredentials() {
            state.formPhoto.reset();

            dispatch.shouldRemoveImgPreview();

            sessionStorage.getItem('profileData')
               ? setProfileData()
               : getProfileData();
         },
         shouldRemoveImgPreview() {
            const img = state.formPhoto.querySelector('img');
            const profileData = sessionStorage.getItem('profileData');

            if (!profileData) {
               return
            }

            const { photo } = JSON.parse(profileData);

            if (!photo) {
               img.setAttribute('src', './images/avatar_icon.svg');
            }
         },
         shouldUpdateCredentials(e) {
            e.preventDefault();
   
            const { inputUsername, inputEmail } = state.credentialsForm;
   
            const newCredentials = {
               email: inputEmail.value.trim(),
               username: inputUsername.value.trim()
            };
            
            const lastCredentials = JSON.parse(sessionStorage.getItem('profileData'));
   
            const keysOfNewCredentials = Object.keys(newCredentials);
   
            const shouldUpdate = keysOfNewCredentials.every(key => lastCredentials[key] === newCredentials[key]);
   
            if (!shouldUpdate) {
               updateCredentials(newCredentials, lastCredentials);
            }
         },
         shouldUploadPhoto(e) {
            e.preventDefault();

            const { inputPhoto } = state.formPhoto;
            const { photo } = JSON.parse(sessionStorage.getItem('profileData'));

            if (!inputPhoto.value) {
               return
            }

            const file = inputPhoto.files[0];
            const photoFormated = { size: file.size, type: file.type, name: file.name };

            if (photoFormated.size > MAXIMUM_PHOTO_SIZE) {
               handleErrors.showPhotoError('maximum photo size');
               return
            }

            readFileAsDataUrl(file, photoUrl => {
               if (photo === photoUrl) return

               photoFormated.photo = photoUrl;
               uploadPhoto(photoFormated);
            });
         },
         shouldResetPassword(e) {
            e.preventDefault();

            const { inputOldPassword, inputNewPassword } = state.resetPasswordForm;
            
            if (inputNewPassword.value === '' || inputOldPassword.value === '') {
               return
            }

            updatePassword({ 
               oldPassword: inputOldPassword.value.trim(),
               newPassword: inputNewPassword.value.trim()
            });
         }
      }

      state.credentialsForm.addEventListener('submit', dispatch.shouldUpdateCredentials);
      state.formPhoto.addEventListener('submit', dispatch.shouldUploadPhoto);
      state.resetPasswordForm.addEventListener('submit', dispatch.shouldResetPassword);
      state.formPhoto.inputPhoto.addEventListener('change', handlePreviewChange);

      return { 
         shouldRequestCredentials: dispatch.shouldRequestCredentials
      }
   }

   function createPopup(forms, popupDeletion) {
      const state = {
         popupWrapper: document.querySelector('.popup-wrapper-profile'),
         btnShowPopup: document.querySelector('header .user-edit'),
         slider: document.querySelector('.container-slider'),
         avalibleToOpen: true,
         show: false
      }

      const hidePopup = () => {
         const [overlayDeletion, overlayProfile] = state.popupWrapper.querySelectorAll('.popup-overlay');
         
         overlayProfile.classList.remove('show');
         setTimeout(() => overlayDeletion.classList.add('show'), 300);

         popupDeletion.resetPopup();
      }

      const showPopup = () => {
         const overlayProfile = state.popupWrapper.querySelector('.overlay-profile');
         overlayProfile.classList.add('show');
      }

      const togglePasswordEye = btn => {
         const inputPassword = btn.parentElement.firstElementChild;
         
         const typeInput = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';
         inputPassword.setAttribute('type', typeInput);

         btn.classList.toggle('show');
      }

      const resetPopupWhenPassingForm = () => {
         const btnEyes = state.popupWrapper.querySelectorAll('.btn-eyes');

         btnEyes.forEach(btn => {
            const inputPassword =  btn.parentElement.firstElementChild;
            inputPassword.setAttribute('type', 'password');
            
            btn.classList.remove('show');
         });

         const inputWithMessage = state.popupWrapper.querySelectorAll('.input-and-message.error');
         const messages = state.popupWrapper.querySelectorAll('.container-message.show');

         inputWithMessage.forEach(container => container.classList.remove('error'));
         messages.forEach(message => message.classList.remove('show'));
      }

      const resetPopup = () => {
         const [emailAndUsername, resetPassword] = state.slider.children;
         const [overlayDeletion, overlayProfile] = state.popupWrapper.querySelectorAll('.popup-overlay');

         resetPopupWhenPassingForm();

         overlayProfile.classList.remove('show');
         overlayDeletion.classList.remove('show');

         emailAndUsername.classList.add('show');
         resetPassword.classList.remove('show');
      }

      const setAccessibilityProps = () => {
         state.show = !state.show;

         state.btnShowPopup.setAttribute('aria-expanded', state.show);

         const message = state.show ? 'Fechar popup de editar perfil' : 'Abrir popup de editar perfil';

         state.btnShowPopup.setAttribute('aria-label', message);
      }

      const setTimeToOpen = () => {
         state.avalibleToOpen = false;

         if (!state.avalibleToOpen) {
            setTimeout(() => state.avalibleToOpen = true, 650);
         }
      }

      const slideForm = () => {
         document.querySelector('.edit-profile-form').reset();
         document.querySelector('.reset-password-form').reset();

         resetPopupWhenPassingForm();

         const [sectionEmailAndUsername, sectionResetPassword] = state.slider.children;

         sectionEmailAndUsername.classList.toggle('show');
         sectionResetPassword.classList.toggle('show');
      }

      const showAndHidePopupWrapper = () => {
         resetPopup();

         setTimeToOpen();
         setAccessibilityProps();

         state.popupWrapper.classList.toggle('show');
         
         if (state.popupWrapper.classList.contains('show')) {
            showPopup();
         } 
      }

      const acceptedPopupActions = {
         slideForm() {
            slideForm();
         },
         hidePopup() {
            hidePopup();
         },
         togglePasswordEye(target) {
            togglePasswordEye(target.parentElement);
         }
      }

      const dispatch = {
         shouldShowOrHidePopup() {
            if(!state.avalibleToOpen) return

            showAndHidePopupWrapper();
            forms.shouldRequestCredentials();
         }
      }

      const popupListener = e => {
         const targetAction = e.target.dataset.action;

         dispatch[targetAction]?.();
         acceptedPopupActions[targetAction]?.(e.target);
      }

      state.popupWrapper.addEventListener('pointerup', popupListener);
      state.btnShowPopup.addEventListener('pointerup', popupListener);

      return {  }
   }

   function createPopupConfirmDeletion({ api, cookie }) {
      const state = {
         popupWrapper: document.querySelector('.popup-wrapper-profile'),
         confirmDeletionForm: document.querySelector('.deletion-account-form'),
         popup: document.querySelector('.popup-confirm-to-delete-account')
      }
   
      const loadings = {
         delete(showOrHide) {
            state.confirmDeletionForm.querySelector('.btn-delete-confirm').classList[showOrHide]('loading');
         }
      }

      const resetPopup = () => {
         const { btnConfirm } = state.confirmDeletionForm;
   
         state.confirmDeletionForm.reset();
         btnConfirm.classList.remove('btn-delete-confirm-active');
      }
   
      const hidePopup = () => {
         const [overlayDeletion, overlayProfile] = state.popupWrapper.querySelectorAll('.popup-overlay');
         
         overlayDeletion.classList.remove('show');
         setTimeout(() => overlayProfile.classList.add('show'), 300);
   
         resetPopup();
      }
   
      const confirmAccountDeletion = async () => {
         loadings.delete('add');

         try {
            await api.request({ auth: true, method: 'DELETE', route: "deleteAccount" });
   
            cookie.deleteCookies();
            window.open('./index.html', '_self');
   
         } catch(e) {
            loadings.delete('remove');
         }
      }
   
      const dispatch = {
         shouldHidePopup() {
            hidePopup();
         },
         shouldActiveTheButton() {
            const { username } = JSON.parse(sessionStorage.getItem('profileData'));
            const { inputUsername, btnConfirm } = state.confirmDeletionForm; 
   
            const addOrRemove = username === inputUsername.value ? 'add' : 'remove';
   
            btnConfirm.classList[addOrRemove]('btn-delete-confirm-active');
         },
         shouldConfirmDeletion(e) {
            e.preventDefault();
   
            const { btnConfirm } = state.confirmDeletionForm;
   
            const shouldDeleteAccount = btnConfirm.classList.contains('btn-delete-confirm-active');
   
            if (shouldDeleteAccount) {
               confirmAccountDeletion();
            }
         }
      } 
   
      const popupListener = e => {
         const action = e.target.dataset.action;
   
         if (dispatch[action]) {
            dispatch[action]();
         }
      }
   
      state.popup.addEventListener('pointerup', popupListener);
   
      state.confirmDeletionForm.inputUsername.addEventListener('input', dispatch.shouldActiveTheButton);
      state.confirmDeletionForm.addEventListener('submit', dispatch.shouldConfirmDeletion);
   
      return { 
         resetPopup
      }
   }

   const render = someHooks => {
      const template = `
      <div class="popup-overlay overlay-confirm-delete" data-action="shouldShowOrHidePopup">
         <div class="popup-confirm-to-delete-account popup">
            <div class="close">
               <button class="close-sub-popup-target close-popup center-flex" tabindex="0" data-action="shouldHidePopup">
                  <img class="close-popup" src="./images/close_popup_icon.svg" alt="Fechar popup">
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
                     <form class="deletion-account-form">
                        <div class="container-input">
                           <input type="text" name="inputUsername" class="input-confirm-delete input-default" autocomplete="off">
                        </div>
                        <div class="buttons">
                           <button type="reset" class="close-sub-popup-target btn-default btn-cancel-confirm tertiary" data-action="shouldHidePopup">Cancelar</button>
                           <button type="submit" name="btnConfirm" class="btn-delete-confirm btn-default">
                              Excluir Conta
                              <div class="container-btn-loading center-flex">
                                 <div class="loading"></div>
                              </div>
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div class="popup-overlay overlay-profile" data-action="shouldShowOrHidePopup">
         <div class="popup-profile popup">
            <div class="close">
               <button class="close-popup-target close-popup center-flex" tabindex="0" data-action="shouldShowOrHidePopup">
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
               <form class="profile-photo-form">
                  <div class="container-photo">
                     <input type="file" name="inputFile" class="inputPhoto" id="inputPhoto" />
                     <label for="inputPhoto" title="Selecionar foto">
                        <img class="photoPreview" src="./images/avatar_icon.svg" alt="avatar icon" />
                        <div class="container-btn-loading center-flex">
                           <div class="loading"></div>
                        </div>
                     </label>
                  </div>
                  <div class="container-photo-contents">
                     <div class="photo-texts">
                        <div class="title-photo">
                           <h1>Foto de perfil</h1>
                        </div>
                        <div class="paragraph-photo">
                           <p>Arquivo aceito do tipo .png, .jpg e .jpeg até 1MB.</p>
                        </div>
                     </div>
                     <div class="button-photo">
                        <button type="submit" class="btn-submit btn-default tertiary">Enviar</button>
                     </div>
                  </div>
               </form>
               <div class="container-photo-error container-message">
                  <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                     <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                  </svg>
                  <span></span>
               </div>
               <div class="container-photo-success container-message">
                  <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                     <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                  </svg>
                  Tudo certo! Sua foto foi atualizada.
               </div>
            </div>

            <div class="container-slider">
               <div class="container-email-username show">
                  <form class="edit-profile-form">
                     <div class="input-and-message">
                        <div class="container-input">
                           <label for="input-username">Nome de usuário</label>
                           <input type="text" class="input-username input-default" id="input-username" value="" name="inputUsername" autocomplete="off">
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                     <div class="input-and-message">
                        <div class="container-input">
                           <label for="input-email">Endereço de email</label>
                           <input type="email" class="input-email input-default" id="input-email" value="" name="inputEmail" autocomplete="off">  
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                     <div class="container-messages">
                        <div class="container-credentials-success container-message">
                           <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                           </svg>
                           Tudo certo! Seus dados foram atualizados.
                        </div>
                        <div class="container-credentials-error container-message">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                              </path>
                           </svg> 
                           Houve um erro, tente novamente mais tarde!
                        </div>
                     </div>
                     <div class="container-buttons">
                        <div>
                           <button type="submit" class="btn-update-credentials btn-default btn-default-hover">
                              Salvar
                              <div class="container-btn-loading center-flex">
                                 <div class="loading"></div>
                              </div>
                           </button>
                           <button type="reset" class="btn-cancel btn-default tertiary">Cancelar</button>
                        </div>
                        <div>
                           <button type="button" class="slideForm btn-reset-password secondary btn-default" data-action="slideForm">
                              Alterar senha
                              <img src="./images/arrow_right.svg" alt="ícone de flecha" />
                           </button>
                        </div>
                     </div>
                  </form>
               </div>

               <div class="container-reset-password">
                  <form class="reset-password-form">
                     <div class="input-and-message">
                        <div class="container-input">
                           <label for="input-old-password">Senha antiga</label>
                           <div class="container-input-password">
                              <input type="password" class="input-old-password input-default input-password" id="input-old-password" value="" name="inputOldPassword" autocomplete="off">
                              <a class="btn-eyes">
                                 <i class="eye-password show" data-action="togglePasswordEye"></i>
                                 <i class="no-eye-password" data-action="togglePasswordEye"></i>
                              </a>
                           </div>
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                     <div class="input-and-message">
                        <div class="container-input">
                           <label for="input-new-password">Nova senha</label>
                           <div class="container-input-password">
                              <input type="password" class="input-new-password input-default input-password" id="input-new-password" value="" name="inputNewPassword" autocomplete="off">
                              <a class="btn-eyes">
                                 <i class="eye-password show" data-action="togglePasswordEye"></i>
                                 <i class="no-eye-password" data-action="togglePasswordEye"></i>
                              </a>
                           </div>
                        </div>
                        <div class="container-error">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                           </svg>
                           <span></span>
                        </div>
                     </div>
                     <div class="container-messages">
                        <div class="container-reset-password-success container-message">
                           <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1" viewBox="0 0 48 48" enable-background="new 0 0 48 48" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                              <circle fill="#4CAF50" cx="24" cy="24" r="21"></circle><polygon fill="#fff" points="34.6,14.6 21,28.2 15.4,22.6 12.6,25.4 21,33.8 37.4,17.4"></polygon>
                           </svg>
                           Tudo certo! Sua senha foi atualizada.
                        </div>
                        <div class="container-reset-password-error container-message">
                           <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
                              </path>
                           </svg> 
                           Houve um erro, tente novamente mais tarde!
                        </div>
                     </div>
                     <div class="container-buttons">
                        <div>
                           <button type="button" class="slideForm btn-email-username secondary btn-default" data-action="slideForm">
                              <img src="./images/arrow_right.svg" alt="ícone de flecha" />
                              Voltar
                           </button>
                        </div>
                        <div>
                           <button type="button" class="forgot-password">Esqueceu a senha?</button>
                           <button type="submit" class="btn-update-password btn-default btn-default-hover">
                              Alterar senha
                              <div class="container-btn-loading center-flex">
                                 <div class="loading"></div>
                              </div>
                           </button>
                        </div>
                     </div>
                  </form>
               </div>
            </div>

            <div class="popup-disable-account">
               <div class="container-texts-popup">
                  <h1>Desative sua conta</h1>
                  <p>Informações sobre a sua conta serão apagadas.</p>
               </div>
               <div class="container-button-disable">
                  <button class="btn-delete btn-default tertiary" data-action="hidePopup">Desativar</button>
               </div>
            </div>
         </div>
      </div>
      ` ;

      state.popupWrapper.innerHTML = template;

      const forms = createForms(someHooks);
      const popupDeletion = createPopupConfirmDeletion(someHooks);

      createPopup(forms, popupDeletion);
   }

   return { 
      render
   }
} 

export default createPopupProfile;