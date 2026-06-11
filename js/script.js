// Globální stav aplikace
let appState = {
    matches: [],
    users: [],
    currentUser: null,
    selectedMatch: null,
    selectedBet: null
};

// Inicializace aplikace
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    initializeApp();
});

// Načtení dat
async function loadData() {
    try {
        const response = await fetch('data/matches.json');
        const data = await response.json();
        appState.matches = data.matches;
        appState.users = data.users;
        
        // Nastavit prvního uživatele jako aktuální
        appState.currentUser = appState.users[0];
        
        // Načíst tipy z localStorage
        loadBetsFromStorage();
    } catch (error) {
        console.error('Chyba při načítání dat:', error);
    }
}

// Načtení tipů z localStorage
function loadBetsFromStorage() {
    const savedBets = localStorage.getItem('bets');
    if (savedBets) {
        try {
            const bets = JSON.parse(savedBets);
            appState.currentUser.bets = bets;
        } catch (error) {
            console.error('Chyba při načítání tipů:', error);
        }
    }
}

// Uložení tipů do localStorage
function saveBetsToStorage() {
    localStorage.setItem('bets', JSON.stringify(appState.currentUser.bets));
}

// Nastavení event listenerů
function setupEventListeners() {
    // Kliknutí na záložky
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchTab(e.target.getAttribute('data-tab'));
        });
    });

    // Filtrování
    document.getElementById('searchInput').addEventListener('input', filterMatches);
    document.getElementById('stageFilter').addEventListener('change', filterMatches);

    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('cancelBetBtn').addEventListener('click', closeModal);
    document.getElementById('saveBetBtn').addEventListener('click', saveBet);

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('bettingModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Inicializace aplikace
function initializeApp() {
    renderMatches();
    renderLeaderboard();
    renderMyBets();
}

// Přepínání záložek
function switchTab(tabName) {
    // Skrýt všechny záložky
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Deaktivovat všechny tlačítka
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Zobrazit vybranou záložku
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Aktualizovat obsah
    if (tabName === 'leaderboard') {
        renderLeaderboard();
    } else if (tabName === 'my-bets') {
        renderMyBets();
    }
}

// Vykreslení zápasů
function renderMatches() {
    const container = document.getElementById('matchesList');
    container.innerHTML = '';

    if (appState.matches.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚽</div><p>Žádné zápasy k dispozici</p></div>';
        return;
    }

    appState.matches.forEach(match => {
        const card = createMatchCard(match);
        container.appendChild(card);
    });
}

// Vytvoření karty zápasu
function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    // Zjistit, zda je zápas již zahájen
    const matchDate = new Date(match.date + 'T' + match.time);
    const isLocked = new Date() > matchDate;
    
    if (isLocked) {
        card.classList.add('locked');
    }

    let resultHTML = '';
    let myBetHTML = '';

    // Vykreslit výsledek
    if (match.result) {
        resultHTML = `
            <div class="match-result">
                <div class="result-score">${match.result.score1} - ${match.result.score2}</div>
                <div class="result-status">Skončeno</div>
            </div>
        `;
    }

    // Vykreslit můj tip
    const myBet = appState.currentUser.bets.find(b => b.matchId === match.id);
    if (myBet) {
        const points = calculatePoints(myBet, match);
        myBetHTML = `<div class="my-bet">Můj tip: ${myBet.score1} - ${myBet.score2} <span style="color: #10b981; font-weight: bold;">+${points}b</span></div>`;
    }

    card.innerHTML = `
        <div class="match-info">
            <div class="match-date">${formatDate(match.date)} ${match.time}</div>
            <div class="teams">
                <div class="team">
                    <div class="team-flag">${match.flag1}</div>
                    <div class="team-name">${match.team1}</div>
                </div>
                <div class="vs">VS</div>
                <div class="team">
                    <div class="team-flag">${match.flag2}</div>
                    <div class="team-name">${match.team2}</div>
                </div>
            </div>
            ${myBetHTML}
        </div>
        ${resultHTML}
        <div class="bet-action">
            ${!isLocked ? `<button class="btn btn-primary btn-sm">Tipovat</button>` : `<button class="btn btn-secondary btn-sm" disabled>Uzavřeno</button>`}
        </div>
    `;

    if (!isLocked) {
        card.querySelector('.btn-primary').addEventListener('click', () => {
            openBettingModal(match);
        });
    }

    return card;
}

// Formátování data
function formatDate(dateString) {
    const date = new Date(dateString);
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    const months = ['led', 'úno', 'bře', 'dub', 'kvě', 'červ', 'červ', 'srp', 'zář', 'říj', 'lis', 'pro'];
    
    return `${days[date.getDay()]} ${date.getDate()}. ${months[date.getMonth()]}`;
}

// Filtrování zápasů
function filterMatches() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const stage = document.getElementById('stageFilter').value;

    const filtered = appState.matches.filter(match => {
        const matchesSearch = match.team1.toLowerCase().includes(searchTerm) || 
                            match.team2.toLowerCase().includes(searchTerm);
        const matchesStage = !stage || match.stage === stage;
        return matchesSearch && matchesStage;
    });

    const container = document.getElementById('matchesList');
    container.innerHTML = '';

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Žádné zápasy nebyl nalezeny</p></div>';
        return;
    }

    filtered.forEach(match => {
        container.appendChild(createMatchCard(match));
    });
}

// Otevření modálního okna pro tipování
function openBettingModal(match) {
    appState.selectedMatch = match;

    // Naplnit modal
    document.getElementById('modalTitle').textContent = `${match.team1} vs ${match.team2}`;
    document.getElementById('team1Info').innerHTML = `<div class="flag">${match.flag1}</div><div class="name">${match.team1}</div>`;
    document.getElementById('team2Info').innerHTML = `<div class="flag">${match.flag2}</div><div class="name">${match.team2}</div>`;

    // Načíst existující tip, pokud existuje
    const existingBet = appState.currentUser.bets.find(b => b.matchId === match.id);
    if (existingBet) {
        document.getElementById('score1').value = existingBet.score1;
        document.getElementById('score2').value = existingBet.score2;
    } else {
        document.getElementById('score1').value = 0;
        document.getElementById('score2').value = 0;
    }

    // Zobrazit modal
    document.getElementById('bettingModal').classList.add('active');
}

// Zavření modálního okna
function closeModal() {
    document.getElementById('bettingModal').classList.remove('active');
    appState.selectedMatch = null;
}

// Uložení tipu
function saveBet() {
    if (!appState.selectedMatch) return;

    const score1 = parseInt(document.getElementById('score1').value);
    const score2 = parseInt(document.getElementById('score2').value);

    // Validace
    if (isNaN(score1) || isNaN(score2)) {
        alert('Prosím, zadejte platné skóre');
        return;
    }

    // Hledat existující tip
    const existingBetIndex = appState.currentUser.bets.findIndex(b => b.matchId === appState.selectedMatch.id);

    const bet = {
        matchId: appState.selectedMatch.id,
        team1: appState.selectedMatch.team1,
        team2: appState.selectedMatch.team2,
        score1: score1,
        score2: score2,
        timestamp: new Date().toISOString()
    };

    if (existingBetIndex > -1) {
        // Aktualizovat existující tip
        appState.currentUser.bets[existingBetIndex] = bet;
    } else {
        // Přidat nový tip
        appState.currentUser.bets.push(bet);
    }

    // Uložit do localStorage
    saveBetsToStorage();

    // Aktualizovat zobrazení
    renderMatches();
    renderMyBets();
    
    closeModal();
    alert('Tip byl úspěšně uložen!');
}

// Funkce pro výpočet bodů
function calculatePoints(bet, match) {
    // Pokud zápas ještě neskončil, vrátit 0
    if (!match.result) {
        return 0;
    }

    const betScore1 = bet.score1;
    const betScore2 = bet.score2;
    const actualScore1 = match.result.score1;
    const actualScore2 = match.result.score2;

    // Přesný výsledek = 10 bodů
    if (betScore1 === actualScore1 && betScore2 === actualScore2) {
        return 10;
    }

    // Nejméně jeden tým má správný počet gólů = 5 bodů
    if (betScore1 === actualScore1 || betScore2 === actualScore2) {
        return 5;
    }

    // Správný vítěz = 3 body
    const betWinner = betScore1 > betScore2 ? 1 : (betScore1 < betScore2 ? -1 : 0);
    const actualWinner = actualScore1 > actualScore2 ? 1 : (actualScore1 < actualScore2 ? -1 : 0);
    
    if (betWinner === actualWinner) {
        return 3;
    }

    return 0;
}

// Vykreslení leaderboardu
function renderLeaderboard() {
    const container = document.getElementById('leaderboardTable');

    // Přepočítat body všech uživatelů
    appState.users.forEach(user => {
        let totalPoints = 0;
        if (user.bets) {
            user.bets.forEach(bet => {
                const match = appState.matches.find(m => m.id === bet.matchId);
                if (match && match.result) {
                    totalPoints += calculatePoints(bet, match);
                }
            });
        }
        user.points = totalPoints;
    });

    // Seřadit uživatele podle bodů
    const sortedUsers = [...appState.users].sort((a, b) => {
        return (b.points || 0) - (a.points || 0);
    });

    let html = `
        <table class="leaderboard-table">
            <thead>
                <tr>
                    <th>Pořadí</th>
                    <th>Jméno</th>
                    <th>Správné tipy</th>
                    <th>Body</th>
                </tr>
            </thead>
            <tbody>
    `;

    sortedUsers.forEach((user, index) => {
        let rankClass = '';
        if (index === 0) rankClass = 'first';
        if (index === 1) rankClass = 'second';
        if (index === 2) rankClass = 'third';

        let correctBets = 0;
        if (user.bets) {
            user.bets.forEach(bet => {
                const match = appState.matches.find(m => m.id === bet.matchId);
                if (match && match.result && calculatePoints(bet, match) > 0) {
                    correctBets++;
                }
            });
        }
        
        const points = user.points || 0;

        html += `
            <tr>
                <td><span class="rank ${rankClass}">${index + 1}</span></td>
                <td>${user.name}</td>
                <td>${correctBets}</td>
                <td>${points}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}

// Vykreslení mých tipů
function renderMyBets() {
    const container = document.getElementById('myBetsList');

    if (!appState.currentUser.bets || appState.currentUser.bets.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><p>Ještě nemáš žádné tipy</p></div>';
        return;
    }

    let html = '';

    appState.currentUser.bets.forEach(bet => {
        const match = appState.matches.find(m => m.id === bet.matchId);
        if (!match) return;

        const points = calculatePoints(bet, match);

        html += `
            <div class="bet-item">
                <div class="bet-content">
                    <div class="bet-teams">${bet.team1} vs ${bet.team2}</div>
                    <div class="bet-prediction">Tvůj tip: <strong>${bet.score1} - ${bet.score2}</strong></div>
                </div>
                <div class="bet-points">+${points}</div>
                <div class="bet-action">
                    <button class="btn btn-edit btn-sm" onclick="editBet(${bet.matchId})">Upravit</button>
                    <button class="btn btn-delete btn-sm" onclick="deleteBet(${bet.matchId})">Smazat</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// Úprava tipu
function editBet(matchId) {
    const match = appState.matches.find(m => m.id === matchId);
    if (match) {
        openBettingModal(match);
    }
}

// Smazání tipu
function deleteBet(matchId) {
    if (confirm('Opravdu chceš smazat tento tip?')) {
        appState.currentUser.bets = appState.currentUser.bets.filter(b => b.matchId !== matchId);
        saveBetsToStorage();
        renderMatches();
        renderMyBets();
    }
}
