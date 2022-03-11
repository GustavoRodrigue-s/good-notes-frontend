import { chooseErrors } from "./handleErrors.js";

const initProfileOptions = (api, getCookies, deleteCookies, toggleLoading, containerSuccessMessage) => {
   const popupProfile = document.querySelector('.popup-profile'),
   overlayConfirmDelete = document.querySelector('.overlay-confirm-delete'),
   inputConfirm = document.querySelector('.input-confirm-delete');

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

            const { accessToken, refreshToken, apiKey } = getCookies();

            const requestOptions = {
               method: "POST",
               headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `${accessToken};${refreshToken}`
               },
               body: JSON.stringify(updateCredentials)
            } 

            const url = `${api.url}/updateUser?key=${apiKey}`;
            const response = await fetch(url, requestOptions);

            if(!response.ok) {
               throw 'Http error';
            }

            const [data, status] = await response.json();

            if(data.newAccessToken) {
               document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
               
               submitChanges();
            } 

            data.state === 'success' && status !== 100
               ? setNewCredentials(data.newDatas) 
               : chooseErrors(data.reason);

            toggleLoading();

         }catch(e) {
            console.log(e);
            toggleLoading();
         }
      },
      "btn-delete"() {
         overlayConfirmDelete.nextElementSibling.classList.remove('show');

         inputConfirm.value = "";
         document.querySelector('.btn-delete-confirm')
            .className = 'btn-default btn-delete-confirm';

         setTimeout(() => {
            overlayConfirmDelete.classList.add('show');
         }, 300);
      },
      "close-sub-popup-target"() {
         overlayConfirmDelete.classList.remove('show');

         inputConfirm.value = "";
         document.querySelector('.btn-delete-confirm')
            .className = 'btn-default btn-delete-confirm';
         
         setTimeout(() => {
            overlayConfirmDelete.nextElementSibling.classList.add('show');
         }, 300);
      },
      async "btn-delete-confirm-active"() {
         this["close-sub-popup-target"]();
         
         try {
            toggleLoading();

            const { apiKey } = getCookies();

            const url = `${api.url}/deleteUser?key=${apiKey}`;
            const response = await fetch(url);

            if(!response.ok) {
               throw 'Http error';
            }

            const [data, status] = await response.json();

            deleteCookies();
            window.open('./index.html', '_self');

         } catch(e) {
            console.log(e);
            toggleLoading();
         }
      }
   }

   inputConfirm.addEventListener('input', () => {
      const btnDelete = document.querySelector('.btn-delete-confirm');
      const { username } = JSON.parse(sessionStorage.getItem('credentials'));

      username === inputConfirm.value
         ? btnDelete.className = 'btn-delete-confirm-active btn-default btn-delete-confirm'
         : btnDelete.className = 'btn-default btn-delete-confirm';
   });

   const chooseOption = e => {
      const firstClassOfTarget = e.target.classList[0];

      profileOptions[firstClassOfTarget] && profileOptions[firstClassOfTarget](e);
   }

   popupProfile.addEventListener('click', chooseOption);
   overlayConfirmDelete.firstElementChild.addEventListener('click', chooseOption);
}

export default initProfileOptions