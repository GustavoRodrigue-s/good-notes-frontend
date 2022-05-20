export default function createAnimation() {
   const state = {
      currentList: null,
      currentListItems: null
   }

   const prepareAnimation = (item, action) => {
      const initialPosition = state.currentListItems.map(item => item.getBoundingClientRect());

      const acceptedActions = {
         add() {
            state.currentList.prepend(item);
         },
         remove() {
            item.classList.add('remove');
         },
         update() {
            state.currentList.insertBefore(item, state.currentListItems[0]);
         }
      }

      acceptedActions[action] && acceptedActions[action]();

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

   const endAnimation = (item, action) => {
      state.currentList.classList.remove('animation');

      if (action === 'remove') {
         item.remove();
      }
   }

   const animationListener = ({ item, list, action }) => {
      state.currentList = list;
      state.currentListItems = [...list.children];

      prepareAnimation(item, action);
      requestAnimationFrame(startAnimation);

      setTimeout(() => endAnimation(item, action), 300);
   }

   return {
      animationListener
   }
}