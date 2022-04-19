const notesInit = ({ api, getCookies }) => {
   const notesList = document.querySelector('.notes-list');
   const sectionNoteList = document.querySelector('section.note-list');
   const sectionCurrentNote = document.querySelector('section.current-note');
   const toolBar = sectionCurrentNote.querySelector('.tool-bar');
   
   const btnAddNote = document.querySelector('.container-add-note > button');

   const containerLoading = document.querySelector('.container-noteList-loading');

   const noteState = {
      gettingNotes: true,
      currentCategoryId: undefined,
      currentNoteId: undefined,
      allNotes: [],

      setItem({ id, dateOne, dateTwo }) {
         const categoryId = +this.currentCategoryId;

         this.allNotes.push({ 
            id, categoryId, 
            title: 'Nova Nota', 
            content: 'O conteúdo da nova nota está aqui...',
            dateOne, dateTwo
         });
      },
      setAllItems(notes) {
         this.allNotes = [...notes, ...this.allNotes];
      },
      hasNotesInThisCategory() {
         const { currentCategoryId, allNotes } = this;

         if (allNotes === []) {
            return
         }

         const shouldGetNotes = allNotes.some(({ categoryId }) => categoryId === +currentCategoryId);
         
         return shouldGetNotes
      },
      getNotesInThisCategory() {
         const { currentCategoryId, allNotes } = this;

         const notes = allNotes.filter(({ categoryId }) => categoryId === +currentCategoryId);

         return notes;
      },
      getNote(noteId) {
         const { allNotes } = this;

         const currentNote = allNotes.find(({ id }) => id === +noteId);

         return currentNote
      }
   }

   const requestTemplate = async configs => {
      try {
         const { accessToken, refreshToken, apiKey } = getCookies();

         api.headers["Authorization"] = `${accessToken};${refreshToken}`;
         api.apiKey = `?key=${apiKey}`;

         const [data, status] = await api.request(configs);

         if (data.newAccessToken) {
            document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
            
            requestTemplate(configs);
         } 

         if (status === 200) {
            return data;
         } else {
            throw { reason: data, status };
         }

      } catch(e) {
         console.log(e)
      }
   }

   const createNoteElement = ({ isItNewNote, ...note }) => {
      const content = `
      <button data-js="selectItem">
         <div class="${isItNewNote ? 'date loading' : 'date'}">
            <small>${isItNewNote ? '' : note.dateTwo}</small>
            <div class="date-loading"></div>
         </div>
         <div class="note-texts">
            <div>
               <h2 class="title">${note.title || 'Nova Nota'}</h2>
            </div>
            <div>
               <p class="content">
                  ${note.content || 'O conteúdo da nova nota está aqui...'}
               </p>
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

   const UIcurrentNoteActions = {
      showSection() {
         sectionCurrentNote.classList.remove('hide');
      },
      setCurrentNote(noteId) {
         const sectionNoteListTitle = sectionNoteList.querySelector('.section-title').innerText;
         const { title, content, dateOne } = noteState.getNote(noteId);

         const sectionPath = sectionCurrentNote.querySelector('.note-path');
         const inputNoteTitle = sectionCurrentNote.querySelector('.title-note input');

         sectionPath.innerText = `${sectionNoteListTitle} > ${title}`;
         inputNoteTitle.value = title;

         const lastModification = sectionCurrentNote.querySelector('.last-modification strong');
         const noteContent = sectionCurrentNote.querySelector('.area-note-content');

         lastModification.innerText = dateOne;
         noteContent.innerText = content;
      },
      setNewLastModification(newLastModification) {
         const lastModification = sectionCurrentNote.querySelector('.last-modification strong');
         lastModification.innerText = newLastModification;
      },
      handleToggleDropDown() {
         const btnDropDown = sectionCurrentNote.querySelector('.btn-dropDown');

         btnDropDown.classList.toggle('active');
      },
      textEditor(e) {
         const elementClicked = e.target;

         if (!elementClicked.dataset.action) {
            return
         }

         // const acceptedCommands = {

         // }

         const command = elementClicked.dataset.action;
         
         console.log(command)

         // document.execCommand(command, false, elementClicked.value);
      }
   }

   const UInotesListActions = {
      renderNewItem() {
         const noteElement = createNoteElement({ isItNewNote: true });

         notesList.prepend(noteElement);

         return noteElement;
      },
      renderAllItems(notes) {
         notesList.innerHTML = "";

         notes.forEach(({ categoryId, ...props }) => {
            const noteElement = createNoteElement({ isItNewNote: false, ...props });

            notesList.append(noteElement);
         });
      },
      selectItem(elementClicked) {
         const noteElement = elementClicked.parentElement;

         const alreadySelected = noteElement.classList.contains('selected');

         if (alreadySelected) {
            return
         }

         const lastNoteClicked = notesList.querySelector('li.selected');
         lastNoteClicked && lastNoteClicked.classList.remove('selected');

         noteElement.classList.add('selected');
         
         const noteName = noteElement.querySelector('h2.title').innerText;
         const noteId = noteElement.dataset.id;

         noteState.currentNoteId = noteId;

         UIcurrentNoteActions.showSection(noteName);
         UIcurrentNoteActions.setCurrentNote(noteId);
      },
      showSection({ categoryName }) {
         const sectionTitle = sectionNoteList.querySelector('.section-title');

         sectionNoteList.classList.remove('hide');
         sectionTitle.innerText = categoryName;
      },
      setDate(noteElement, { dateTwo }) {
         const containerDate = noteElement.querySelector('.date');
         const noteDate = noteElement.querySelector('small');

         noteDate.innerText = dateTwo;
         containerDate.classList.remove('loading');
      },
      updateListItem({ noteId, newTitle, newContent }) {
         const noteElement = notesList.querySelector(`li[data-id="${noteId}"]`);

         const title = noteElement.querySelector('.title');
         const content = noteElement.querySelector('.content');

         title.innerText = newTitle;
         content.innerText = newContent

         const firstNoteElement = notesList.firstElementChild;

         notesList.insertBefore(noteElement, firstNoteElement);

         sectionNoteList.scrollTop = 0;
      }
   }

   const NotesAction = {
      async getNotes({ categoryId }) {
         noteState.gettingNotes = true;

         sectionNoteList.scrollTop = 0;

         const { notes } = await requestTemplate({
            route: 'getNotes',
            method: 'POST',
            body: { categoryId }
         });

         if (notes) {
            noteState.setAllItems(notes);
            const currentNoteList = noteState.getNotesInThisCategory();

            UInotesListActions.renderAllItems(currentNoteList);
         }
         
         noteState.gettingNotes = false;
         containerLoading.classList.remove('show');
      },
      async createNote({ currentCategoryId }) {
         const noteElement = UInotesListActions.renderNewItem();

         const { noteData } = await requestTemplate({
            route: 'addNote',
            method: 'POST',
            body: { categoryId: currentCategoryId }
         });

         noteState.setItem(noteData);

         noteElement.setAttribute('data-id', noteData.id);
         UInotesListActions.setDate(noteElement, noteData);
      },
      async deleteNote({ currentCategoryId, currentNoteId }) {
         const noteElement = notesList.querySelector(`[data-id="${currentNoteId}"]`);
         noteElement.remove();

         sectionCurrentNote.classList.add('hide');

         await requestTemplate({
            route: 'deleteNote',
            method: 'POST',
            body: { categoryId: currentCategoryId, noteId: currentNoteId }
         })
      },
      async updateNote(noteDatas) {
         const { lastModification } = await requestTemplate({
            route: 'updateNote',
            method: 'POST',   
            body: { ...noteDatas }
         });

         UIcurrentNoteActions.setNewLastModification(lastModification);
         UInotesListActions.updateListItem(noteDatas);
      }
   }

   const DispatchActions = {
      shouldGetNotes({ categoryId, categoryName }) {
         sectionCurrentNote.classList.add('hide');

         if (!categoryId) {
            return
         }

         containerLoading.classList.add('show');
         UInotesListActions.showSection({ categoryName });

         noteState.currentCategoryId = categoryId;

         const hasNotes = noteState.hasNotesInThisCategory();

         if (hasNotes) {
            const notesInThisCategory = noteState.getNotesInThisCategory();
            UInotesListActions.renderAllItems(notesInThisCategory);

            containerLoading.classList.remove('show');

            return
         }

         NotesAction.getNotes({ categoryId });
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
         UIcurrentNoteActions.handleToggleDropDown();

         const { currentNoteId: noteId, currentCategoryId: categoryId } = noteState;

         if (!noteId || !categoryId) {
            return
         }

         const { title, content } = noteState.getNote(noteId);

         const newTitle = sectionCurrentNote.querySelector('.input-note-title').value;
         const newContent = sectionCurrentNote.querySelector('.area-note-content').innerHTML;
         
         if (title === newTitle && content === newContent) {
            return
         }         

         NotesAction.updateNote({ noteId, categoryId, newTitle, newContent });
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
   btnAddNote.addEventListener('click', chooseAction);
   toolBar.addEventListener('click', UIcurrentNoteActions.textEditor);

   return DispatchActions.shouldGetNotes
}

export default notesInit