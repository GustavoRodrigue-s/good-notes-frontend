import { createCategoryNetwork, createCategoryList, createCategoryItem } from './category.js';
import { createNoteList, createNoteItem, createCurrentNote, createNoteNetwork } from './notes.js';
import createRepository from './repository.js';
import createAnimation from './animations.js';

export default function createNoteApp({ api }) {

   const networkTemplate = async configs => {
      try {
         const [data, status] = await api.request({ auth: true, ...configs });

         if (status === 401 || status === 403) {
            throw { reason: data, status };
         } 
         
         return data;
         
      } catch(e) {
         cloudError.showPopup();

         throw e
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
         observers: [],
         deletionTarget: null
      }

      const setTheDeleteTarget = targetFunction => {
         state.deletionTarget = targetFunction;
      }
   
      const showPopup = targetMessage => {
         state.popupWrapper.classList.remove('category', 'note');
         state.popupWrapper.classList.add('show', targetMessage);
      }
   
      const hidePopup = () => {
         state.popupWrapper.classList.remove('show');
      }
   
      const dispatch = {
         shouldConfirmDeletion(targetClass) {
            targetClass === 'btn-confirm-delete' && state.deletionTarget();
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
         setTheDeleteTarget
      }
   }

   function createCloudError() {
      const state = {
         popupWrapper: document.querySelector('.popup-wrapper-cloud-error')
      }

      const showPopup = () => {
         state.popupWrapper.classList.add('show');
      }

      const hidePopup = () => {
         state.popupWrapper.classList.remove('show');
      }

      const dispatch = {
         shouldHideThePopup(targetClass) {
            const listOfHidePopup = ['close-popup-target', 'btn-confirm-error'];
            const shouldHide = listOfHidePopup.includes(targetClass);

            if (shouldHide) {
               hidePopup();
            }
         }
      }

      const popupListener = e => {
         if (e.type === 'touchstart') e.preventDefault();

         const targetClass = e.target.classList[0];

         dispatch.shouldHideThePopup(targetClass);
      }

      state.popupWrapper.addEventListener('click', popupListener);
      state.popupWrapper.addEventListener('touchstart', popupListener);

      return {
         showPopup
      }
   }

   // core application
   const repository = createRepository();

   // layers
   const popupLoading = createLoading();
   const popupConfirmDeletion = createConfirmDelete();
   const cloudError = createCloudError();
   const animation = createAnimation();
   
   const categoryList = createCategoryList();
   const categoryNetwork = createCategoryNetwork({ networkTemplate, popupLoading });
   const categoryItem = createCategoryItem();

   const noteList = createNoteList(repository);
   const noteItem = createNoteItem();
   const currentNote = createCurrentNote(repository);
   const noteNetwork = createNoteNetwork({ networkTemplate, popupLoading, repository });

   // Connecting layers
   categoryList.subscribe('click', categoryNetwork.networkListener);
   categoryList.subscribe('click', categoryItem.categoryItemListener);

   categoryList.subscribe('renderItem', animation.animationListener);

   categoryNetwork.subscribe('obtainedCategories', categoryList.renderAllCategories);
   categoryNetwork.subscribe('verifyToCreateCategory', categoryItem.removeConfirmation);
   categoryNetwork.subscribe('verifyToUpdateCategory', categoryItem.removeConfirmation);
   categoryNetwork.subscribe('verifyToDeleteCategory', categoryItem.removeConfirmation);
   categoryNetwork.subscribe('categoryUpdated', noteList.shouldUpdateCategoryName);
   categoryNetwork.subscribe('categoryUpdated', currentNote.shouldUpdateCategoryName);
   categoryNetwork.subscribe('setTheDeleteTarget', popupConfirmDeletion.setTheDeleteTarget);

   categoryNetwork.subscribe('categoryRemoved', noteList.shouldHideNoteList);
   categoryNetwork.subscribe('categoryRemoved', currentNote.shouldHideCurrentNote);

   categoryNetwork.subscribe('restoreCategory', categoryList.renderCategory);

   categoryNetwork.subscribe('removeItem', animation.animationListener);

   categoryItem.subscribe('categorySelected', repository.setSelectedCategoryId);
   categoryItem.subscribe('categorySelected', noteList.resetNoteList);
   categoryItem.subscribe('categorySelected', currentNote.hideSection);
   categoryItem.subscribe('categorySelected', noteList.showSection);

   categoryItem.subscribe('showPopupDelete', popupConfirmDeletion.showPopup);
   categoryItem.subscribe('showPopupDelete', categoryNetwork.setCategoryConfirmationDeletion);

   categoryItem.subscribe('cancelAddition', animation.animationListener);
   categoryItem.subscribe('cancelAddition', categoryList.resetAvailableToAddCategory);

   noteNetwork.subscribe('creatingNote', noteList.renderNewItem);
   noteNetwork.subscribe('noteCreated', noteList.setDate);
   
   noteNetwork.subscribe('updatingNote', noteList.updateListItem);
   noteNetwork.subscribe('updatingNote', currentNote.shouldUpdateNoteName);

   noteNetwork.subscribe('noteUpdated', currentNote.shouldSetNewLastModification);
   noteNetwork.subscribe('setTheDeleteTarget', popupConfirmDeletion.setTheDeleteTarget);

   noteNetwork.subscribe('deletingNote', currentNote.hideSection);
   noteNetwork.subscribe('deletingNote', animation.animationListener);
   noteNetwork.subscribe('restoreUpdate', noteList.updateListItem);
   noteNetwork.subscribe('restoreUpdate', currentNote.setCurrentNoteDatas);
   
   noteNetwork.subscribe('restoreNote', animation.animationListener);
   noteNetwork.subscribe('obtainedNotes', noteList.shouldRenderNotes);

   noteList.subscribe('click', noteItem.noteItemListener);
   noteList.subscribe('click', noteNetwork.networkListener);
   
   noteList.subscribe('renderItem', animation.animationListener);
   noteList.subscribe('updateItem', animation.animationListener);

   noteList.subscribe('noNotesFoundInRepository', noteNetwork.shouldGetNotes);

   noteItem.subscribe('noteSelected', repository.setSelectedNoteId);
   noteItem.subscribe('noteSelected', currentNote.showSection);

   currentNote.subscribe('showPopupDelete', popupConfirmDeletion.showPopup);
   currentNote.subscribe('showPopupDelete', noteNetwork.setNoteConfirmationDeletion);
   currentNote.subscribe('click', noteNetwork.networkListener);
   currentNote.subscribe('updateNote', noteNetwork.shouldUpdateNote);

   categoryNetwork.getCategories();

   document.querySelector('.container-not-selected').classList.remove('hide');
}