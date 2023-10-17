document.addEventListener("DOMContentLoaded", function() {
    const modeSwitchButton = document.getElementById('modeSwitchButton');
  
    modeSwitchButton.addEventListener('click', function () {
      document.body.classList.toggle('dark');
      let hrs = document.getElementsByTagName('hr');
      if (document.body.classList.contains('dark')) {
        localStorage.setItem('Mode','dark')
        modeSwitchButton.innerHTML = '<img src="img/Moon.png" alt="Moon Icon" style="height:23px; width:23px;filter: brightness(250%);position: relative;vertical-align:middle;margin-right: 0px;margin-bottom: 3px;"> Light Mode';
        checkDarkMode();
      } else {
        localStorage.setItem('Mode','light')
        modeSwitchButton.innerHTML = '<img src="img/Sun.png" alt="Sun Icon" style="height:23px; width:23px;filter: brightness(250%);position: relative;vertical-align:middle;margin-right: 0px;margin-bottom: 3px;"> Night Mode'; 
        checkDarkMode();
      }
    })
  });



  function checkDarkMode() {
    let hrs = document.getElementsByTagName('hr');
    if (document.body.classList.contains('dark')) {
      for (let i = 0; i < hrs.length; i++) {
        if (!hrs[i].classList.contains('persistent')) {
          hrs[i].style.display = 'none';
        }
      }
    } else {
      for (let i = 0; i < hrs.length; i++) {
        hrs[i].style.display = 'block';
      }
    }
  }

  window.checkDarkMode = checkDarkMode;
  