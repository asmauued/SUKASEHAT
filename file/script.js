
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.scroll-anim');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show'); 
      } else {
        entry.target.classList.remove('show');
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => observer.observe(el));
});
