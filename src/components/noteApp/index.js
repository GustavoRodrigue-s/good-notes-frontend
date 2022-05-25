import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupProfile from '../popupProfile/popupProfile.js';

import createNoteApp from './noteApp.js';

function createNoteAuth() {
   const auth = createAuthProvider();

   const header = createHeader();
   const popupProfile = createPopupProfile();

   const redirectUser = () => {  
      localStorage.setItem('unauthorized', true);

      window.location.href = 'index.html';
   }

   auth.subscribe('unauthenticated', redirectUser);

   auth.subscribe('authenticated', header.render);
   auth.subscribe('authenticated', popupProfile.render);

   auth.subscribe('authenticated', createNoteApp);

   auth.verifyAuth();
}

createNoteAuth();