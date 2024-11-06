// file path
const p2fPlayersData = '../data/playersdata.json';
const p2fMatchData = '../data/matchdata.json';
const p2fPlayerGameData = '../data/playergamedata.json';

// Update on FIle Updtes
const PD_VERSION = '1.1';
const MD_VERSION = '1.1';
const PGD_VERSION = '1.1';

// global vars
let playersData = [];
let matchData = []; 
let playerGameData = []; 

async function loadFromFile(path) {
    // If data not in localStorage, fetch from API
    try {
        const response = await fetch(path);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data; 
      } catch (error) {
        console.error("Error loading data:", error);
      }
}

// Function to load data either from localStorage or by fetching from API
function loadData() {
    // Check if data is already in localStorage
    const tmpPlayersData = localStorage.getItem('playersData');
    const tmpPDversion = localStorage.getItem('pd_version');
    const tmpMatchData = localStorage.getItem('matchData');
    const tmpMDversion = localStorage.getItem('md_version');
    const tmpPlayerGameData = localStorage.getItem('playerGameData');
    const tmpPGDversion = localStorage.getItem('pgd_version');

    if (tmpPlayersData && tmpPlayersData != 'undefined' && tmpPlayersData != '{}' && PD_VERSION == tmpPDversion) {
        playersData = JSON.parse(tmpPlayersData);
    } else {
        loadFromFile(p2fPlayersData).then(data =>{
           // Store data in localStorage and in global variable
            localStorage.setItem('playersData', JSON.stringify(data));
            localStorage.setItem('pd_version', PD_VERSION);
            playersData = data;
        });
    }

    if (tmpMatchData && tmpMatchData != 'undefined' && tmpMatchData != '{}' && MD_VERSION == tmpMDversion) {
        matchData = JSON.parse(tmpMatchData);
    } else {
        loadFromFile(p2fMatchData).then(data =>{
            // Store data in localStorage and in global variable
            localStorage.setItem('matchData', JSON.stringify(data));
            localStorage.setItem('md_version', MD_VERSION);
            matchData = data;
        });
    }

    if (tmpPlayerGameData && tmpPlayerGameData != 'undefined' && tmpPlayerGameData != '{}' && PGD_VERSION == tmpPGDversion) {
        playerGameData = JSON.parse(tmpPlayerGameData);
    } else {
        loadFromFile(p2fPlayerGameData).then(data =>{
            // Store data in localStorage and in global variable
            localStorage.setItem('playerGameData', JSON.stringify(data));
            localStorage.setItem('pgd_version', PGD_VERSION);
            playerGameData = data;
        });
    }
}

// Load data immediately when the script is loaded
loadData();


// CORE FUNCTIONS acting as endpoints for the API calls
// COMMON FUNCTIONS
function Common_Seasons() {
    const seasonMatchMap = {};
    matchData.forEach(match => {
        const { season, match_no } = match;
        if (!seasonMatchMap[season]) {
            seasonMatchMap[season] = match_no; 
        } else {
            seasonMatchMap[season] = Math.max(seasonMatchMap[season], match_no);
        }
    });
    const sortedSeasons = Object.entries(seasonMatchMap)
        .sort(([, a], [, b]) => b - a) 
        .map(([season]) => season); 

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sortedSeasons),
    });
}

function Common_Day(selectedSeason) {
    const filteredDays = matchData
        .filter(item => !selectedSeason || item.season === selectedSeason)
        .map(item => item.day); 

    const distinctDays = [...new Set(filteredDays)];

    const sortedDays = distinctDays.sort((a, b) => {
        const maxMatchNoA = Math.max(...matchData.filter(item => item.day === a).map(item => item.match_no));
        const maxMatchNoB = Math.max(...matchData.filter(item => item.day === b).map(item => item.match_no));
        return maxMatchNoB - maxMatchNoA; 
    });

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sortedDays),
    });
}

function Common_Matches(selectedSeason, selectedDay) {
    const filteredMatches = matchData.filter(item => {
        const seasonMatch = !selectedSeason || item.season === selectedSeason;
        const dayMatch = !selectedDay || item.day === selectedDay;
        return seasonMatch && dayMatch;
    });

    const sortedMatches = filteredMatches.sort((a, b) => b.match_no - a.match_no);

    const matches = sortedMatches.map(match => ({
        match_id: match.match_id,
        match_no: match.match_no,
    }));

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(matches),
    });
}

// LeaderBoard
function Leaderboard_Refresh(season, day, match_no) {
    // First, filter the match data based on the season and day
    const filteredMatches = matchData.filter(match => {
        const seasonMatches = !season || match.season == season;
        const dayMatches = !day || match.day == day;
        const matchNoMatches = !match_no || match.match_no == match_no;
        return seasonMatches && dayMatches && matchNoMatches;
    }).map(match => match.match_no); // Get only the matching match numbers

    const leaderboard = playersData.map(player => {
        const gameData = playerGameData.filter(data => data.player_no === player.player_no);

        // Filter game data based on the filtered match numbers
        const relevantGameData = gameData.filter(data => filteredMatches.includes(data.match_no));

        const totalFinishes = relevantGameData.reduce((sum, data) => sum + data.finishes, 0);
        const totalAssists = relevantGameData.reduce((sum, data) => sum + data.assists, 0);
        const totalRevives = relevantGameData.reduce((sum, data) => sum + data.revives, 0);

        if (relevantGameData.length > 0) {
            return {
                player_no: player.player_no,
                player_id: player.player_id,
                player_in_game_name: player.player_in_game_name,
                total_finishes: totalFinishes,
                total_assists: totalAssists,
                total_revives: totalRevives,
                match_no: relevantGameData.map(data => data.match_no)
            };
        }
    });

    const filteredLeaderboard = leaderboard.filter(player => player !== undefined);

    // Sort by total finishes in descending order and limit to 500
    const sortedLeaderboard = filteredLeaderboard.sort((a, b) => {
        if (b.total_finishes !== a.total_finishes) {
            return b.total_finishes - a.total_finishes;
        }
        if (b.total_assists !== a.total_assists) {
            return b.total_assists - a.total_assists;
        }
        return b.total_revives - a.total_revives;
    }).slice(0, 500);

    sortedLeaderboard.forEach((player, index) => {
        player.rank = index + 1;
    });

    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(sortedLeaderboard),
    });
}

function MatchData_Refresh(season, day, match_no) {
    const filteredMatches = matchData.filter(match => {
        const seasonMatches = !season || match.season == season;
        const dayMatches = !day || match.day == day;
        const matchNoMatches = !match_no || match.match_no == match_no;
        return seasonMatches && dayMatches && matchNoMatches;
    });
    
    // Get the match numbers from the filtered results
    const matchNumbers = filteredMatches.map(match => match.match_no);
    
    // Now, you can proceed to filter player game data based on these match numbers
    const finalData = playerGameData.filter(data => matchNumbers.includes(data.match_no))
        .map(data => {
            const player = playersData.find(p => p.player_no === data.player_no);
            return {
                match_no: data.match_no,
                season: filteredMatches.find(m => m.match_no === data.match_no)?.season,
                day: filteredMatches.find(m => m.match_no === data.match_no)?.day,
                match_id: filteredMatches.find(m => m.match_no === data.match_no)?.match_id,
                player_no: player.player_no,
                player_id: player.player_id,
                player_in_game_name: player.player_in_game_name,
                finishes: data.finishes,
                assists: data.assists,
                revives: data.revives
            };
        });
    
    // Filter out players with total sums of finishes, assists, and revives equal to zero
    const result = finalData.filter(player =>
        player.finishes > 0 || player.assists > 0 || player.revives > 0
    );
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(result),
    });
}

function PlayerData_Refresh() {
    return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(playersData),
    });
}