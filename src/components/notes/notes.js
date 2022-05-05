export function createNoteLoading() {
   const state = {
      loading: document.querySelector('.container-noteList-loading')
   }

   return {  }
}

export function createNoteRepository() {
   const state = {
      allNotes: []
   }

   const insertItemFirst = noteId => {
      const { allNotes } = state;

      const updatedNoteIndex = allNotes.findIndex(({ id }) => id === +noteId);

      if (updatedNoteIndex === -1) {
         return
      }

      const [ updatedNoteRemoved ] = allNotes.splice(updatedNoteIndex, 1);
      allNotes.unshift(updatedNoteRemoved);
   }

   const setItem = currentCategoryId => {
      const categoryId = +currentCategoryId;

      const newItem = { 
         categoryId, 
         title: 'Nova Nota', 
         summary: 'O resumo da nova nota está aqui...',
         content: 'O conteúdo da nova nota está aqui...',
         element: createNoteElement({ isItNewNote: true })
      }

      state.allNotes.unshift(newItem);

      return newItem;
   }

   const setAllItems = notes => {
      const definedNotes = notes.map(note => ({
         ...note,
         element: createNoteElement({ isItNewNote: false, ...note }) 
      }));

      state.allNotes = [...definedNotes, ...state.allNotes];

      return definedNotes
   }

   const getAllItems = () => {
      const { currentCategoryId, allNotes } = state;

      const notes = allNotes.filter(({ categoryId }) => categoryId === +currentCategoryId);

      return notes;
   }

   const getItem = noteId => {
      const { allNotes } = state;

      const currentNote = allNotes.find(({ id }) => id === +noteId);

      return currentNote
   }

   const deleteItem = (currentCategoryId, noteId) => {
      const { allNotes } = state;

      const newNoteList = allNotes.filter(({ id, categoryId }) => 
         id !== +noteId && currentCategoryId !== categoryId);

      state.allNotes = newNoteList;
   }

   const deleteAllItems = currentCategoryId => {
      const { allNotes } = state;

      const newNoteList = allNotes.filter(({ categoryId }) => categoryId !== +currentCategoryId);

      state.allNotes = newNoteList;
   }

   const updateItem = (note, { title, content, summary }) => {
      note.title = title;
      note.content = content;
      note.summary = summary;

      insertItemFirst(note.id)
   }

   return { 
      setAllItems,
      setItem,
      getAllItems,
      getItem,
      deleteAllItems,
      deleteItem,
      updateItem
   }
}

export function createNoteNetwork(networkTemplate) {
   const state = {
      observers: [],
      gettingNotes: false,
      pendingRequestQueue: [],
      queueAlreadyRequested: []
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

   const alreadyRequested = categoryId => {
      const { pendingRequestQueue, queueAlreadyRequested } = state;

      const currentIdPendingRequest = pendingRequestQueue.find(id => id === categoryId);
      const currentIdAlreadyRequested = queueAlreadyRequested.find(id => id === categoryId);

      return { currentIdPendingRequest, currentIdAlreadyRequested }
   }

   const getNotes = async ({ categoryId }) => {
      if (categoryId === noteState.currentCategoryId) {
         containerLoading.classList.add('show');
      }

      state.gettingNotes = true;
      sectionNoteList.scrollTop = 0;

      state.pendingRequestQueue.push(categoryId);

      const { notes } = await networkTemplate({
         route: 'getNotes',
         method: 'POST',
         body: { categoryId }
      });

      if (notes) {
         const definedNotes = noteState.setAllItems(notes);

         if (categoryId === noteState.currentCategoryId) {
            UInotesListActions.renderAllItems(definedNotes);
         }
      }
      
      state.gettingNotes = false;
      state.queueAlreadyRequested.push(categoryId);

      // camada loading
      if (categoryId === noteState.currentCategoryId) {
         containerLoading.classList.remove('show');
      }
   }

   const createNote = async ({ currentCategoryId }) => {
      const id = loading.showLoading();

      const newNote = noteState.setItem(currentCategoryId);
      UInotesListActions.renderNewItem(newNote.element);

      const { noteData } = await networkTemplate({
         route: 'addNote',
         method: 'POST',
         body: { categoryId: currentCategoryId }
      });

      newNote.id = noteData.id;
      newNote.dateCreated = noteData.dateCreated;
      newNote.lastModification = noteData.lastModification;

      newNote.element.setAttribute('data-id', noteData.id);
      UInotesListActions.setDate(newNote.element, noteData);

      loading.shouldHideLoading(id);
   }

   const deleteNote = async ({ currentCategoryId, currentNoteId }) => {
      const id = loading.showLoading();

      noteState.deleteItem(currentCategoryId, currentNoteId);
      notesList.querySelector(`[data-id="${currentNoteId}"]`).remove();

      UIcurrentNoteActions.hideSection();

      await networkTemplate({
         route: 'deleteNote',
         method: 'POST',
         body: { categoryId: currentCategoryId, noteId: currentNoteId }
      })

      loading.shouldHideLoading(id);
   }

   const updateNote = async (note, newNoteValues) => {
      const id = loading.showLoading();

      noteState.updateItem(note, newNoteValues);

      UInotesListActions.updateListItem(newNoteValues);
      UIcurrentNoteActions.updateNoteNameInPath(note.title);

      const { lastModification } = await networkTemplate({
         route: 'updateNote',
         method: 'POST',   
         body: { ...newNoteValues }
      });

      note.lastModification = lastModification;

      if (note.id === +noteState.currentNoteId) {
         UIcurrentNoteActions.setNewModifications(lastModification);
      }

      loading.shouldHideLoading(id);
   }

   const dispatch = {
      shouldGetNotes(categoryElement) {
         // os comentários significam que está pronto

         const categoryId = categoryElement.dataset.id;

         // sectionCurrentNote.classList.add('hide');

         if (!categoryId) {
            return
         }
         
         // UInotesListActions.showSection({ categoryName });

         const hasNotes = noteState.getAllItems();

         if (hasNotes.length) {
            UInotesListActions.renderAllItems(hasNotes);
            containerLoading.classList.remove('show');

            return
         }

         const { currentIdPendingRequest, currentIdAlreadyRequested } = alreadyRequested(categoryId);

         if (!currentIdPendingRequest) {
            getNotes({ categoryId });

            return
         } 

         if (!currentIdAlreadyRequested) {
            containerLoading.classList.add('show');
         } else {
            containerLoading.classList.remove('show');
         }

         notesList.innerHTML = '';
      },
      shouldCreateNote() {
         const { currentCategoryId, gettingNotes } = noteState;

         if (!currentCategoryId || gettingNotes) {
            return
         }

         createNote({ currentCategoryId });
      },
      shouldDeleteNote() {
         const { currentCategoryId, currentNoteId } = noteState;

         if (!currentCategoryId || !currentNoteId) {
            return
         }

         deleteNote({ currentCategoryId, currentNoteId });
      },
      shouldUpdateNote() {
         document.querySelector('.container-more-currentNote > .btn-dropDown').classList.remove('active');

         const { currentNoteId, currentCategoryId } = noteState;

         if (!currentNoteId || !currentCategoryId) {
            return
         }

         const note = noteState.getItem(currentNoteId);

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

   return { 
      shouldGetNotes: dispatch.shouldGetNotes
   }
}

export function createCurrentNote() {
   const state = {
      autoSave: setTimeout,
      currentNote: document.querySelector('section.current-note'),
      toolBar: document.querySelector('section.current-note .tool-bar'),
      btnExpandSummary: document.querySelector('section.current-note .container-summary > button')
   }

   const hideSection = () => {
      const btnDropDown = state.currentNote.querySelector('.btn-dropDown');

      state.currentNote.classList.add('hide');
      btnDropDown.classList.remove('active');
   }

   const showCurrentNote = () => {
      state.currentNote.classList.remove('hide');
   }

   const resetToolBar = () => {
      // pegar elementos com form

      const [
         selectFontSize, selectFontFamily, inputColor
      ] = sectionCurrentNote.querySelector('.select-group').children;

      selectFontSize.value = '3';
      selectFontFamily.value = 'arial';
      inputColor.value = '#000000';
   }

   const showPopupDelete = () => {
      // alterar para camada network
      confirmDeletion.subscribe(DispatchActions.shouldDeleteNote);
      confirmDeletion.showPopup('note');
   }

   const setCurrentNote = noteId => {
      if (!noteId) {
         return
      }

      const sectionNoteListTitle = sectionNoteList.querySelector('.section-title').innerText;
      const btnExpandSummary = sectionCurrentNote.querySelector('.container-summary > .btn-dropDown');
      const { title, summary, content, lastModification } = noteState.getItem(noteId);

      btnExpandSummary.classList.remove('active');

      const path = sectionCurrentNote.querySelector('.note-path');
      const inputNoteTitle = sectionCurrentNote.querySelector('.title-note input');
      const summaryArea = sectionCurrentNote.querySelector('.summaryArea');

      path.innerText = `${sectionNoteListTitle} > ${title}`;
      inputNoteTitle.value = title;
      summaryArea.value = summary;

      const elementLastModification = sectionCurrentNote.querySelector('.last-modification strong');
      const noteContent = sectionCurrentNote.querySelector('.area-note-content');

      elementLastModification.innerText = lastModification;
      noteContent.innerHTML = content;

      resetToolBar();
   }

   const setNewModifications = lastModification => {
      const noteLastModification = state.currentNote.querySelector('.last-modification strong');

      noteLastModification.innerText = lastModification;
   }

   const handleToggleDropDown = e => {
      const btnDropDown = e.target;

      btnDropDown.classList.toggle('active');
   }

   const btnTextEditor = e => {
      const elementClicked = e.target;

      if (elementClicked.tagName !== 'BUTTON') {
         return
      }

      const command = elementClicked.dataset.action;
      
      document.execCommand(command);
   }

   const selectionsTextEditor = e => {
      const elementClicked = e.target;

      if (!elementClicked.dataset.action) {
         return 
      }

      const command = elementClicked.dataset.action;
      const value = elementClicked.value;

      document.execCommand(command, false, value);
   }

   const updatePathName = ({ noteName, categoryName }) => {
      const path =  state.currentNote.querySelector('.note-path');
      const [lastNoteName, lastCategoryName] = path.innerText.split(' > ');

      const newNoteName = noteName || lastNoteName;
      const newCategoryName = categoryName || lastCategoryName;

      path.innerText = `${newCategoryName} > ${newNoteName}`;
   }

   const automaticallySaveChanges = () => {
      clearInterval(state.autoSave);

      state.autoSave = setTimeout(noteNetwork.shouldGetNotes, 4000);
   }

   const dispatch = {
      shouldHideCurrentNote({ categoryId }) {
            // obter o current CategoryId da camada categoryItem

         if (categoryId === noteState.currentCategoryId) {
            hideSection();
         }
      },
      shouldUpdateCategoryName({ categoryId, categoryName }) {
         // obter o current CategoryId da camada categoryItem

         if (categoryId === noteState.currentCategoryId) {
            updatePathName({ noteName: false, categoryName });
         }
      }
   }

   const dispatchListener = (action, data) => {
      if (dispatch[action]) {
         dispatch[action](data);
      }
   }

   state.currentNote.addEventListener('input', automaticallySaveChanges);

   return { 
      hideSection
   }
}

export function createNoteList() {
   const state = {
      sectionNoteList: document.querySelector('section.note-list'),
      noteList: document.querySelector('section.note-list ul.note-list'),
      btnAddNote: document.querySelector('.container-add-note > button')
   }

   const showSection = categoryElement => {
      const categoryName = categoryElement.querySelector('input').value;

      updateSectionTitle(categoryName)

      state.sectionNoteList.classList.remove('hide');
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

      const firstNoteElement = notesList.firstElementChild;

      notesList.insertBefore(noteElement, firstNoteElement);
      state.sectionNoteList.scrollTop = 0;
   }

   const setDate = (noteElement, { dateCreated }) => {
      const containerDate = noteElement.querySelector('.date');
      const noteDate = noteElement.querySelector('small');

      noteDate.innerText = dateCreated;
      containerDate.classList.remove('loading');
   }

   const renderAllItems = notes => {
      state.noteList.innerHTML = "";

      notes.forEach(({ element }) => {
         state.noteList.append(element);
      });

      noteItem.removeSelectedItem();
   }

   const renderNewItem = noteElement => {
      notesList.prepend(noteElement);
   }

   const hideSection = () => {
      state.noteList.innerHTML = '';
      state.noteList.classList.add('hide');
   }

   
   const dispatch = {
      shouldHideNoteList({ categoryId }) {
         // obter o CurrentCategoryId da camada categoryItem

         if (categoryId === noteState.currentCategoryId) {
            hideSection();
         }
      },
      shouldUpdateCategoryName({ categoryId, categoryName }) {
         // obter o CurrentCategoryId da camada categoryItem

         if (categoryId === noteState.currentCategoryId) {
            updateSectionTitle(categoryName);
         }
      }
   }

   const dispatchListener = (action, data) => {
      if (dispatch[action]) {
         dispatch[action](data);
      }
   }

   const noteListListener = e => {
      const action = e.target.dataset.js;

      noteItem.noteItemListener(action);
   }
   
   state.noteList.addEventListener('click', noteListListener);

   return { 
      showSection
   }
}

export function createNoteItem() {
   const state = {
      currentNoteId: undefined
   }

   const getCurrentNoteId = () => {
      return state.currentNoteId;
   }

   const removeSelectedItem = () => {
      const lastNoteClicked = document.querySelector('.note-item.selected');
      lastNoteClicked && lastNoteClicked.classList.remove('selected');
   }

   const acceptedNoteActions = {
      selectItem(noteElement) {
         removeSelectedItem();

         noteElement.classList.add('selected');
         
         // const noteName = noteElement.querySelector('h2.title').innerText;
         // const noteId = noteElement.dataset.id;

         state.currentNoteId = noteElement.dataset.id;

         // talvez usar o observer??
         UIcurrentNoteActions.showSection(noteElement);
         UIcurrentNoteActions.setCurrentNote(noteElement);
      }
   }

   const dispatch = {
      shouldSelectItem(elementClicked) {
         const noteElement = elementClicked.parentElement;

         const alreadySelected = noteElement.classList.contains('selected');
         const id = noteElement.dataset.id;

         if (alreadySelected || !id) {
            return
         }

         acceptedNoteActions.selectItem(noteElement);
      }
   }

   const noteItemListener = action => {
      if (dispatch[action]) {
         acceptedNoteActions[action](e.target);
      }
   }

   return { 
      noteItemListener,
      getCurrentNoteId,
      removeSelectedItem
   }
}
