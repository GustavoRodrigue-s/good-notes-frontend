export default function createNoteRepository() {
   const state = {
      selectedCategoryId: undefined,
      selectedNoteId: undefined,
      notes: []
   }

   const handleErrors = {
      create() {
         const { notes } = state.storage;

         const newNoteList = notes.filter(note => 'id' in note);

         state.notes = newNoteList;
      },
      delete(note) {
         note.element.classList.remove('selected');

         state.notes.unshift(note);
      },
      update(note, noteClone) {
         update(note, noteClone);
      }
   }

   const acceptedGetActions = {
      notes(currentCategoryId) {
         const notes = state.notes;
   
         const currentNoteList = notes.filter(({ categoryId }) => categoryId === +currentCategoryId);
   
         return currentNoteList;
      },
      note(noteId) {
         const notes = state.notes;
   
         const currentNote = notes.find(({ id }) => id === +noteId);
   
         return currentNote
      },
      selectedIds() {
         const { selectedNoteId, selectedCategoryId } = state;

         return { selectedNoteId, selectedCategoryId }
      }
   }

   const get = (where, argument) => {
      const data = acceptedGetActions[where](argument);

      return data
   }

   const insertItemFirst = noteId => {
      const notes = state.notes;

      const updatedNoteIndex = notes.findIndex(({ id }) => id === +noteId);

      if (updatedNoteIndex === -1) {
         return
      }

      const [ updatedNoteRemoved ] = notes.splice(updatedNoteIndex, 1);
      notes.unshift(updatedNoteRemoved);
   }

   const create = currentCategoryId => {
      const categoryId = +currentCategoryId;

      const newItem = { 
         categoryId, 
         title: 'Nova Nota', 
         summary: 'O resumo da nova nota está aqui...',
         content: 'O conteúdo da nova nota está aqui...'
      }

      state.notes.unshift(newItem);

      return newItem;
   }

   const setNotes = notes => {
      state.notes = [...notes, ...state.notes];
   }

   const setSelectedCategoryId = category => {
      const id = category.dataset.id
      state.selectedCategoryId = id;
   }

   const setSelectedNoteId = ({ noteId }) => {
      state.selectedNoteId = noteId;
   }

   const deleteNote = (currentCategoryId, noteId) => {
      const notes = state.notes;

      const newNoteList = notes.filter(({ id, categoryId }) => 
            id !== +noteId && currentCategoryId !== categoryId);

      state.notes = newNoteList;
   }

   const deleteNotes = currentCategoryId => {
      const notes = state.notes;

      const newNoteList = notes.filter(({ categoryId }) => categoryId !== +currentCategoryId);

      state.notes = newNoteList;
   }

   const update = (note, { title, content, summary }) => {
      note.title = title;
      note.content = content;
      note.summary = summary;

      insertItemFirst(note.id);
   }

   return { 
      get,
      create,
      update,
      setNotes,
      deleteNote,
      deleteNotes,
      setSelectedCategoryId,
      setSelectedNoteId,
      handleErrors: handleErrors
   }
}