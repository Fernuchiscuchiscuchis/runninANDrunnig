/* ============================================
   BARA 2.0 - ui.js
   Shared UI helpers, dashboard, stats
   ============================================ */

/* --- DOM Helpers --- */

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function setStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el) el.style[prop] = value;
}

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
}

function setDefaultDate(inputId) {
    const el = document.getElementById(inputId);
    if (el) el.value = todayStr();
}

function todayStr() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
    const today = todayStr();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === today)     return 'Hoy';
    if (dateStr === yesterday) return 'Ayer';
    return new Date(dateStr).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
}

function formatMonth(monthStr) {
    const [y, m] = monthStr.split('-');
    return new Date(y, m - 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function changeValue(inputId, delta) {
    const el  = document.getElementById(inputId);
    if (!el) return;
    const min = parseInt(el.min) ?? 0;
    el.value  = Math.max(min, (parseInt(el.value) || 0) + delta);
    el.dispatchEvent(new Event('input'));
}

function showToast(message) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => el.classList.remove('show'), 3000);
}

/* --- Modal Helpers --- */

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

function openSettings() {
    if (appData.profile) {
        document.getElementById('profileSummary').innerHTML = `
            ${appData.profile.age} años · ${appData.profile.height} cm · ${appData.profile.weight} kg<br>
            Sexo: ${appData.profile.gender === 'male' ? 'Masculino' : 'Femenino'} · 
            Objetivo: ${goalName(appData.profile.goal)}<br>
            Plaza: ${appData.settings.lapMeters} m/vuelta
        `;
    }
    document.getElementById('settingsModal').classList.add('active');
}

function goalName(g) {
    return { fat_loss: 'Bajar grasa', muscle_gain: 'Ganar músculo', recomp: 'Recomposición', performance: 'Rendimiento', maintain: 'Mantener' }[g] || g;
}

function editProfile() {
    appData.settings.onboarded = false;
    saveData();
    closeModal('settingsModal');
    showOnboarding();
}

/* --- Shared Calculations --- */

function getLastNDaysSessions(arr, n) {
    const since = new Date(Date.now() - n * 86400000);
    return arr.filter(s => new Date(s.date) >= since);
}

function calculateStreak() {
    const allDates = [
        ...appData.runningSessions.map(s => s.date),
        ...appData.gymSessions.map(s => s.date)
    ];
    const unique = [...new Set(allDates)].sort().reverse();
    if (!unique.length) return 0;

    let streak = 0;
    let ref    = new Date(); ref.setHours(0,0,0,0);

    for (const d of unique) {
        const dt = new Date(d); dt.setHours(0,0,0,0);
        const diff = Math.round((ref - dt) / 86400000);
        if (diff === streak || (streak === 0 && diff <= 1)) {
            streak++;
            ref = dt;
        } else break;
    }
    return streak;
}

function getTodayActivities() {
    const today = todayStr();
    return {
        running: appData.runningSessions.filter(s => s.date === today),
        gym:     appData.gymSessions.filter(s => s.date === today)
    };
}

function calculateDisciplineIndex() {
    const since = new Date(Date.now() - 28 * 86400000);
    const all   = [
        ...appData.runningSessions.filter(s => new Date(s.date) >= since),
        ...appData.gymSessions.filter(s => new Date(s.date) >= since)
    ];
    const uniqueDays = new Set(all.map(a => a.date)).size;
    const consistency = (uniqueDays / 28) * 100;
    const streakBonus = Math.min(40, calculateStreak() * 2);
    return Math.round(consistency * 0.6 + streakBonus * 0.4);
}

/* --- Dashboard --- */

function updateDashboard() {
    if (!appData.profile) return;

    const today   = todayStr();
    const acts    = getTodayActivities();
    const todayKcal = appData.meals.filter(m => m.date === today).reduce((s, m) => s + m.calories, 0);

    setText('todayCalories',  todayKcal);
    setText('todayActivities', acts.running.length + acts.gym.length);
    setText('weekStreak',     calculateStreak());

    const weekRun  = getLastNDaysSessions(appData.runningSessions, 7);
    const weekGym  = getLastNDaysSessions(appData.gymSessions, 7);
    const weekMeal = getLastNDaysSessions(appData.meals, 7);
    const weekKm   = weekRun.reduce((s, r) => s + r.distanceKm, 0);
    const avgKcal  = weekMeal.length > 0 ? weekMeal.reduce((s, m) => s + m.calories, 0) / 7 : 0;

    setText('weekKm',         weekKm.toFixed(1));
    setText('weekGym',        weekGym.length);
    setText('weekCalorieAvg', Math.round(avgKcal));

    renderMainSuggestion();
    renderRecentActivity();
}

function renderMainSuggestion() {
    const acts   = getTodayActivities();
    const week   = getLastNDaysSessions(appData.runningSessions, 7);
    const weekGym = getLastNDaysSessions(appData.gymSessions, 7);
    const streak  = calculateStreak();

    let text = '';

    if (acts.running.length && acts.gym.length) {
        const kcal = appData.profile
            ? Math.round(
                acts.running.reduce((s, r) => s + r.distanceKm * appData.profile.weight * 1.036, 0) +
                calculateGymCalories(appData.profile.weight, 60)
              )
            : 0;
        text = `🔥 Día completo: Running + Gym. Quemaste ~${kcal} kcal extra. Priorizá proteína y carbos.`;
    } else if (weekGym.length >= 4 && week.reduce((s,r)=>s+r.distanceKm,0) > 15) {
        text = '⚠️ Semana intensa. Considerá un día de descanso activo o total.';
    } else if (streak >= 7) {
        text = `💪 ¡${streak} días de racha! Recordá: el descanso también construye músculo.`;
    } else if (!week.length && !weekGym.length) {
        text = '🎯 Esta semana arrancás desde cero. Hoy es el mejor momento para empezar.';
    } else {
        const opts = [
            'Un buen día para intervalos en la plaza 💨',
            'Combiná running suave + gym de piernas hoy.',
            'Si entrenaste ayer, hoy podés hacer movilidad o descanso.',
            'Hidratate bien antes de salir a correr 💧'
        ];
        text = opts[Math.floor(Math.random() * opts.length)];
    }

    setText('mainSuggestionText', text);
}

function renderRecentActivity() {
    const el = document.getElementById('recentActivity');
    if (!el) return;

    const all = [
        ...appData.runningSessions.map(s => ({...s, _type:'run'})),
        ...appData.gymSessions.map(s => ({...s, _type:'gym'})),
        ...appData.meals.map(m => ({...m, _type:'meal'}))
    ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    if (!all.length) {
        el.innerHTML = '<div class="empty-state"><div class="empty-text">Todavía no hay actividad registrada</div></div>';
        return;
    }

    el.innerHTML = all.map(a => {
        let icon, content;
        if (a._type === 'run') {
            icon = '🏃'; content = `${a.totalLaps} vueltas · ${a.distanceKm.toFixed(1)} km`;
        } else if (a._type === 'gym') {
            icon = '💪'; content = `${a.muscleGroup} · ${a.exercise} ${a.weight}kg`;
        } else {
            icon = '🍽️'; content = `${a.mealType} · ${a.calories} kcal`;
        }
        return `<div class="activity-item">
            <div class="activity-type">${icon} ${formatDate(a.date)}</div>
            <div class="activity-content">${content}</div>
        </div>`;
    }).join('');
}

/* --- Stats Screen --- */

function updateStatsScreen() {
    renderMonthlyStats();

    const totalKm  = appData.runningSessions.reduce((s,r) => s + r.distanceKm, 0);
    const allDates = new Set([
        ...appData.runningSessions.map(s=>s.date),
        ...appData.gymSessions.map(s=>s.date)
    ]);

    setText('totalKm',   totalKm.toFixed(1));
    setText('totalGym',  appData.gymSessions.length);
    setText('totalDays', allDates.size);

    const score = calculateDisciplineIndex();
    setText('disciplineScore', score);
    setStyle('disciplineProgress', 'width', `${Math.min(100,score)}%`);

    let lvl = 'Iniciando';
    if (score >= 80)      lvl = '🔥 Élite';
    else if (score >= 60) lvl = '💪 Avanzado';
    else if (score >= 40) lvl = '⚡ Intermedio';
    else if (score >= 20) lvl = '📈 En progreso';
    setText('disciplineLevel', lvl);
}

function renderMonthlyStats() {
    const el = document.getElementById('monthlyStats');
    if (!el) return;

    const monthly = {};
    appData.runningSessions.forEach(s => {
        const mo = s.date.slice(0,7);
        if (!monthly[mo]) monthly[mo] = { km: 0, gym: 0 };
        monthly[mo].km += s.distanceKm;
    });
    appData.gymSessions.forEach(s => {
        const mo = s.date.slice(0,7);
        if (!monthly[mo]) monthly[mo] = { km: 0, gym: 0 };
        monthly[mo].gym++;
    });

    const months = Object.keys(monthly).sort().slice(-4);

    if (!months.length) {
        el.innerHTML = '<div class="empty-text" style="color:var(--text-secondary);">Necesitas datos de al menos un mes</div>';
        return;
    }

    el.innerHTML = months.map((mo, i) => {
        const d    = monthly[mo];
        const prev = i > 0 ? monthly[months[i-1]] : null;
        const chg  = prev && prev.km > 0 ? ((d.km - prev.km) / prev.km * 100) : null;
        const chgHtml = chg !== null
            ? `<span class="${chg >= 0 ? 'month-change-pos' : 'month-change-neg'}">${chg >= 0 ? '+' : ''}${chg.toFixed(0)}%</span>`
            : '';
        return `<div class="month-row">
            <div class="month-name">${formatMonth(mo)}</div>
            <div class="month-data">
                <span>🏃 ${d.km.toFixed(1)} km</span>
                <span>💪 ${d.gym}</span>
                ${chgHtml}
            </div>
        </div>`;
    }).join('');
}

/* --- Screen Navigation --- */

function showScreen(screenId, event) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    document.getElementById(screenId).classList.add('active');
    if (event && event.currentTarget) event.currentTarget.classList.add('active');

    switch (screenId) {
        case 'dashboard':  updateDashboard();      break;
        case 'running':    updateRunningScreen();  break;
        case 'gym':        updateGymScreen();      break;
        case 'nutrition':  updateNutritionScreen();break;
        case 'stats':      updateStatsScreen();    break;
    }
}

/* --- Modals open helpers --- */

function openNewRunModal() {
    document.getElementById('newRunModal').classList.add('active');
    setDefaultDate('runDate');
    document.getElementById('runMetricsPreview').style.display = 'none';
}

function openNewGymModal() {
    document.getElementById('newGymModal').classList.add('active');
    setDefaultDate('gymDate');
}

function openNewMealModal() {
    document.getElementById('newMealModal').classList.add('active');
}

/* --- Close on backdrop click --- */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});
