import AuthProvider from "../../auth/auth.js";
import categoryInit from "./category.js";

const auth = new AuthProvider();

auth.verifyAuth()
   .then(() => auth.authenticated && categoryInit());