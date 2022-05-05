import api from '../../services/api.js';
import { createCategoryNetwork, createCategoryList, createCategoryItem } from './category.js';
import { createNoteList, createNoteItem, createCurrentNote, createNoteNetwork, createNoteRepository } from './notes.js';

function createNoteApp() {

   const networkTemplate = async configs => {
      try {
         const [data, status] = await api.request({ auth: true, ...configs });

         if (status === 401 || status === 403) {
            throw { reason: data, status };
         } 
         
         return data;
         
      } catch(e) {
         console.log(e)
      }
   }

   function createLoading() {
      const state = {
         loading: document.querySelector('.container-auto-save'),
         queueLength: 0
      }
   
      const incrementQueue = () => {
         state.queueLength++;
      }
   
      const resetQueue = () => {
         state.queueLength = 0;
      }
   
      const resetLoadingAnimation = () => {
         const shouldResetAnimation = state.loading.classList.contains('show');
   
         if (!shouldResetAnimation) {
            return
         }
   
         state.loading.classList.add('reset');
         setTimeout(() => state.loading.classList.remove('reset'), 100);
      }
   
      const toggleSuccessMessage = addOrRemove => {
         state.loading.classList[addOrRemove]('success');
      }
   
      const showLoading = () => {
         toggleSuccessMessage('remove');
         resetLoadingAnimation();
         incrementQueue();
   
         state.loading.classList.remove('hide');
         state.loading.classList.add('show');
   
         return state.queueLength;
      }
   
      const hideLoading = () => {
         toggleSuccessMessage('add');
         resetQueue();
   
         state.loading.classList.remove('show');
         state.loading.classList.add('hide');
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
   
   function createConfirmDelete() {
      const state = {
         popupWrapper: document.querySelector('.popup-wrapper-confirm-delete'),
         observers: []
      }

      // alterar o observer para current deletion
   
      const subscribe = observerFunction => {
         state.observers.push(observerFunction);
      }
   
      const notifyAll = () => {
         for (const observerFunction of state.observers) {
            observerFunction();
         }
      }
   
      const resetObservers = () => {
         state.observers = [];
      }
   
      const showPopup = targetMessage => {
         state.popupWrapper.classList.remove('category', 'note');
         state.popupWrapper.classList.add('show', targetMessage);
      }
   
      const hidePopup = () => {
         state.popupWrapper.classList.remove('show');
   
         resetObservers();
      }
   
      const dispatch = {
         shouldConfirmDeletion(targetClass) {
            targetClass === 'btn-confirm-delete' && notifyAll();
         },
         shouldHideThePopup(targetClass) {
            const listOfRemovePopup = ['popup-overlay', 'btn-cancel-delete', 'btn-confirm-delete'];
            const shouldHide = listOfRemovePopup.includes(targetClass);
   
            shouldHide && hidePopup();
         }
      }
   
      const popupActionListener = e => {
         const targetClass = e.target.classList[0];
   
         dispatch.shouldConfirmDeletion(targetClass);
         dispatch.shouldHideThePopup(targetClass);
      }
   
      state.popupWrapper.addEventListener('mousedown', popupActionListener);
   
      return {
         showPopup,
         subscribe
      }
   }

   const popupLoading = createLoading();
   const popupConfirmDeletion = createConfirmDelete();
   
   const categoryList = createCategoryList();
   const categoryNetwork = createCategoryNetwork(networkTemplate);
   const categoryItem = createCategoryItem();

   const noteRepository = createNoteRepository();
   const noteList = createNoteList();
   const noteItem = createNoteItem();
   const currentNote = createCurrentNote();
   const noteNetwork = createNoteNetwork(networkTemplate);

   categoryList.subscribe('click', categoryNetwork.networkListener);
   categoryList.subscribe('click', categoryItem.categoryItemListener);

   categoryNetwork.subscribe('obtainedCategories', categoryList.renderAllCategories);
   categoryNetwork.subscribe('obtainedCategories', categoryList.setGettingCategories);

   categoryItem.subscribe('categorySelected', noteNetwork.shouldGetNotes);
   categoryItem.subscribe('categorySelected', noteList.showSection);
   categoryItem.subscribe('categorySelected', currentNote.hideSection);

   categoryNetwork.getCategories();
}

export default createNoteApp