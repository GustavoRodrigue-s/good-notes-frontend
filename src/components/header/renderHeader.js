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
      <div class="container-header-flex">
         <a href="./index.html" tabindex="0" class="link-logo">
            <div class="good-notes-logo">
               <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" style="overflow: visible;">
                  <g fill="#000" transform="matrix(0.4, 0, 0, 0.4, 0 0)" data-uid="o_en83865jn_4" width="30" height="30">
                     <path d="M80.6,66.5h-8.4v-1h8.4c3,0,5.4-2.4,5.4-5.4V25.6c0-3-2.4-5.4-5.4-5.4H35.8c-3,0-5.4,2.4-5.4,5.4v8.2h-1v-8.2 c0-3.5,2.9-6.4,6.4-6.4h44.8c3.5,0,6.4,2.9,6.4,6.4v34.5C87,63.6,84.1,66.5,80.6,66.5z"  fill="#000" data-uid="o_en83865jn_5">
                     </path>
                     <path d="M64.9,80.8H33.1C22,80.8,13,71.8,13,60.7V41.2c0-4.3,3.5-7.7,7.7-7.7h44.2c4.3,0,7.7,3.5,7.7,7.7v31.9  C72.6,77.4,69.1,80.8,64.9,80.8z M20.7,34.5c-3.7,0-6.7,3-6.7,6.7v19.5c0,10.5,8.6,19.1,19.1,19.1h31.8c3.7,0,6.7-3,6.7-6.7V41.2     c0-3.7-3-6.7-6.7-6.7H20.7z"  fill="#000" data-uid="o_en83865jn_6">
                     </path>
                     <path  fill="#000" data-type="polygon" d="M30.9 80.3L29.9 80.3L29.9 64L13.5 64L13.5 63L30.9 63Z" data-uid="o_en83865jn_7"></path><path  fill="#000" data-type="rect" data-x="21.9" data-y="44.6" data-width="41.3" data-height="1" d="M21.9 44.6H63.199999999999996 V45.6 H21.9 Z" data-uid="o_en83865jn_8">
                     </path>
                     <path fill="#000" data-type="rect" data-x="21.9" data-y="53.2" data-width="41.3" data-height="1" d="M21.9 53.2H63.199999999999996 V54.2 H21.9 Z" data-uid="o_en83865jn_9"></path>
                  </g>
               </svg>
               Good Notes
            </div>
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
                           <a href="#" class="my-notes">
                              Minhas Notas
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
                     <a href="#" class="my-notes">
                        Minhas Notas
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