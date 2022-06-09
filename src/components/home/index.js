import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';

function createHomeApp() {
   const auth = createAuthProvider();
   const header = createHeader();
   const popupAuthForms = createPopupAuthForms();
   const popupProfile = createPopupProfile(header);

   auth.subscribe('unauthenticated', header.render);
   auth.subscribe('unauthenticated', popupAuthForms.render);

   auth.subscribe('authenticated', header.render);
   auth.subscribe('authenticated', popupProfile.render);

   auth.verifyAuth();
}

createHomeApp();