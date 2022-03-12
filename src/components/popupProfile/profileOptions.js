import { chooseErrors } from "./handleErrors.js";

const initProfileOptions = tools => {
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

            tools.containerSuccessMessage.classList.add('show');
         }
         
         try {
            tools.toggleLoading();

            const { accessToken, refreshToken, apiKey } = tools.getCookies();

            const requestOptions = {
               method: "POST",
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${accessToken};${refreshToken}`
               },
               body: JSON.stringify(updateCredentials)
            } 

            const response = await fetch(tools.apiUrl+'/updateUser?key='+apiKey, requestOptions);

            if(!response.ok) throw 'Http error';

            const [data, status] = await response.json();

            if(data.newAccessToken) {
               document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
               
               profileOptions['btn-update-credentials'](e);
            } 

            data.state === 'success' && status !== 100
               ? setNewCredentials(data.newDatas) 
               : chooseErrors(data.reason);

               tools.toggleLoading();

         }catch(e) {
            console.log(e);
            tools.toggleLoading();
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
            tools.toggleLoading();

            const { apiKey } = tools.getCookies();

            const response = await fetch(tools.apiUrl+'/deleteUser?key='+apiKey);

            if(!response.ok) throw 'Http error';

            tools.deleteCookies();
            window.open('./index.html', '_self');

         } catch(e) {
            console.log(e);
            tools.toggleLoading();
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