export default function createAnimation() {
   const state = {
      currentList: null,
      currentListItems: null
   }

   const prepareAnimation = callbackAction => {
      const initialPosition = state.currentListItems.map(item => item.getBoundingClientRect());

      callbackAction();

      state.currentListItems.forEach((item, i) => {
         const finalPosition = item.getBoundingClientRect();
         const x = initialPosition[i].left - finalPosition.left;
         const y = initialPosition[i].top - finalPosition.top;

         item.style.transform = `translate(${x}px, ${y}px)`;
      });
   }

   const startAnimation = () => {
      state.currentListItems.forEach(item => item.style.transform = '');
      state.currentList.classList.add('animation');
   }

   const endAnimation = item => {
      state.currentList.classList.remove('animation');

      if (item.classList.contains('remove')) {
         item.remove();
      }
   }
   
   const animationModel = (item, list, callback) => {
      state.currentList = list;
      state.currentListItems = [...list.children];

      prepareAnimation(callback);
      requestAnimationFrame(startAnimation);

      setTimeout(() => endAnimation(item), 300);
   }

   const add = ({ item, list }) => {
      animationModel(item, list, () => list.prepend(item));
   }

   const remove = ({ item, list }) => {
      animationModel(item, list, () => item.classList.add('remove'));
   }

   const update = ({ item, list }) => {
      animationModel(item, list, () => list.insertBefore(item, list.children[0]));
   }

   return {
      add,
      remove,
      update
   }
}