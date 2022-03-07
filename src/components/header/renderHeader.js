import btnHamburguerInit from './hamburguer.js';

const renderHeader = hasToken => {
   const header = document.querySelector('header');

   const userNotLoggedIn = `
      <div class="container-buttonsToThePopup">
         <button class="button-signIn btn-default" id="button-signIn" data-js="0" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Entrar
         </button>
         <button class="button-signUp btn-default btn-default-hover" data-js="1" id="button-signUp" aria-expanded="false" aria-haspopup="true" aria-controls="menuAccount" aria-label="Abrir Menu">
            Registrar-se
         </button>
      </div>`;

   const loggedInUser = `
      <div class="container-isLoggedIn">
         <details class="user-information tabindex="0">
               <summary class="center-flex">
                  <img src="../images/avatar_icon.svg" alt="ícone do avatar do usuário">
               </summary>
               <ul>
                  <li class="user-edit" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Abrir caixa para editar perfil.">Editar perfil</li>
                  <li class="user-exit" tabindex="0" aria-label="Sair da conta.">Sair</li>
               </ul>
         </details>
         <div class="user-information-hamburguer">
               <ul>
                  <li class="user-edit" tabindex="0" aria-haspopup="true" aria-expanded="false" aria-label="Abrir caixa para editar perfil.">Editar perfil</li>
                  <li class="user-exit" tabindex="0" aria-label="Sair da conta.">Sair</li>
               </ul>
         </div>
      </div>`;

   const stringAuth = hasToken ? loggedInUser : userNotLoggedIn;

   const headerContent = `
      <div class="container-header-flex container-limiter">
         <a href="./index.html" tabindex="0">
            <div class="container-header-logo" title="Good Notes"></div>
         </a>
         <div class="container-content-header">
               <button class="button-hamburguer btn-default" aria-expanded="false" aria-haspopup="true" aria-label="Abrir Menu" aria-controls="menu-hamburguer" tabindex="0">
                  <span class="span-hamburguer"></span>
               </button>
               <div class="container-navigation">
                  <nav>
                     <ul>
                           <li>
                              <a href="#"class="link-home">
                                 Home
                              </a>
                           </li>
                           <li>
                              <a href="layout/registerNews/registerNews.html" class="link-create-notes">
                                 Criar Anotações
                              </a>
                           </li>
                           <li>
                              <a href="./index.html" class="link-show-notes">
                                 Exibir Anotações
                              </a>
                           </li>
                     </ul>
                  </nav>
                  <span class="pipe-header">|</span>
               </div>
               <div class="hamburguer-wrapper" aria-label="Fechar Menu"></div>
               <div class="container-authentication popup-hamburguer" id="menu-hamburguer" role="menu">
                  <nav class="nav-hamburguer">
                     <a href="#">
                        Home
                     </a>
                     <a href="layout/registerNews/registerNews.html">
                        Criar Anotações
                     </a>
                     <a href="./index.html">
                        Exibir Anotações
                     </a>
                  </nav>
                  <hr class="line-hamburguer">
                  ${stringAuth}
               </div>
         </div>
      </div>`;

   header.innerHTML = headerContent;

   btnHamburguerInit();
}

export default renderHeader;