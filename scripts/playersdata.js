// Fetch leaderboard data on page load
window.onload = function() {
    fetchSeasons();
    RefreshPlayerData();
};

function RefreshPlayerData() {
    loadPlayerData();
    const searchText = document.getElementById('search_txt').value.toLowerCase();
    if (searchText != '') {
        searchPlayerData();
    } 
}

function loadPlayerData() {
    PlayerData_Refresh()
        .then(response => response.json())
        .then(data => {
            MainTableData = data;
            filteredData = MainTableData;
            displayTableData();
            displayPagination();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

//PlayersData
function searchPlayerData() {
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
        displayPagination();
    }
}

function displayTableData() {
    const tbody = document.getElementById('playersDataTable');
    tbody.innerHTML = ''; // Clear existing rows

    // Use filteredData for search results or MainTableData for full leaderboard
    const dataToDisplay = filteredData.length > 0 ? filteredData : MainTableData;

    // Calculate start and end indices for slicing the data
    const start = (currentPage - 1) * resultsPerPage;
    const end = start + resultsPerPage;
    const paginatedData = dataToDisplay.slice(start, end); // Get the current page's data

    paginatedData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.player_no}</td>
            <td>${item.player_id}</td>
            <td>${maskName(item.real_name)}</td>
            <td>${item.player_in_game_name}</td>
            <td>${maskName(item.youtube_channel)}</td>
            <td>${maskName(item.insta_name)}</td>
            <td>${maskName(item.discord_name)}</td>
        `;
        tbody.appendChild(row);
    });

    if (paginatedData.length === 0) {
        alert('No players found matching your search criteria.');
    }
}

function maskName(name) {
    // Check if the name is long enough to mask
    if (name.length <= 6) {
        return name; // Return the original name if it's 6 characters or less
    }

    const firstPart = name.slice(0, 3); // Get the first three characters
    const lastPart = name.slice(-2); // Get the last three characters

    return `${firstPart}####${lastPart}`; // Combine them with four dots
}
