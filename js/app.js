/* ============================================
   BARA 2.0 - app.js
   App init, onboarding flow
   ============================================ */

let _onboardingStep = 1;

function initApp() {
    loadData();

    if (!appData.settings.onboarded) {
        showOnboarding();
    } else {
        updateDashboard();
        attachRunPreviewListeners();
    }
}

/* --- Onboarding --- */

function showOnboarding() {
    _onboardingStep = 1;
    document.getElementById('onboardingStep1').style.display = 'block';
    document.getElementById('onboardingStep2').style.display = 'none';
    document.getElementById('onboardingStep3').style.display = 'none';
    document.getElementById('onboardingModal').classList.add('active');
}

function nextOnboardingStep() {
    document.getElementById(`onboardingStep${_onboardingStep}`).style.display = 'none';
    _onboardingStep++;
    document.getElementById(`onboardingStep${_onboardingStep}`).style.display = 'block';
}

function completeOnboarding() {
    const age    = parseInt(document.getElementById('profileAge').value);
    const height = parseInt(document.getElementById('profileHeight').value);
    const weight = parseFloat(document.getElementById('profileWeight').value);

    if (!age || !height || !weight) {
        showToast('⚠️ Completá todos los campos');
        return;
    }

    appData.profile = {
        age,
        height,
        weight,
        gender:        document.getElementById('profileGender').value,
        goal:          document.getElementById('profileGoal').value,
        activityLevel: parseFloat(document.getElementById('profileActivity').value)
    };

    appData.settings.lapMeters = parseInt(document.getElementById('profileLapMeters').value) || 400;
    appData.settings.onboarded = true;

    saveData();
    closeModal('onboardingModal');
    updateDashboard();
    attachRunPreviewListeners();
    showToast('✓ Perfil configurado. ¡A entrenar!');
}

/* --- Boot --- */
document.addEventListener('DOMContentLoaded', initApp);
