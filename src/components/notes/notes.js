export function createNoteNetwork({ networkTemplate, repository }) {
   const state = {
      observers: [],
      loading: document.querySelector('.container-noteList-loading'),
      messageDontHaveNotes: document.querySelector('.container-notes-not-found'),
      availableToAddNote: true,

      currentRequestId: 0,
      gettingNotes: false,
      categoriesData: []
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

   const setRequestId = () => {
      notifyAll('startingRequest', id => state.currentRequestId = id);

      return state.currentRequestId;
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

         notifyAll('restoreNote', { 
            item: note.element,
            list: document.querySelector('section.note-list ul.note-list'),
            action: 'add' 
         });
      },
      update(note, noteClone) {
         repository.handleErrors.update(note, noteClone);
         notifyAll('restoreUpdate', noteClone);
      }
   }

   const getNotes = async ({ category }) => {
      state.gettingNotes = true;
      state.loading.classList.add('show');

      category.waitingForNotes = true;

      const { notes } = await networkTemplate({
         route: 'getNotes',
         method: 'POST',
         body: { categoryId: category.id }
      });

      notes && repository.setAllItems(notes);

      category.notesReceived = true;
      category.waitingForNotes = false;

      state.gettingNotes = false;

      dispatch.shouldHideLoading({ id: category.id });

      notifyAll('obtainedNotes', { categoryId: category.id });
   }

   const createNote = async ({ selectedCategoryId }) => {
      const id = setRequestId();

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
         }, 300);
      }

      notifyAll('endingRequest', id);
   }

   const deleteNote = async ({ selectedCategoryId, selectedNoteId }) => {
      const id = setRequestId();

      const note = repository.getItem(selectedNoteId);
      
      try {
         notifyAll('deletingNote', { 
            item: note.element, 
            list: note.element.parentElement, 
            action: 'remove'
         });

         repository.deleteItem(selectedCategoryId, selectedNoteId);

         await networkTemplate({
            route: 'deleteNote',
            method: 'POST',
            body: { categoryId: selectedCategoryId, noteId: selectedNoteId }
         })

      } catch (e) {
         setTimeout(() => {
            handleErrors.delete(note);
         }, 300);
      }

      notifyAll('endingRequest', id);
   }

   const updateNote = async (note, newNoteValues) => {
      const id = setRequestId();

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

      notifyAll('endingRequest', id);
   }

   const setNoteDatas = (newNote, noteData) => {
      newNote.id = noteData.id;
      newNote.dateCreated = noteData.dateCreated;
      newNote.lastModification = noteData.lastModification;

      newNote.element.setAttribute('data-id', noteData.id);
   }

   const setNoteConfirmationDeletion = () => {
      notifyAll('setTheDeleteTarget', dispatch.shouldDeleteNote);
   }

   const resetAvailableToAddNote = () => {
      state.availableToAddNote = false;

      setTimeout(() => state.availableToAddNote = true, 400);
   }

   const createCategoryData = categoryId => {
      const newCategoryData = { id: categoryId, waitingForNotes: false, notesReceived: false };

      state.categoriesData.push(newCategoryData);

      return newCategoryData
   }

   const dispatch = {
      shouldGetNotes({ categoryId }) {

         const category = state.categoriesData.find(({ id }) => id === categoryId) || createCategoryData(categoryId);
         
         if (category.notesReceived) {
            state.messageDontHaveNotes.classList.add('show');
            return
         }

         if (category.waitingForNotes) {
            state.loading.classList.add('show');
            return
         }

         getNotes({ category });
      },
      shouldCreateNote() {
         const selectedCategoryId = repository.getSelectedCategoryId();
         const isGettingCategories = state.gettingNotes;

         if (!selectedCategoryId || isGettingCategories || !state.availableToAddNote) {
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
      },
      shouldHideLoading({ id }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (id === selectedCategoryId) {
            state.loading.classList.remove('show');
         }
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

      updatePathName({ noteName: title });

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
            updatePathName({ categoryName: newCategoryName });
         }
      },
      shouldUpdateNoteName({ title }) {
         updatePathName({ noteName: title });
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
      resetNoteList(categoryElement);

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

   const renderAllItems = notes => {
      notes.forEach(note => {
         if (!note.element) {
            note.element = createNoteElement({ isItNewNote: false, ...note });
         }

         note.element.classList.remove('selected');
         state.noteList.append(note.element);
      });
   }

   const renderNewItem = note => {
      note.element = createNoteElement({ isItNewNote: true });

      document.querySelector('.container-notes-not-found').classList.remove('show');

      notifyAll('renderItem', { item: note.element, list: state.noteList, action: 'add' });
   }

   const resetNoteList = categoryElement => {
      document.querySelector('.container-notes-not-found').classList.remove('show');
      document.querySelector('.container-noteList-loading').classList.remove('show');

      state.noteList.innerHTML = "";

      dispatch.shouldRenderNotes({ categoryId: categoryElement.dataset.id });
   }

   const dispatch = {
      shouldRenderNotes({ categoryId }) {
         const selectedCategoryId = repository.getSelectedCategoryId();

         if (!categoryId || categoryId !== selectedCategoryId) {
            return
         }

         const hasNotes = repository.getAllItems(categoryId);

         hasNotes.length
            ? renderAllItems(hasNotes)
            : notifyAll('noNotesFoundInRepository', { categoryId });
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

   // assim reduzimos a quantidade de functions retornadas
   // const dispatchListener = ({ data, action }) => {
   //    if (dispatch[action]) {
   //       dispatch[action](data);
   //    }
   // }
   
   state.noteList.addEventListener('click', noteListListener);
   state.btnAddNote.addEventListener('click', noteListListener);

   return { 
      subscribe,
      showSection,
      renderNewItem,
      setDate,
      updateListItem,
      //talvez adicionar um listener??
      shouldRenderNotes: dispatch.shouldRenderNotes,
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