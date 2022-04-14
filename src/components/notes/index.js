import AuthProvider from "../../auth/auth.js";
import categoryInit from "./category.js";
import notesInit from "./notes.js";

const auth = new AuthProvider();

auth.verifyAuth()
   .then(() => {
      if (auth.authenticated) {
         categoryInit();
         notesInit();
      }
   });