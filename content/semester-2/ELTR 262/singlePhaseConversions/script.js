// --- Constants ---
const SQRT_2 = Math.sqrt(2);
const PI = Math.PI;
const TURNS_RATIO = 0.1;
const V_DIODE_PRACTICAL = 0.7;

// --- DOM Refs ---
const inputs = {
    turnsRatio: document.getElementById('turnsRatio'),
    vSource: document.getElementById('vSource'),
    vSourcePeak: document.getElementById('vSourcePeak'),
    vSecondary: document.getElementById('vSecondary'),
    vSecPeak: document.getElementById('vSecPeak'),
    loadResistor: document.getElementById('loadResistor'),
    frequency: document.getElementById('frequency')
};

const diodeToggle = document.getElementById('diodeToggle');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

// Result display elements
const results = {
    vLoadDc: document.getElementById('vLoadDc'),
    vLoadRms: document.getElementById('vLoadRms'),
    vLoadPk: document.getElementById('vLoadPk'),
    iLoadDc: document.getElementById('iLoadDc'),
    iLoadRms: document.getElementById('iLoadRms'),
    iLoadPk: document.getElementById('iLoadPk'),
    diodeVdrop: document.getElementById('diodeVdrop'),
    diodeIdc: document.getElementById('diodeIdc'),
    diodeImax: document.getElementById('diodeImax'),
    diodePIV: document.getElementById('diodePIV'),
    formFactor: document.getElementById('formFactor'),
    rippleFactor: document.getElementById('rippleFactor'),
    rippleFreq: document.getElementById('rippleFreq'),
    sourceFreq: document.getElementById('sourceFreq')
};

// --- Calculation Engine ---
function calculateAll() {
    const vSecRMS = parseFloat(inputs.vSecondary.value) || 0;
    const vSecPk = parseFloat(inputs.vSecPeak.value) || 0;
    const R = parseFloat(inputs.loadResistor.value) || 1;
    const f = parseFloat(inputs.frequency.value) || 60;
    const isPractical = diodeToggle.checked;
    const vD = isPractical ? V_DIODE_PRACTICAL : 0;

    // Peak voltage after diode drop
    const Vm = Math.max(0, vSecPk - vD);

    // Half-wave rectifier formulas
    const Vdc = Vm / PI;
    const Vrms = Vm / 2;
    const Vpk = Vm;

    // Currents
    const Idc = Vdc / R;
    const Irms = Vrms / R;
    const Ipk = Vm / R;

    // Diode characteristics
    const diodeVoltageDrop = isPractical ? vD : 0;
    const diodeIdc = Idc;
    const diodeImax = Ipk;
    const diodePIV = vSecPk;

    // Performance metrics
    const FF = Vrms > 0 ? Vrms / Vdc : 0;
    const RF = Math.sqrt(FF * FF - 1);
    const rippleFreq = f;

    // Update display
    results.vLoadDc.textContent = Vdc.toFixed(3) + ' V';
    results.vLoadRms.textContent = Vrms.toFixed(3) + ' V';
    results.vLoadPk.textContent = Vpk.toFixed(3) + ' V';
    results.iLoadDc.textContent = Idc.toFixed(3) + ' A';
    results.iLoadRms.textContent = Irms.toFixed(3) + ' A';
    results.iLoadPk.textContent = Ipk.toFixed(3) + ' A';

    results.diodeVdrop.textContent = diodeVoltageDrop.toFixed(3) + ' V';
    results.diodeIdc.textContent = diodeIdc.toFixed(3) + ' A';
    results.diodeImax.textContent = diodeImax.toFixed(3) + ' A';
    results.diodePIV.textContent = diodePIV.toFixed(3) + ' V';

    results.formFactor.textContent = FF.toFixed(3);
    results.rippleFactor.textContent = RF.toFixed(3);
    results.rippleFreq.textContent = rippleFreq.toFixed(1) + ' Hz';
    results.sourceFreq.textContent = f.toFixed(1) + ' Hz';
}

// --- Input Auto-Calculation ---
function updateAllFields(changedId, value) {
    if (isNaN(value) || value <= 0) return;

    const ratio = parseFloat(inputs.turnsRatio.value) || TURNS_RATIO;

    let vSrcRMS, vSrcPk, vSecRMS, vSecPk;

    switch (changedId) {
        case 'turnsRatio':
            vSrcRMS = parseFloat(inputs.vSource.value) || 0;
            vSrcPk = vSrcRMS * SQRT_2;
            vSecRMS = vSrcRMS * ratio;
            vSecPk = vSecRMS * SQRT_2;
            break;
        case 'vSource':
            vSrcRMS = value;
            vSrcPk = vSrcRMS * SQRT_2;
            vSecRMS = vSrcRMS * ratio;
            vSecPk = vSecRMS * SQRT_2;
            break;
        case 'vSourcePeak':
            vSrcPk = value;
            vSrcRMS = vSrcPk / SQRT_2;
            vSecRMS = vSrcRMS * ratio;
            vSecPk = vSecRMS * SQRT_2;
            break;
        case 'vSecondary':
            vSecRMS = value;
            vSrcRMS = vSecRMS / ratio;
            vSrcPk = vSrcRMS * SQRT_2;
            vSecPk = vSecRMS * SQRT_2;
            break;
        case 'vSecPeak':
            vSecPk = value;
            vSecRMS = vSecPk / SQRT_2;
            vSrcRMS = vSecRMS / ratio;
            vSrcPk = vSrcRMS * SQRT_2;
            break;
        default:
            return;
    }

    inputs.vSource.value = vSrcRMS.toFixed(2);
    inputs.vSourcePeak.value = vSrcPk.toFixed(2);
    inputs.vSecondary.value = vSecRMS.toFixed(2);
    inputs.vSecPeak.value = vSecPk.toFixed(2);

    calculateAll();
}

Object.keys(inputs).forEach(id => {
    if (id === 'loadResistor' || id === 'frequency') {
        inputs[id].addEventListener('input', calculateAll);
    } else {
        inputs[id].addEventListener('input', (e) => {
            updateAllFields(id, parseFloat(e.target.value));
        });
    }
});

diodeToggle.addEventListener('change', calculateAll);

// Initial calculation
calculateAll();

// --- Animation Logic ---
let animationRunning = false;
let abortAnimation = false;

const elements = {
    srcCircle: document.getElementById('src-circle'),
    wireSrcTop: document.getElementById('wire-src-top'),
    txPri: document.getElementById('tx-pri'),
    wireSrcBot: document.getElementById('wire-src-bot'),
    txSec: document.getElementById('tx-sec'),
    wireSecTop: document.getElementById('wire-sec-top'),
    diodePoly: document.querySelector('#diode polygon'),
    diodeLine: document.querySelector('#diode line'),
    wireDiodeOut: document.getElementById('wire-diode-out'),
    loadRes: document.getElementById('load-res'),
    wireSecBot: document.getElementById('wire-sec-bot')
};

function clearAllClasses() {
    Object.values(elements).forEach(el => {
        el.classList.remove('active-pos', 'active-neg');
    });
}

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runSimulation() {
    if (animationRunning) return;
    animationRunning = true;
    abortAnimation = false;
    startBtn.textContent = 'Running...';
    startBtn.disabled = true;
    stopBtn.disabled = false;

    const stepTime = 400;

    while (!abortAnimation) {
        // === POSITIVE HALF CYCLE ===
        elements.srcCircle.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.wireSrcTop.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.txPri.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.wireSrcBot.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.txSec.classList.add('active-pos');
        elements.wireSecTop.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.diodePoly.classList.add('active-pos');
        elements.diodeLine.classList.add('active-pos');
        elements.wireDiodeOut.classList.add('active-pos');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.loadRes.classList.add('active-pos');
        elements.wireSecBot.classList.add('active-pos');
        await delay(stepTime * 2);
        if (abortAnimation) break;

        clearAllClasses();
        await delay(200);
        if (abortAnimation) break;

        // === NEGATIVE HALF CYCLE ===
        elements.srcCircle.classList.add('active-neg');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.wireSrcBot.classList.add('active-neg');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.txPri.classList.add('active-neg');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.wireSrcTop.classList.add('active-neg');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.txSec.classList.add('active-neg');
        elements.wireSecBot.classList.add('active-neg');
        elements.loadRes.classList.add('active-neg');
        await delay(stepTime);
        if (abortAnimation) break;

        elements.wireDiodeOut.classList.add('active-neg');
        await delay(stepTime * 2);
        if (abortAnimation) break;

        clearAllClasses();
        await delay(200);
    }

    clearAllClasses();
    animationRunning = false;
    startBtn.textContent = 'Start Simulation';
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function stopSimulation() {
    if (animationRunning) {
        abortAnimation = true;
    }
}

startBtn.addEventListener('click', runSimulation);
stopBtn.addEventListener('click', stopSimulation);