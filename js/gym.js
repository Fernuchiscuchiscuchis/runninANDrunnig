/* ============================================
   BARA 2.0 - gym.js
   Gym sessions, routines library, progress
   ============================================ */

/* --- Level --- */

function calculateGymLevel() {
    const n = appData.gymSessions.length;
    if (n < 10)  return 1;
    if (n < 30)  return 2;
    if (n < 60)  return 3;
    if (n < 100) return 4;
    return 5;
}

/* --- Save Gym Session --- */

function saveGymSession(event) {
    event.preventDefault();

    const session = {
        id:          Date.now(),
        date:        getVal('gymDate'),
        muscleGroup: getVal('gymMuscleGroup'),
        exercise:    getVal('gymExercise'),
        weight:      parseFloat(getVal('gymWeight')),
        sets:        parseInt(getVal('gymSets')),
        reps:        parseInt(getVal('gymReps'))
    };

    appData.gymSessions.unshift(session);
    saveData();
    closeModal('newGymModal');
    document.getElementById('newGymForm').reset();
    setDefaultDate('gymDate');
    updateGymScreen();
    updateDashboard();

    const volume = session.weight * session.sets * session.reps;
    showToast(`✓ ${session.exercise} ${session.weight}kg ${session.sets}×${session.reps} (${volume}kg vol)`);
}

/* --- Screen Render --- */

function updateGymScreen() {
    const weekGym    = getLastNDaysSessions(appData.gymSessions, 7);
    const weekVolume = weekGym.reduce((s, g) => s + g.weight * g.sets * g.reps, 0);

    setText('gymWeekSessions', weekGym.length);
    setText('gymWeekVolume',   (weekVolume / 1000).toFixed(1));
    setText('gymLevel',        calculateGymLevel());

    renderLastGymSession();
}

function renderLastGymSession() {
    const el = document.getElementById('lastGymSession');
    if (!el) return;

    if (appData.gymSessions.length === 0) {
        el.innerHTML = '<div class="empty-text" style="color:var(--text-secondary);padding:1rem 0;">No hay sesiones registradas</div>';
        return;
    }

    const s = appData.gymSessions[0];
    el.innerHTML = `
        <div class="exercise-item">
            <div class="exercise-info">
                <div class="exercise-name">${s.muscleGroup}</div>
                <div class="exercise-details">${s.exercise} · ${s.sets}×${s.reps}</div>
            </div>
            <div class="exercise-meta">
                <div class="exercise-weight">${s.weight} kg</div>
                <div class="exercise-sets">${formatDate(s.date)}</div>
            </div>
        </div>
    `;
}

/* --- Tab Switching --- */

function switchGymTab(tab, event) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');

    document.getElementById('gymWorkoutTab').style.display  = tab === 'workout'  ? 'block' : 'none';
    document.getElementById('gymRoutinesTab').style.display = tab === 'routines' ? 'block' : 'none';
    document.getElementById('gymProgressTab').style.display = tab === 'progress' ? 'block' : 'none';

    if (tab === 'routines') renderRoutinesList();
    if (tab === 'progress') renderGymProgress();
}

/* --- Routines Library --- */

function getRoutines() {
    return [
        {
            id: 'fullbody_beginner',
            name: 'Full Body Principiante',
            description: 'Cuerpo completo 3 veces por semana. Perfecto para empezar a construir la base.',
            frequency: '3×/semana',
            duration: '45-60 min',
            level: 1,
            days: [
                {
                    label: 'Día A / C',
                    exercises: [
                        { name: 'Sentadilla',                  sets: 3, reps: '10-12' },
                        { name: 'Press banca',                 sets: 3, reps: '8-10'  },
                        { name: 'Remo con barra',              sets: 3, reps: '10-12' },
                        { name: 'Press militar',               sets: 3, reps: '8-10'  },
                        { name: 'Curl de bíceps',              sets: 2, reps: '12-15' },
                        { name: 'Extensiones de tríceps',      sets: 2, reps: '12-15' }
                    ]
                }
            ],
            tips: [
                'Descansá 60-90 seg entre series.',
                'Enfocate en la técnica antes de subir peso.',
                'Aumentá 2.5 kg cuando podés completar todas las reps limpias.'
            ]
        },
        {
            id: 'upper_lower',
            name: 'Upper / Lower Intermedio',
            description: 'Dividir tren superior e inferior. 4 días por semana. Ideal para ganar fuerza y tamaño.',
            frequency: '4×/semana',
            duration: '60-75 min',
            level: 2,
            days: [
                {
                    label: 'Upper A (Fuerza)',
                    exercises: [
                        { name: 'Press banca',       sets: 4, reps: '4-6'   },
                        { name: 'Remo con barra',    sets: 4, reps: '4-6'   },
                        { name: 'Press inclinado',   sets: 3, reps: '8-10'  },
                        { name: 'Jalón al pecho',    sets: 3, reps: '8-10'  },
                        { name: 'Press militar',     sets: 3, reps: '8-10'  }
                    ]
                },
                {
                    label: 'Lower A (Fuerza)',
                    exercises: [
                        { name: 'Sentadilla',        sets: 4, reps: '4-6'   },
                        { name: 'Peso muerto rumano', sets: 3, reps: '6-8'  },
                        { name: 'Prensa de piernas', sets: 3, reps: '10-12' },
                        { name: 'Curl femoral',      sets: 3, reps: '10-12' }
                    ]
                },
                {
                    label: 'Upper B (Volumen)',
                    exercises: [
                        { name: 'Press inclinado DB',  sets: 4, reps: '10-12' },
                        { name: 'Dominadas',           sets: 4, reps: '8-10'  },
                        { name: 'Aperturas',           sets: 3, reps: '12-15' },
                        { name: 'Face pulls',          sets: 3, reps: '15-20' },
                        { name: 'Curl martillo',       sets: 3, reps: '12-15' }
                    ]
                },
                {
                    label: 'Lower B (Volumen)',
                    exercises: [
                        { name: 'Peso muerto convencional', sets: 4, reps: '6-8'   },
                        { name: 'Sentadilla búlgara',       sets: 3, reps: '10-12' },
                        { name: 'Extensiones cuád.',        sets: 3, reps: '12-15' },
                        { name: 'Elevaciones de gemelos',   sets: 4, reps: '15-20' }
                    ]
                }
            ],
            tips: [
                'Descansá 2-3 min en series pesadas, 60-90 seg en volumen.',
                'La progresión doble funciona bien: más reps, luego más peso.',
                'Cada 4-6 semanas hacé una semana de deload (60% del volumen).'
            ]
        },
        {
            id: 'ppl_advanced',
            name: 'Push Pull Legs Avanzado',
            description: 'PPL 6 días, máximo volumen y frecuencia. Para atletas con más de 6 meses de base.',
            frequency: '6×/semana',
            duration: '75-90 min',
            level: 3,
            days: [
                {
                    label: 'Push (Fuerza)',
                    exercises: [
                        { name: 'Press banca',        sets: 5, reps: '3-5'  },
                        { name: 'Press inclinado',    sets: 4, reps: '6-8'  },
                        { name: 'Aperturas cable',    sets: 3, reps: '12-15'},
                        { name: 'Press militar',      sets: 4, reps: '6-8'  },
                        { name: 'Tríceps polea',      sets: 3, reps: '12-15'}
                    ]
                },
                {
                    label: 'Pull (Fuerza)',
                    exercises: [
                        { name: 'Peso muerto',        sets: 5, reps: '3-5'  },
                        { name: 'Dominadas lastradas',sets: 4, reps: '5-8'  },
                        { name: 'Remo pendlay',       sets: 4, reps: '6-8'  },
                        { name: 'Curl bíceps barra',  sets: 3, reps: '8-10' }
                    ]
                },
                {
                    label: 'Legs (Fuerza)',
                    exercises: [
                        { name: 'Sentadilla back',    sets: 5, reps: '3-5'  },
                        { name: 'Prensa',             sets: 4, reps: '10-12'},
                        { name: 'Peso muerto rumano', sets: 4, reps: '6-8'  },
                        { name: 'Gemelos de pie',     sets: 4, reps: '12-15'}
                    ]
                }
            ],
            tips: [
                'Descansá 3-5 min en los levantamientos principales.',
                'Deload obligatorio cada 6-8 semanas.',
                'Dormí al menos 8 horas. El músculo crece mientras descansás.',
                'Comé al menos 2g de proteína por kg de peso corporal.'
            ]
        }
    ];
}

function renderRoutinesList() {
    const el    = document.getElementById('routinesList');
    if (!el) return;

    const level = calculateGymLevel();
    const list  = getRoutines().filter(r => r.level <= level + 1);

    el.innerHTML = list.map(r => `
        <div class="routine-card" onclick="showRoutineDetail('${r.id}')">
            <div class="routine-title">${r.name}</div>
            <div class="routine-description">${r.description}</div>
            <div class="routine-stats">
                <span>📅 ${r.frequency}</span>
                <span>⏱️ ${r.duration}</span>
                <span class="badge badge-info">Nivel ${r.level}</span>
            </div>
        </div>
    `).join('');
}

function showRoutineDetail(id) {
    const routine = getRoutines().find(r => r.id === id);
    if (!routine) return;

    setText('routineModalTitle', routine.name);

    let html = `<p style="color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.7;">${routine.description}</p>`;

    routine.days.forEach(day => {
        html += `<div style="margin-bottom:1.25rem;">
            <div class="card-title">${day.label}</div>
            ${day.exercises.map(ex => `
                <div class="exercise-item" style="margin-bottom:0.5rem;">
                    <div class="exercise-info">
                        <div class="exercise-name">${ex.name}</div>
                    </div>
                    <div class="exercise-meta">
                        <div class="exercise-weight">${ex.sets}×${ex.reps}</div>
                    </div>
                </div>
            `).join('')}
        </div>`;
    });

    if (routine.tips && routine.tips.length) {
        html += `<div class="card-title" style="margin-top:1rem;">💡 Tips</div>`;
        html += routine.tips.map(t => `<div style="padding:0.4rem 0;color:var(--text-secondary);font-size:0.9rem;">• ${t}</div>`).join('');
    }

    document.getElementById('routineModalContent').innerHTML = html;
    document.getElementById('routineModal').classList.add('active');
    window._currentRoutineId = id;
}

function closeRoutineModal() {
    closeModal('routineModal');
}

function startRoutine() {
    const routine = getRoutines().find(r => r.id === window._currentRoutineId);
    if (routine) {
        showToast(`✓ Rutina "${routine.name}" guardada como activa`);
        closeModal('routineModal');
    }
}

/* --- Progress / PRs --- */

function renderGymProgress() {
    const el = document.getElementById('gymRecords');
    if (!el) return;

    if (appData.gymSessions.length === 0) {
        el.innerHTML = '<div class="empty-text" style="color:var(--text-secondary);">Registrá entrenamientos para ver tus récords</div>';
        return;
    }

    // PRs per exercise (max weight)
    const prs = {};
    appData.gymSessions.forEach(s => {
        if (!prs[s.exercise] || s.weight > prs[s.exercise].weight) {
            prs[s.exercise] = s;
        }
    });

    el.innerHTML = Object.values(prs)
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 10)
        .map(pr => `
            <div class="exercise-item">
                <div class="exercise-info">
                    <div class="exercise-name">${pr.exercise}</div>
                    <div class="exercise-details">${pr.muscleGroup} · ${pr.sets}×${pr.reps}</div>
                </div>
                <div class="exercise-meta">
                    <div class="exercise-weight">${pr.weight} kg</div>
                    <div class="exercise-sets">${formatDate(pr.date)}</div>
                </div>
            </div>
        `).join('');
}
