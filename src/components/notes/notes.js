export function createNoteNetwork({ networkTemplate, repository, popupLoading }) {
   const state = {
      observers: [],
      loading: document.querySelector('.container-noteList-loading'),
      availableToAddNote: true,

      networkData : {
         gettingNotes: false,
         queueWaitingForNotes: [],
         queueHasArrivedNotes: []
      }
   }

   const subscribe = (event, listener) => {
      state.observers.push({ event, listener });
   }

   const notifyAll = (event, data) => {
      const listeners = state.observers.filter(observer => observer.event === event);

      for (const { listener } of listeners) {
         listener(data);
      }
   }

   const handleErrors = {
      create(note) {
         if ('element' in note) {
            note.element.remove();
         }

         repository.handleErrors.create();
      },
      delete(note) {
         note.element.classList.remove('remove');

         repository.handleErrors.delete(note);
         notifyAll('restoreNote', note);
      },
      update(note, noteClone) {
         repository.handleErrors.update(note, noteClone);
         notifyAll('restoreUpdate', noteClone);
      }
   }

   const getNotes = async ({ categoryId }) => {
      state.networkData.gettingNotes = true;
      state.networkData.queueWaitingForNotes.push(categoryId);

      const { notes } = await networkTemplate({
         route: 'getNotes',
         method: 'POST',
         body: { categoryId }
      });

      const selectedCategoryId = repository.getSelectedCategoryId();

      // pq n colocar essa regra de negócio no render list das notas??
      if (notes.length) {
         repository.setAllItems(notes);

         if (categoryId === selectedCategoryId) {
            notifyAll('obtainedNotes', notes);
         }
      } else {
         notifyAll('noNotesFound', { categoryId });
      }
      
      state.networkData.gettingNotes = false;
      state.networkData.queueHasArrivedNotes.push(categoryId);

      if (categoryId === selectedCategoryId) {
         state.loading.classList.remove('show');
      }
   }

   const createNote = async ({ selectedCategoryId }) => {
      const id = popupLoading.showLoading();

      const newNote = repository.setItem(selectedCategoryId);

      try {
         notifyAll('creatingNote', newNote);

         const { noteData } = await networkTemplate({
            route: 'addNote',
            method: 'POST',
            body: { categoryId: selectedCategoryId }
         });

         setNoteDatas(newNote, noteData);
         notifyAll('noteCreated', { newNote, noteData });

      } catch (e) {
         setTimeout(() => {
            handleErrors.create(newNote);
         }, 150);
      }

      popupLoading.shouldHideLoading(id);
   }

   const deleteNote = async ({ selectedCategoryId, selectedNoteId }) => {
      const id = popupLoading.showLoading();

      const note = repository.getItem(selectedNoteId);
      
      try {
         // note.element.remove();
         notifyAll('removeItem', { item: note.element, list: note.element.parentElement, action: 'remove' });

         repository.deleteItem(selectedCategoryId, selectedNoteId);

         notifyAll('deletingNote');

         await networkTemplate({
            route: 'deleteNote',
            method: 'POST',
            body: { categoryId: selectedCategoryId, noteId: selectedNoteId }
         })

      } catch (e) {
         handleErrors.delete(note);
      }

      popupLoading.shouldHideLoading(id);
   }

   const updateNote = async (note, newNoteValues) => {
      const id = popupLoading.showLoading();

      const noteClone = { ...note };

      try {
         repository.updateItem(note, newNoteValues);

         notifyAll('updatingNote', newNoteValues);

         const { lastModification } = await networkTemplate({
            route: 'updateNote',
            method: 'POST',   
            body: { ...newNoteValues }
         });

         note.lastModification = lastModification;

         notifyAll('noteUpdated', { noteId: note.id, lastModification }); 

      } catch (e) {
         handleErrors.update(note, noteClone);
      }

      popupLoading.shouldHideLoading(id);
   }

   const setNoteDatas = (newNote, noteData) => {
      newNote.id = noteData.id;
      newNote.dateCreated = noteData.dateCreated;
      newNote.lastModification = noteData.lastModification;

      newNote.element.setAttribute('data-id', noteData.id);
   }

   const getAvailabilityToGetNotes = categoryId => {
      const { queueWaitingForNotes, queueHasArrivedNotes } = state.networkData;

      const waitingForNotes = queueWaitingForNotes.find(id => id === categoryId);
      const receivedTheNotes = queueHasArrivedNotes.find(id => id === categoryId);

      return { waitingForNotes, receivedTheNotes };
   }

   const setNoteConfirmationDeletion = () => {
      notifyAll('setTheDeleteTarget', dispatch.shouldDeleteNote);
   }

   const resetAvailableToAddNote = () => {
      state.availableToAddNote = false;

      setTimeout(() => state.availableToAddNote = true, 400);
   }

   const dispatch = {
      shouldGetNotes(categoryElement) {
         const categoryId = categoryElement.dataset.id;

         if (!categoryId) {
            return
         }

         notifyAll('isGettingNotes');

         state.loading.classList.add('show');

         const hasNotes = repository.getAllItems(categoryId);

         if (hasNotes.length) {
            notifyAll('haveNotesInTheRepository', hasNotes);
            state.loading.classList.remove('show');

            return
         }

         const { waitingForNotes, receivedTheNotes } = getAvailabilityToGetNotes(categoryId);
         
         if (receivedTheNotes) {
            notifyAll('thisCategoryDontHaveNotes');
            state.loading.classList.remove('show');

            return
         }

         if (waitingForNotes) {
            return
         }  

         getNotes({ categoryId });
      },
      shouldCreateNote() {
         const selectedCategoryId = repository.getSelectedCategoryId();
         const isGettingCategoris = state.networkData.gettingNotes;

         if (!selectedCategoryId || isGettingCategoris || !state.availableToAddNote) {
            return
         }

         resetAvailableToAddNote();

         createNote({ selectedCategoryId });
      },
      shouldDeleteNote() {
         const selectedCategoryId = repository.getSelectedCategoryId();
         const selectedNoteId = repository.getSelectedNoteId();

         if (!selectedCategoryId || !selectedNoteId) {
            return
         }

         deleteNote({ selectedCategoryId, selectedNoteId });
      },
      shouldUpdateNote({ currentNoteForm }) {
         const selectedCategoryId = repository.getSelectedCategoryId();
         const selectedNoteId = repository.getSelectedNoteId();

         if (!selectedNoteId || !selectedCategoryId) {
            return
         }

         const note = repository.getItem(selectedNoteId);

         if (!note) {
            return
         }

         const { inputNoteTitle, textareaSummary } = currentNoteForm;

         const newNoteValues = {
            title: inputNoteTitle.value,
            summary: textareaSummary.value,
            content: currentNoteForm.querySelector('.area-note-content').innerHTML,
         }

         const keysOfNewValues = Object.keys(newNoteValues);

         const shouldUpdate = keysOfNewValues.every(key => newNoteValues[key] === note[key]);

         if (shouldUpdate || !newNoteValues.title) {
            return
         }

         newNoteValues.id = note.id;
         newNoteValues.categoryId = note.categoryId;

         updateNote(note, newNoteValues);
      }
   }

   const networkListener = ({ action }) => {
      if (dispatch[action]) {
         dispatch[action]();
      }
   }

   return { 
      subscribe,
      networkListener,
      shouldGetNotes: dispatch.shouldGetNotes,
      shouldUpdateNote: dispatch.shouldUpdateNote,
      setNoteConfirmationDeletion
   }
}

export function createCurrentNote(repository) {
   const state = {
      observers: [],
      autoSave: setTimeout,
      currentNote: document.querySelector('section.current-note'),
      currentNoteForm: document.querySelector('.current-note .current-note-form'), 
      toolBar: document.querySelector('section.current-note .tool-bar')
   }

   const subscribe = (event, listener) => {
      state.observers.push({ event, listener });
   }

   const notifyAll = (event, data) => {
      const listeners = state.observers.filter(observer => observer.event === event);

      for (const { listener } of listeners) {
         listener(data);
      }
   }

   const hideSection = () => {
      const btnDropDown = state.currentNote.querySelector('.btn-dropDown');

      state.currentNote.classList.add('hide');
      btnDropDown.classList.remove('active');
   }

   const showSection = noteDatas => {
      state.currentNote.classList.remove('hide');

      dispatch.shouldSetCurrentNote(noteDatas);
   }

   const resetToolBar = () => {
      const { selectFontSize, selectFontFamily, inputColor } = state.currentNoteForm

      selectFontSize.value = '3';
      selectFontFamily.value = 'arial';
      inputColor.value = '#000000';
   }

   const setCurrentNoteDatas = ({ title, summary, content, lastModification }) => {
      const { inputNoteTitle, textareaSummary, btnExpandSummary } = state.currentNoteForm;

      updatePathName({ noteName: title, categoryName: false });

      btnExpandSummary.classList.remove('active');

      inputNoteTitle.value = title;
      textareaSummary.value = summary;

      const elementLastModification = state.currentNote.querySelector('.last-modification strong');
      const noteContent = state.currentNote.querySelector('.area-note-content');

      elementLastModification.innerText = lastModification;
      noteContent.innerHTML = content;
   }

   const setCurrentNote = (noteId, noteListTitle) => {
      const note = repository.getItem(noteId);

      setCurrentNoteDatas(note);

      updatePathName({ noteName: note.title, categoryName: noteListTitle });

      resetToolBar();
   }

   const setNewModifications = lastModification => {
      const noteLastModification = state.currentNote.querySelector('.last-modification strong');

      noteLastModification.innerText = lastModification;
   }

   const btnTextEditor = e => {
      const targetElement = e.target;

      if (targetElement.tagName !== 'BUTTON') {
         return
      }

      const command = targetElement.dataset.action;
      
      document.execCommand(command);
   }

   const selectionsTextEditor = e => {
      const targetElement = e.target;

      if (!targetElement.dataset.action) {
         return 
      }

      const command = targetElement.dataset.action;
      const value = targetElement.value;

      document.execCommand(command, false, value);
   }

   const updatePathName = ({ noteName, categoryName }) => {
      const path = state.currentNote.querySelector('.note-path');
      const [ lastCategoryName, lastNoteName ] = path.innerText.split(' > ');

      const newNoteName = noteName || lastNoteName;
      const newCategoryName = categoryName || lastCategoryName;

      path.innerText = `${newCategoryName} > ${newNoteName}`;
   }

   const automaticallySaveChanges = () => {
      clearInterval(state.autoSave);

      state.autoSave = setTimeout(() => {
         notifyAll('updateNote', { currentNoteForm: state.currentNoteForm });
      }, 4000);
   }

   const acceptedCurrentNoteActions = {
      handleDropDown(e) {
         const btnDropDown = e.target;
   
         btnDropDown.classList.toggle('active');
      },
      showPopupDelete() {
         notifyAll('showPopupDelete', 'note');
      },
      updateNote() {
         state.currentNote.querySelector('.header .btn-dropDown').classList.remove('active');

         notifyAll('updateNote', { currentNoteForm: state.currentNoteForm });
      }
   }

   const dispatch = {
      shouldSetNewLastModification({ noteId, lastModification }) {
         const selectedNoteId = repository.getSelectedNoteId();

         if (noteId === +selectedNoteId) {
            setNewModifications(lastModification);
         }
      },
      shouldSetCurrentNote({ noteElement, noteListTitle }) {
         const noteId = noteElement.dataset.id;

         if (noteId) {
            setCurrentNote(noteId, noteListTitle);
         }
      },
      shouldHideCurrentNote({ categoryId }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (categoryId === selectedCategoryId) {
            hideSection();
         }
      },
      shouldUpdateCategoryName({ categoryId, newCategoryName }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (categoryId === selectedCategoryId) {
            updatePathName({ noteName: false, categoryName: newCategoryName });
         }
      },
      shouldUpdateNoteName({ title }) {
         updatePathName({ noteName: title, categoryName: false });
      }
   }

   const currentNoteListener = e => {
      const action = e.target.dataset.js;

      if (acceptedCurrentNoteActions[action]) {
         acceptedCurrentNoteActions[action](e);
      }

      notifyAll('click', { action });
   }

   state.currentNoteForm.addEventListener('submit', e => e.preventDefault());

   state.currentNote.addEventListener('click', currentNoteListener);
   state.currentNote.addEventListener('input', automaticallySaveChanges);

   state.toolBar.addEventListener('click', btnTextEditor);
   state.toolBar.addEventListener('change', selectionsTextEditor);

   return { 
      subscribe,
      hideSection,
      showSection,
      setCurrentNoteDatas,
      shouldHideCurrentNote: dispatch.shouldHideCurrentNote,
      shouldUpdateCategoryName: dispatch.shouldUpdateCategoryName,
      shouldUpdateNoteName: dispatch.shouldUpdateNoteName,
      shouldSetNewLastModification: dispatch.shouldSetNewLastModification
   }
}

export function createNoteList(repository) {
   const state = {
      observers: [],
      noteList: document.querySelector('section.note-list ul.note-list'),
      messageDontHaveNotes: document.querySelector('.container-notes-not-found'),
      sectionNoteList: document.querySelector('section.note-list'),
      btnAddNote: document.querySelector('.container-add-note > button')
   }

   const subscribe = (event, listener) => {
      state.observers.push({ event, listener });
   }

   const notifyAll = (event, data) => {
      const listeners = state.observers.filter(observer => observer.event === event);

      for (const { listener } of listeners) {
         listener(data);
      }
   }

   const scrollTop = () => {
      state.sectionNoteList.scrollTop = 0;
   }

   const showSection = categoryElement => {
      const categoryName = categoryElement.querySelector('input').value;

      updateSectionTitle(categoryName)

      state.sectionNoteList.classList.remove('hide');
      document.querySelector('.container-not-selected').classList.add('hide');

      scrollTop();
   }

   const hideSection = () => {
      state.noteList.innerHTML = '';
      state.sectionNoteList.classList.add('hide');
   }

   const showMessageNoNotesFound = () => {
      state.messageDontHaveNotes.classList.add('show');
   }

   const removeMessageNoNotesFound = () => {
      state.messageDontHaveNotes.classList.remove('show');
   }

   const clearList = () => {
      state.noteList.innerHTML = "";
      showMessageNoNotesFound();
   }

   const createNoteElement = ({ isItNewNote, ...note }) => {
      const content = `
      <button data-js="shouldSelectItem">
         <div class="${isItNewNote ? 'date loading' : 'date'}">
            <small>${isItNewNote ? '' : note.dateCreated}</small>
            <div class="date-loading"></div>
         </div>
         <div class="note-texts">
            <div>
               <h2 class="title">${note.title || 'Nova Nota'}</h2>
            </div>
            <div>
               <div class="summary">
                  ${note.summary || 'O resumo da nova nota está aqui...'}
               </div>
            </div>
         </div>
      </button>
      `;

      const noteItem = document.createElement('li');

      noteItem.className = 'note-item';
      noteItem.innerHTML = content;

      if (!isItNewNote) {
         noteItem.setAttribute('data-id', note.id);
      }

      return noteItem
   }

   const updateSectionTitle = categoryName => {
      const title = state.sectionNoteList.querySelector('.section-title');
      title.innerText = categoryName;
   }

   const updateListItem = ({ id, title, summary }) => {
      const noteElement = state.noteList.querySelector(`li[data-id="${id}"]`);

      const noteTitle = noteElement.querySelector('.title');
      const noteSummary = noteElement.querySelector('.summary');

      noteTitle.innerText = title;
      noteSummary.innerText = summary;

      // const firstNoteElement = state.noteList.firstElementChild;

      // state.noteList.insertBefore(noteElement, firstNoteElement);
      notifyAll('updateItem', { item: noteElement, list: state.noteList, action: 'update' });

      state.sectionNoteList.scrollTop = 0;
   }

   const setDate = ({ newNote, noteData }) => {
      const containerDate = newNote.element.querySelector('.date');
      const noteDate = newNote.element.querySelector('small');

      noteDate.innerText = noteData.dateCreated;
      containerDate.classList.remove('loading');
   }

   const renderItem = note => {
      state.noteList.prepend(note.element);
   }

   const renderAllItems = notes => {
      removeMessageNoNotesFound();
      state.noteList.innerHTML = "";

      notes.forEach(note => {
         note.element = !note.element 
            ? createNoteElement({ isItNewNote: false, ...note }) 
            : note.element;

         note.element.classList.remove('selected');
         state.noteList.append(note.element);
      });
   }

   const renderNewItem = note => {
      note.element = createNoteElement({ isItNewNote: true });

      notifyAll('renderItem', { item: note.element, list: state.noteList, action: 'add' });
      // renderItem(note);
   }

   const dispatch = {
      shouldShowMessageNoNotesFound({ categoryId }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (categoryId === +selectedCategoryId) {
            showMessageNoNotesFound();
         }
      },
      shouldHideNoteList({ categoryId }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (categoryId === selectedCategoryId) {
            hideSection();
         }
      },
      shouldUpdateCategoryName({ categoryId, newCategoryName }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (categoryId === selectedCategoryId) {
            updateSectionTitle(newCategoryName);
         }
      }
   }

   const noteListListener = e => {
      const noteListTitle = state.sectionNoteList.querySelector('.section-title').innerText;
      const action = e.target.dataset.js;

      notifyAll('click', { e, action, noteListTitle });
   }
   
   state.noteList.addEventListener('click', noteListListener);
   state.btnAddNote.addEventListener('click', noteListListener);

   return { 
      subscribe,
      showSection,
      renderAllItems,
      renderNewItem,
      renderItem,
      clearList,
      setDate,
      updateListItem,
      removeMessageNoNotesFound,
      shouldShowMessageNoNotesFound: dispatch.shouldShowMessageNoNotesFound,
      shouldUpdateCategoryName: dispatch.shouldUpdateCategoryName,
      shouldHideNoteList: dispatch.shouldHideNoteList
   }
}

export function createNoteItem() {
   const state = {
      observers: []
   }

   const subscribe = (event, listener) => {
      state.observers.push({ event, listener });
   }

   const notifyAll = (event, data) => {
      const listeners = state.observers.filter(observer => observer.event === event);

      for (const { listener } of listeners) {
         listener(data);
      }
   }

   const removeSelectedItem = () => {
      const lastNoteClicked = document.querySelector('.note-item.selected');
      lastNoteClicked && lastNoteClicked.classList.remove('selected');
   }

   const acceptedNoteActions = {
      selectItem(noteElement, noteListTitle) {
         removeSelectedItem();

         noteElement.classList.add('selected');
         
         notifyAll('noteSelected', { noteElement, noteListTitle });
      }
   }

   const dispatch = {
      shouldSelectItem(elementClicked, noteListTitle) {
         const noteElement = elementClicked.parentElement;

         const alreadySelected = noteElement.classList.contains('selected');
         const id = noteElement.dataset.id;

         if (alreadySelected || !id) {
            return
         }

         acceptedNoteActions.selectItem(noteElement, noteListTitle);
      }
   }

   const noteItemListener = ({ e, action, noteListTitle }) => {
      if (dispatch[action]) {
         dispatch[action](e.target, noteListTitle);
      }
   }

   return {
      subscribe, 
      noteItemListener,
      removeSelectedItem,
   }
}