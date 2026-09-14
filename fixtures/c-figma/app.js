document.querySelector('form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('[role="status"]').textContent = `Subscribed: ${document.querySelector('#email').value}`;
});
