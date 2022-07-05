import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';
import createEmailConfirmation from "../emailConfirmation/emailConfirmation.js";
import createRecoverAccount from '../recoverAccount/recoverAccount.js';

function createHomeApp() {

   const auth = createAuthProvider();
   const header = createHeader();
   const confirmationCode = createEmailConfirmation();
   const recoverAccount = createRecoverAccount(confirmationCode);
   const popupAuthForms = createPopupAuthForms(confirmationCode, recoverAccount);
   const popupProfile = createPopupProfile(header, confirmationCode, recoverAccount);

   const renderStandardComponents = hooks => {
      header.render(hooks);
      confirmationCode.render(hooks);
      recoverAccount.render(hooks);
   }

   auth.subscribe('unauthenticated', renderStandardComponents);
   auth.subscribe('unauthenticated', popupAuthForms.render);

   auth.subscribe('authenticated', renderStandardComponents);
   auth.subscribe('authenticated', popupProfile.render);

   auth.verifyAuth();
}

createHomeApp();