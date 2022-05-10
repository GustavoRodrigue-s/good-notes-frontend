export default function createNoteRepository() {
   const state = {
      selectedCategoryId: undefined,
      selectedNoteId: undefined,

      storage: {
         notes: []
      }
   }

   const insertItemFirst = noteId => {
      const { notes } = state.storage;

      const updatedNoteIndex = notes.findIndex(({ id }) => id === +noteId);

      if (updatedNoteIndex === -1) {
         return
      }

      const [ updatedNoteRemoved ] = notes.splice(updatedNoteIndex, 1);
      notes.unshift(updatedNoteRemoved);
   }

   const setItem = currentCategoryId => {
      const categoryId = +currentCategoryId;

      const newItem = { 
         categoryId, 
         title: 'Nova Nota', 
         summary: 'O resumo da nova nota está aqui...',
         content: 'O conteúdo da nova nota está aqui...'
      }

      state.storage.notes.unshift(newItem);

      return newItem;
   }

   const setAllItems = notes => {
      state.storage.notes = [...notes, ...state.storage.notes];
   }

   const getAllItems = currentCategoryId => {
      const { notes } = state.storage;

      const currentNoteList = notes.filter(({ categoryId }) => categoryId === +currentCategoryId);

      return currentNoteList;
   }

   const getItem = noteId => {
      const { notes } = state.storage;

      const currentNote = notes.find(({ id }) => id === +noteId);

      return currentNote
   }

   const getSelectedCategoryId = () => {
      return state.selectedCategoryId;
   }

   const setSelectedCategoryId = category => {
      const id = category.dataset.id
      state.selectedCategoryId = id;
   }

   const getSelectedNoteId = () => {
      return state.selectedNoteId;
   }

   const setSelectedNoteId = ({ noteElement }) => {
      const id = noteElement.dataset.id;
      state.selectedNoteId = id;
   }

   const deleteItem = (currentCategoryId, noteId) => {
      const { notes } = state.storage;

      const newNoteList = notes.filter(({ id, categoryId }) => 
         id !== +noteId && currentCategoryId !== categoryId);

      state.storage.notes = newNoteList;
   }

   const deleteAllItems = currentCategoryId => {
      const { notes } = state.storage;

      const newNoteList = notes.filter(({ categoryId }) => categoryId !== +currentCategoryId);

      state.storage.notes = newNoteList;
   }

   const updateItem = (note, { title, content, summary }) => {
      note.title = title;
      note.content = content;
      note.summary = summary;

      insertItemFirst(note.id);
   }

   return { 
      setAllItems,
      setItem,
      getAllItems,
      getItem,
      deleteAllItems,
      deleteItem,
      updateItem,
      getSelectedCategoryId,
      setSelectedCategoryId,
      getSelectedNoteId,
      setSelectedNoteId
   }
}