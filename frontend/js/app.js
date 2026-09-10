/**
 * ==============================================================================
 * J.A.R.V.I.S — JUST A RATHER VERY INTELLIGENT SYSTEM
 * Full-Stack AI Voice Assistant Web Application Logic
 * Mark VII Command Center Engine
 * ==============================================================================
 */

// Application State Constants
const JARVIS_STATE = {
    IDLE: 'IDLE',
    LISTENING: 'LISTENING',
    PROCESSING: 'PROCESSING',
    SPEAKING: 'SPEAKING',
    ERROR: 'ERROR'
};

// Global App Configuration & Context
const getDefaultBackendUrl = () => {
    const configured = window.__JARVIS_BACKEND_URL__;
    if (configured) {
        return configured.replace(/\/$/, '');
    }

    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://127.0.0.1:8000';
    }

    return window.location.origin;
};

const AppConfig = {
    backendUrl: getDefaultBackendUrl(),
    wakeWord: 'jarvis',
    speechRate: 1.05,
    speechPitch: 0.95,
    continuousListening: true,
    wakeWordEnabled: true,
    voiceSynthesisEnabled: true,
    selectedVoice: null,
    currentState: JARVIS_STATE.IDLE,
    recognitionInstance: null,
    isListening: false,
    manualVoiceActivation: false,
    audioContext: null,
    analyser: null,
    microphoneStream: null,
    lastVoiceTrigger: 0
};

// ==============================================================================
// 1. Initialization & Boot Sequence
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeJarvis();
});

/**
 * Main App Initialization
 */
function initializeJarvis() {
    console.log("%c[JARVIS]%c Initializing Mark VII Neural System...", "color:#00f0ff;font-weight:bold", "color:#fff");

    // 1. Initialize DOM elements & Event listeners
    bindDOMElements();
    setupEventListeners();

    // 2. Initialize Clocks & System Metrics
    updateClock();
    setInterval(updateClock, 1000);
    initSystemTelemetry();

    // 3. Initialize Audio & Speech Recognition Systems
    initSpeechSynthesis();
    initSpeechRecognition();

    // 4. Initialize Visuals & Particle Canvases
    initAmbientParticles();
    initWaveformCanvas();
    initHologramCanvas();
    initReactorSparkCanvas();

    // 5. Load Saved Scratchpad & History
    loadSavedNotes();
    fetchBackendStatus();

    // 6. Set initial state
    setAssistantState(JARVIS_STATE.IDLE);
    addActivity("J.A.R.V.I.S Core MK VII Initialized", "success");
    addActivity("Audio & Speech Engines Ready", "info");
}

/**
 * Bind DOM references
 */
let DOM = {};
function bindDOMElements() {
    DOM = {
        // Reactor & Center
        arcReactor: document.getElementById('arcReactor'),
        reactorStateBadge: document.getElementById('reactorStateBadge'),
        reactorStateLabel: document.getElementById('reactorStateLabel'),
        reactorPrimaryPrompt: document.getElementById('reactorPrimaryPrompt'),
        reactorSecondaryPrompt: document.getElementById('reactorSecondaryPrompt'),
        reactorOutputText: document.getElementById('reactorOutputText'),
        masterMicBtn: document.getElementById('masterMicBtn'),
        masterMicIcon: document.getElementById('masterMicIcon'),
        masterMicLabel: document.getElementById('masterMicLabel'),
        aiModelBadge: document.getElementById('aiModelBadge'),

        // Voice Controller (Left)
        micStatusChip: document.getElementById('micStatusChip'),
        listeningIndicatorTag: document.getElementById('listeningIndicatorTag'),
        transcriptViewport: document.getElementById('transcriptViewport'),
        transcriptPlaceholder: document.getElementById('transcriptPlaceholder'),
        liveInterimText: document.getElementById('liveInterimText'),
        continuousListenSwitch: document.getElementById('continuousListenSwitch'),
        wakeWordSwitch: document.getElementById('wakeWordSwitch'),
        clearChatHistoryBtn: document.getElementById('clearChatHistoryBtn'),
        audioPeakIndicator: document.getElementById('audioPeakIndicator'),

        // Header
        liveClockTime: document.getElementById('liveClockTime'),
        liveClockDate: document.getElementById('liveClockDate'),
        systemStatusDot: document.getElementById('systemStatusDot'),
        systemStatusText: document.getElementById('systemStatusText'),
        networkPing: document.getElementById('networkPing'),
        voiceMuteToggleBtn: document.getElementById('voiceMuteToggleBtn'),
        voiceMuteIcon: document.getElementById('voiceMuteIcon'),
        systemRebootBtn: document.getElementById('systemRebootBtn'),

        // Right Panel (Telemetry & Apps)
        cpuGaugeRing: document.getElementById('cpuGaugeRing'),
        cpuGaugeVal: document.getElementById('cpuGaugeVal'),
        ramGaugeRing: document.getElementById('ramGaugeRing'),
        ramGaugeVal: document.getElementById('ramGaugeVal'),
        netGaugeRing: document.getElementById('netGaugeRing'),
        netGaugeVal: document.getElementById('netGaugeVal'),
        storageGaugeRing: document.getElementById('storageGaugeRing'),
        storageGaugeVal: document.getElementById('storageGaugeVal'),
        activityFeedList: document.getElementById('activityFeedList'),
        refreshActivityBtn: document.getElementById('refreshActivityBtn'),
        serverStatusChip: document.getElementById('serverStatusChip'),

        // Chat Viewport
        chatMessagesContainer: document.getElementById('chatMessagesContainer'),
        typingIndicatorBar: document.getElementById('typingIndicatorBar'),
        chatForm: document.getElementById('chatForm'),
        chatTextInput: document.getElementById('chatTextInput'),
        inputMicToggleBtn: document.getElementById('inputMicToggleBtn'),
        sendMsgBtn: document.getElementById('sendMsgBtn'),
        initialMsgTime: document.getElementById('initialMsgTime'),

        // Modals
        calculatorModal: document.getElementById('calculatorModal'),
        calcDisplay: document.getElementById('calcDisplay'),
        notepadModal: document.getElementById('notepadModal'),
        notepadTextarea: document.getElementById('notepadTextarea'),
        noteSaveStatus: document.getElementById('noteSaveStatus'),
        saveNoteBtn: document.getElementById('saveNoteBtn'),
        clearNoteBtn: document.getElementById('clearNoteBtn'),
        searchModal: document.getElementById('searchModal'),
        modalSearchInput: document.getElementById('modalSearchInput'),
        modalSearchExecBtn: document.getElementById('modalSearchExecBtn'),
        settingsModal: document.getElementById('settingsModal'),
        filesModal: document.getElementById('filesModal'),
        voiceSelect: document.getElementById('voiceSelect'),
        speechRateRange: document.getElementById('speechRateRange'),
        speechRateVal: document.getElementById('speechRateVal'),
        speechPitchRange: document.getElementById('speechPitchRange'),
        speechPitchVal: document.getElementById('speechPitchVal'),
        testVoiceBtn: document.getElementById('testVoiceBtn'),
        backendUrlInput: document.getElementById('backendUrlInput'),
    };

    if (DOM.initialMsgTime) {
        DOM.initialMsgTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

/**
 * Attach Event Listeners
 */
function setupEventListeners() {
    // 1. Arc Reactor Click & Master Mic Button
    if (DOM.arcReactor) {
        DOM.arcReactor.addEventListener('click', toggleListening);
    }
    if (DOM.masterMicBtn) {
        DOM.masterMicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleListening();
        });
    }
    if (DOM.inputMicToggleBtn) {
        DOM.inputMicToggleBtn.addEventListener('click', toggleListening);
    }

    // 2. Chat Form Submit
    if (DOM.chatForm) {
        DOM.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = DOM.chatTextInput.value.trim();
            if (text) {
                sendMessage(text);
                DOM.chatTextInput.value = '';
            }
        });
    }

    // 3. Quick Command Chips
    document.querySelectorAll('.cmd-chip-btn[data-command]').forEach(btn => {
        btn.addEventListener('click', () => {
            const command = btn.getAttribute('data-command');
            sendMessage(command);
        });
    });

    // 4. Quick Apps Hub Buttons
    document.getElementById('appBtnYouTube')?.addEventListener('click', () => handleToolAction('youtube'));
    document.getElementById('appBtnCalc')?.addEventListener('click', () => openModal('calculatorModal'));
    document.getElementById('appBtnNotepad')?.addEventListener('click', () => openModal('notepadModal'));
    document.getElementById('appBtnWeather')?.addEventListener('click', () => handleToolAction('weather'));
    document.getElementById('appBtnNews')?.addEventListener('click', () => handleToolAction('news'));
    document.getElementById('appBtnMaps')?.addEventListener('click', () => handleToolAction('maps'));
    document.getElementById('appBtnMusic')?.addEventListener('click', () => handleToolAction('music'));
    document.getElementById('appBtnMail')?.addEventListener('click', () => handleToolAction('mail'));

    // 5. Switches & Voice Settings
    DOM.continuousListenSwitch?.addEventListener('change', (e) => {
        AppConfig.continuousListening = e.target.checked;
        addActivity(`Continuous Listening: ${AppConfig.continuousListening ? 'ENABLED' : 'DISABLED'}`, 'info');
        if (AppConfig.continuousListening && !AppConfig.isListening) {
            startListening();
        }
    });

    DOM.wakeWordSwitch?.addEventListener('change', (e) => {
        AppConfig.wakeWordEnabled = e.target.checked;
        addActivity(`Wake-Word ("JARVIS"): ${AppConfig.wakeWordEnabled ? 'ENABLED' : 'DISABLED'}`, 'info');
    });

    DOM.clearChatHistoryBtn?.addEventListener('click', clearConversationHistory);
    DOM.refreshActivityBtn?.addEventListener('click', () => fetchBackendStatus(true));

    // 6. Audio / Voice Mute Toggle
    DOM.voiceMuteToggleBtn?.addEventListener('click', () => {
        AppConfig.voiceSynthesisEnabled = !AppConfig.voiceSynthesisEnabled;
        if (AppConfig.voiceSynthesisEnabled) {
            DOM.voiceMuteIcon.className = 'fa-solid fa-volume-high';
            addActivity("Voice Audio Output: ACTIVE", 'info');
        } else {
            DOM.voiceMuteIcon.className = 'fa-solid fa-volume-xmark';
            window.speechSynthesis?.cancel();
            addActivity("Voice Audio Output: MUTED", 'warning');
        }
    });

    // 7. System Reboot Simulation
    DOM.systemRebootBtn?.addEventListener('click', rebootJarvisSystem);

    // 8. Navigation Buttons
    document.getElementById('navHomeBtn')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.getElementById('navSystemBtn')?.addEventListener('click', () => triggerDiagnostics());
    document.getElementById('navMediaBtn')?.addEventListener('click', () => handleToolAction('music'));
    document.getElementById('navCenterReactorBtn')?.addEventListener('click', toggleListening);
    document.getElementById('navWebBtn')?.addEventListener('click', () => openModal('searchModal'));
    document.getElementById('navFilesBtn')?.addEventListener('click', () => openModal('filesModal'));
    document.getElementById('navSettingsBtn')?.addEventListener('click', () => openModal('settingsModal'));

    // 9. Modals Close Handlers
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const modalId = btn.getAttribute('data-modal');
            closeModal(modalId);
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('hud-modal')) {
            e.target.classList.remove('active');
        }
    });

    // 10. Calculator Logic
    setupCalculator();

    // 11. Notepad Actions
    DOM.saveNoteBtn?.addEventListener('click', saveNotes);
    DOM.clearNoteBtn?.addEventListener('click', clearNotes);

    // 12. Search Modal Action
    DOM.modalSearchExecBtn?.addEventListener('click', executeWebSearch);
    DOM.modalSearchInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeWebSearch();
    });

    // 13. Settings Handlers
    DOM.speechRateRange?.addEventListener('input', (e) => {
        AppConfig.speechRate = parseFloat(e.target.value);
        if (DOM.speechRateVal) DOM.speechRateVal.textContent = `${AppConfig.speechRate.toFixed(2)}x`;
    });

    DOM.speechPitchRange?.addEventListener('input', (e) => {
        AppConfig.speechPitch = parseFloat(e.target.value);
        if (DOM.speechPitchVal) DOM.speechPitchVal.textContent = AppConfig.speechPitch.toFixed(2);
    });

    DOM.voiceSelect?.addEventListener('change', (e) => {
        const voices = window.speechSynthesis.getVoices();
        AppConfig.selectedVoice = voices.find(v => v.name === e.target.value) || null;
    });

    DOM.testVoiceBtn?.addEventListener('click', () => {
        speakResponse("Good day, Sir. Audio synthesis calibration is operating within optimal parameters.");
    });

    DOM.backendUrlInput?.addEventListener('change', (e) => {
        AppConfig.backendUrl = e.target.value.replace(/\/$/, '');
        fetchBackendStatus(true);
    });
}

// ==============================================================================
// 2. State Machine & Arc Reactor Animation Management
// ==============================================================================

/**
 * Update global assistant state and trigger visual and auditory changes
 * @param {string} newState - 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'
 */
function setAssistantState(newState) {
    AppConfig.currentState = newState;
    console.log(`%c[STATE] ➔ ${newState}`, 'color:#00f0ff;font-weight:bold');

    if (!DOM.arcReactor) return;

    // Reset state classes
    DOM.arcReactor.className = 'arc-reactor';

    switch (newState) {
        case JARVIS_STATE.IDLE:
            DOM.arcReactor.classList.add('state-idle');
            updateBadge('IDLE • STANDBY', 'var(--cyan-core)', 'var(--cyan-core)');
            DOM.reactorPrimaryPrompt.textContent = "HOW CAN I HELP YOU, SIR?";
            DOM.reactorSecondaryPrompt.innerHTML = `<i class="fa-solid fa-headset"></i> Say <strong>"JARVIS"</strong> to activate, or press the button below`;
            DOM.masterMicBtn.classList.remove('active-listening');
            DOM.masterMicLabel.textContent = "VOICE COMMAND";
            DOM.masterMicIcon.className = "fa-solid fa-microphone";
            DOM.listeningIndicatorTag.textContent = "● IDLE";
            DOM.listeningIndicatorTag.style.color = "var(--text-muted)";
            DOM.micStatusChip.textContent = "MIC STANDBY";
            DOM.micStatusChip.className = "hud-chip";
            break;

        case JARVIS_STATE.LISTENING:
            DOM.arcReactor.classList.add('state-listening');
            updateBadge('LISTENING • AUDIO ACTIVE', '#00f0ff', '#00f0ff');
            DOM.reactorPrimaryPrompt.textContent = "I'M LISTENING, SIR...";
            DOM.reactorSecondaryPrompt.innerHTML = `<i class="fa-solid fa-wave-square"></i> Processing live acoustic transmission`;
            DOM.masterMicBtn.classList.add('active-listening');
            DOM.masterMicLabel.textContent = "LISTENING...";
            DOM.masterMicIcon.className = "fa-solid fa-microphone-lines";
            DOM.listeningIndicatorTag.textContent = "● LISTENING";
            DOM.listeningIndicatorTag.style.color = "var(--cyan-core)";
            DOM.micStatusChip.textContent = "MIC RECORDING";
            DOM.micStatusChip.className = "hud-chip chip-success";
            break;

        case JARVIS_STATE.PROCESSING:
            DOM.arcReactor.classList.add('state-processing');
            updateBadge('COMPUTING • GROQ AI', 'var(--gold-stark)', 'var(--gold-stark)');
            DOM.reactorPrimaryPrompt.textContent = "PROCESSING QUERY...";
            DOM.reactorSecondaryPrompt.innerHTML = `<i class="fa-solid fa-microchip"></i> Analyzing neural algorithms & synthetic reasoning`;
            DOM.masterMicBtn.classList.remove('active-listening');
            DOM.masterMicLabel.textContent = "PROCESSING...";
            DOM.masterMicIcon.className = "fa-solid fa-atom fa-spin";
            DOM.listeningIndicatorTag.textContent = "● COMPUTING";
            DOM.listeningIndicatorTag.style.color = "var(--gold-stark)";
            showLoading();
            break;

        case JARVIS_STATE.SPEAKING:
            DOM.arcReactor.classList.add('state-speaking');
            updateBadge('SPEAKING • HARMONIC VOCAL', 'var(--cyan-core)', 'var(--cyan-core)');
            DOM.reactorPrimaryPrompt.textContent = "TRANSMITTING RESPONSE";
            DOM.reactorSecondaryPrompt.innerHTML = `<i class="fa-solid fa-volume-high"></i> Synthesizing acoustic output`;
            DOM.masterMicBtn.classList.remove('active-listening');
            DOM.masterMicLabel.textContent = "SPEAKING...";
            DOM.masterMicIcon.className = "fa-solid fa-volume-high";
            DOM.listeningIndicatorTag.textContent = "● SPEAKING";
            DOM.listeningIndicatorTag.style.color = "var(--green-success)";
            hideLoading();
            break;

        case JARVIS_STATE.ERROR:
            DOM.arcReactor.classList.add('state-error');
            updateBadge('ERROR • SYSTEM ALERT', 'var(--red-alert)', 'var(--red-alert)');
            DOM.reactorPrimaryPrompt.textContent = "SYSTEM ANOMALY";
            DOM.reactorSecondaryPrompt.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Diagnostic discrepancy detected`;
            DOM.masterMicBtn.classList.remove('active-listening');
            DOM.listeningIndicatorTag.textContent = "● ALERT";
            DOM.listeningIndicatorTag.style.color = "var(--red-alert)";
            hideLoading();
            // Automatically recover back to IDLE after 3 seconds
            setTimeout(() => {
                if (AppConfig.currentState === JARVIS_STATE.ERROR) {
                    setAssistantState(JARVIS_STATE.IDLE);
                }
            }, 3000);
            break;
    }

    animateReactor();
}

function updateBadge(text, color, dotColor) {
    if (DOM.reactorStateLabel) DOM.reactorStateLabel.textContent = text;
    if (DOM.reactorStateBadge) {
        DOM.reactorStateBadge.style.borderColor = color;
        DOM.reactorStateBadge.style.color = color;
    }
    const dot = DOM.reactorStateBadge?.querySelector('.badge-dot');
    if (dot) {
        dot.style.background = dotColor;
        dot.style.boxShadow = `0 0 8px ${dotColor}`;
    }
}

/**
 * Animate the Reactor particles & pulse effects
 */
function animateReactor() {
    // Dynamic particle burst or energy ring speed modulation handled via CSS & Canvas
    if (DOM.reactorOutputText) {
        const outputs = {
            [JARVIS_STATE.IDLE]: "OUTPUT: 100% NOMINAL",
            [JARVIS_STATE.LISTENING]: "OUTPUT: 140% ACOUSTIC UPLINK",
            [JARVIS_STATE.PROCESSING]: "OUTPUT: 185% NEURAL LOAD",
            [JARVIS_STATE.SPEAKING]: "OUTPUT: 120% HARMONIC SYNC",
            [JARVIS_STATE.ERROR]: "OUTPUT: WARNING LEVEL 4"
        };
        DOM.reactorOutputText.textContent = outputs[AppConfig.currentState] || "OUTPUT: NOMINAL";
    }
}

function showLoading() {
    if (DOM.typingIndicatorBar) DOM.typingIndicatorBar.style.display = 'flex';
}

function hideLoading() {
    if (DOM.typingIndicatorBar) DOM.typingIndicatorBar.style.display = 'none';
}

// ==============================================================================
// 3. Web Speech API (Voice Recognition & Wake-Word)
// ==============================================================================

/**
 * Initialize Browser Speech Recognition
 */
function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        console.warn("[SpeechRecognition] Web Speech API not supported in this browser.");
        addActivity("SpeechRecognition not natively supported in browser", "warning");
        if (DOM.micStatusChip) DOM.micStatusChip.textContent = "MIC UNSUPPORTED";
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
        AppConfig.isListening = true;
        console.log("[SpeechRecognition] Service started.");
        if (AppConfig.currentState === JARVIS_STATE.IDLE) {
            setAssistantState(JARVIS_STATE.IDLE);
        }
    };

    recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcriptChunk = event.results[i][0].transcript.trim();
            if (!transcriptChunk) continue;

            if (event.results[i].isFinal) {
                finalTranscript += (finalTranscript ? ' ' : '') + transcriptChunk;
            } else {
                interimTranscript += (interimTranscript ? ' ' : '') + transcriptChunk;
            }
        }

        // Display interim text
        if (interimTranscript) {
            if (DOM.transcriptPlaceholder) DOM.transcriptPlaceholder.style.display = 'none';
            if (DOM.liveInterimText) DOM.liveInterimText.textContent = interimTranscript;
            
            // Peak indicator pulse
            if (DOM.audioPeakIndicator) {
                DOM.audioPeakIndicator.classList.add('active');
                setTimeout(() => DOM.audioPeakIndicator.classList.remove('active'), 200);
            }
        }

        // Process final speech command
        if (finalTranscript.trim()) {
            console.log("[SpeechRecognition] Final transcript:", finalTranscript);
            if (DOM.liveInterimText) DOM.liveInterimText.textContent = '';
            if (DOM.transcriptPlaceholder) {
                DOM.transcriptPlaceholder.style.display = 'block';
                DOM.transcriptPlaceholder.textContent = `Recognized: "${finalTranscript.trim()}"`;
            }

            handleVoiceCommand(finalTranscript.trim());
        }
    };

    recognition.onerror = (event) => {
        console.warn("[SpeechRecognition] Error:", event.error);
        if (event.error === 'not-allowed') {
            addActivity("Microphone permission denied by browser", "error");
            setAssistantState(JARVIS_STATE.ERROR);
            AppConfig.isListening = false;
        } else if (event.error !== 'no-speech') {
            addActivity(`Voice Error: ${event.error}`, "warning");
        }
    };

    recognition.onend = () => {
        console.log("[SpeechRecognition] Service ended.");
        AppConfig.isListening = false;
        
        // Auto-restart if continuous listening is enabled and not speaking/processing
        if (AppConfig.continuousListening && AppConfig.currentState !== JARVIS_STATE.SPEAKING) {
            setTimeout(() => {
                if (!AppConfig.isListening && AppConfig.continuousListening) {
                    try {
                        recognition.start();
                    } catch (e) {
                        // Already started or busy
                    }
                }
            }, 300);
        }
    };

    AppConfig.recognitionInstance = recognition;

    // Start listening on boot if enabled
    if (AppConfig.continuousListening) {
        startListening();
    }
}

/**
 * Start speech recognition
 */
function startListening(source = 'auto') {
    if (!AppConfig.recognitionInstance) return;

    AppConfig.manualVoiceActivation = source === 'manual';

    try {
        AppConfig.recognitionInstance.start();
        setAssistantState(JARVIS_STATE.LISTENING);
        addActivity("Voice Recognition Uplink ACTIVE", "info");
    } catch (e) {
        // Recognition already active or starting
        setAssistantState(JARVIS_STATE.LISTENING);
    }
}

/**
 * Stop speech recognition
 */
function stopListening() {
    if (!AppConfig.recognitionInstance) return;
    try {
        AppConfig.recognitionInstance.stop();
        AppConfig.isListening = false;
        AppConfig.manualVoiceActivation = false;
        setAssistantState(JARVIS_STATE.IDLE);
        addActivity("Voice Recognition Stopped", "info");
    } catch (e) {
        console.warn(e);
    }
}

/**
 * Toggle Microphone Listening
 */
function toggleListening() {
    if (AppConfig.currentState === JARVIS_STATE.LISTENING) {
        stopListening();
    } else {
        startListening('manual');
    }
}

/**
 * Handle Recognized Voice Command with Wake-Word Detection
 * @param {string} transcript - The raw text recognized from the microphone
 */
function handleVoiceCommand(transcript) {
    const cleanTranscript = transcript.trim();
    if (!cleanTranscript) return;

    const now = Date.now();
    if (now - AppConfig.lastVoiceTrigger < 1200) {
        console.log("[Voice] Ignored duplicate transcript:", cleanTranscript);
        return;
    }
    AppConfig.lastVoiceTrigger = now;

    const rawLower = cleanTranscript.toLowerCase();
    addActivity(`Voice Input: "${cleanTranscript}"`, 'info');

    let commandToProcess = cleanTranscript;
    let wakeWordDetected = false;

    if (AppConfig.wakeWordEnabled) {
        const wakeWordFound = rawLower.includes(AppConfig.wakeWord) || rawLower.includes("hey jarvis") || rawLower.includes("jarvis");

        if (wakeWordFound) {
            wakeWordDetected = true;
            commandToProcess = cleanTranscript
                .replace(/hey jarvis/gi, '')
                .replace(/\bjarvis\b/gi, '')
                .trim();

            if (!commandToProcess) {
                speakResponse("Yes, Sir? How may I assist you?");
                setAssistantState(JARVIS_STATE.LISTENING);
                return;
            }
        } else if (!AppConfig.manualVoiceActivation) {
            // Ignore background chatter while the assistant is on passive listening.
            console.log("[WakeWord] Filtered ambient audio:", cleanTranscript);
            return;
        }
    }

    if (AppConfig.wakeWordEnabled) {
        AppConfig.manualVoiceActivation = false;
    }

    // Process the cleaned command.
    sendMessage(commandToProcess, true);
}

// ==============================================================================
// 4. Speech Synthesis (JARVIS Voice Audio Output)
// ==============================================================================

/**
 * Initialize SpeechSynthesis and pick an optimal sophisticated English voice
 */
function initSpeechSynthesis() {
    if (!('speechSynthesis' in window)) {
        console.warn("[SpeechSynthesis] Not supported in this browser.");
        return;
    }

    const populateVoiceList = () => {
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return;

        if (DOM.voiceSelect) {
            DOM.voiceSelect.innerHTML = '';
            voices.forEach(voice => {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})${voice.default ? ' [DEFAULT]' : ''}`;
                option.value = voice.name;
                DOM.voiceSelect.appendChild(option);
            });
        }

        // Prefer sophisticated UK English Male or refined neutral voice for JARVIS persona
        const preferredVoices = [
            voices.find(v => v.name.includes("Google UK English Male")),
            voices.find(v => v.name.includes("Daniel") || v.name.includes("Oliver")),
            voices.find(v => v.name.includes("George") || v.name.includes("British")),
            voices.find(v => v.name.includes("Natural") && v.lang.startsWith("en")),
            voices.find(v => v.lang.startsWith("en-GB")),
            voices.find(v => v.lang.startsWith("en-US")),
            voices[0]
        ];

        AppConfig.selectedVoice = preferredVoices.find(Boolean) || voices[0];
        if (DOM.voiceSelect && AppConfig.selectedVoice) {
            DOM.voiceSelect.value = AppConfig.selectedVoice.name;
        }
    };

    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}

/**
 * Speak text response aloud using SpeechSynthesis with Arc Reactor pulse sync
 * @param {string} text - Message to speak aloud
 * @param {Function} callback - Optional callback on completion
 */
function speakResponse(text, callback) {
    if (!AppConfig.voiceSynthesisEnabled || !('speechSynthesis' in window)) {
        if (callback) callback();
        return;
    }

    // Strip markdown formatting and emojis for cleaner speech
    const cleanSpeech = text
        .replace(/[*_#`~]/g, '')
        .replace(/https?:\/\/\S+/g, 'link')
        .replace(/[\u{1F600}-\u{1F6FF}]/gu, '');

    window.speechSynthesis.cancel(); // Stop any pending speech

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    if (AppConfig.selectedVoice) utterance.voice = AppConfig.selectedVoice;
    utterance.rate = AppConfig.speechRate;
    utterance.pitch = AppConfig.speechPitch;

    utterance.onstart = () => {
        setAssistantState(JARVIS_STATE.SPEAKING);
    };

    utterance.onend = () => {
        console.log("[SpeechSynthesis] Finished speaking.");
        setAssistantState(JARVIS_STATE.IDLE);
        if (callback) callback();
        // If continuous listening is enabled, resume listening
        if (AppConfig.continuousListening && !AppConfig.isListening) {
            setTimeout(startListening, 400);
        }
    };

    utterance.onerror = (e) => {
        console.warn("[SpeechSynthesis] Error:", e);
        setAssistantState(JARVIS_STATE.IDLE);
        if (callback) callback();
    };

    window.speechSynthesis.speak(utterance);
}

// ==============================================================================
// 5. Message Handling & Backend Communication (Groq API)
// ==============================================================================

/**
 * Handle submission of a user command
 * @param {string} text - Command text
 * @param {boolean} isVoice - True if command originated from voice
 */
async function sendMessage(text, isVoice = false) {
    if (!text || !text.trim()) return;

    const query = text.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Display User Message in Feed
    displayMessage('user', query, now);

    // 2. Check for immediate local browser safe commands
    const localHandled = handleLocalCommand(query);
    if (localHandled) return;

    // 3. Send to Django Backend / Groq AI
    setAssistantState(JARVIS_STATE.PROCESSING);
    
    try {
        const data = await sendToBackend(query, isVoice);
        handleBackendResponse(data);
    } catch (err) {
        console.error("[Backend Error]", err);
        addActivity(`Connection error: ${err.message}`, 'error');
        
        // Graceful offline fallback
        const fallbackReply = generateOfflineResponse(query);
        displayMessage('jarvis', fallbackReply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        speakResponse(fallbackReply);
    }
}

/**
 * Send HTTP request to Django /api/chat/
 * @param {string} message - User query
 * @param {boolean} isVoice - Voice flag
 */
async function sendToBackend(message, isVoice = false) {
    const endpoint = `${AppConfig.backendUrl}/api/chat/`;
    
    // Gather last few messages as conversation history context
    const historyNodes = document.querySelectorAll('.chat-message');
    const history = [];
    historyNodes.forEach(node => {
        const isUser = node.classList.contains('message-user');
        const content = node.querySelector('.msg-content')?.textContent?.trim();
        if (content) {
            history.push({
                sender: isUser ? 'user' : 'jarvis',
                message: content
            });
        }
    });

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: message,
            is_voice: isVoice,
            history: history.slice(-6)
        })
    });

    if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || `HTTP ${response.status}: Failed to communicate with core`);
    }

    return await response.json();
}

/**
 * Handle returned response from Django Backend
 * @param {Object} data - Payload containing { success, reply, timestamp, response_time, action, action_data }
 */
function handleBackendResponse(data) {
    const replyText = data.reply || "Sir, I have processed your request.";
    const timeStr = data.timestamp 
        ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Display JARVIS message in feed
    displayMessage('jarvis', replyText, timeStr, data.response_time, data.model);

    // Check for special action triggers (e.g. open youtube, open calculator)
    if (data.action) {
        executeSpecialAction(data.action, data.action_data);
    }

    // Speak aloud response and sync with Arc Reactor
    speakResponse(replyText);

    // Update AI Model Badge if present
    if (data.model && DOM.aiModelBadge) {
        DOM.aiModelBadge.textContent = `AI MODEL: ${data.model.toUpperCase()}`;
    }
}

/**
 * Render message inside the chat scrolling feed
 */
function displayMessage(sender, text, timestamp, responseTime = null, model = null) {
    if (!DOM.chatMessagesContainer) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message message-${sender} message-enter`;

    const isUser = sender === 'user';
    const avatarIcon = isUser ? 'fa-user-ninja' : 'fa-atom';
    const authorName = isUser ? 'SIR' : 'J.A.R.V.I.S';
    const tagText = isUser ? 'TRANSMISSION' : (responseTime ? `⚡ ${responseTime}s` : 'SYSTEM READY');

    msgDiv.innerHTML = `
        <div class="msg-avatar-wrapper">
            <div class="msg-avatar ${isUser ? 'user-avatar' : 'jarvis-avatar'}">
                <i class="fa-solid ${avatarIcon}"></i>
            </div>
        </div>
        <div class="msg-body">
            <div class="msg-meta">
                <span class="msg-author">${authorName}</span>
                <span class="msg-time">${timestamp}</span>
                <span class="msg-tag">${tagText}</span>
            </div>
            <div class="msg-content">${formatMessageText(text)}</div>
            ${!isUser ? `
                <div class="msg-actions">
                    <button class="msg-action-btn speak-msg-btn" title="Speak response aloud">
                        <i class="fa-solid fa-volume-high"></i> Listen
                    </button>
                    <button class="msg-action-btn copy-msg-btn" title="Copy to clipboard">
                        <i class="fa-solid fa-copy"></i> Copy
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    // Action button listeners
    if (!isUser) {
        const speakBtn = msgDiv.querySelector('.speak-msg-btn');
        speakBtn?.addEventListener('click', () => speakResponse(text));

        const copyBtn = msgDiv.querySelector('.copy-msg-btn');
        copyBtn?.addEventListener('click', () => {
            navigator.clipboard.writeText(text);
            copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
            setTimeout(() => {
                copyBtn.innerHTML = `<i class="fa-solid fa-copy"></i> Copy`;
            }, 2000);
        });
    }

    DOM.chatMessagesContainer.appendChild(msgDiv);
    DOM.chatMessagesContainer.scrollTop = DOM.chatMessagesContainer.scrollHeight;
}

/**
 * Simple text formatting for links and linebreaks
 */
function formatMessageText(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br>')
        .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:var(--cyan-core);text-decoration:underline;">$1</a>');
}

// ==============================================================================
// 6. Local Command Execution & Subsystem Triggers
// ==============================================================================

/**
 * Check and execute safe local browser commands
 * @param {string} query - Raw user query
 * @returns {boolean} - True if handled locally
 */
function handleLocalCommand(query) {
    const q = query.toLowerCase().trim();

    // 1. Time / Date query
    if (q === "what time is it" || q === "what is the time" || q === "time" || q === "current time" || q === "what's the time") {
        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
        const reply = `The current time is ${nowStr}, on ${dateStr}, Sir.`;
        
        displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        speakResponse(reply);
        return true;
    }

    // 2. Clear conversation
    if (q.includes("clear conversation") || q.includes("clear chat") || q.includes("clear history") || q.includes("reset chat")) {
        clearConversationHistory();
        return true;
    }

    // 3. Stop listening / Mute
    if (q === "stop listening" || q === "mute microphone" || q === "stop mic") {
        stopListening();
        speakResponse("Microphone uplink deactivated, Sir.");
        return true;
    }

    // 4. Open YouTube
    if (q === "open youtube" || q === "launch youtube") {
        const reply = "Opening YouTube in a new tab for you, Sir.";
        displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        speakResponse(reply, () => {
            window.open('https://www.youtube.com', '_blank');
        });
        return true;
    }

    // 5. Open Calculator
    if (q === "open calculator" || q === "launch calculator" || q === "calculator") {
        const reply = "Opening the Quantum Calculator interface, Sir.";
        displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        openModal('calculatorModal');
        speakResponse(reply);
        return true;
    }

    // 6. Open Files / Archives
    if (q === "open files" || q === "open file" || q === "view files" || q === "archives") {
        const reply = "Accessing Stark Arc Data Archives, Sir.";
        displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        openModal('filesModal');
        speakResponse(reply);
        return true;
    }

    // 7. System status / Diagnostics
    if (q === "system status" || q === "diagnostics" || q === "run diagnostics") {
        triggerDiagnostics();
        return true;
    }

    // 8. Search web shortcut
    if (q.startsWith("search the web for") || q.startsWith("search web for") || q.startsWith("google ")) {
        const term = query.replace(/search the web for/i, '').replace(/search web for/i, '').replace(/google /i, '').trim();
        if (term) {
            const reply = `Searching the web for "${term}", Sir.`;
            displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            speakResponse(reply, () => {
                window.open(`https://www.google.com/search?q=${encodeURIComponent(term)}`, '_blank');
            });
            return true;
        }
    }

    return false;
}

/**
 * Execute special action triggers provided by backend
 */
function executeSpecialAction(action, actionData) {
    if (action === 'open_url' && actionData?.url) {
        window.open(actionData.url, '_blank');
    } else if (action === 'web_search' && actionData?.url) {
        window.open(actionData.url, '_blank');
    } else if (action === 'open_tool' && actionData?.tool) {
        if (actionData.tool === 'calculator') openModal('calculatorModal');
        if (actionData.tool === 'files') openModal('filesModal');
        if (actionData.tool === 'weather') handleToolAction('weather');
    }
}

/**
 * Handle Quick Apps Launchers
 */
function handleToolAction(tool) {
    switch (tool) {
        case 'youtube':
            window.open('https://www.youtube.com', '_blank');
            speakResponse("Launching YouTube in a new window, Sir.");
            break;
        case 'weather':
            const weatherMsg = "Atmospheric conditions nominal: 22°C (72°F), Clear skies with mild localized barometric variation.";
            displayMessage('jarvis', weatherMsg, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
            speakResponse(weatherMsg);
            break;
        case 'news':
            window.open('https://news.google.com', '_blank');
            speakResponse("Opening Stark Global News Feed, Sir.");
            break;
        case 'maps':
            window.open('https://www.google.com/maps', '_blank');
            speakResponse("Accessing Global Satellite Mapping array, Sir.");
            break;
        case 'music':
            window.open('https://music.youtube.com', '_blank');
            speakResponse("Accessing audio stream frequency, Sir.");
            break;
        case 'mail':
            window.open('https://mail.google.com', '_blank');
            speakResponse("Accessing encrypted communications, Sir.");
            break;
    }
}

/**
 * System Diagnostics Sequence
 */
function triggerDiagnostics() {
    setAssistantState(JARVIS_STATE.PROCESSING);
    addActivity("Running Full System Diagnostics", "info");

    setTimeout(() => {
        const reply = "All Mark VII systems are functioning within optimal tolerances, Sir. Core Arc Reactor temperature is 10,000 Kelvin, power distribution is nominal, and neural latency is 24 milliseconds.";
        displayMessage('jarvis', reply, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        speakResponse(reply);
        fetchBackendStatus(true);
    }, 600);
}

/**
 * Clear Chat History on Frontend and Backend
 */
async function clearConversationHistory() {
    if (DOM.chatMessagesContainer) {
        DOM.chatMessagesContainer.innerHTML = '';
    }

    const resetMsg = "Sir, all conversation logs have been securely cleared from active memory archives.";
    displayMessage('jarvis', resetMsg, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    speakResponse(resetMsg);
    addActivity("Conversation Memory Cleared", "info");

    try {
        await fetch(`${AppConfig.backendUrl}/api/history/clear/`, { method: 'POST' });
    } catch (e) {
        // Backend might be offline
    }
}

/**
 * Offline Heuristic Fallback Responses
 */
function generateOfflineResponse(query) {
    const q = query.toLowerCase();
    if (q.includes("joke")) {
        return "Why did Tony Stark never use standard algorithms? Because quantum supercomputers don't accept half-measures, Sir.";
    }
    if (q.includes("who are you") || q.includes("what are you")) {
        return "I am J.A.R.V.I.S — Just A Rather Very Intelligent System. I oversee Mr. Stark's diagnostics and command subsystems.";
    }
    return `I received your command: "${query}", Sir. Core network communication to Groq API is offline or key is missing in jarvis_backend/.env, but local subsystems remain fully responsive.`;
}

// ==============================================================================
// 7. Telemetry, Clocks, & Activity Feed
// ==============================================================================

/**
 * Dynamic Clock and Date Update
 */
function updateClock() {
    const now = new Date();
    
    // Time: HH:MM:SS
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    if (DOM.liveClockTime) DOM.liveClockTime.textContent = timeStr;

    // Date: DAY, MONTH DD, YYYY
    const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase();
    if (DOM.liveClockDate) DOM.liveClockDate.textContent = dateStr;
}

/**
 * Fetch Backend Status and Telemetry Metrics
 */
async function fetchBackendStatus(isUserTriggered = false) {
    try {
        const res = await fetch(`${AppConfig.backendUrl}/api/status/`);
        if (res.ok) {
            const data = await res.json();
            if (DOM.systemStatusText) DOM.systemStatusText.textContent = "ONLINE";
            if (DOM.systemStatusDot) DOM.systemStatusDot.style.backgroundColor = "var(--green-success)";
            if (DOM.serverStatusChip) {
                DOM.serverStatusChip.textContent = "CORE ONLINE";
                DOM.serverStatusChip.className = "hud-chip chip-success";
            }

            if (data.metrics) {
                updateTelemetryGauges(data.metrics);
            }

            if (isUserTriggered) {
                addActivity(`Telemetry Synchronized: CPU ${data.metrics?.cpu_percent || 24}%`, 'success');
            }
        }
    } catch (e) {
        if (DOM.serverStatusChip) {
            DOM.serverStatusChip.textContent = "OFFLINE MODE";
            DOM.serverStatusChip.className = "hud-chip";
        }
        // Fallback simulated metrics
        simulateTelemetryOscillation();
    }
}

/**
 * Initialize Gauges and Telemetry Loop
 */
function initSystemTelemetry() {
    setInterval(() => {
        fetchBackendStatus(false);
    }, 5000);
}

/**
 * Update Circular SVG Gauges
 */
function updateTelemetryGauges(metrics) {
    const cpu = metrics.cpu_percent || 24;
    const ram = metrics.memory_percent || 48;
    const net = Math.min(100, Math.round((metrics.bytes_recv_mb || 50) % 100));
    const storage = metrics.disk_percent || 55;

    setGaugePercent(DOM.cpuGaugeRing, DOM.cpuGaugeVal, cpu);
    setGaugePercent(DOM.ramGaugeRing, DOM.ramGaugeVal, ram);
    setGaugePercent(DOM.netGaugeRing, DOM.netGaugeVal, net);
    setGaugePercent(DOM.storageGaugeRing, DOM.storageGaugeVal, storage);
}

function simulateTelemetryOscillation() {
    const cpu = Math.floor(18 + Math.random() * 15);
    const ram = Math.floor(45 + Math.random() * 8);
    const net = Math.floor(85 + Math.random() * 12);
    const storage = 55;

    setGaugePercent(DOM.cpuGaugeRing, DOM.cpuGaugeVal, cpu);
    setGaugePercent(DOM.ramGaugeRing, DOM.ramGaugeVal, ram);
    setGaugePercent(DOM.netGaugeRing, DOM.netGaugeVal, net);
    setGaugePercent(DOM.storageGaugeRing, DOM.storageGaugeVal, storage);
}

function setGaugePercent(circleElement, valueElement, percent) {
    if (!circleElement || !valueElement) return;
    const clamped = Math.max(0, Math.min(100, percent));
    const circumference = 264;
    const offset = circumference - (clamped / 100) * circumference;
    circleElement.style.strokeDashoffset = offset;
    valueElement.textContent = `${clamped}%`;
}

/**
 * Add an event entry to the Recent Activity feed
 * @param {string} eventText - Description
 * @param {string} severity - 'info' | 'success' | 'warning' | 'error'
 */
function addActivity(eventText, severity = 'info') {
    if (!DOM.activityFeedList) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const item = document.createElement('div');
    item.className = `activity-item ${severity}`;
    item.innerHTML = `
        <span class="activity-time">${timeStr}</span>
        <span class="activity-text">${eventText}</span>
    `;

    DOM.activityFeedList.insertBefore(item, DOM.activityFeedList.firstChild);
    
    // Keep max 25 items
    while (DOM.activityFeedList.children.length > 25) {
        DOM.activityFeedList.removeChild(DOM.activityFeedList.lastChild);
    }
}

/**
 * Reboot JARVIS Simulation
 */
function rebootJarvisSystem() {
    addActivity("SYSTEM REBOOT INITIATED", "warning");
    setAssistantState(JARVIS_STATE.ERROR);
    
    setTimeout(() => {
        initializeJarvis();
        speakResponse("Reboot sequence complete, Sir. All systems recalibrated and operating at 100% capacity.");
    }, 1200);
}

// ==============================================================================
// 8. Visual & Canvas Engines (Waveform, Hologram, Ambient Particles, Sparks)
// ==============================================================================

/**
 * Audio Waveform Visualizer Canvas
 */
function initWaveformCanvas() {
    const canvas = document.getElementById('waveformCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    function renderWaveform() {
        requestAnimationFrame(renderWaveform);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isListening = AppConfig.currentState === JARVIS_STATE.LISTENING;
        const isSpeaking = AppConfig.currentState === JARVIS_STATE.SPEAKING;
        const isProcessing = AppConfig.currentState === JARVIS_STATE.PROCESSING;

        const numBars = 32;
        const barWidth = canvas.width / numBars - 2;
        const centerY = canvas.height / 2;

        // 1. Draw animated bars
        for (let i = 0; i < numBars; i++) {
            let amp = 6;
            if (isListening || isSpeaking) {
                amp = Math.sin(phase + i * 0.4) * 28 + Math.cos(phase * 1.5 + i * 0.2) * 18 + 20;
            } else if (isProcessing) {
                amp = Math.abs(Math.sin(phase * 3 + i * 0.6)) * 35 + 8;
            } else {
                amp = Math.sin(phase + i * 0.3) * 5 + 8;
            }

            const x = i * (barWidth + 2);
            const y = centerY - amp / 2;

            ctx.fillStyle = isListening ? 'rgba(0, 240, 255, 0.85)' : (isProcessing ? 'rgba(255, 170, 0, 0.85)' : 'rgba(0, 119, 254, 0.65)');
            ctx.shadowBlur = isListening || isSpeaking ? 8 : 2;
            ctx.shadowColor = isListening ? '#00f0ff' : '#0077fe';
            ctx.fillRect(x, y, barWidth, amp);
        }

        // 2. Draw smooth central sine wave
        ctx.beginPath();
        ctx.strokeStyle = isListening ? '#00f0ff' : '#ffffff';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f0ff';

        for (let x = 0; x < canvas.width; x++) {
            const freq = (isListening || isSpeaking) ? 0.04 : 0.02;
            const amp = (isListening || isSpeaking) ? 14 : 4;
            const y = centerY + Math.sin(x * freq + phase * 2) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += (isListening || isSpeaking) ? 0.08 : 0.03;
    }

    renderWaveform();
}

/**
 * 3D Holographic AI Core Matrix Canvas
 */
function initHologramCanvas() {
    const canvas = document.getElementById('hologramCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    const numNodes = 16;
    const radius = 38;

    function renderHologram() {
        requestAnimationFrame(renderHologram);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Draw outer holographic rotating ellipses
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius + 15, (radius + 15) * 0.35, angle, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radius + 8, (radius + 8) * 0.45, -angle * 1.3, 0, Math.PI * 2);
        ctx.stroke();

        // Draw rotating 3D spherical nodes
        const nodes = [];
        for (let i = 0; i < numNodes; i++) {
            const theta = (i / numNodes) * Math.PI * 2 + angle;
            const phi = Math.sin(theta * 2 + angle) * 0.6;

            const x = centerX + radius * Math.cos(theta);
            const y = centerY + radius * Math.sin(theta) * Math.sin(phi);
            const z = Math.sin(theta) * Math.cos(phi);

            nodes.push({ x, y, z });

            const scale = (z + 1.5) / 2.5;
            ctx.fillStyle = z > 0 ? '#00f0ff' : 'rgba(0, 119, 254, 0.5)';
            ctx.beginPath();
            ctx.arc(x, y, 2.5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw wireframe interconnecting lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
                if (dist < 35) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        angle += 0.02;
    }

    renderHologram();
}

/**
 * Ambient Dust Particles Canvas
 */
function initAmbientParticles() {
    const canvas = document.getElementById('ambientParticleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const count = 45;

    for (let i = 0; i < count; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 2 + 0.5,
            alpha: Math.random() * 0.5 + 0.1
        });
    }

    function renderParticles() {
        requestAnimationFrame(renderParticles);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.fillStyle = `rgba(0, 240, 255, ${p.alpha})`;
            ctx.shadowBlur = 4;
            ctx.shadowColor = '#00f0ff';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    renderParticles();
}

/**
 * Reactor Dynamic Sparks & Ray Burst Canvas
 */
function initReactorSparkCanvas() {
    const canvas = document.getElementById('reactorSparkCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    let sparkPhase = 0;

    function renderSparks() {
        requestAnimationFrame(renderSparks);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const isIntense = AppConfig.currentState === JARVIS_STATE.PROCESSING || AppConfig.currentState === JARVIS_STATE.LISTENING;
        const rayCount = isIntense ? 12 : 6;

        for (let i = 0; i < rayCount; i++) {
            const angle = (i / rayCount) * Math.PI * 2 + sparkPhase;
            const length = 110 + Math.sin(sparkPhase * 3 + i) * (isIntense ? 30 : 10);

            const x2 = centerX + Math.cos(angle) * length;
            const y2 = centerY + Math.sin(angle) * length;

            ctx.strokeStyle = isIntense ? 'rgba(0, 240, 255, 0.4)' : 'rgba(0, 240, 255, 0.15)';
            ctx.lineWidth = isIntense ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }

        sparkPhase += isIntense ? 0.04 : 0.01;
    }

    renderSparks();
}

// ==============================================================================
// 9. Built-in Tools & Modals (Calculator, Scratchpad, Search)
// ==============================================================================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

/**
 * Calculator Engine
 */
function setupCalculator() {
    let currentInput = "0";
    const display = DOM.calcDisplay;

    document.querySelectorAll('.calc-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const val = btn.getAttribute('data-val');

            if (val === 'C') {
                currentInput = "0";
            } else if (val === 'CE') {
                currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
            } else if (val === '=') {
                try {
                    // Safe basic evaluation
                    const sanitized = currentInput.replace(/[^0-9+\-*/.%]/g, '');
                    currentInput = String(eval(sanitized) || 0);
                } catch {
                    currentInput = "ERROR";
                }
            } else if (val === 'sqrt') {
                try {
                    const num = parseFloat(currentInput);
                    currentInput = String(Math.sqrt(num));
                } catch {
                    currentInput = "ERROR";
                }
            } else {
                if (currentInput === "0" && val !== '.') {
                    currentInput = val;
                } else {
                    currentInput += val;
                }
            }

            if (display) display.textContent = currentInput;
        });
    });
}

/**
 * Scratchpad Storage
 */
function loadSavedNotes() {
    const saved = localStorage.getItem('jarvis_stark_notes');
    if (saved && DOM.notepadTextarea) {
        DOM.notepadTextarea.value = saved;
    }
}

function saveNotes() {
    if (!DOM.notepadTextarea) return;
    localStorage.setItem('jarvis_stark_notes', DOM.notepadTextarea.value);
    if (DOM.noteSaveStatus) {
        DOM.noteSaveStatus.textContent = "Saved to local memory matrix (" + new Date().toLocaleTimeString() + ")";
    }
    addActivity("Scratchpad Notes Persisted", "success");
}

function clearNotes() {
    if (DOM.notepadTextarea) DOM.notepadTextarea.value = '';
    localStorage.removeItem('jarvis_stark_notes');
    if (DOM.noteSaveStatus) DOM.noteSaveStatus.textContent = "Scratchpad cleared";
}

/**
 * Web Search Modal Action
 */
function executeWebSearch() {
    const query = DOM.modalSearchInput?.value?.trim();
    if (!query) return;

    const engine = document.querySelector('input[name="searchEngine"]:checked')?.value || 'google';
    let url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

    if (engine === 'duckduckgo') url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
    if (engine === 'bing') url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    if (engine === 'youtube') url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

    window.open(url, '_blank');
    closeModal('searchModal');
    speakResponse(`Executing web search for ${query}, Sir.`);
}
