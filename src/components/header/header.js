function createHeader() {
   const state = {
      header: document.querySelector('header')
   }

   function createMenuHamburguer() {
      const state = {
         btnHamburguer: document.querySelector('.button-hamburguer'),
         show: false
      }

      const setAccessibilityProps = () => {
         state.show = !state.show;

         state.show
            ? state.btnHamburguer.setAttribute('aria-label', 'Fechar Menu')
            : state.btnHamburguer.setAttribute('aria-label', 'Abrir Menu');

         state.btnHamburguer.setAttribute('aria-expanded', state.show);
      }

      const showAndHide = e => {
         if (e.type === 'touchstart') e.preventDefault();

         setAccessibilityProps();

         state.btnHamburguer.classList.toggle('active');
      } 

      state.btnHamburguer.addEventListener('click', showAndHide);
      state.btnHamburguer.addEventListener('touchstart', showAndHide);
   }

   const componentLoggedInUser = () => {
      const template = `
      <div class="container-isLoggedIn container-dropDown">
         <button class="btn-dropDown btn-wrapper-default btn-dropDown-header-menu">
            <img src="../../../images/avatar_icon.svg" alt="ícone do avatar do usuário">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#000000">
               <path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
            </svg>
         </button>
         <ul class="list-dropDown">
            <li class="user-edit" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Abrir caixa para editar perfil.">Editar perfil</li>
            <li class="user-exit" tabindex="0" aria-label="Sair da conta.">Sair</li>
         </ul>
      </div>
      `;

      return template
   }

   const componentNotLoggedInUser = () => {
      const template = `
      <div class="container-buttonsToThePopup">
         <button class="button-signIn btn-default" id="button-signIn" data-js="showSignInForm" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Entrar
         </button>
         <button class="button-signUp btn-default btn-default-hover" data-js="showSignUpForm" id="button-signUp" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Registrar-se
         </button>
      </div>
      `;

      return template
   }

   const render = hasToken => {
      const currentComponent = hasToken ? componentLoggedInUser() : componentNotLoggedInUser();

      const headerTemplate = `
      <div class="container-header-flex">
         <a href="/" tabindex="0" class="link-logo">
            <div class="good-notes-logo">
               <svg width="42" height="35" viewBox="0 0 43 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6.25" y="0.25" width="36.5" height="30.5" rx="4.75" fill="#0058DB" stroke="white" stroke-width="0.5"/>
                  <path d="M6 6.25H31C34.1756 6.25 36.75 8.82436 36.75 12V31C36.75 34.1756 34.1756 36.75 31 36.75H10C4.61522 36.75 0.25 32.3848 0.25 27V12C0.25 8.82436 2.82436 6.25 6 6.25Z" fill="#0066FF" stroke="white" stroke-width="0.5"/>
                  <line x1="5.5" y1="11.5" x2="32.5" y2="11.5" stroke="white" stroke-linecap="round"/>
                  <line x1="5.5" y1="19.5" x2="32.5" y2="19.5" stroke="white" stroke-linecap="round"/>
                  <line x1="5.5" y1="15.5" x2="32.5" y2="15.5" stroke="white" stroke-linecap="round"/>
               </svg>
               Good Notes
            </div>
         </a>
         <div class="container-content-header container-dropDown">
            <div class="container-navigation">
               <nav>
                  <ul>
                     <li>
                        <a href="/" class="link-home">
                           Home
                        </a>
                     </li>
                     <li>
                        <a href="./notes.html" class="my-notes">
                           Minhas Notas
                        </a>
                     </li>
                  </ul>
               </nav>
               <span class="pipe-header">|</span>
            </div>
            <div class="hamburguer-wrapper" aria-label="Fechar Menu"></div>
            <button class="button-hamburguer btn-default btn-wrapper-default" aria-expanded="false" aria-haspopup="true" aria-label="Abrir Menu" aria-controls="menu-hamburguer" tabindex="0">
               <span class="span-hamburguer"></span>
            </button>
            <div class="container-authentication popup-hamburguer" id="menu-hamburguer" role="menu">
               <nav class="nav-hamburguer">
                  <a href="/" class="link-home">
                     Home
                  </a>
                  <a href="./notes.html" class="my-notes">
                     Minhas Notas
                  </a>
               </nav>
               <hr class="line-hamburguer">
               ${currentComponent}
            </div>
         </div>
      </div>
      `;

      state.header.innerHTML = headerTemplate;

      createMenuHamburguer();
   }

   return { 
      render 
   }
}

const header = createHeader();

export default header;