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
    checkAuthStatus();
});

// Načtení dat
async function loadData() {
    try {
        const response = await fetch('data/matches.json');
        const data = await response.json();
        appState.matches = data.matches;
        appState.users = data.users;
    } catch (error) {
        console.error('Chyba při načítání dat:', error);
    }
}

// Kontrola přihlášení
function checkAuthStatus() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (loggedInUser) {
        appState.currentUser = JSON.parse(loggedInUser);
        showAppScreen();
    } else {
        showLoginScreen();
    }
}

// Přepnutí na přihlašovací obrazovku
function showLoginScreen() {
    document.getElementById('loginScreen').classList.add('active');
    document.getElementById('appScreen').classList.remove('active');
}

// Přepnutí na aplikační obrazovku
function showAppScreen() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    document.getElementById('currentUserName').textContent = appState.currentUser.name;
    loadUserBetsFromStorage();
    initializeApp();
}

// Nastavení event listenerů
function setupEventListeners() {
    // Login/Signup tabs
    document.querySelectorAll('.login-tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            switchLoginTab(e.target.getAttribute('data-login-tab'));
        });
    });

    // Forms
    document.getElementById('signinForm').addEventListener('submit', handleSignIn);
    document.getElementById('signupForm').addEventListener('submit', handleSignUp);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

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

// Přepínání přihlašovacích záložek
function switchLoginTab(tabName) {
    document.querySelectorAll('.login-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.login-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-login-tab="${tabName}"]`).classList.add('active');
}

// Přihlášení
function handleSignIn(e) {
    e.preventDefault();
    const email = document.getElementById('signinEmail').value.toLowerCase();
    const password = document.getElementById('signinPassword').value;
    const errorDiv = document.getElementById('signinError');

    // Hledat u��ivatele
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        appState.currentUser = user;
        showAppScreen();
        document.getElementById('signinForm').reset();
    } else {
        errorDiv.textContent = 'Nesprávný email nebo heslo!';
        errorDiv.classList.add('show');
    }
}

// Registrace
function handleSignUp(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value.toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const password2 = document.getElementById('signupPassword2').value;
    const errorDiv = document.getElementById('signupError');

    // Validace
    if (password !== password2) {
        errorDiv.textContent = 'Hesla se neshodují!';
        errorDiv.classList.add('show');
        return;
    }

    if (password.length < 4) {
        errorDiv.textContent = 'Heslo musí mít alespoň 4 znaky!';
        errorDiv.classList.add('show');
        return;
    }

    // Kontrola, zda uživatel existuje
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    if (users.find(u => u.email === email)) {
        errorDiv.textContent = 'Tento email je již registrován!';
        errorDiv.classList.add('show');
        return;
    }

    // Vytvoření nového uživatele
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        bets: [],
        points: 0
    };

    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    appState.currentUser = newUser;
    showAppScreen();
    document.getElementById('signupForm').reset();
}

// Odhlášení
function handleLogout() {
    localStorage.removeItem('loggedInUser');
    appState.currentUser = null;
    showLoginScreen();
    document.getElementById('signinEmail').value = '';
    document.getElementById('signinPassword').value = '';
}

// Načtení tipů uživatele
function loadUserBetsFromStorage() {
    const userBets = localStorage.getItem(`bets_${appState.currentUser.id}`);
    if (userBets) {
        try {
            appState.currentUser.bets = JSON.parse(userBets);
        } catch (error) {
            console.error('Chyba při načítání tipů:', error);
            appState.currentUser.bets = [];
        }
    } else {
        appState.currentUser.bets = [];
    }
}

// Uložení tipů uživatele
function saveBetsToStorage() {
    localStorage.setItem(`bets_${appState.currentUser.id}`, JSON.stringify(appState.currentUser.bets));
}

// Inicializace aplikace
function initializeApp() {
    renderMatches();
    renderLeaderboard();
    renderMyBets();
}

// Přepínání záložek
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

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
    
    const matchDate = new Date(match.date + 'T' + match.time);
    const isLocked = new Date() > matchDate;
    
    if (isLocked) {
        card.classList.add('locked');
    }

    let resultHTML = '';
    let myBetHTML = '';

    if (match.result) {
        resultHTML = `
            <div class="match-result">
                <div class="result-score">${match.result.score1} - ${match.result.score2}</div>
                <div class="result-status">Skončeno</div>
            </div>
        `;
    }

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
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🔍</div><p>Žádné zápasy nebyly nalezeny</p></div>';
        return;
    }

    filtered.forEach(match => {
        container.appendChild(createMatchCard(match));
    });
}

// Otevření modálního okna pro tipování
function openBettingModal(match) {
    appState.selectedMatch = match;

    document.getElementById('modalTitle').textContent = `${match.team1} vs ${match.team2}`;
    document.getElementById('team1Info').innerHTML = `<div class="flag">${match.flag1}</div><div class="name">${match.team1}</div>`;
    document.getElementById('team2Info').innerHTML = `<div class="flag">${match.flag2}</div><div class="name">${match.team2}</div>`;

    const existingBet = appState.currentUser.bets.find(b => b.matchId === match.id);
    if (existingBet) {
        document.getElementById('score1').value = existingBet.score1;
        document.getElementById('score2').value = existingBet.score2;
    } else {
        document.getElementById('score1').value = 0;
        document.getElementById('score2').value = 0;
    }

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

    if (isNaN(score1) || isNaN(score2)) {
        alert('Prosím, zadejte platné skóre');
        return;
    }

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
        appState.currentUser.bets[existingBetIndex] = bet;
    } else {
        appState.currentUser.bets.push(bet);
    }

    saveBetsToStorage();
    renderMatches();
    renderMyBets();
    
    closeModal();
    alert('Tip byl úspěšně uložen!');
}

// Výpočet bodů
function calculatePoints(bet, match) {
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

    // Remíza = 7 bodů
    const betIsRemiza = betScore1 === betScore2;
    const actualIsRemiza = actualScore1 === actualScore2;
    if (betIsRemiza && actualIsRemiza) {
        return 7;
    }

    // Nejméně jeden tým má správný počet gólů = 3 body
    if (betScore1 === actualScore1 || betScore2 === actualScore2) {
        return 3;
    }

    // Správný vítěz = 5 bodů
    const betWinner = betScore1 > betScore2 ? 1 : (betScore1 < betScore2 ? -1 : 0);
    const actualWinner = actualScore1 > actualScore2 ? 1 : (actualScore1 < actualScore2 ? -1 : 0);
    
    if (betWinner === actualWinner && betWinner !== 0 && actualWinner !== 0) {
        return 5;
    }

    return 0;
}

// Vykreslení leaderboardu
function renderLeaderboard() {
    const container = document.getElementById('leaderboardTable');

    // Přepočítat body všech uživatelů
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.forEach(user => {
        let totalPoints = 0;
        const userBets = JSON.parse(localStorage.getItem(`bets_${user.id}`) || '[]');
        if (userBets) {
            userBets.forEach(bet => {
                const match = appState.matches.find(m => m.id === bet.matchId);
                if (match && match.result) {
                    totalPoints += calculatePoints(bet, match);
                }
            });
        }
        user.points = totalPoints;
    });

    const sortedUsers = [...users].sort((a, b) => {
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
        const userBets = JSON.parse(localStorage.getItem(`bets_${user.id}`) || '[]');
        if (userBets) {
            userBets.forEach(bet => {
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
