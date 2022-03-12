import { chooseRequestMessage, showMessageError } from "./handleErrors.js";
import { createCookie } from '../../auth/auth.js';

const formInit = apiUrl => {
   const formSignIn = document.querySelector('.form-signIn');
   const formSignUp = document.querySelector('.form-signUp');

   const PopupForms = {
      getFormSignInDatas({ inputEmail, inputPassword, inputCheckbox }) {
         return {
            email: inputEmail.value.trim(),
            password: inputPassword.value.trim(),
            keepConnected: inputCheckbox.checked
         }
      },
      getFormSignUpDatas({ inputUsername, inputEmail, inputPassword, inputConfirmPassword }) {
         return {
            username: inputUsername.value.trim(),
            email: inputEmail.value.trim(),
            password: [
               inputPassword.value.trim(),
               inputConfirmPassword.value.trim()
            ],
            keepConnected: false
         }
      }
   }

   const showAndHideLoading = index => {
      document.querySelectorAll('.popup-content')[index].classList.toggle('hideToLoading');
      document.querySelectorAll('.popup .container-loading')[index].classList.toggle('show');
   }

   // Request of form
   const submitForm = async (requestBody, { route, index }) => {
      try {
         showAndHideLoading(index);

         const requestOptions = {
            method: "POST",
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
         }

         const url = `${apiUrl}/${route}`;

         const response = await fetch(url, requestOptions);

         if (!response.ok) {
            throw new Error(`HTTP error, status: ${response.status}`);
         }

         const [data, status] = await response.json();

         console.log(data)

         showAndHideLoading(index);

         data.state === 'success'
            ? createCookie(data.userData, data.apiKey)
            : chooseRequestMessage(data.errors, index);

         if(status === 200) {
            const keepConnected = requestBody.keepConnected;

            sessionStorage.setItem('USER_FIRST_SESSION', true);
            localStorage.setItem('keepConnected', JSON.stringify(keepConnected));
         }

      } catch (error) {
         console.log(error)
         showAndHideLoading(index);
         chooseRequestMessage([{ state: 'error', reason: 'request error' }], index);
      }
   }

   const inputEmail = document.querySelector('.input-default[type="email"]');

   // Cofing datas
   inputEmail.addEventListener('invalid', e => {
      e.preventDefault();

      const thisInput = e.target;

      thisInput.validity.typeMismatch && showMessageError(
         thisInput, 'Digite um e-mail válido!'
      );
   })

   formSignIn.addEventListener('submit', e => {
      e.preventDefault();

      const datas = PopupForms.getFormSignInDatas(formSignIn);

      submitForm(datas, { route: 'login', index: 0 });
   });

   formSignUp.addEventListener('submit', e => {
      e.preventDefault();

      const datas = PopupForms.getFormSignUpDatas(formSignUp);

      submitForm(datas, { route: 'register', index: 1 });
   })
}

export default formInit;