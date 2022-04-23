import api from '../../services/api.js';
import { getCookies } from '../../services/cookie.js';
import AuthProvider from "../../auth/auth.js";
import categoryInit from "./category.js";
import notesInit from "./notes.js";

const createLoadingHandler = () => {
   const state = {
      loading: document.querySelector('.container-auto-save'),
      queueLength: 0
   }

   const addToQueue = () => {
      state.queueLength += 1;
   }

   const clearQueue = () => {
      state.queueLength = 0;
   }

   const resetAnimation = () => {
      const shouldResetAnimation = state.loading.classList.contains('show')

      if (shouldResetAnimation) {
         state.loading.classList.add('reset');
         setTimeout(() => state.loading.classList.remove('reset'), 100);
      }
   }

   const showLoading = () => {
      resetAnimation();
      addToQueue();

      state.loading.classList.add('show');

      return state.queueLength;
   }

   const hideLoading = () => {
      clearQueue();
      state.loading.classList.remove('show');
   }

   const dispatch = {
      shouldHideLoading(id) {
         const lastQueueNumber = state.queueLength; 
   
         const someId = lastQueueNumber === id;

         someId && hideLoading();
      }
   }

   return { 
      showLoading, 
      shouldHideLoading: dispatch.shouldHideLoading 
   }
}

const loading = createLoadingHandler();

const auth = new AuthProvider();

auth.verifyAuth()
   .then(() => {
      if (auth.authenticated) {
         const shouldGetNotes = notesInit({ api, getCookies, loading });
         categoryInit({ api, getCookies, shouldGetNotes, loading });
      }
   });