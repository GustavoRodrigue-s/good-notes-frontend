const btnHamburguerInit = () => {
   const btnHamburguer = document.querySelector('.button-hamburguer');
   let show = false;

   const toggleMenuHamburguer = e => {
      if (e.type === 'touchstart') e.preventDefault();
      
      show = !show;

      show
         ? btnHamburguer.setAttribute('aria-label', 'Fechar Menu')
         : btnHamburguer.setAttribute('aria-label', 'Abrir Menu');

      btnHamburguer.setAttribute('aria-expanded', show);

      btnHamburguer.classList.toggle('active');
   }

   btnHamburguer.addEventListener('click', toggleMenuHamburguer);
   btnHamburguer.addEventListener('touchstart', toggleMenuHamburguer);
}

export default btnHamburguerInit;