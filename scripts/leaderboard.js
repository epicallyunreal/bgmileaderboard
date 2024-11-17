// Fetch leaderboard data on page load
window.onload = function() {
    fetchSeasons();
    showLoadingAndRefresh();
};

function showLoadingAndRefresh() {
    if (playersData && playersData != 'undefined' && playersData != '{}') {
        RefreshLeaderboard();
    }
    else {
        // Show the loading spinner
        const loadingSpinner = document.getElementById("loadingSpinner");

        loadingSpinner.style.display = "block";
        setTimeout(() => {
            loadingSpinner.style.display = "none";
            RefreshLeaderboard();
        }, 3000);
    }
}

function RefreshLeaderboard() {
    const selectedSeason = document.getElementById('season');
    const selectedDay = document.getElementById('day');
    const selectedMatch = document.getElementById('match');
    loadLeaderboard(selectedSeason.value, selectedDay.value, selectedMatch.value);
    const searchText = document.getElementById('search_txt').value.toLowerCase();
    if (searchText != '') {
        searchLeaderboard();
    }

    if (selectedSeason.value != "") selectedSeason.classList.add("dropdown-filter");
        else selectedSeason.classList.remove("dropdown-filter");
    if (selectedDay.value != "") selectedDay.classList.add("dropdown-filter");
        else selectedDay.classList.remove("dropdown-filter");
    if (selectedMatch.value != "") selectedMatch.classList.add("dropdown-filter");
        else selectedMatch.classList.remove("dropdown-filter");
    
    
    partyAnimation();
    launchConfetti();
}

function loadLeaderboard(season, day = '', matchNo = '') {
    Leaderboard_Refresh(season, day, matchNo)
    .then(response => response.json())
    .then(leaderboard => {
        MainTableData = leaderboard;
        filteredData = MainTableData;
        displayTableData();
        showToast("LeaderBoard Refreshed!!");
    });
}

function searchLeaderboard() {
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
            player.player_id.toString().includes(searchText) // Assuming player_no is a number
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
    const tbody = document.getElementById('leaderboardTable');
    tbody.innerHTML = ''; // Clear existing rows

    // Use filteredData for search results or MainTableData for full leaderboard
    const dataToDisplay = filteredData.length > 0 ? filteredData : MainTableData;

    // Calculate start and end indices for slicing the data
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedData = dataToDisplay.slice(start, end); // Get the current page's data

    let rank = 1;
    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${getRank(item.rank)}</td>
            <td>${item.player_no}</td>
            <td>${item.player_id}</td>
            <td>${item.player_in_game_name}</td>
            <td>${item.total_finishes}</td>
            <td>${item.total_assists}</td>
            <td>${item.total_revives}</td>
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

function getRank(rank) {
    let icon;

    switch (true) {
        case rank === 1:
            icon = '<i class="fas fa-medal" style="color: gold; font-size: 24px;"></i>'; // Gold Medal
            break;
        case rank === 2:
            icon = '<i class="fas fa-medal" style="color: silver; font-size: 22px;"></i>'; // Silver Medal
            break;
        case rank === 3:
            icon = '<i class="fas fa-medal" style="color: #cd7f32; font-size: 20px;"></i>'; // Bronze Medal
            break;
        case rank >= 4 && rank <= 10:
            icon = '<i class="fas fa-star" style="color: orange; font-size: 18px;"></i>'; // Star for ranks 4-10
            break;
        case rank >= 11 && rank <= 30:
            icon = '<i class="fas fa-star-half-alt" style="color: yellow; font-size: 16px;"></i>'; // Half Star for ranks 11-30
            break;
        case rank >= 31 && rank <= 100:
            icon = '<i class="fas fa-thumbs-up" style="color: white; font-size: 16px;"></i>'; // Thumbs Up for ranks 31-100
            break;
        default:
            icon = '<i class="fas fa-user"></i>'; // Default icon for other ranks
            break;
    }

    return rank.toString() + " " + icon;
}