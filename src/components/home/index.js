import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';
import createConfirmationCode from "../confirmationCode/confirmationCode.js";

function createHomeApp() {
   const confirmationCode = createConfirmationCode();

   const auth = createAuthProvider();
   const header = createHeader();
   const popupAuthForms = createPopupAuthForms(confirmationCode);
   const popupProfile = createPopupProfile(header, confirmationCode);
   
   confirmationCode.render();

   auth.subscribe('unauthenticated', header.render);
   auth.subscribe('unauthenticated', popupAuthForms.render);

   auth.subscribe('authenticated', header.render);
   auth.subscribe('authenticated', popupProfile.render);

   auth.verifyAuth();
}

createHomeApp();