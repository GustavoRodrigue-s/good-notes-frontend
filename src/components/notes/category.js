export function createCategoryNetwork({ networkTemplate, popupLoading }) {
   const state = {
      observers: [],
      loading: document.querySelector('.container-category-loading')
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

   const setCategoryConfirmationDeletion = () => {
      notifyAll('setTheDeleteTarget', dispatch.shouldDeleteCategory);
   }

   const createCategory = async ({ categoryElement, categoryName }) => {
      const id = popupLoading.showLoading();

      const { categoryId } = await networkTemplate({
         route: "addCategory",
         method: "POST",
         body: { 'categoryName': categoryName }
      });
         
      categoryElement.setAttribute('data-id', categoryId);
      popupLoading.shouldHideLoading(id);
   }

   const updateCategory = async ({ inputCategoryName, categoryId, newCategoryName }) => {
      const id = popupLoading.showLoading();

      await networkTemplate({
         route: 'updateCategory',
         method: 'POST',
         body: { categoryId, newCategoryName }
      })
      
      inputCategoryName.setAttribute('value', newCategoryName);
      popupLoading.shouldHideLoading(id);

      notifyAll('categoryUpdated', { categoryId, newCategoryName });
   }

   const deleteCategory = async ({ categoryElement, categoryId }) => {
      const id = popupLoading.showLoading();

      categoryElement.remove();
      notifyAll('categoryRemoved', { categoryId });

      await networkTemplate({
         route: 'deleteCategory',
         method: 'POST',
         body: { categoryId }
      })

      popupLoading.shouldHideLoading(id);
   }

   const getCategories = async () => {
      const { categories } = await networkTemplate({ route: 'getCategories' });
      
      notifyAll('obtainedCategories', categories);

      state.loading.classList.remove('show');
   }

   const dispatch = {
      shouldCreateCategory(categoryElement) {
         const inputCategoryName = categoryElement.querySelector('input');
         const categoryName = inputCategoryName.value.trim() || 'Nova Categoria';

         inputCategoryName.setAttribute('value', categoryName);

         createCategory({ categoryElement, categoryName });

         notifyAll('verifyToCreateCategory', categoryElement);
      },
      shouldUpdateCategory(categoryElement) {
         notifyAll('verifyToUpdateCategory', categoryElement);

         const inputCategoryName = categoryElement.querySelector('input');
         const categoryId = categoryElement.dataset.id;
   
         if (!categoryId) {
            inputCategoryName.value = inputCategoryName.getAttribute('value');

            return
         }

         const newCategoryName = inputCategoryName.value.trim();
         const lastCategoryName = inputCategoryName.getAttribute('value');

         if (newCategoryName === lastCategoryName) {
            return
         }

         updateCategory({ inputCategoryName, categoryId, newCategoryName });
      },
      shouldDeleteCategory() {
         const categoryElement = document.querySelector('.category-item.dropDown-active');
         const categoryId = categoryElement.dataset.id;
   
         notifyAll('verifyToDeleteCategory', categoryElement);

         if (!categoryId) {
            return
         }

         deleteCategory({ categoryElement, categoryId });
      }
   }

   const networkListener = ({ e, action, getCategory }) => {
      const acceptedDispatch = dispatch[action]

      if (acceptedDispatch) {
         const categoryElement = getCategory(e);

         dispatch[action](categoryElement)
      }
   }

   return { 
      subscribe,
      networkListener,
      getCategories,
      setCategoryConfirmationDeletion
   }
}

export function createCategoryList() {
   const state = {
      observers: [],
      gettingCategories: true,
      availableToAddCategory: true,
      categoryList: document.querySelector('.category-list'),
      inputSearch: document.querySelector('.input-search-categories'),
      btnAddCategory: document.querySelector('.add-new-category')
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

   const getCategory = e => {
      const eventTargetPath = [...e.path];
      
      const categoryElement = eventTargetPath.find(element => element.classList.contains('category-item'));

      return categoryElement;
   }

   const createCategoryElement = ({ isItNewCategory, ...category }) => {
      const content = `
      <form class="category-form">
         <div class="container-name">
            <button class="btn-name btn-default" type="button" data-js="shouldSelectItem">
               <svg width="25" height="20" viewBox="0 0 25 20" fill="#969696" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 5.33333H15.1661V8H0V5.33333ZM0 2.66667H15.1661V0H0V2.66667ZM0 13.3333H9.65118V10.6667H0V13.3333ZM20.6949 9.16L21.6738 8.21333C21.8013 8.08973 21.9529 7.99167 22.1196 7.92476C22.2864 7.85785 22.4652 7.82341 22.6458 7.82341C22.8264 7.82341 23.0052 7.85785 23.172 7.92476C23.3388 7.99167 23.4903 8.08973 23.6178 8.21333L24.5967 9.16C25.1344 9.68 25.1344 10.52 24.5967 11.04L23.6178 11.9867L20.6949 9.16ZM19.716 10.1067L12.4087 17.1733V20H15.3316L22.6389 12.9333L19.716 10.1067Z" fill="currentColor"/>
               </svg>
               <input placeholder="Nome da categoria" class="input-default" type="text" name="inputCategoryName" autocomplete="off" ${!isItNewCategory ? 'value="' + category.name + '"' : ''}/>
            </button>
         </div>
         <div class="container-options">
            <div class="${!isItNewCategory ? 'container-dropDown show' : 'container-dropDown'}">
               <button class="btn-dropDown btn-wrapper-default center-flex" name="btnDropDown" type="button" data-js="activateDropDown">
                  <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/>
                     <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
               </button>
               <ul class="list-dropDown">
                  <li>
                     <button type="button" data-js="toggleDatasetForRenameItem">
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#696969"><path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
                        </svg>
                     </button>
                     <span class="tooltip">Renomear</span>
                  </li>
                  <li class="delete-category">
                     <button type="button" class="btn-delete-category" data-js="showPopupDelete">
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#696969"><path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
                        </svg>
                     </button>
                     <span class="tooltip">Excluir</span>
                  </li>
               </ul>
            </div>
            <div class="${!isItNewCategory ? 'container-confirmation' : 'container-confirmation show'} center-flex">
               <button type="submit" class="btn-confirm-category btn-default center-flex" data-js="shouldCreateCategory">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00dd6f"><path d="M0 0h24v24H0V0z" fill="none"/>
                     <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
               </button>
               <button type="reset" class="btn-undo-category btn-default btn-wrapper-default center-flex" data-js="cancelItemAddition">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#f52500">
                     <path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
               </button>
            </div> 
         </div>
      </form>
      `;

      const categoryElement = document.createElement('li');

      categoryElement.className = isItNewCategory ? 'category-item confirmation' : 'category-item';
      categoryElement.innerHTML = content;

      if (!isItNewCategory) {
         categoryElement.setAttribute('data-id', category.id);
      }

      return categoryElement
   }

   const searchCategory = categoryElements => {
      const valueInputSeach = state.inputSearch.value.trim();
      const areTheSameTexts = new RegExp(valueInputSeach, 'i');

      const showOrHideCategories = categoryElements.map(element => {
         const name = element.querySelector('input').value.trim();

         const removeOrAdd = areTheSameTexts.test(name) ? 'remove' : 'add';

         return { element, removeOrAdd }
      });

      showOrHideCategories.forEach(({ element, removeOrAdd }) => 
         element.classList[removeOrAdd]('hide'));
   }

   const renderAllCategories = categories => {
      if (categories === []) {
         return
      }

      const allCategoryElements = categories.map(([id, name]) => 
         createCategoryElement({ isItNewCategory: false, id, name }));

      allCategoryElements.forEach(element => state.categoryList.append(element));

      state.gettingCategories = false;
   }

   const renderCategory = () => {
      state.availableToAddCategory = false;

      const categoryElement = createCategoryElement({ isItNewCategory: true });     

      state.categoryList.prepend(categoryElement);

      categoryElement.querySelector('input').focus();

      setTimeout(() => state.availableToAddCategory = true, 400);
   }

   const dispatch = {
      shouldSearchItem() {
         if (state.gettingCategories) {
            return
         }

         const categoryElements = [...state.categoryList.children];

         if (categoryElements === []) {
            return
         }

         searchCategory(categoryElements);
      },
      shouldCreateElement() {
         if (state.gettingCategories || !state.availableToAddCategory) {
            return
         }

         renderCategory();
      }
   }

   const categoryListListener = e => {
      if (e.type === 'submit') e.preventDefault();

      const action = e.target.dataset.js;

      notifyAll('click', { e, action, getCategory });
   }

   state.categoryList.addEventListener('click', categoryListListener);
   state.categoryList.addEventListener('submit', categoryListListener);

   state.btnAddCategory.addEventListener('click', dispatch.shouldCreateElement);
   state.inputSearch.addEventListener('input', dispatch.shouldSearchItem);

   return { 
      subscribe,
      renderAllCategories
   }
}

export function createCategoryItem() {
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

   const getCurrentCategoryId = () => {
      return state.currentCategoryId;
   }

   const setCurrentCategoryId = id => {
      state.currentCategoryId = id;
   }

   const changeContainersVisibility = ({ confirmation, dropDown, categoryElement }) => {
      const [containerDropDown, containerConfirmation] = categoryElement.querySelectorAll('.container-options > div');

      containerConfirmation.classList[confirmation]('show');   
      containerDropDown.classList[dropDown]('show');
   }

   const inputAutoFocus = currentInput => {
      const strLength = currentInput.value.length;

      currentInput.focus();
      currentInput.setSelectionRange(strLength, strLength);
   }

   const addConfirmation = categoryElement => {
      const { inputCategoryName } = categoryElement.querySelector('form');
      
      changeContainersVisibility({ confirmation: 'add', dropDown: 'remove', categoryElement });

      categoryElement.classList.add('confirmation');

      inputCategoryName.removeAttribute('readonly');
      inputAutoFocus(inputCategoryName);
   }

   const removeConfirmation = categoryElement => {
      const { inputCategoryName, btnDropDown } = categoryElement.querySelector('form');
      
      changeContainersVisibility({ confirmation: 'remove', dropDown: 'add', categoryElement });

      categoryElement.classList.remove('confirmation', 'dropDown-active');
      btnDropDown.classList.remove('active');

      inputCategoryName.setAttribute('readonly', 'readonly');
   }

   const removeSelectedItem = () => {
      const lastSelectedLi = document.querySelector('.category-item.selected');
      lastSelectedLi && lastSelectedLi.classList.remove('selected');
   }

   // talvez adicionar currentCategoryElement dentro desse obj, assim eliminando a syntax de parâmetros
   const acceptedCategoryActions = {
      activateDropDown(categoryElement) {
         const btnDropDown = categoryElement.querySelector('.btn-dropDown');

         categoryElement.classList.toggle('dropDown-active');
         btnDropDown.classList.toggle('active');
      },
      showPopupDelete() {
         notifyAll('showPopupDelete', 'category');
      },
      selectItem(categoryElement) {
         removeSelectedItem();

         categoryElement.classList.add('selected');

         notifyAll('categorySelected', categoryElement);
      },
      cancelItemAddition(categoryElement) {
         categoryElement.remove();
      },
      cancelRenameItem(categoryElement) {
         removeConfirmation(categoryElement);
      },
      toggleDatasetForRenameItem(categoryElement) {
         addConfirmation(categoryElement);

         const [btnConfirm, btnCancel] = categoryElement.querySelectorAll('.container-confirmation > button');

         btnConfirm.setAttribute('data-js', 'shouldUpdateCategory');
         btnCancel.setAttribute('data-js', 'cancelRenameItem');
      }
   }

   const dispatch = {
      shouldSelectItem(categoryElement) {
         const alreadySelected = categoryElement.classList.contains('selected');
         const isInTheConfirmationPhase = categoryElement.classList.contains('confirmation');
         const id = categoryElement.dataset.id;

         if (alreadySelected || !id || isInTheConfirmationPhase) {
            return
         }

         acceptedCategoryActions.selectItem(categoryElement);
      }
   }

   const categoryItemListener = ({ e, action, getCategory }) => {
      const categoryElement = dispatch[action] || acceptedCategoryActions[action] 
         ? getCategory(e) 
         : '';

      if (dispatch[action]) {
         dispatch[action](categoryElement);
      }

      if (acceptedCategoryActions[action]) {
         acceptedCategoryActions[action](categoryElement);
      }
   }

   return { 
      subscribe,
      categoryItemListener,
      inputAutoFocus,
      removeConfirmation,
      getCurrentCategoryId,
      setCurrentCategoryId
   }
}