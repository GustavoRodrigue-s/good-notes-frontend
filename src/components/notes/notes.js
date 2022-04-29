const notesInit = ({ api, loading, confirmDelete }) => {
   const notesList = document.querySelector('.notes-list');
   const sectionNoteList = document.querySelector('section.note-list');
   const sectionCurrentNote = document.querySelector('section.current-note');

   const toolBar = sectionCurrentNote.querySelector('.tool-bar');
   const btnAddNote = document.querySelector('.container-add-note > button');
   const btnExpandSummary = sectionCurrentNote.querySelector('.container-summary > button');

   const containerLoading = document.querySelector('.container-noteList-loading');

   // criar camada separada para o containerLoading skeleton

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
      deleteAllItems() {
         const { allNotes, currentCategoryId } = this;

         const newNoteList = allNotes.filter(({ categoryId }) => categoryId !== +currentCategoryId);

         this.allNotes = newNoteList;
      },
      updateItem(noteDatas) {
         const { allNotes } = this;
         const { newTitle, newContent, newSummary, newLastModification } = noteDatas;

         const noteUpdated = {
            title: newTitle,
            content: newContent,
            summary: newSummary,
            lastModification: newLastModification
         };

         this.allNotes = allNotes.map(note => 
            note.id === noteUpdated.id ? { ...note ,...noteUpdated } : note);
      },
      insertItemFirst(noteId) {
         const { allNotes } = this;

         const updatedNoteIndex = allNotes.findIndex(({ id }) => id === +noteId);

         if (updatedNoteIndex === -1) {
            return
         }

         const updatedNoteRemoved = allNotes.splice(updatedNoteIndex, 1);
         allNotes.unshift(updatedNoteRemoved);
      },
      alreadyRequested(categoryId) {
         const { pendingRequestQueue, queueAlreadyRequested } = this;

         const currentIdPendingRequest = pendingRequestQueue.find(id => id === categoryId);
         const currentIdAlreadyRequested = queueAlreadyRequested.find(id => id === categoryId);

         return { currentIdPendingRequest, currentIdAlreadyRequested }
      }
   }

   const requestTemplate = async configs => {
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

   const NotesAction = {
      async getNotes({ categoryId }) {
         if (categoryId === noteState.currentCategoryId) {
            containerLoading.classList.add('show');
         }

         noteState.gettingNotes = true;
         sectionNoteList.scrollTop = 0;

         noteState.pendingRequestQueue.push(categoryId);

         const { notes } = await requestTemplate({
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
      },
      async createNote({ currentCategoryId }) {
         const id = loading.showLoading();

         const newNote = noteState.setItem(currentCategoryId);
         UInotesListActions.renderNewItem(newNote.element);

         const { noteData } = await requestTemplate({
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
      },
      async deleteNote({ currentCategoryId, currentNoteId }) {
         const id = loading.showLoading();

         noteState.deleteItem(currentCategoryId, currentNoteId);

         const noteElement = notesList.querySelector(`[data-id="${currentNoteId}"]`);
         noteElement.remove();

         UIcurrentNoteActions.hideSection();

         await requestTemplate({
            route: 'deleteNote',
            method: 'POST',
            body: { categoryId: currentCategoryId, noteId: currentNoteId }
         })

         loading.shouldHideLoading(id);
      },
      async updateNote(noteDatas) {
         const id = loading.showLoading();

         UInotesListActions.updateListItem(noteDatas);

         const { lastModification } = await requestTemplate({
            route: 'updateNote',
            method: 'POST',   
            body: { ...noteDatas }
         });

         noteDatas.newLastModification = lastModification;

         noteState.updateItem(noteDatas);
         UIcurrentNoteActions.setNewModifications(noteDatas);
         
         loading.shouldHideLoading(id);
      }
   }

   const DispatchActions = {
      shouldGetNotes({ categoryId, categoryName }) {
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

         const { currentNoteId: noteId, currentCategoryId: categoryId } = noteState;

         if (!noteId || !categoryId) {
            return
         }

         const { title, content, summary } = noteState.getItem(noteId);

         const newTitle = sectionCurrentNote.querySelector('.input-note-title').value;
         const newContent = sectionCurrentNote.querySelector('.area-note-content').innerHTML;
         const newSummary = sectionCurrentNote.querySelector('.summaryArea').value;

         if (title === newTitle && content === newContent && summary === newSummary) {
            return
         }

         NotesAction.updateNote({ noteId, categoryId, newTitle, newContent, newSummary });
      },
      shouldHideNoteUIs(categoryId) {
         noteState.deleteAllItems();

         if (categoryId === noteState.currentCategoryId) {
            UInotesListActions.hideSection();
            UIcurrentNoteActions.hideSection();
         }
      },
      shouldUpdatePath(categoryId, categoryName) {
         if (categoryId === noteState.currentCategoryId) {
            UInotesListActions.updateSectionTitle(categoryName);
            UIcurrentNoteActions.updateSectionPath(categoryName);
         }
      }
   }

   const UIcurrentNoteActions = {
      hideSection() {
         const btnDropDown = sectionCurrentNote.querySelector('.btn-dropDown');

         sectionCurrentNote.classList.add('hide');
         btnDropDown.classList.remove('active');
      },
      showSection() {
         sectionCurrentNote.classList.remove('hide');
      },
      showPopupDelete() {
         confirmDelete.subscribe(DispatchActions.shouldDeleteNote);
         confirmDelete.showPopup('note');
      },
      resetToolBar() {
         const [
            selectFontSize, selectFontFamily, inputColor
         ] = sectionCurrentNote.querySelector('.select-group').children;

         selectFontSize.value = '3';
         selectFontFamily.value = 'arial';
         inputColor.value = '#000000';
      },
      setCurrentNote(noteId) {
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

         this.resetToolBar();
      },
      setNewModifications({ newLastModification, newTitle }) {
         const path = sectionCurrentNote.querySelector('.note-path');
         const lastModification = sectionCurrentNote.querySelector('.last-modification strong');

         const currentCategory = path.innerText.split(' > ')[0];

         lastModification.innerText = newLastModification;
         path.innerText = `${currentCategory} > ${newTitle}`;
      },
      handleToggleDropDown(e) {
         const btnDropDown = e.target;

         btnDropDown.classList.toggle('active');
      },
      btnTextEditor(e) {
         const elementClicked = e.target;

         if (elementClicked.tagName !== 'BUTTON') {
            return
         }

         const command = elementClicked.dataset.action;
         
         document.execCommand(command);
      },
      selectionsTextEditor(e) {
         const elementClicked = e.target;

         if (!elementClicked.dataset.action) {
            return 
         }

         const command = elementClicked.dataset.action;
         const value = elementClicked.value;

         document.execCommand(command, false, value);
      },
      updateSectionPath(categoryName) {
         const path = sectionCurrentNote.querySelector('.note-path');
         const currentNote = path.innerText.split(' > ')[1];

         path.innerText = `${categoryName} > ${currentNote}`;
      }
   }

   const UInotesListActions = {
      hideSection() {
         notesList.innerHTML = '';
         sectionNoteList.classList.add('hide');
      },
      renderNewItem(noteElement) {
         notesList.prepend(noteElement);
      },
      renderAllItems(notes) {
         notesList.innerHTML = "";

         notes.forEach(({ element }) => {
            notesList.append(element);
         });

         this.removeSelectedItem();
      },
      removeSelectedItem() {
         const lastNoteClicked = notesList.querySelector('li.selected');
         lastNoteClicked && lastNoteClicked.classList.remove('selected');
      },
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
      },
      showSection({ categoryName }) {
         this.updateSectionTitle(categoryName)

         sectionNoteList.classList.remove('hide');
      },
      setDate(noteElement, { dateCreated }) {
         const containerDate = noteElement.querySelector('.date');
         const noteDate = noteElement.querySelector('small');

         noteDate.innerText = dateCreated;
         containerDate.classList.remove('loading');
      },
      updateListItem({ noteId, newTitle, newSummary }) {
         const noteElement = notesList.querySelector(`li[data-id="${noteId}"]`);

         const title = noteElement.querySelector('.title');
         const summary = noteElement.querySelector('.summary');

         title.innerText = newTitle;
         summary.innerText = newSummary;

         const firstNoteElement = notesList.firstElementChild;

         notesList.insertBefore(noteElement, firstNoteElement);
         sectionNoteList.scrollTop = 0;

         noteState.insertItemFirst(noteId);
      },
      updateSectionTitle(categoryName) {
         const sectionTitle = sectionNoteList.querySelector('.section-title');
         sectionTitle.innerText = categoryName;
      }
   }

   const chooseAction = e => {
      const dataJsOfThisElement = e.target.dataset.js; 
      
      UInotesListActions[dataJsOfThisElement] && UInotesListActions[dataJsOfThisElement](e.target);
      UIcurrentNoteActions[dataJsOfThisElement] && UIcurrentNoteActions[dataJsOfThisElement](e);
      DispatchActions[dataJsOfThisElement] && DispatchActions[dataJsOfThisElement]();
   }

   /* Trigger elements */ 

   notesList.addEventListener('click', chooseAction);
   sectionCurrentNote.addEventListener('click', chooseAction);

   btnAddNote.addEventListener('click', DispatchActions.shouldCreateNote);

   toolBar.addEventListener('click', UIcurrentNoteActions.btnTextEditor);
   toolBar.addEventListener('change', UIcurrentNoteActions.selectionsTextEditor);

   btnExpandSummary.addEventListener('click', UIcurrentNoteActions.handleToggleDropDown);

   return {
      shouldGetNotes: DispatchActions.shouldGetNotes,
      shouldHideNoteUIs: DispatchActions.shouldHideNoteUIs,
      shouldUpdatePath: DispatchActions.shouldUpdatePath
   }
}

export default notesInit