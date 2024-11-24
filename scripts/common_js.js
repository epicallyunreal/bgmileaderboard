MainTableData = [];
filteredData = [];
let currentPage = 1; // Current page number
let resultsPerPage = 10; // Default results per page

function fetchSeasons() {
    Common_Seasons()
        .then(response => response.json())
        .then(seasons => {
            const seasonSelect = document.getElementById('season');
            seasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = season;
                seasonSelect.appendChild(option);
            });
        });
    fetchDays('');
}

const seasonElement = document.getElementById('season');
if (seasonElement) {
    seasonElement.addEventListener('change', function() {
        const selectedSeason = this.value;
        fetchDays(selectedSeason);
        fetchMatches(selectedSeason, '');
    });
}

function fetchDays(season) {
    Common_Day(season)
        .then(response => response.json())
        .then(days => {
            const daySelect = document.getElementById('day');
            daySelect.innerHTML = '<option value="">Select Day</option>'; // Reset options
            days.forEach(day => {
                const option = document.createElement('option');
                option.value = day;
                option.textContent = `Day ${day}`;
                daySelect.appendChild(option);
            });
        });
    fetchMatches(season, '');
}

const dayElement = document.getElementById('day');
if (dayElement) {
    day.addEventListener('change', function() {
        const selectedDay = this.value;
        const selectedSeason = document.getElementById('season').value;
        fetchMatches(selectedSeason, selectedDay);
    });
}

function fetchMatches(season, day) {
    Common_Matches(season, day)
        .then(response => response.json())
        .then(matches => {
            const matchSelect = document.getElementById('match');
            matchSelect.innerHTML = '<option value="">Select Match</option>'; // Reset options
            matches.forEach(match => {
                const option = document.createElement('option');
                option.value = match.match_no;
                option.textContent = `(${match.match_no}) ${match.match_id}`;
                matchSelect.appendChild(option);
            });
        });
}

// document.getElementById('match').addEventListener('change', function() {
//     const selectedSeason = document.getElementById('season').value;
//     const selectedDay = document.getElementById('day').value;
// });


function displayPagination() {
    const paginationContainer = document.getElementById('paginationContainer');
    paginationContainer.innerHTML = ''; // Clear previous pagination

    // Determine which data to use for pagination
    const dataToDisplay = filteredData.length > 0 ? filteredData : MainTableData;
    const totalPages = Math.ceil(dataToDisplay.length / resultsPerPage);

    // Create First Page button
    const firstPage = document.createElement('button');
    firstPage.textContent = '||<< First';
    firstPage.onclick = () => goToPage(1);
    firstPage.disabled = currentPage === 1; // Disable if on the first page
    paginationContainer.appendChild(firstPage);

    // Create Previous button
    const prevButton = document.createElement('button');
    prevButton.textContent = '<< Prev';
    prevButton.onclick = () => goToPage(currentPage - 1);
    prevButton.disabled = currentPage === 1; // Disable if on the first page
    paginationContainer.appendChild(prevButton);
    
    // for (let i = 1; i <= totalPages; i++) {
    //     const pageButton = document.createElement('button');
    //     pageButton.textContent = i;
    //     pageButton.onclick = () => goToPage(i); // Set up button click to go to the page
    //     paginationContainer.appendChild(pageButton);
    // }

    for (let i=1; i<=totalPages; i++) {
        if (i < currentPage) {
            if(i==currentPage-3){
                paginationContainer.appendChild(createPaginationButton(i, "...", ''));
            }
            if(i==currentPage-2 || i==currentPage-1){
                paginationContainer.appendChild(createPaginationButton(i, i, ''));
            }
        }
        else if (i > currentPage) {
            if(i==currentPage+3){
                paginationContainer.appendChild(createPaginationButton(i, "...", ''));
            }
            if(i==currentPage+2 || i==currentPage+1){
                paginationContainer.appendChild(createPaginationButton(i, i, ''));
            }
        }
        else {
            paginationContainer.appendChild(createPaginationButton(i, i, 'active'));
        }
    }

    // Create Next button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next >>';
    nextButton.onclick = () => goToPage(currentPage + 1);
    nextButton.disabled = currentPage === totalPages; // Disable if on the last page
    paginationContainer.appendChild(nextButton);

    // Create lastPage button
    const lastPage = document.createElement('button');
    lastPage.textContent = 'Last >>||';
    lastPage.onclick = () => goToPage(totalPages);
    lastPage.disabled = currentPage === totalPages; // Disable if on the last page
    paginationContainer.appendChild(lastPage);
}
function createPaginationButton(pageNo, txt, cssClass) {
    const pageButton = document.createElement('button');
    pageButton.textContent = txt;
    if (cssClass !='') {
    pageButton.classList.add(cssClass);
    }
    pageButton.onclick = () => goToPage(pageNo);
    return pageButton;
}

function goToPage(page) {
    currentPage = page; // Update current page
    displayTableData(); // Refetch the main Table for the current page
}

// Function to handle results per page change
function setResultsPerPage() {
    resultsPerPage = parseInt(document.getElementById('resultsPerPage').value); // Get user-selected page size
    currentPage = 1; // Reset to the first page
    displayTableData(); // Refetch data with new page size
}

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    
    // Hide the toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showRestrictedStatus(match) {
    var returnStr = match;
    if (RestrictedMatches.includes(match)) {
        returnStr += " &#128680";
    }
    return returnStr;
}

function showBannedStatus(player) {
    var returnStr = player;
    if (RestrictedPlayers.includes(player)) {
        returnStr += " &#128683;";
    }
    return returnStr;
}

// // Notification area
// function populateNotifications() {
//     const container = document.getElementById("notifications-container");
//     container.innerHTML = ""; // Clear existing notifications
//     notificationsData.forEach((notification) => {
//       const notificationElem = document.createElement("div");
//       notificationElem.classList.add("notification");
//       notificationElem.innerHTML = `
//         <div class="date">${notification.date}</div>
//         <div class="header">${notification.header}</div>
//         <div class="body">${notification.body}</div>
//       `;
//       container.appendChild(notificationElem);
//     });
//   }
  
//   // Open and close modal functionality
//   const notificationsBtn = document.getElementById("notifications-btn");
//   const notificationsModal = document.getElementById("notifications-modal");
//   const closeModal = document.getElementById("close-modal");
  
//   notificationsBtn.addEventListener("click", () => {
//     fetchNotifications(); // Populate notifications when modal opens
//     notificationsModal.classList.add("show");  // Add 'show' class to make the modal visible
//     notificationsModal.style.display = "block";
//   });
  
//   closeModal.addEventListener("click", () => {
//     notificationsModal.classList.remove("show");  // Remove 'show' class to hide modal
//     notificationsModal.style.display = "none";
//   });
  
//   window.addEventListener("click", (event) => {
//     if (event.target === notificationsModal) {
//       notificationsModal.classList.remove("show");  // Remove 'show' class to hide modal
//       notificationsModal.style.display = "none";
//     }
//   });