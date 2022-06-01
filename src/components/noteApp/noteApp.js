import { createCategoryNetwork, createCategoryList, createCategoryItem } from './category.js';
import { createNoteList, createNoteItem, createCurrentNote, createNoteNetwork } from './notes.js';
import createNoteRepository from './repository.js';
import createAnimations from './animations.js';
import createNavMobile from './navBar.js';

export default function createNoteApp({ api }) {

   const networkTemplate = async configs => {
      try {
         const [data, status] = await api.request({ auth: true, ...configs });

         if (status === 401 || status === 403) {
            throw { reason: data, status };
         } 
         
         return data;
         
      } catch(e) {
         popupCloudError.showPopup();

         throw e
      }
   }

   function createLoading() {
      const state = {
         loading: document.querySelector('.container-auto-save'),
         idQueue: 0
      }
   
      const incrementQueue = () => {
         state.idQueue++;
      }
   
      const resetQueue = () => {
         state.idQueue = 0;
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
   
      const showLoading = setId => {
         toggleSuccessMessage('remove');
         resetLoadingAnimation();
         incrementQueue();
   
         state.loading.classList.remove('hide');
         state.loading.classList.add('show');
   
         setId(state.idQueue);
      }
   
      const hideLoading = () => {
         toggleSuccessMessage('add');
         resetQueue();
   
         state.loading.classList.remove('show');
         state.loading.classList.add('hide');
      }
   
      const dispatch = {
         shouldHideLoading(id) {
            const lastId = state.idQueue; 
      
            lastId === id && hideLoading();
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

            shouldHide && hidePopup();
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
   const noteRepository = createNoteRepository();

   // layers
   const popupLoading = createLoading();
   const popupConfirmDeletion = createConfirmDelete();
   const popupCloudError = createCloudError();
   const animations = createAnimations();
   
   const categoryList = createCategoryList();
   const categoryNetwork = createCategoryNetwork(networkTemplate);
   const categoryItem = createCategoryItem();

   const noteList = createNoteList(noteRepository);
   const noteItem = createNoteItem();
   const currentNote = createCurrentNote(noteRepository);
   const noteNetwork = createNoteNetwork(networkTemplate, noteRepository);

   const navMobile = createNavMobile();

   // Connecting layers
   categoryList.subscribe('click', categoryNetwork.networkListener);
   categoryList.subscribe('click', categoryItem.categoryItemListener);
   categoryList.subscribe('render', animations.add);
   categoryList.subscribe('arrowClicked', navMobile.selecteAndShowNoteList);
   categoryList.subscribe('hiddenSection', navMobile.removeNoteListAvailability);

   categoryNetwork.subscribe('obtainedCategories', categoryList.renderCategories);
   categoryNetwork.subscribe('dispatchCalled', categoryItem.removeConfirmation);
   categoryNetwork.subscribe('update', noteList.shouldUpdateCategoryName);

   // refatorar essas func
   categoryNetwork.subscribe('update', currentNote.shouldUpdateCategoryName);
   categoryNetwork.subscribe('delete', currentNote.shouldHideCurrentNote);
   
   categoryNetwork.subscribe('delete', noteList.shouldHideNoteList);
   categoryNetwork.subscribe('delete', animations.remove);
   categoryNetwork.subscribe('setDeletion', popupConfirmDeletion.setTheDeleteTarget);
   categoryNetwork.subscribe('deletionError', animations.add);
   categoryNetwork.subscribe('startingRequest', popupLoading.showLoading);
   categoryNetwork.subscribe('endingRequest', popupLoading.shouldHideLoading);

   categoryItem.subscribe('categorySelected', noteRepository.setSelectedCategoryId);
   categoryItem.subscribe('categorySelected', currentNote.hideSection);
   categoryItem.subscribe('categorySelected', noteList.showSection);
   categoryItem.subscribe('categorySelected', categoryList.showArrow);

   // refatorar isso
   categoryItem.subscribe('categorySelected', navMobile.removeCurrentNoteAvailability);
   categoryItem.subscribe('categorySelected', navMobile.setNoteListAvailability);
   
   categoryItem.subscribe('showPopupDelete', popupConfirmDeletion.showPopup);
   categoryItem.subscribe('showPopupDelete', categoryNetwork.setCategoryConfirmationDeletion);
   categoryItem.subscribe('cancelAddition', animations.remove);
   categoryItem.subscribe('cancelAddition', categoryList.resetAvailableToAddCategory);

   noteNetwork.subscribe('creatingNote', noteList.renderNote);
   noteNetwork.subscribe('noteCreated', noteList.setDate);
   noteNetwork.subscribe('updating', noteList.shouldUpdateListItem);
   noteNetwork.subscribe('updating', currentNote.shouldUpdateNoteName);
   noteNetwork.subscribe('updated', currentNote.shouldSetNewLastModification);
   noteNetwork.subscribe('setDeletion', popupConfirmDeletion.setTheDeleteTarget);
   noteNetwork.subscribe('delete', currentNote.hideSection);
   noteNetwork.subscribe('delete', animations.remove);
   noteNetwork.subscribe('delete', navMobile.removeCurrentNoteAvailability);
   noteNetwork.subscribe('updateError', noteList.shouldUpdateListItem);
   noteNetwork.subscribe('updateError', currentNote.setCurrentNoteDatas);
   noteNetwork.subscribe('deletionError', animations.add);
   noteNetwork.subscribe('obtainedNotes', noteList.shouldRenderNotes);
   noteNetwork.subscribe('startingRequest', popupLoading.showLoading);
   noteNetwork.subscribe('endingRequest', popupLoading.shouldHideLoading);

   noteList.subscribe('click', noteItem.noteItemListener);
   noteList.subscribe('click', noteNetwork.networkListener);
   noteList.subscribe('render', animations.add);
   noteList.subscribe('update', animations.update);
   noteList.subscribe('noNotesFoundInRepository', noteNetwork.shouldGetNotes);
   noteList.subscribe('arrowClicked', navMobile.selecteAndShowCategories);
   noteList.subscribe('hiddenSection', navMobile.removeNoteListAvailability);
   noteList.subscribe('hiddenSection', categoryList.hideArrow);

   noteItem.subscribe('noteSelected', noteRepository.setSelectedNoteId);
   noteItem.subscribe('noteSelected', currentNote.showSection);
   noteItem.subscribe('noteSelected', navMobile.setCurrentNoteAvailability);

   currentNote.subscribe('showPopupDelete', popupConfirmDeletion.showPopup);
   currentNote.subscribe('showPopupDelete', noteNetwork.setNoteConfirmationDeletion);
   currentNote.subscribe('click', noteNetwork.networkListener);
   currentNote.subscribe('update', noteNetwork.shouldUpdateNote);
   currentNote.subscribe('autosave', noteNetwork.shouldUpdateNote);

   categoryNetwork.getCategories();

   document.querySelector('.container-not-selected').classList.remove('hide');
}