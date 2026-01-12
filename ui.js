// Star toggle logic
document.addEventListener('DOMContentLoaded', function() {
  const starBtn = document.getElementById('bookmark-star');
  if (starBtn) {
    // Prevent all pointer and focus events from propagating and triggering parent handlers
    ['mousedown','mouseup','click','focus'].forEach(evt => {
      starBtn.addEventListener(evt, function(event) {
        event.stopImmediatePropagation();
        event.preventDefault();
        if(evt === 'click') {
          const isStarred = starBtn.classList.toggle('starred');
          starBtn.setAttribute('aria-pressed', isStarred);
          starBtn.querySelector('.star-outline').style.display = isStarred ? 'none' : 'inline';
          starBtn.querySelector('.star-filled').style.display = isStarred ? 'inline' : 'none';
        }
      });
    });
  }

  // Back to top button
  const backToTopButton = document.getElementById('back-to-top');

  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTopButton.style.display = 'block';
      } else {
        backToTopButton.style.display = 'none';
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
});