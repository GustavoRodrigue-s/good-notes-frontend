import createAuthProvider from "../../auth/auth.js";
import createHeader from "../header/header.js";
import createPopupAuthForms from '../popupForms/popupAuthForms.js';
import createPopupProfile from '../popupProfile/popupProfile.js';

const auth = createAuthProvider();
const header = createHeader();
const popupAuthForms = createPopupAuthForms();
const popupProfile = createPopupProfile();

auth.subscribe('redirectingUserAsLoggedOut', header.render);
auth.subscribe('redirectingUserAsLoggedOut', popupAuthForms.render);

auth.subscribe('redirectingUserAsLoggedIn', header.render);
auth.subscribe('redirectingUserAsLoggedIn', popupProfile.render);

auth.verifyAuth();