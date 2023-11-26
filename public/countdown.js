// countdown.js

window.addEventListener('DOMContentLoaded', function() {
    var countdownElement = document.getElementById('countdown-timer');
    var countdownDate = new Date(countdownElement.getAttribute('data-countdown')).getTime();
  
    var x = setInterval(function() {
      var now = new Date().getTime();
      var distance = countdownDate - now;
  
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  
      countdownElement.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
  
      if (distance < 0) {
        clearInterval(x);
        countdownElement.innerHTML = "Expired";
      }
    }, 1000);
  });
  