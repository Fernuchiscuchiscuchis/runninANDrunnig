/* ============================================
   BARA 2.0 - data.js
   Data layer: load, save, export, import
   ============================================ */

const STORAGE_KEY = 'baraData_v2';

let appData = {
    profile: null,
    runningSessions: [],
    gymSessions: [],
    meals: [],
    settings: {
        lapMeters: 400,
        onboarded: false
    }
};

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            // Deep merge to preserve defaults
            appData = {
                profile:         parsed.profile         || null,
                runningSessions: parsed.runningSessions || [],
                gymSessions:     parsed.gymSessions     || [],
                meals:           parsed.meals           || [],
                settings: {
                    lapMeters:  parsed.settings?.lapMeters  ?? 400,
                    onboarded:  parsed.settings?.onboarded  ?? false
                }
            };
        }
    } catch (e) {
        console.error('BARA: error loading data', e);
    }
}

function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.error('BARA: error saving data', e);
        showToast('⚠️ Error al guardar datos');
    }
}

function exportData() {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    a.href     = url;
    a.download = `bara-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Datos exportados');
}

function importData() {
    const input   = document.createElement('input');
    input.type    = 'file';
    input.accept  = 'application/json';
    input.onchange = (e) => {
        const file   = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if (confirm('¿Importar datos? Esto reemplazará tus datos actuales.')) {
                    appData = imported;
                    saveData();
                    location.reload();
                }
            } catch (err) {
                showToast('❌ Archivo inválido');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    if (confirm('¿Borrar TODOS los datos permanentemente?')) {
        if (confirm('⚠️ Esta acción no tiene vuelta atrás. ¿Continuar?')) {
            localStorage.removeItem(STORAGE_KEY);
            location.reload();
        }
    }
}
