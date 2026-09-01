// System Game Engine Data
let player = {
    level: 1,
    xp: 0,
    maxXp: 100,
    stats: {
        STR: 10,
        INT: 10,
        AGI: 10,
        VIT: 10
    }
};

let quests = [
    { id: 1, title: "Deadlift & Heavy Training", stat: "STR", points: 5, completed: false },
    { id: 2, title: "Read 20 Pages of Tech Docs", stat: "INT", points: 5, completed: false }
];

// Elements
const userLevelEl = document.getElementById('userLevel');
const xpTextEl = document.getElementById('xpText');
const xpBarInner = document.getElementById('xpBarInner');
const questListEl = document.getElementById('questList');
const addQuestForm = document.getElementById('addQuestForm');

// Update Status Screen
function updateStatusUI() {
    if (!userLevelEl) return;
    userLevelEl.innerText = player.level;
    xpTextEl.innerText = `${player.xp} / ${player.maxXp} XP`;
    const percentage = (player.xp / player.maxXp) * 100;
    xpBarInner.style.width = `${percentage}%`;

    document.getElementById('statSTR').innerText = player.stats.STR;
    document.getElementById('statINT').innerText = player.stats.INT;
    document.getElementById('statAGI').innerText = player.stats.AGI;
    document.getElementById('statVIT').innerText = player.stats.VIT;
}

// Render Quests
function renderQuests() {
    if (!questListEl) return;
    questListEl.innerHTML = '';
    quests.forEach(quest => {
        const item = document.createElement('div');
        item.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        item.innerHTML = `
            <div>
                <span class="quest-info-title">${quest.title}</span>
                <span class="quest-tag">+${quest.points} ${quest.stat}</span>
            </div>
            ${!quest.completed ? `<button class="complete-quest-btn" onclick="completeQuest(${quest.id})">COMPLETE ⚔️</button>` : '<span>DONE</span>'}
        `;
        questListEl.appendChild(item);
    });
}

// Complete Quest Logic
window.completeQuest = function (id) {
    const quest = quests.find(q => q.id === id);
    if (quest && !quest.completed) {
        quest.completed = true;
        player.stats[quest.stat] += quest.points;
        player.xp += 35;
        if (player.xp >= player.maxXp) {
            player.level += 1;
            player.xp -= player.maxXp;
            player.maxXp += 50;
            alert(`🎉 LEVEL UP! YOU ARE NOW LEVEL ${player.level}`);
        }
        updateStatusUI();
        renderQuests();
    }
}

// Add New Quest Form Handler
if (addQuestForm) {
    addQuestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('questInput').value;
        const stat = document.getElementById('statSelect').value;

        quests.push({
            id: Date.now(),
            title: title,
            stat: stat,
            points: 5,
            completed: false
        });

        document.getElementById('questInput').value = '';
        renderQuests();
    });
}

// Initial Init
updateStatusUI();
renderQuests();