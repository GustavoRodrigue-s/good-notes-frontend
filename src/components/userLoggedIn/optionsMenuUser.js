import api from '../../services/api.js';
import renderPopupEditProfile from "./renderPopupEditProfile.js";
import { deleteCookies, getCookies } from '../../auth/auth.js';

const optionsMenuUser = () => {
   renderPopupEditProfile();

   const containerIsLoggedIn = document.querySelector('.container-isLoggedIn');
   const popupWrapper = document.querySelector('.popup-wrapper-profile');

   // Open and close menu options.

   const summaryOptions = document.querySelector('.user-information > summary');

   summaryOptions.addEventListener('click', () => {
      summaryOptions.classList.toggle('show');
   });

   const logoutAccount = async () => {
      try {
         const { accessToken, refreshToken, apiKey } = getCookies();

         const requestOptions = {
            headers: {
               'Content-Type': 'aplication/json',
               'Authorization': `${accessToken};${refreshToken}`
            }
         }

         const response = await fetch(`${api.url}/logout?key=${apiKey}`, requestOptions);

         if(!response.ok) throw `HTTP error, status: ${response.status}`;

         const [data, status] = await response.json();

         if(data.newAccessToken) {
            document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;

            logoutAccount();
         }else {
            throw 'exiting...';
         }

      } catch(e) {
         deleteCookies();

         window.open('./index.html', '_self');
      }
   }

   const toggleLoading = () => {
      const containerLoading = document.querySelector('.popup-profile .container-loading');
      containerLoading.classList.toggle('show');
   }

   // form profile

   const { inputEmail, inputUsername } = document.querySelector('.edit-profile-form');

   const containerError = document.querySelector('.container-error-profile');

   const resetPopup = () => {
      inputEmail.setAttribute('value', '');
      inputUsername.setAttribute('value', '');

      containerError.classList.remove('show');
   }

   // Credentails Saved

   const handleSavedCredentials = () => {
      const credentials = JSON.parse(sessionStorage.getItem('credentials'));

      inputEmail.setAttribute('value', credentials.email);
      inputUsername.setAttribute('value', credentials.username);
   }

   const setCredentials = ({ email, username }) => {
      sessionStorage.setItem(
         'credentials',
         JSON.stringify({ email: email, username: username }) 
      )         

      inputEmail.setAttribute('value', email);
      inputUsername.setAttribute('value', username);
   }

   // Get user credentials

   const getUserCredentials = async () => {
      try {
         toggleLoading();

         const { accessToken, refreshToken, apiKey } = getCookies();

         const requestOptions = {
            headers: {
               'Content-Type': 'aplication/json',
               'Authorization': `${accessToken};${refreshToken}`
            }
         }

         const response = await fetch(`${api.url}/profile?key=${apiKey}`, requestOptions);

         if(!response.ok) throw `HTTP error, status: ${response.status}`;

         const [data, status] = await response.json();
         
         if(data.newAccessToken) {
            document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
            
            getUserCredentials();
         }else if(status !== 200) {
            throw 'The tokens is not valid.';
         }

         status === 200 && setCredentials(data);

         toggleLoading();

      }catch(e) {
         toggleLoading();
         containerError.classList.add('show');
      }
   }

   // Accessibility

   const userEdit = document.querySelectorAll('.container-isLoggedIn .user-edit');
   let show = false;

   const accessibilityForUsers = () => {
      show = !show;

      userEdit.forEach(btn => btn.setAttribute('aria-expanded', show));

      show 
         ? userEdit.forEach(btn => btn.setAttribute('aria-label', 'Fechar caixa para editar perfil.'))
         : userEdit.forEach(btn => btn.setAttribute('aria-label', 'Abrir caixa para editar perfil.'));
   }

   // Open and close popup option (Editar Perfil).
   
   let avalibleToOpen = true;

   const waitForTheClickTime = () => {
      avalibleToOpen = false;
      if (!avalibleToOpen) setTimeout(() => avalibleToOpen = true, 650);
   }

   const togglePopupEditProfile = e => {
      if(!avalibleToOpen) return

      const firstClassOfClickedElement = e.target.classList[0];
      
      const listOfElementsToToggle = ['close-popup-target', 'popup-overlay', 'user-edit'];

      const toggle = listOfElementsToToggle.includes(firstClassOfClickedElement);

      if (toggle) {
         resetPopup();
         
         waitForTheClickTime();

         accessibilityForUsers();

         popupWrapper.classList.toggle('show');

         if(!popupWrapper.classList.contains('show')) return

         !sessionStorage.getItem('credentials')
            ? getUserCredentials()
            : handleSavedCredentials();
      }
   }

   // Choose options account.

   const chooseOption = e => {
      if (e.type === 'touchstart') e.preventDefault();

      const firstClassOfClickedElement = e.target.classList[0];

      firstClassOfClickedElement === 'user-exit'
         ? logoutAccount()
         : togglePopupEditProfile(e);
   }

   containerIsLoggedIn.addEventListener('mousedown', chooseOption);
   popupWrapper.addEventListener('mousedown', togglePopupEditProfile);
}

export default optionsMenuUser;