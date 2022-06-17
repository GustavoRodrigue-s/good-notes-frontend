import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';
import createEmailConfirmation from "../emailConfirmation/emailConfirmation.js";

function createHomeApp() {
   const confirmationCode = createEmailConfirmation();

   const auth = createAuthProvider();
   const header = createHeader();
   const popupAuthForms = createPopupAuthForms(confirmationCode);
   const popupProfile = createPopupProfile(header);

   auth.subscribe('unauthenticated', header.render);
   auth.subscribe('unauthenticated', popupAuthForms.render);
   auth.subscribe('unauthenticated', confirmationCode.render);

   auth.subscribe('authenticated', header.render);
   auth.subscribe('authenticated', popupProfile.render);
   auth.subscribe('authenticated', confirmationCode.render);

   auth.verifyAuth();
}

createHomeApp();