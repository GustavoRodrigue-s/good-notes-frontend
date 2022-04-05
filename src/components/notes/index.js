import api from '../../services/api.js';
import { getCookies } from '../../services/cookie.js';

const categoryList = document.querySelector('.category-list');
const btnNewCategory = document.querySelector('.add-new-category');
const popupWrapper = document.querySelector('.popup-wrapper-category-delete');

const saveChanges = async configs => {
   try {
      const { accessToken, refreshToken, apiKey } = getCookies();

      api.headers["Authorization"] = `${accessToken};${refreshToken}`;
      api.apiKey = `?key=${apiKey}`;

      const [data, status] = await api.request(configs);

      if (data.newAccessToken) {
         document.cookie = `accessToken = ${data.newAccessToken} ; path=/`;
         
         saveChanges(configs);
      } 

      if (status === 200) {
         return data;
      } 

   } catch(e) {
      console.log(e)
   }
}


const categoryActions = {
   "dropDown"(e) {
      const currentLi = e.target.parentElement.parentElement.parentElement;
      const currentButton = e.target;
      
      currentLi.classList.toggle('dropDown-active');
      currentButton.classList.toggle('active');
   },
   "togglePopupConfirmDeleteCategory"(e) {
      const classOfElementClicked = e.target.classList[0];

      const listOfTogglePopup = ['popup-wrapper', 'popup-overlay', 'delete-category', 'btn-delete-category', 'btn-cancel-delete-category'];
      const enableToToggle = listOfTogglePopup.includes(classOfElementClicked);

      if (enableToToggle) {
         popupWrapper.classList.toggle('show');
      }

      classOfElementClicked === 'btn-confirm-delete-category' && categoryActions['confirmDeleteCategory']();
   },
   "selectCategory"(e) {
      const currentLi = e.target.parentElement.parentElement;

      if (currentLi.classList.contains('confirmation')) {
         return
      }

      const lastSelectedLi = document.querySelector('.category-list > li.selected');
      lastSelectedLi && lastSelectedLi.classList.remove('selected');

      currentLi.classList.add('selected');
   },
   "undoCategory"() {
      const currentLi = document.querySelector('.category-list > li.confirmation');

      currentLi.remove();
   },
   "confirmCategory"() {
      const [containerDropDown, containerConfirmation] = 
         document.querySelectorAll('.category-item.confirmation > .container-options > div');

      const currentInput = document.querySelector('.category-item.confirmation input');

      currentInput.setAttribute('readonly', 'readonly');
      currentInput.setAttribute('value', currentInput.value.trim() || 'Nova Categoria');

      containerConfirmation.classList.remove('show');
      containerDropDown.classList.add('show');

      const currentLi = document.querySelector('.category-list > li.confirmation');

      currentLi.classList.remove('confirmation');

      saveChanges({
         route: "addCategory",
         method: "POST",
         body: { 'categoryName': currentInput.value.trim() }
      })
      .then(data => currentLi.setAttribute('data-js', data.categoryId));
   },
   "addNewCategory"() {
      const template = `
      <li class="category-item confirmation">
         <div class="container-name">
            <button class="btn-name btn-default" data-js="selectCategory">
               <svg width="25" height="20" viewBox="0 0 25 20" fill="#969696" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 5.33333H15.1661V8H0V5.33333ZM0 2.66667H15.1661V0H0V2.66667ZM0 13.3333H9.65118V10.6667H0V13.3333ZM20.6949 9.16L21.6738 8.21333C21.8013 8.08973 21.9529 7.99167 22.1196 7.92476C22.2864 7.85785 22.4652 7.82341 22.6458 7.82341C22.8264 7.82341 23.0052 7.85785 23.172 7.92476C23.3388 7.99167 23.4903 8.08973 23.6178 8.21333L24.5967 9.16C25.1344 9.68 25.1344 10.52 24.5967 11.04L23.6178 11.9867L20.6949 9.16ZM19.716 10.1067L12.4087 17.1733V20H15.3316L22.6389 12.9333L19.716 10.1067Z" fill="currentColor"/>
               </svg>
               <input placeholder="Nova Categoria" class="input-default" type="text" name="inputNameCategory" autocomplete="off" />
            </button>
         </div>
         <div class="container-options">
            <div class="container-dropDown">
               <button class="btn-dropDown btn-wrapper-default center-flex" data-js="dropDown">
                  <svg xmlns="http://www.w3.org/2000/svg" height="35px" viewBox="0 0 24 24" width="35px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/>
                     <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                  </svg>
               </button>
               <ul class="list-dropDown">
                  <li>
                     <button>
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#696969"><path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/>
                        </svg>
                     </button>
                     <span class="tooltip">Renomear</span>
                  </li>
                  <li class="delete-category">
                     <button class="btn-delete-category" data-js="togglePopupConfirmDeleteCategory">
                        <svg xmlns="http://www.w3.org/2000/svg" height="30px" viewBox="0 0 24 24" width="30px" fill="#696969"><path d="M0 0h24v24H0V0z" fill="none"/>
                           <path d="M16 9v10H8V9h8m-1.5-6h-5l-1 1H5v2h14V4h-3.5l-1-1zM18 7H6v12c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7z"/>
                        </svg>
                     </button>
                     <span class="tooltip">Excluir</span>
                  </li>
               </ul>
            </div>
            <div class="container-confirmation show center-flex">
               <button class="btn-confirm-category btn-default" data-js="confirmCategory">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#00dd6f"><path d="M0 0h24v24H0V0z" fill="none"/>
                     <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
               </button>
               <button class="btn-undo-category btn-default btn-wrapper-default" data-js="undoCategory">
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#f52500">
                     <path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
                  </svg>
               </button>
            </div> 
         </div>
      </li>
      `;

      categoryList.innerHTML += template;

      document.querySelector('.category-item.confirmation input').focus();
   },
   "confirmDeleteCategory"() {
      const currentLi = document.querySelector('.category-item.dropDown-active');
      const currentCategoryId = currentLi.dataset.js;

      console.log(currentCategoryId);

      if (!currentCategoryId) return

      saveChanges({
         route: 'deleteCategory',
         method: 'POST',
         body: { categoryId: currentCategoryId }
      })
      .then(() => {
         currentLi.remove();
         popupWrapper.classList.remove('show');
      });
   }
}

// add loading in screen => canto inferior esquerdo.
// remover o then do confirm delete para deletar automáticamente.

/* Trigger elements */ 

categoryList.addEventListener('click', e => {
   const dataJsOfThisElement = e.target.dataset.js;

   categoryActions[dataJsOfThisElement] && categoryActions[dataJsOfThisElement](e);
})

btnNewCategory.addEventListener('click', categoryActions['addNewCategory']);

popupWrapper.addEventListener('click', categoryActions['togglePopupConfirmDeleteCategory']);