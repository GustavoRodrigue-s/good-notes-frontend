import formInit from "./submitForms.js";

const popupFormInit = () => {
   const containerButtons = document.querySelector('.container-buttonsToThePopup');
   const popupWrapper = document.querySelector('.popup-wrapper-auth');
   const eyePasswords = document.querySelectorAll('.eye-password');

   // Show and hide input value password.

   const togglePasswordEye = e => {
      if (e.type === "touchstart") e.preventDefault();

      const eyePassword = e.target;
      const inputPassword = eyePassword.previousElementSibling.previousElementSibling;

      const typeInput = inputPassword.getAttribute('type') === 'password' ? 'text' : 'password';

      inputPassword.setAttribute('type', typeInput);
      eyePassword.classList.toggle('show');
   }

   // Focus on the first input of the form.

   const inputFocus = () => {
      const inputAutoFocus = document.querySelector('[autofocus]');
      setTimeout(() => inputAutoFocus.focus(), 400);
   }

   //  Choose popup form.

   let avalibleToOpen = true;

   const currentForm = e => {
      if (!avalibleToOpen) return
      if (e.type === 'touchstart') e.preventDefault();

      const popupsOverlay = document.querySelectorAll('.popup-overlay'),
      dataJsOfTheElementClicked = e.target.dataset.js;
      
      const addShowClassOfPopup = () => {
         popupsOverlay[dataJsOfTheElementClicked].classList.add('show');
         
         if (popupsOverlay[0].classList.contains('show')) inputFocus();
      }

      if (dataJsOfTheElementClicked) {
         popupsOverlay[0].classList.remove('show');
         popupsOverlay[1].classList.remove('show');

         waitForTheClickTime();

         popupWrapper.classList.contains('show')
            ? setTimeout(addShowClassOfPopup, 300)
            : addShowClassOfPopup();
      }
   }

   const resetPopup = () => {
      const forms = document.querySelectorAll('.popup-wrapper-auth form');
      const containerErrorAndInput = document.querySelectorAll('.container-errorAndInput');

      forms[0].reset();
      forms[1].reset();

      containerErrorAndInput.forEach(container => container.classList.remove('error'));

      eyePasswords.forEach(eye => {
         eye.classList.remove('show');

         const inputPassword = eye.previousElementSibling.previousElementSibling;
         inputPassword.setAttribute('type', 'password');
      });
   }

   // Wait for the click time

   const waitForTheClickTime = () => {
      avalibleToOpen = false;
      if (!avalibleToOpen) setTimeout(() => avalibleToOpen = true, 650);
   }

   // Open and close popup wrapper.

   let show = false;

   const togglePopUpWrapper = e => {
      if (!avalibleToOpen) return
      if (e.type === 'touchstart') e.preventDefault();

      const firstClassOfClickedElement = e.target.classList[0];

      currentForm(e);

      const listOfElementsToToggle = ['close-popup-target', 'popup-overlay', 'button-signIn', 'button-signUp'];

      const toggle = listOfElementsToToggle.includes(firstClassOfClickedElement);
      
      if (toggle) {
         resetPopup();

         const buttons = [containerButtons.firstElementChild, containerButtons.lastElementChild];

         show = !show;

         show
            ? buttons.forEach(button => button.setAttribute('aria-label', 'Fechar Menu'))
            : buttons.forEach(button => button.setAttribute('aria-label', 'Abrir Menu'));

         buttons.forEach(button => button.setAttribute('aria-expanded', show));

         popupWrapper.classList.toggle('show');

         waitForTheClickTime();
      }
   }

   containerButtons.addEventListener('click', togglePopUpWrapper);
   containerButtons.addEventListener('touchstart', togglePopUpWrapper);

   popupWrapper.addEventListener('mousedown', togglePopUpWrapper);

   eyePasswords.forEach(eye => {
      eye.addEventListener('click', togglePasswordEye)
      eye.addEventListener('touchstart', togglePasswordEye);
   })

   formInit();
}

export default popupFormInit;