/* ============================================
   BARA 2.0 - nutrition.js
   TMB, TDEE, macros, meal tracking
   ============================================ */

/* --- Formulas --- */

function calculateTMB(profile) {
    // Mifflin-St Jeor
    const base = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age;
    return profile.gender === 'male' ? base + 5 : base - 161;
}

function calculateTDEE(profile) {
    return calculateTMB(profile) * profile.activityLevel;
}

function calculateRunningCalories(weightKg, km) {
    return weightKg * km * 1.036;
}

function calculateGymCalories(weightKg, minutes = 60) {
    // MET for strength training ≈ 6.0
    return (minutes * 6.0 * weightKg) / 60;
}

function calculateDailyTarget(profile, todayActivities) {
    let total = calculateTDEE(profile);

    todayActivities.running.forEach(s => {
        total += calculateRunningCalories(profile.weight, s.distanceKm);
    });

    if (todayActivities.gym.length > 0) {
        total += calculateGymCalories(profile.weight, 60);
    }

    const adjustments = {
        fat_loss:    -500,
        muscle_gain: +300,
        recomp:      -200,
        performance: +200,
        maintain:      0
    };

    return Math.round(total + (adjustments[profile.goal] || 0));
}

function calculateMacros(calories, goal, weightKg) {
    const ratios = {
        fat_loss:    { protein: 2.2, fat: 0.8 },
        muscle_gain: { protein: 2.0, fat: 1.0 },
        recomp:      { protein: 2.4, fat: 0.9 },
        performance: { protein: 1.8, fat: 1.0 },
        maintain:    { protein: 1.8, fat: 0.9 }
    };

    const r       = ratios[goal] || ratios.maintain;
    const protein = Math.round(weightKg * r.protein);
    const fat     = Math.round(weightKg * r.fat);
    const carbs   = Math.round((calories - protein * 4 - fat * 9) / 4);

    return { protein, fat, carbs: Math.max(0, carbs) };
}

/* --- Screen Updates --- */

function updateNutritionScreen() {
    if (!appData.profile) return;

    const today          = todayStr();
    const todayActs      = getTodayActivities();
    const todayMeals     = appData.meals.filter(m => m.date === today);
    const target         = calculateDailyTarget(appData.profile, todayActs);
    const consumed       = todayMeals.reduce((s, m) => s + m.calories, 0);
    const remaining      = target - consumed;
    const progressPct    = Math.min(100, (consumed / target) * 100);

    setText('nutritionTarget',         target);
    setText('nutritionConsumed',       consumed);
    setText('nutritionRemaining',      Math.max(0, remaining));
    setStyle('nutritionProgress', 'width', `${progressPct}%`);
    setText('nutritionProgressPercent', `${Math.round(progressPct)}%`);

    let status = 'Comenzá el día';
    if (progressPct >= 120)      status = '⚠️ Superaste el objetivo';
    else if (progressPct >= 100) status = '✓ Objetivo alcanzado';
    else if (progressPct >= 80)  status = 'Casi llegás';
    else if (progressPct >= 50)  status = 'Vas bien';
    setText('nutritionStatus', status);

    renderTodayMeals(todayMeals);
    renderMacros(target);
}

function renderTodayMeals(meals) {
    const el = document.getElementById('todayMeals');
    if (!el) return;

    if (meals.length === 0) {
        el.innerHTML = `<div class="empty-state">
            <div class="empty-icon">🍽️</div>
            <div class="empty-text">Todavía no registraste comidas hoy</div>
        </div>`;
        return;
    }

    el.innerHTML = meals.map(m => `
        <div class="meal-card">
            <div class="meal-header">
                <div class="meal-name">${m.mealType}</div>
                <div class="meal-calories">${m.calories} kcal</div>
            </div>
            <div class="meal-description">${m.description}</div>
        </div>
    `).join('');
}

function renderMacros(targetCalories) {
    if (!appData.profile) return;
    const macros = calculateMacros(targetCalories, appData.profile.goal, appData.profile.weight);
    setText('macroProtein', `${macros.protein}g`);
    setText('macroCarbs',   `${macros.carbs}g`);
    setText('macroFat',     `${macros.fat}g`);
}

/* --- Save Meal --- */

function saveMeal(event) {
    event.preventDefault();

    const meal = {
        id:          Date.now(),
        date:        todayStr(),
        mealType:    getVal('mealType'),
        description: getVal('mealDescription'),
        calories:    parseInt(getVal('mealCalories'))
    };

    appData.meals.push(meal);
    saveData();
    closeModal('newMealModal');
    document.getElementById('newMealForm').reset();
    document.getElementById('mealCalories').value = 500;
    updateNutritionScreen();
    updateDashboard();
    showToast('✓ Comida registrada');
}
