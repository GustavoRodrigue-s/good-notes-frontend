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

      const showAndHide = () => {
         setAccessibilityProps();

         state.btnHamburguer.classList.toggle('active');
      } 

      state.btnHamburguer.addEventListener('pointerup', showAndHide);
   }

   function createMenuDropdown({ api, cookie }) {
      const state = {
         dropDown: document.querySelector('.container-isLoggedIn'),
         loading: document.querySelector('body > .container-loading')
      }

      const acceptedMenuActions = {
         showAndHideDropDown(e) {
            const closeOrOpen = e.target.classList.contains('active');

            e.target.setAttribute(
               'aria-label',
               closeOrOpen ? 'Abrir menu' : 'Fechar menu'
            );
         
            e.target.classList.toggle('active');
         },
         logoutAccount() {
            (async () => {
               try {
                  state.loading.classList.add('show');
      
                  await api.request({ auth: true, method: 'GET', route: "logout" });
      
                  throw 'exiting...';
      
               } catch(e) {
                  cookie.deleteCookies();
      
                  window.open('./index.html', '_self');
               }
            })();
         }
      }

      const menuDropDownListener = e => {
         const targetAction = e.target.dataset.action;

         if (acceptedMenuActions[targetAction]) {
            acceptedMenuActions[targetAction](e);
         }
      }

      state.dropDown.addEventListener('pointerup', menuDropDownListener);
   }

   const componentLoggedInUser = () => {
      const usernameTemplate = `
         <span class="item-username-hamburguer">Usuário</span>
         <hr>
      `

      const template = `
      <div class="container-isLoggedIn container-dropDown">
         <button class="btn-dropDown btn-wrapper-default btn-dropDown-header-menu" data-action="showAndHideDropDown" aria-label="Abrir menu" 
         aria-controls="menuAccount" aria-expanded="false" aria-haspopup="true">
            <img src="../../../images/avatar_icon.svg" alt="ícone do avatar do usuário">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 0 24 24" width="20px" fill="#000000">
               <path d="M24 24H0V0h24v24z" fill="none" opacity=".87"/><path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z"/>
            </svg>
         </button>
         <ul class="list-dropDown" id="menuAccount">
            <li class="item-username">Usuário</li>
            <hr>
            <li class="user-edit" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Abrir caixa para editar perfil." data-action="shouldShowOrHidePopup">Editar perfil</li>
            <li class="user-exit" data-action="logoutAccount" tabindex="0" aria-label="Sair da conta.">Sair</li>
         </ul>
      </div>
      `;

      return { template, usernameTemplate }
   }

   const componentNotLoggedInUser = () => {
      const template = `
      <div class="container-buttonsToThePopup">
         <button class="button-signIn btn-default" id="button-signIn" data-js="showSignInForm" data-action="shouldShowOrHidePopup" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Entrar
         </button>
         <button class="button-signUp btn-default btn-default-hover" data-js="showSignUpForm" data-action="shouldShowOrHidePopup" id="button-signUp" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Registrar-se
         </button>
      </div>
      `;

      return { template }
   }

   const updateProfileData = ({ photoUrl, username }) => {
      const image = state.header.querySelector('.btn-dropDown > img');
      const itemUsername = state.header.querySelector('.item-username');
      const itemUsernameHamburguer = state.header.querySelector('.item-username-hamburguer');

      photoUrl && image.setAttribute('src', photoUrl);

      if (username) {
         itemUsername.innerText = username;
         itemUsernameHamburguer.innerText = username;
      }
   }

   const render = ({ authenticated, api, cookie }) => {
      const { template, usernameTemplate } = authenticated ? componentLoggedInUser() : componentNotLoggedInUser();

      const headerTemplate = `
      <div class="container-header-flex">
         <a href="/" tabindex="0" class="link-logo">
            <div class="good-notes-logo">
               <span class="color-good">good</span>
               <span>notes</span>
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
            <div class="hamburguer-wrapper"></div>
            <button class="button-hamburguer btn-default btn-wrapper-default" aria-expanded="false" aria-haspopup="true" aria-label="Abrir Menu" aria-controls="menu-hamburguer" tabindex="0">
               <span class="span-hamburguer"></span>
            </button>
            <div class="container-authentication popup-hamburguer" id="menu-hamburguer">
               ${usernameTemplate ? usernameTemplate : ''}
               <nav class="nav-hamburguer">
                  <a href="/" class="link-home">
                     Home
                  </a>
                  <a href="./notes.html" class="my-notes">
                     Minhas Notas
                  </a>
               </nav>
               <hr class="line-hamburguer">
               ${template}
            </div>
         </div>
      </div>
      `;

      state.header.innerHTML = headerTemplate;

      createMenuHamburguer();
      authenticated && createMenuDropdown({ api, cookie });

      dispatch.shouldSetProfileData();
   }

   const dispatch = {
      shouldSetProfileData() {
         const profileData = sessionStorage.getItem('profileData');

         if (!profileData) {
            return
         }

         const { photo: photoUrl, username } = JSON.parse(profileData);

         updateProfileData({ photoUrl, username });
      }
   }

   return { 
      render,
      updateProfileData
   }
}

export default createHeader;