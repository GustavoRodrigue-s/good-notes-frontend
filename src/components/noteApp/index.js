import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupProfile from '../popupProfile/popupProfile.js';
import createEmailConfirmation from "../emailConfirmation/emailConfirmation.js";
import createRecoverAccount from '../recoverAccount/recoverAccount.js';

import createNoteApp from './noteApp.js';

function createNoteAuth() {
   const auth = createAuthProvider();
   const confirmationCode = createEmailConfirmation();
   const recoverAccount = createRecoverAccount(confirmationCode);

   const header = createHeader();
   const popupProfile = createPopupProfile(header, confirmationCode, recoverAccount);

   const redirectUser = () => {  
      localStorage.setItem('unauthorized', true);

      window.location.href = 'index.html';
   }

   auth.subscribe('unauthenticated', redirectUser);

   auth.subscribe('authenticated', header.render);
   auth.subscribe('authenticated', popupProfile.render); 
   auth.subscribe('authenticated', recoverAccount.render);
   auth.subscribe('authenticated', confirmationCode.render);

   auth.subscribe('authenticated', createNoteApp);

   auth.verifyAuth();
}

createNoteAuth();