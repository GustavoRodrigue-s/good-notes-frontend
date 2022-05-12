import createAuthProvider from "../../auth/auth.js";
import createNoteApp from './noteApp.js';

async function createNoteAuth() {
   const auth = createAuthProvider();

   auth.subscribe('authenticated', createNoteApp);

   await auth.verifyAuth();
}

createNoteAuth();