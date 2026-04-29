/* ============================================
   BARA 2.0 - running.js
   Running sessions, metrics, history
   ============================================ */

/* --- Metrics --- */

function formatPace(pace) {
    if (!pace || !isFinite(pace) || pace <= 0) return '--:--';
    const mins = Math.floor(pace);
    const secs = Math.round((pace - mins) * 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

function computeRunMetrics(laps, minutes, seconds) {
    const meters       = laps * appData.settings.lapMeters;
    const km           = meters / 1000;
    const totalMinutes = minutes + seconds / 60;
    const pace         = km > 0 ? totalMinutes / km       : 0;
    const speed        = km > 0 ? km / (totalMinutes / 60) : 0;
    return { meters, km, pace, speed };
}

/* --- Live Preview in modal --- */

function updateRunPreview() {
    const laps    = parseInt(getVal('runLaps'))    || 0;
    const minutes = parseInt(getVal('runMinutes')) || 0;
    const seconds = parseInt(getVal('runSeconds')) || 0;

    const preview = document.getElementById('runMetricsPreview');
    if (!preview) return;

    if (laps > 0 && (minutes > 0 || seconds > 0)) {
        const m = computeRunMetrics(laps, minutes, seconds);
        setText('previewKm',    m.km.toFixed(2));
        setText('previewPace',  formatPace(m.pace));
        setText('previewSpeed', m.speed.toFixed(1));
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

/* --- Save Running Session --- */

function saveRunSession(event) {
    event.preventDefault();

    const laps    = parseInt(getVal('runLaps'));
    const minutes = parseInt(getVal('runMinutes'));
    const seconds = parseInt(getVal('runSeconds'));
    const m       = computeRunMetrics(laps, minutes, seconds);

    const session = {
        id:             Date.now(),
        date:           getVal('runDate'),
        totalLaps:      laps,
        totalMinutes:   minutes,
        totalSeconds:   seconds,
        perceivedEffort:parseInt(getVal('runEffort')),
        weather:        getVal('runWeather'),
        distanceMeters: m.meters,
        distanceKm:     m.km,
        paceMinPerKm:   m.pace,
        avgSpeedKmh:    m.speed
    };

    appData.runningSessions.unshift(session);
    saveData();
    closeModal('newRunModal');
    document.getElementById('newRunForm').reset();
    setDefaultDate('runDate');
    updateRunningScreen();
    updateDashboard();
    showToast(`✓ ${laps} vueltas (${m.km.toFixed(2)} km) guardadas`);
}

/* --- Screen Render --- */

function updateRunningScreen() {
    const weekRun   = getLastNDaysSessions(appData.runningSessions, 7);
    const uniqueDays = new Set(weekRun.map(s => s.date)).size;
    const weekKm    = weekRun.reduce((s, r) => s + r.distanceKm, 0);

    setText('runWeekKm',   weekKm.toFixed(1));
    setText('runWeekDays', uniqueDays);
    setText('runStreak',   calculateStreak());

    renderRunHistory();
}

function renderRunHistory() {
    const el = document.getElementById('runningHistory');
    if (!el) return;

    const list = appData.runningSessions.slice(0, 15);

    if (list.length === 0) {
        el.innerHTML = `<div class="empty-state">
            <div class="empty-icon">🏃</div>
            <div class="empty-text">Todavía no registraste ninguna salida</div>
        </div>`;
        return;
    }

    el.innerHTML = list.map(s => `
        <div class="exercise-item">
            <div class="exercise-info">
                <div class="exercise-name">📅 ${formatDate(s.date)}</div>
                <div class="exercise-details">${s.totalLaps} vueltas · ${s.totalMinutes}:${String(s.totalSeconds).padStart(2,'0')} · ${s.weather || ''}</div>
            </div>
            <div class="exercise-meta">
                <div class="exercise-weight">${s.distanceKm.toFixed(1)} km</div>
                <div class="exercise-sets">${formatPace(s.paceMinPerKm)}/km</div>
            </div>
        </div>
    `).join('');
}

/* --- Attach live preview listeners after DOM ready --- */

function attachRunPreviewListeners() {
    ['runLaps', 'runMinutes', 'runSeconds'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', updateRunPreview);
    });
}
