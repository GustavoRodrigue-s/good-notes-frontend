export default function createNavMobile() {
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

   const setBtnNoteListAvailability = () => {
      const liNoteList = state.navList.children[1];

      liNoteList.classList.add('available');

      selectLi(liNoteList);
   }

   const setBtnCurrentNoteAvailability = () => {
      const liCurrentNote = state.navList.children[2];

      liCurrentNote.classList.add('available');

      selectLi(liCurrentNote);
   }

   const acceptedSectionActions = {
      showCategories() {
         resetSectionsVisibility();

         state.categories.classList.add('show');
      }, 
      showNoteList() {
         resetSectionsVisibility();

         state.noteList.classList.remove('hide');
         state.noteList.classList.add('show');
      },
      showCurrentNote() {
         resetSectionsVisibility();

         state.noteList.classList.add('active');

         state.currentNote.classList.remove('hide');
         state.currentNote.classList.add('show');
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

         selectLi(currentLi);

         acceptedSectionActions[action]();
      }
   }

   const navListener = e => {
      if (e.type === 'touchstart') e.preventDefault();

      const currentLi = e.target.parentElement;
      const action = currentLi.dataset.js;

      dispatch.shouldSelectedTheButton(currentLi, action);
   }

   state.navList.addEventListener('touchstart', navListener);
   state.navList.addEventListener('click', navListener);

   return { 
      setBtnNoteListAvailability,
      setBtnCurrentNoteAvailability
   }
}