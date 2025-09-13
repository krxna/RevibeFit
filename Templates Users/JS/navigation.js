// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
  const profileToggle = document.getElementById('profileDropdownToggle');
  const profileMenu = document.getElementById('profileMenu');
  
  if (profileToggle && profileMenu) {
    profileToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      profileMenu.classList.toggle('show-menu');
    });
    
    // Close the menu when clicking outside
    document.addEventListener('click', function(e) {
      if (profileMenu.classList.contains('show-menu') && 
          !profileMenu.contains(e.target) && 
          !profileToggle.contains(e.target)) {
        profileMenu.classList.remove('show-menu');
      }
    });
    
    // Prevent menu from closing when clicking inside it
    profileMenu.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }
}); 