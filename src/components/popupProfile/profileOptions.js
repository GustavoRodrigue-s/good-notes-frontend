import { chooseErrors } from "./handleErrors.js";

const initProfileOptions = ({ api, containerSuccessMessage, toggleLoading, deleteCookies }) => {

   const popupProfile = document.querySelector('.popup-profile'),
   popupDeleteAccount = document.querySelector('.popup-confirm-to-delete-account'),
   inputConfirm = document.querySelector('.input-confirm-delete'),
   btnDeleteConfirm = document.querySelector('.btn-delete-confirm');

   const resetPopupConfirmToDeleteAccount = () => {
      inputConfirm.value = "";
      btnDeleteConfirm.className = 'btn-default btn-delete-confirm';
   }

   const profileOptions = {
      async 'btn-update-credentials'(e) {
         e.preventDefault();

         const { inputUsername, inputEmail } = document.querySelector('.edit-profile-form');

         const updateCredentials = {
            email: inputEmail.value.trim(),
            username: inputUsername.value.trim()
         };

         const verifyIfIsEqual = () => {
            const lastCredentials = JSON.parse(sessionStorage.getItem('credentials'));

            let isEqual = true;

            for (const key in updateCredentials) {
               isEqual = isEqual && lastCredentials[key] === updateCredentials[key];
            }

            return isEqual
         }

         const isEqual = verifyIfIsEqual();

         if (isEqual) return

         const setNewCredentials = newCredentials => {
            sessionStorage.setItem('credentials', JSON.stringify(newCredentials));

            inputEmail.setAttribute('value', newCredentials.email);
            inputUsername.setAttribute('value', newCredentials.username);

            containerSuccessMessage.classList.add('show');
         }
         
         try {
            toggleLoading();

            const [data, status] = await api.request({
               method: "POST",
               route: "updateUser",
               body: updateCredentials,
               auth: true
            });

            if(data.newAccessToken) {
               document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
               
               profileOptions['btn-update-credentials'](e);
            } 

            data.state === 'success' && status !== 100
               ? setNewCredentials(data.newDatas) 
               : chooseErrors(data.reason);

               toggleLoading();

         }catch(e) {
            toggleLoading();
         }
      },
      "btn-delete"() {
         popupProfile.parentElement.classList.remove('show');
         resetPopupConfirmToDeleteAccount();

         setTimeout(() => 
            popupDeleteAccount.parentElement.classList.add('show'), 300);
      }
   }

   const confirmToDeleteAccountOptions = {
      async "btn-delete-confirm-active"() {
         this["close-sub-popup-target"]();
         
         try {
            toggleLoading();

            await api.request({auth: true, route: "deleteUser"});

            deleteCookies();
            window.open('./index.html', '_self');

         } catch(e) {
            toggleLoading();
         }
      },
      "close-sub-popup-target"() {
         popupDeleteAccount.parentElement.classList.remove('show');
         resetPopupConfirmToDeleteAccount();
         
         setTimeout(() => 
            popupProfile.parentElement.classList.add('show'), 300);
      }
   }

   inputConfirm.addEventListener('input', () => {
      const { username } = JSON.parse(sessionStorage.getItem('credentials'));

      username === inputConfirm.value
         ? btnDeleteConfirm.className = 'btn-delete-confirm-active btn-default btn-delete-confirm'
         : btnDeleteConfirm.className = 'btn-default btn-delete-confirm';
   });

   popupProfile.addEventListener('click', e => {
      const firstClassOfTarget = e.target.classList[0];
      profileOptions[firstClassOfTarget] && profileOptions[firstClassOfTarget](e);
   });

   popupDeleteAccount.addEventListener('click', e => {
      const firstClassOfTarget = e.target.classList[0];
      confirmToDeleteAccountOptions[firstClassOfTarget] && confirmToDeleteAccountOptions[firstClassOfTarget](e);
   });
}

export default initProfileOptions