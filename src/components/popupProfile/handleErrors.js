export const showErrorMessage = (input, message) => {
   const containerInputAndMessage = input.parentElement.parentElement;
   const containerError = containerInputAndMessage.lastElementChild;

   const template = `
      <svg fill="currentColor" width="16px" height="16px" viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg">
         <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
      </svg>
      ${message}
   `

   containerError.innerHTML = message ? template : "";
   containerInputAndMessage.classList.add('error');

   input.addEventListener('keydown', () => 
      containerInputAndMessage.classList.remove('error'));
}

export const chooseErrors = data => {
   const errors = {
      "empty input"({ input }) {
         const currentInput = document.querySelector(`.edit-profile-form .${input}`);

         showErrorMessage(currentInput, 'Preencha este campo!');
      },
      "email already exists"({ input }) {
         const currentInput = document.querySelector(`.edit-profile-form .${input}`);

         showErrorMessage(currentInput, 'Este email já existe!');
      },
      "username already exists"({ input }) {
         const currentInput = document.querySelector(`.edit-profile-form .${input}`);

         showErrorMessage(currentInput, 'Este nome já existe!');
      }
   }

   data.forEach(data => {
      errors[data.reason] && errors[data.reason](data);
   })
}