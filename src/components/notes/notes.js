const notesInit = ({ api, loading, confirmDeletion }) => {
   const containerLoading = document.querySelector('.container-noteList-loading');

   // criar camada separada para o containerLoading skeleton

   function createNoteLoading() {

      return {  }
   }

   const noteState = {
      gettingNotes: false,
      currentCategoryId: undefined,
      currentNoteId: undefined,
      allNotes: [],
      pendingRequestQueue: [],
      queueAlreadyRequested: [],

      setItem(currentCategoryId) {
         const categoryId = +currentCategoryId;

         const newItem = { 
            categoryId, 
            title: 'Nova Nota', 
            summary: 'O resumo da nova nota está aqui...',
            content: 'O conteúdo da nova nota está aqui...',
            element: createNoteElement({ isItNewNote: true })
         }

         this.allNotes.unshift(newItem);

         return newItem;
      },
      setAllItems(notes) {
         const definedNotes = notes.map(note => ({
            ...note,
            element: createNoteElement({ isItNewNote: false, ...note }) 
         }));

         this.allNotes = [...definedNotes, ...this.allNotes];

         return definedNotes
      },
      getAllItems() {
         const { currentCategoryId, allNotes } = this;

         const notes = allNotes.filter(({ categoryId }) => categoryId === +currentCategoryId);

         return notes;
      },
      getItem(noteId) {
         const { allNotes } = this;

         const currentNote = allNotes.find(({ id }) => id === +noteId);

         return currentNote
      },
      deleteItem(currentCategoryId, noteId) {
         const { allNotes } = this;

         const newNoteList = allNotes.filter(({ id, categoryId }) => 
            id !== +noteId && currentCategoryId !== categoryId);

         this.allNotes = newNoteList;
      },
      deleteAllItems(currentCategoryId) {
         const { allNotes } = this;

         const newNoteList = allNotes.filter(({ categoryId }) => categoryId !== +currentCategoryId);

         this.allNotes = newNoteList;
      },
      updateItem(note, { title, content, summary }) {
         note.title = title;
         note.content = content;
         note.summary = summary;
      },
      insertItemFirst(noteId) {
         const { allNotes } = this;

         const updatedNoteIndex = allNotes.findIndex(({ id }) => id === +noteId);

         if (updatedNoteIndex === -1) {
            return
         }

         const [ updatedNoteRemoved ] = allNotes.splice(updatedNoteIndex, 1);
         allNotes.unshift(updatedNoteRemoved);
      },
      alreadyRequested(categoryId) {
         const { pendingRequestQueue, queueAlreadyRequested } = this;

         const currentIdPendingRequest = pendingRequestQueue.find(id => id === categoryId);
         const currentIdAlreadyRequested = queueAlreadyRequested.find(id => id === categoryId);

         return { currentIdPendingRequest, currentIdAlreadyRequested }
      }
   }

   function createNoteNetwork() {

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

      const getNotes = async ({ categoryId }) => {
         if (categoryId === noteState.currentCategoryId) {
            containerLoading.classList.add('show');
         }

         noteState.gettingNotes = true;
         sectionNoteList.scrollTop = 0;

         noteState.pendingRequestQueue.push(categoryId);

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
         
         noteState.gettingNotes = false;
         noteState.queueAlreadyRequested.push(categoryId);

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
            const categoryId = categoryElement.dataset.id;
            const categoryName = categoryElement.querySelector('input').value;
   
            sectionCurrentNote.classList.add('hide');
   
            if (!categoryId) {
               return
            }
            
            UInotesListActions.showSection({ categoryName });
            noteState.currentCategoryId = categoryId;
   
            const hasNotes = noteState.getAllItems();
   
            if (hasNotes.length) {
               UInotesListActions.renderAllItems(hasNotes);
               containerLoading.classList.remove('show');
   
               return
            }
   
            const { currentIdPendingRequest, currentIdAlreadyRequested } = noteState.alreadyRequested(categoryId);
   
            if (!currentIdPendingRequest) {
               NotesAction.getNotes({ categoryId });
   
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
   
            NotesAction.createNote({ currentCategoryId });
         },
         shouldDeleteNote() {
            const { currentCategoryId, currentNoteId } = noteState;
   
            if (!currentCategoryId || !currentNoteId) {
               return
            }
   
            NotesAction.deleteNote({ currentCategoryId, currentNoteId });
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
   
            NotesAction.updateNote(note, newNoteValues);
         }
      }

      return {  }
   }

   const DispatchActions = {
      shouldHideNoteUIs(categoryId) {
         noteState.deleteAllItems(categoryId);

         if (categoryId === noteState.currentCategoryId) {
            UInotesListActions.hideSection();
            UIcurrentNoteActions.hideSection();
         }
      },
      shouldUpdatePath(categoryId, categoryName) {
         if (categoryId === noteState.currentCategoryId) {
            UInotesListActions.updateSectionTitle(categoryName);
            UIcurrentNoteActions.updateSectionCategoryNameInPath(categoryName);
         }
      }
   }

   function createCurrentNote() {
      const state = {
         currentNote: document.querySelector('section.current-note'),
         toolBar: this.currentNote.querySelector('.tool-bar')
      }

      // const btnExpandSummary = sectionCurrentNote.querySelector('.container-summary > button');

      const hideCurrentNote = () => {
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

      const updateSectionCategoryNameInPath = categoryName => {
         const path = sectionCurrentNote.querySelector('.note-path');
         const currentNote = path.innerText.split(' > ')[1];

         path.innerText = `${categoryName} > ${currentNote}`;
      }

      const updateNoteNameInPath = noteName => {
         const path = sectionCurrentNote.querySelector('.note-path');
         const currentCategory = path.innerText.split(' > ')[0];

         path.innerText = `${currentCategory} > ${noteName}`;
      }

      return {  }
   }

   function createNoteList() {
      const state = {
         noteList: document.querySelector('section.note-list'),
         btnAddNote: document.querySelector('.container-add-note > button')
      }

      const showNoteList = ({ categoryName }) => {
         updateSectionTitle(categoryName)

         state.noteList.classList.remove('hide');
      }

      const createNoteElement = ({ isItNewNote, ...note }) => {
         const content = `
         <button data-js="selectItem">
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
         const title = state.noteList.querySelector('.section-title');
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
         sectionNoteList.scrollTop = 0;

         noteState.insertItemFirst(id);
      }

      const setDate = (noteElement, { dateCreated }) => {
         const containerDate = noteElement.querySelector('.date');
         const noteDate = noteElement.querySelector('small');

         noteDate.innerText = dateCreated;
         containerDate.classList.remove('loading');
      }

      const removeSelectedItem = () => {
         const lastNoteClicked = notesList.querySelector('li.selected');
         lastNoteClicked && lastNoteClicked.classList.remove('selected');
      }

      const renderAllItems = notes => {
         notesList.innerHTML = "";

         notes.forEach(({ element }) => {
            notesList.append(element);
         });

         this.removeSelectedItem();
      }

      const renderNewItem = noteElement => {
         notesList.prepend(noteElement);
      }

      const hideSection = () => {
         notesList.innerHTML = '';
         sectionNoteList.classList.add('hide');
      }

      const acceptedNoteActions = {
         selectItem(elementClicked) {
            const noteElement = elementClicked.parentElement;
   
            const alreadySelected = noteElement.classList.contains('selected');
            const id = noteElement.dataset.id;
   
            if (alreadySelected || !id) {
               return
            }
   
            this.removeSelectedItem();
   
            noteElement.classList.add('selected');
            
            const noteName = noteElement.querySelector('h2.title').innerText;
            const noteId = noteElement.dataset.id;
   
            noteState.currentNoteId = noteId;
   
            UIcurrentNoteActions.showSection(noteName);
            UIcurrentNoteActions.setCurrentNote(noteId);
         }
      }

      const noteListListener = e => {
         const action = dataset.js;

         if (acceptedNoteActions[action]) {
            acceptedNoteActions[action](e.target);
         }
      }
      
      state.noteList.addEventListener('click', noteListListener);

      return {  }
   }

   // talvez colocar essa camada dentro do currentNote
   function createAutoSaveListener() {
      const state = {
         autoSave: setTimeout,
         sectionCurrentNote: document.querySelector('section.current-note')
      }

      const saveChanges = () => {
         clearInterval(state.autoSave);

         state.autoSave = setTimeout(DispatchActions.shouldUpdateNote, 4000);
      }

      state.sectionCurrentNote.addEventListener('input', saveChanges);
   }

   createAutoSaveListener();

   const noteList = createNoteList();

   // const chooseAction = e => {
   //    if (e.type === 'submit') e.preventDefault();

   //    const dataJsOfThisElement = e.target.dataset.js; 
      
   //    UInotesListActions[dataJsOfThisElement] && UInotesListActions[dataJsOfThisElement](e.target);
   //    UIcurrentNoteActions[dataJsOfThisElement] && UIcurrentNoteActions[dataJsOfThisElement](e);
   //    DispatchActions[dataJsOfThisElement] && DispatchActions[dataJsOfThisElement]();
   // }

   /* Trigger elements */ 

   return {
      shouldGetNotes: DispatchActions.shouldGetNotes,
      shouldHideNoteUIs: DispatchActions.shouldHideNoteUIs,
      shouldUpdatePath: DispatchActions.shouldUpdatePath
   }
}

export default notesInit