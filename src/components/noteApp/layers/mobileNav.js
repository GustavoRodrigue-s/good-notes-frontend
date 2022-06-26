export default function createMobileNav() {
   const state = {
      navList: document.querySelector('.mobile-btn-list'),
      categories: document.querySelector('section.categories'),
      noteList: document.querySelector('section.note-list'),
      currentNote: document.querySelector('section.current-note')
   }

   const resetSectionsVisibility = () => {
      state.categories.classList.remove('show');
      state.noteList.classList.remove('show', 'active');
      state.currentNote.classList.remove('show');
   }

   const removeLastSelectedLi = () => {
      const lastSelectedLi = state.navList.querySelector('li.selected');
      lastSelectedLi && lastSelectedLi.classList.remove('selected');
   }

   const selectLi = li => {
      removeLastSelectedLi();

      li.classList.add('selected');
   }

   const acceptedSectionActions = {
      showCategories() {
         resetSectionsVisibility();

         state.categories.classList.add('show');

         selectLi(state.navList.children[0]);
      }, 
      showNoteList() {
         resetSectionsVisibility();

         const liNoteList = state.navList.children[1];

         liNoteList.classList.add('available');

         state.noteList.classList.remove('hide');
         state.noteList.classList.add('show');

         selectLi(liNoteList);
      },
      showCurrentNote() {
         resetSectionsVisibility();

         const liCurrentNote = state.navList.children[2];

         liCurrentNote.classList.add('available');

         state.noteList.classList.add('active');

         state.currentNote.classList.remove('hide');
         state.currentNote.classList.add('show');

         selectLi(state.navList.children[2]);
      },
      hideCategories() {
         state.categories.classList.remove('show');
      },
      hideNoteList() {
         const liNoteList = state.navList.children[1];
         
         state.noteList.classList.remove('show', 'active');

         liNoteList.classList.remove('available', 'selected');
      },
      hideCurrentNote() {
         const liCurrentNote = state.navList.children[2];

         state.currentNote.classList.remove('show');

         liCurrentNote.classList.remove('available', 'selected');
      }
   }

   const dispatch = {
      shouldSelectedTheButton(currentLi, action) {
         if (!action || !acceptedSectionActions[action]) {
            return
         }

         const shouldShowSection = currentLi.classList.contains('available');
         const shouldSelectLi = !currentLi.classList.contains('selected');

         if (!shouldShowSection || !shouldSelectLi) {
            return
         }

         acceptedSectionActions[action]();
      }
   }

   const navListener = e => {
      const currentLi = e.target.parentElement;
      const action = currentLi.dataset.js;

      dispatch.shouldSelectedTheButton(currentLi, action);
   }

   state.navList.addEventListener('pointerup', navListener);

   return { 
      showCategories: acceptedSectionActions.showCategories,
      showCurrentNote: acceptedSectionActions.showCurrentNote,
      showNoteList: acceptedSectionActions.showNoteList,
      hideCategories: acceptedSectionActions.hideCategories,
      hideNoteList: acceptedSectionActions.hideNoteList,
      hideCurrentNote: acceptedSectionActions.hideCurrentNote
   }
}