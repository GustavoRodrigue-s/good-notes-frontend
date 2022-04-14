const notesInit = () => {
   const notesList = document.querySelector('.notes-list');
   const btnAddNote = document.querySelector('.container-add-note > button');

   const createNoteElement = ({ isItNewNote, ...note }) => {
      const content = `
      <button data-js="selectItem">
         <div>
            <small>28 Março 2022 às 17:22</small>
         </div>
         <div>
            <h2>Nota test</h2>
         </div>
         <div>
            <p>
               Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis molestias fugiat, dolore laboriosam enim necessitatibus deleniti velit corporis iure impedit fuga cupiditate odit porro dolorum alias similique, libero numquam sint? Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci, neque praesentium sint est dignissimos aspernatur reiciendis saepe. Qui, quaerat eius, natus quasi doloremque dolore dolorum provident fugit nesciunt debitis veniam!
            </p>
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

   const UInotesActions = {
      renderNewItem() {
         const noteElement = createNoteElement({ isItNewNote: true });

         notesList.append(noteElement);
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
      }
   }

   const chooseAction = e => {
      const dataJsOfThisElement = e.target.dataset.js; 
      
      UInotesActions[dataJsOfThisElement] && UInotesActions[dataJsOfThisElement](e.target);
   }

   /* Trigger elements */ 

   notesList.addEventListener('click', chooseAction);
   btnAddNote.addEventListener('click', chooseAction);
}

export default notesInit