export const showMessageError = (input, message) => {
   const containerGenericError = document.querySelectorAll('form > .generic-container')

   const containerErrorAndInput = input.parentElement.parentElement,
   containerError = containerErrorAndInput.lastElementChild;

   const template = `
      <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z">
            </path>
      </svg>
      ${message}
   `;

   containerError.innerHTML = message === '' ? '' : template;

   containerErrorAndInput.classList.add('error');

   input.addEventListener('keydown', () => {
      containerErrorAndInput.classList.remove('error');
      containerGenericError.forEach(container => container.classList.remove('error'));
   });
}

export const chooseRequestMessage = (response, index) => {
   const containerGenericError = document.querySelectorAll('form > .generic-container')

   const formSignUp = document.querySelector('.form-signUp'),
   formSignIn = document.querySelector('.form-signIn');

   const whatError = {
      "empty input"({ input }) {
         const thisForm = index === 0 ? 'form-signIn' : 'form-signUp';
         const currentInput = document.querySelector(`.${thisForm} .${input}`);
         
         if(input === 'inputs-passwords') {
            const { inputPassword, inputConfirmPassword } = formSignUp;

            showMessageError(inputPassword, 'Preencha os dois campos!');
            showMessageError(inputConfirmPassword, 'Preencha os dois campos!');
         } else {
            showMessageError(currentInput, 'Preencha este campo!');
         }
      },
      "wrong credentials"() {
         const { inputEmail, inputPassword } = formSignIn;

         showMessageError(inputEmail, '');
         showMessageError(inputPassword, 'Email ou senha incorretos!');

         const removeError = () => {
            inputEmail.parentElement.parentElement.classList.remove('error');
            inputPassword.parentElement.parentElement.classList.remove('error');
         }

         inputEmail.addEventListener('keydown', removeError);
         inputPassword.addEventListener('keydown', removeError);
      },
      "username already exists"() {
         showMessageError(formSignUp.inputUsername, 'Este nome já existe!');
      },
      "email already exists"() {
         showMessageError(formSignUp.inputEmail, "Este email já existe!");
      },
      "differents passwords"() {
         const { inputPassword, inputConfirmPassword } = formSignUp;

         showMessageError(inputPassword, 'Senhas diferentes!');
         showMessageError(inputConfirmPassword, 'Senhas diferentes!');
      },
      "request error"() {
         containerGenericError[index].classList.add('error');
      }
   }

   response.forEach(data => {
      whatError[data.reason] 
         ? whatError[data.reason](data)
         : whatError['request error']();
   })
}