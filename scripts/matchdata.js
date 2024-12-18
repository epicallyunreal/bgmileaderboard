// Fetch leaderboard data on page load
window.onload = function() {
    fetchSeasons();
    RefreshMatchData();
};

function RefreshMatchData() {
    const selectedSeason = document.getElementById('season');
    const selectedDay = document.getElementById('day');
    const selectedMatch = document.getElementById('match');
    loadMatchData(selectedSeason.value, selectedDay.value, selectedMatch.value);
    const searchText = document.getElementById('search_txt').value.toLowerCase();
    if (searchText != '') {
        searchMatchData();
    }

    if (selectedSeason.value != "") selectedSeason.classList.add("dropdown-filter");
        else selectedSeason.classList.remove("dropdown-filter");
    if (selectedDay.value != "") selectedDay.classList.add("dropdown-filter");
        else selectedDay.classList.remove("dropdown-filter");
    if (selectedMatch.value != "") selectedMatch.classList.add("dropdown-filter");
        else selectedMatch.classList.remove("dropdown-filter");
}

function loadMatchData(season, day = '', matchNo = '') {
    MatchData_Refresh(season, day, matchNo)
        .then(response => response.json())
        .then(matchdata => {
            MainTableData = matchdata;
            filteredData = MainTableData;
            displayTableData();
            showToast("Match Data Refreshed!!");
        });
}

function searchMatchData() {
    const searchText = document.getElementById('search_txt').value.toLowerCase(); // Get the search term directly from the input field

    // if (searchTerm.trim() === '') {
    //     alert('Please enter a player ID or in-game name to search.'); // Alert for empty search
    //     return; // Exit the function if the search input is empty
    // }

    if (searchText === '') {
        // If search box is empty, reset to full data
        filteredData = MainTableData;
    } else {
        // Filter MainTableData based on search input
        filteredData = MainTableData.filter(player =>
            player.player_in_game_name.toLowerCase().includes(searchText) ||
            player.player_id.toString().includes(searchText) // Assuming player_id is a number
        );
    }
    // Check if filteredData is empty
    if (filteredData.length === 0) {
        alert('No players found matching your search criteria.'); // Alert if no data is present
    } else {
        currentPage = 1;
        displayTableData(); // Display the filtered leaderboard
    }
}

function displayTableData() {
    const tbody = document.getElementById("allMatchDataTable");
    tbody.innerHTML = ""; // Clear existing rows 

    // Use filteredData for search results or MainTableData for full leaderboard
    const dataToDisplay = filteredData.length > 0 ? filteredData : MainTableData;

    // Calculate start and end indices for slicing the data
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedData = dataToDisplay.slice(start, end); // Get the current page's data

    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${showRestrictedStatus(item.match_no)}</td>
            <td>${item.season}</td>
            <td>${item.day}</td>
            <td>${item.match_id}</td>
            <td>${showBannedStatus(item.player_no)}</td>
            <td>${item.player_id}</td>
            <td>${item.player_in_game_name}</td>
            <td>${item.finishes}</td>
            <td>${item.assists}</td>
            <td>${item.revives}</td>
        `;
        if(item.player_id == '') {
            row.classList.add("unregistered");
        }
        tbody.appendChild(row);
    });

    displayPagination();

    if (paginatedData.length === 0) {
        alert('No players found matching your search criteria.');
    }
}