const notesInit = ({ api, getCookies }) => {
   const notesList = document.querySelector('.notes-list');
   const btnAddNote = document.querySelector('.container-add-note > button');
   const sectionNoteList = document.querySelector('section.note-list');
   const sectionCurrentNote = document.querySelector('section.current-note');

   // criar um state com => {categories: [{'name', 'id', notes: [{'title', 'content', 'id'}, {'title', 'content', 'id'}]}]}

   const noteState = {
      gettingNotes: true,
      currentCategoryId: undefined
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
         <div>
            <small>28 Março 2022 às 17:22</small>
         </div>
         <div class="note-texts">
            <div>
               <h2 class="title">Nova Nota</h2>
            </div>
            <div>
               <p>
                  O conteúdo da nova nota está aqui...
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
      showSection(noteName) {
         const sectionNoteListTitle = sectionNoteList.querySelector('.section-title').innerText;

         const sectionPath = sectionCurrentNote.querySelector('.note-path');
         const inputNoteTitle = sectionCurrentNote.querySelector('.title-note input');

         sectionPath.innerText = `${sectionNoteListTitle} > ${noteName}`;
         inputNoteTitle.value = noteName;

         sectionCurrentNote.classList.remove('hide');
      }
   }

   const UInotesListActions = {
      renderNewItem() {
         const noteElement = createNoteElement({ isItNewNote: true });

         notesList.append(noteElement);

         return noteElement;
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

         UIcurrentNoteActions.showSection(noteName);
      },
      showSection({ categoryName }) {
         const sectionTitle = sectionNoteList.querySelector('.section-title');

         sectionNoteList.classList.remove('hide');
         sectionTitle.innerText = categoryName;
      }
   }

   const NotesAction = {
      async getNotes({ categoryId }) {
         noteState.gettingNotes = true;

         const data = await requestTemplate({
            route: 'getNotes',
            method: 'POST',
            body: { categoryId }
         });

         console.log(data);
         noteState.currentCategoryId = categoryId;
         noteState.gettingNotes = false;
      },
      async createNote({ currentCategoryId }) {
         const noteElement = UInotesListActions.renderNewItem();

         const { noteId } = await requestTemplate({
            route: 'addNote',
            method: 'POST',
            body: { categoryId: currentCategoryId }
         })

         console.log(noteId);
         noteElement.setAttribute('data-id', noteId);
      }
   }

   const DispatchActions = {
      shouldGetNotes({ categoryId, categoryName }) {
         if (!categoryId) {
            return
         }

         UInotesListActions.showSection({ categoryName });
         NotesAction.getNotes({ categoryId });
      },
      shouldCreateNote() {
         const { currentCategoryId, gettingNotes } = noteState;

         if (!currentCategoryId || gettingNotes) {
            return
         }

         NotesAction.createNote({ currentCategoryId });
      }
   }

   const chooseAction = e => {
      const dataJsOfThisElement = e.target.dataset.js; 
      
      UInotesListActions[dataJsOfThisElement] && UInotesListActions[dataJsOfThisElement](e.target);
      DispatchActions[dataJsOfThisElement] && DispatchActions[dataJsOfThisElement]();
   }

   /* Trigger elements */ 

   notesList.addEventListener('click', chooseAction);
   btnAddNote.addEventListener('click', chooseAction);

   return DispatchActions.shouldGetNotes
}

export default notesInit