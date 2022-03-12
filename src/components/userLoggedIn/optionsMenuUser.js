import initProfileOptions from '../popupProfile/ProfileOptions.js';
import { deleteCookies, getCookies,  } from '../../auth/auth.js';

const optionsMenuUser = apiUrl => {
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
               'Content-Type': 'application/json',
               'Authorization': `${accessToken};${refreshToken}`
            }
         }

         const response = await fetch(`${apiUrl}/logout?key=${apiKey}`, requestOptions);

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

   const containerError = document.querySelector('.popup-profile .container-error-profile');
   const containerSuccessMessage = document.querySelector('.popup-profile .container-success-profile');


   const resetPopup = () => {
      const containerInputMessage = 
         document.querySelectorAll('.edit-profile-form .input-and-message');

      containerInputMessage.forEach(cont => cont.classList.remove('error'));

      inputEmail.setAttribute('value', '');
      inputUsername.setAttribute('value', '');

      containerError.classList.remove('show');
      containerSuccessMessage.classList.remove('show');

      popupWrapper.lastElementChild.classList.remove('show');
      popupWrapper.firstElementChild.classList.remove('show');
   }

   // Credentails Saved

   const handleSavedCredentials = () => {
      const { email, username } = JSON.parse(sessionStorage.getItem('credentials'));

      inputEmail.setAttribute('value', email);
      inputUsername.setAttribute('value', username);
      
      inputEmail.value = email;
      inputUsername.value = username;
   }

   const setCredentials = ({ email, username }) => {
      sessionStorage.setItem('credentials',
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
               'Content-Type': 'application/json',
               'Authorization': `${accessToken};${refreshToken}`
            }
         }

         const response = await fetch(`${apiUrl}/profile?key=${apiKey}`, requestOptions);

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
         else popupWrapper.lastElementChild.classList.toggle('show');

         !sessionStorage.getItem('credentials') ? getUserCredentials() : handleSavedCredentials();
      }
   }

   const chooseOption = e => {
      if (e.type === 'touchstart') e.preventDefault();

      const firstClassOfClickedElement = e.target.classList[0];

      firstClassOfClickedElement === 'user-exit'
         ? logoutAccount()
         : togglePopupEditProfile(e);
   }

   containerIsLoggedIn.addEventListener('mousedown', chooseOption);
   popupWrapper.addEventListener('mousedown', togglePopupEditProfile);

   const tools = { 
      apiUrl: apiUrl,
      getCookies,
      deleteCookies,
      toggleLoading,
      containerSuccessMessage: containerSuccessMessage
   }

   initProfileOptions(tools);
}

export default optionsMenuUser;