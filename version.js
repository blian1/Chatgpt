document.addEventListener('DOMContentLoaded', function() {
    var versionButton = document.getElementById('versionButton');
    var dropdownMenu = document.getElementById('dropdownMenu');

    versionButton.addEventListener('mouseenter', function() {
      dropdownMenu.style.display = 'block';
    });

    versionButton.addEventListener('mouseleave', function() {
      dropdownMenu.style.display = 'none';
    });

    var updateDropdownMenu = function(selectedVersion) {
      var allVersions = ["GPT3.5", "GPT4.0", "GPT5.0"]; 
      while (dropdownMenu.firstChild) {
        dropdownMenu.removeChild(dropdownMenu.firstChild);
      }
      allVersions.forEach(function(version) {
        if (version !== selectedVersion) {
          var p = document.createElement('p');
          p.textContent = version;
          p.className = 'dropdownItem';
          p.addEventListener('click', function() {
            versionButton.textContent = this.textContent;
            updateDropdownMenu(this.textContent);
          });
          dropdownMenu.appendChild(p);
        }
      });
    }

    document.querySelectorAll('.dropdownItem').forEach(function(item) {
      item.addEventListener('click', function() {
        versionButton.textContent = this.textContent;
        updateDropdownMenu(this.textContent);
      });
    });
});