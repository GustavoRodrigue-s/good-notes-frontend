import api from '../../services/api.js';
import { getCookies } from '../../services/cookie.js';
import AuthProvider from "../../auth/auth.js";
import categoryInit from "./category.js";
import notesInit from "./notes.js";

const auth = new AuthProvider();

auth.verifyAuth()
   .then(() => {
      if (auth.authenticated) {
         const shouldGetNotes = notesInit({ api, getCookies });
         categoryInit({ api, getCookies, shouldGetNotes });
      }
   });