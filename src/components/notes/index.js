import auth from "../../auth/auth.js";
import createNoteApp from './noteApp.js';

async function createNoteAuth() {
   const authenticated = await auth.verifyAuth();

   if (authenticated) {
      createNoteApp();
   }
}

createNoteAuth();