import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';
import createEmailConfirmation from "../emailConfirmation/emailConfirmation.js";
import createResetPassword from '../resetPassword/resetPassword.js';

function createHomeApp() {

   const auth = createAuthProvider();
   const header = createHeader();
   const confirmationCode = createEmailConfirmation();
   const resetPassword = createResetPassword(confirmationCode);
   const popupAuthForms = createPopupAuthForms(confirmationCode, resetPassword);
   const popupProfile = createPopupProfile(header, confirmationCode, resetPassword);

   const renderStandardComponents = hooks => {
      header.render(hooks);
      confirmationCode.render(hooks);
      resetPassword.render(hooks);
   }

   auth.subscribe('unauthenticated', renderStandardComponents);
   auth.subscribe('unauthenticated', popupAuthForms.render);

   auth.subscribe('authenticated', renderStandardComponents);
   auth.subscribe('authenticated', popupProfile.render);

   auth.verifyAuth();
}

createHomeApp();