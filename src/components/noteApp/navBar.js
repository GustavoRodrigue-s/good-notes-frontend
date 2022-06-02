export default function createNavMobile() {
   const state = {
      mobileNav: document.querySelector('.container-nav-mobile'),
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

   // refatorar essas func
   const setNoteListAvailability = () => {
      const liNoteList = state.navList.children[1];

      liNoteList.classList.add('available');

      acceptedSectionActions.showNoteList();

      selectLi(liNoteList);
   }

   // essa func deveriar ser um reset
   const removeNoteListAvailability = () => {
      const liNoteList = state.navList.children[1];
      const liCurrentNote = state.navList.children[2];

      liNoteList.classList.remove('available', 'selected');
      liCurrentNote.classList.remove('available', 'selected');
   }

   const setCurrentNoteAvailability = () => {
      const liCurrentNote = state.navList.children[2];

      liCurrentNote.classList.add('available');

      selectLi(liCurrentNote);
   }

   const removeCurrentNoteAvailability = () => {
      const liCurrentNote = state.navList.children[2];

      liCurrentNote.classList.remove('available', 'selected')

      setNoteListAvailability();
   }

   const selecteAndShowCategories = () => {
      acceptedSectionActions.showCategories();
      selectLi(state.navList.children[0]);
   }

   const selecteAndShowNoteList = () => {
      acceptedSectionActions.showNoteList();
      selectLi(state.navList.children[1]);
   }

   // reaproveitar showSections das outras camadas
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
      setNoteListAvailability,
      removeNoteListAvailability,
      setCurrentNoteAvailability,
      removeCurrentNoteAvailability,
      selecteAndShowCategories,
      selecteAndShowNoteList
   }
}