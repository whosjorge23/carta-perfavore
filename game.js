/**
 * Game Core Logic
 */

const COUNTRIES = ["Arstotzka", "Kolechia", "Antegria", "Impor", "Obristan", "Republia", "United Federation"];
const COMPANIES = ["Grestin Steel", "MOL Works", "Civic Rail", "Saint Marmero Depot"];

const AVATAR_PROFILES = [
    { skin: "#f2d0b1", hair: "#3c2517", shirt: "#4b6f8f", bg: "#8a9d7a" },
    { skin: "#c89163", hair: "#231b16", shirt: "#6f5b8f", bg: "#8694b0" },
    { skin: "#e7bf90", hair: "#704620", shirt: "#7a4f42", bg: "#9f8b77" },
    { skin: "#8f5f3d", hair: "#121212", shirt: "#2f5c54", bg: "#7f8a67" },
    { skin: "#d8ab7a", hair: "#764f2c", shirt: "#324f78", bg: "#9c9273" },
    { skin: "#ab7750", hair: "#221913", shirt: "#73423a", bg: "#83918a" },
    { skin: "#f0c5a2", hair: "#5e3320", shirt: "#3a6872", bg: "#a69878" }
];

function encodeSVG(svg) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function createAvatarImage(profile, variant = "doc") {
    const scale = variant === "booth" ? 1.2 : 1;
    const eyeY = variant === "booth" ? 97 : 103;
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="220" viewBox="0 0 180 220">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${profile.bg}"/>
      <stop offset="1" stop-color="#5d4935"/>
    </linearGradient>
  </defs>
  <rect width="180" height="220" fill="url(#bg)"/>
  <ellipse cx="90" cy="216" rx="84" ry="54" fill="${profile.shirt}"/>
  <path d="M48 109 C48 58, 132 58, 132 109 L132 129 C132 164, 48 164, 48 129 Z" fill="${profile.skin}"/>
  <path d="M38 90 C39 50, 72 30, 103 36 C133 42, 143 67, 142 96 L131 93 C126 69, 112 58, 90 58 C69 58, 53 73, 48 96 Z" fill="${profile.hair}"/>
  <ellipse cx="70" cy="${eyeY}" rx="4" ry="4" fill="#1f1a16"/>
  <ellipse cx="110" cy="${eyeY}" rx="4" ry="4" fill="#1f1a16"/>
  <path d="M74 131 C84 138, 96 138, 106 131" fill="none" stroke="#4a3020" stroke-width="3" stroke-linecap="round"/>
  <rect x="72" y="145" width="36" height="20" rx="8" fill="${profile.skin}"/>
  <rect x="58" y="163" width="64" height="57" fill="${profile.shirt}"/>
  <rect x="78" y="164" width="24" height="57" fill="#f8f0e2" transform="scale(${scale},1)" transform-origin="90px 190px"/>
</svg>`;

    return encodeSVG(svg.trim());
}

class DocumentGenerator {
    static generateName() {
        const first = ["Jorji", "Sergiu", "Dimitri", "Mikhail", "Ivan", "Natalya", "Elena", "Ludmila"];
        const last = ["Costava", "Vuko", "Petrov", "Romanov", "Smirnov", "Ivanova", "Kuznetsov"];
        return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
    }

    static generateID() {
        const lengths = [6, 7, 7, 7, 8];
        const len = lengths[Math.floor(Math.random() * lengths.length)];
        return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
    }

    static generateDate(startYear, endYear) {
        const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }

    static addDoc(type, fields) {
        return { type, fields: { ...fields } };
    }

    static createTraveler(dayPolicy, wantedProfile) {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const name = this.generateName();
        const id = this.generateID();
        const dob = this.generateDate(1930, 1960);
        const expiry = this.generateDate(1982, 1985);
        const sex = Math.random() > 0.5 ? 'M' : 'F';
        const destination = Math.random() > 0.5 ? 'Grestin' : 'East Grestin';
        const purpose = Math.random() > 0.45 ? 'visit' : 'work';
        const duration = purpose === 'work' ? '6 months' : '14 days';

        let profileIndex = Math.floor(Math.random() * AVATAR_PROFILES.length);
        const isWanted = Math.random() < 0.2;
        if (isWanted) profileIndex = wantedProfile;

        const passport = {
            type: 'passport',
            country,
            name,
            id,
            dob,
            expiry,
            sex,
            profileIndex,
            photo: createAvatarImage(AVATAR_PROFILES[profileIndex], 'doc'),
            boothPhoto: createAvatarImage(AVATAR_PROFILES[profileIndex], 'booth')
        };

        const docs = [
            this.addDoc('passport', {
                NAME: name,
                ID: id,
                DOB: dob,
                SEX: sex,
                ISS: country,
                EXP: expiry
            })
        ];

        const isForeigner = country !== 'Arstotzka';
        if (!isForeigner || Math.random() > 0.1) {
            docs.push(this.addDoc('entry_permit', {
                NAME: name,
                ID: id,
                PURPOSE: purpose,
                DEST: destination,
                DURATION: duration
            }));
        }

        if (purpose === 'work' && Math.random() > 0.1) {
            docs.push(this.addDoc('work_pass', {
                NAME: name,
                ID: id,
                COMPANY: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
                UNTIL: this.generateDate(1982, 1983)
            }));
        }

        if (!dayPolicy.requireVaxCard || Math.random() > 0.15) {
            docs.push(this.addDoc('vax_card', {
                NAME: name,
                ID: id,
                VAX: 'POLIO',
                DOSE: '2/2'
            }));
        }

        const traveler = {
            document: passport,
            documents: docs,
            purpose,
            destination,
            isWanted,
            lieProfile: Math.random() < 0.4 ? 'evasive' : 'honest'
        };

        this.applyDiscrepancy(traveler, dayPolicy);
        return traveler;
    }

    static applyDiscrepancy(traveler, dayPolicy) {
        if (Math.random() < 0.45) return;

        const types = ['EXPIRED', 'NAME_MISMATCH', 'ID_MISMATCH', 'MISSING_PERMIT', 'MISSING_WORK_PASS', 'MISSING_VAX'];
        const type = types[Math.floor(Math.random() * types.length)];
        const docs = traveler.documents;
        const passportDoc = docs.find((d) => d.type === 'passport');

        switch (type) {
            case 'EXPIRED':
                traveler.document.expiry = '1981-01-01';
                passportDoc.fields.EXP = '1981-01-01';
                break;
            case 'NAME_MISMATCH': {
                const permit = docs.find((d) => d.type === 'entry_permit');
                if (permit) permit.fields.NAME = `NOT ${permit.fields.NAME}`;
                break;
            }
            case 'ID_MISMATCH': {
                const pass = docs.find((d) => d.type === 'work_pass') || docs.find((d) => d.type === 'vax_card');
                if (pass) pass.fields.ID = 'BAD-777';
                break;
            }
            case 'MISSING_PERMIT':
                traveler.documents = docs.filter((d) => d.type !== 'entry_permit');
                break;
            case 'MISSING_WORK_PASS':
                traveler.documents = docs.filter((d) => d.type !== 'work_pass');
                break;
            case 'MISSING_VAX':
                if (dayPolicy.requireVaxCard) {
                    traveler.documents = docs.filter((d) => d.type !== 'vax_card');
                }
                break;
        }
    }
}

class RuleEngine {
    constructor(gameDate) {
        this.ruleCatalog = {
            EXPIRY: { id: 'EXPIRY', description: 'Documents must not be expired', check: (passport, today) => new Date(passport.expiry) >= today },
            ID_FORMAT: { id: 'ID_FORMAT', description: 'ID must be exactly 7 characters', check: (passport) => passport.id.length === 7 },
            ARSTOTZKA_ONLY: { id: 'ARSTOTZKA_ONLY', description: 'Only Arstotzka citizens allowed', check: (passport) => passport.country === 'Arstotzka' },
            NO_UNITED_FEDERATION: { id: 'NO_UNITED_FEDERATION', description: 'No entry for United Federation citizens', check: (passport) => passport.country !== 'United Federation' },
            NO_KOLECHIA: { id: 'NO_KOLECHIA', description: 'No entry for Kolechia citizens', check: (passport) => passport.country !== 'Kolechia' },
            NO_OBRISTAN: { id: 'NO_OBRISTAN', description: 'No entry for Obristan citizens', check: (passport) => passport.country !== 'Obristan' },
            BORN_BEFORE_1965: { id: 'BORN_BEFORE_1965', description: 'Travelers must be born before 1965', check: (passport) => new Date(passport.dob).getFullYear() < 1965 },
            BORN_BEFORE_1955: { id: 'BORN_BEFORE_1955', description: 'Travelers must be born before 1955', check: (passport) => new Date(passport.dob).getFullYear() < 1955 },
            BORN_AFTER_1935: { id: 'BORN_AFTER_1935', description: 'Travelers must be born after 1935', check: (passport) => new Date(passport.dob).getFullYear() > 1935 }
        };

        this.currentRules = [];
        this.refreshRulesForDate(gameDate);
    }

    seededRandom(seed) {
        let s = seed >>> 0;
        return () => {
            s = (s + 0x6D2B79F5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    pickOne(list, rand) {
        return list[Math.floor(rand() * list.length)];
    }

    refreshRulesForDate(date) {
        const daySeed = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
        const rand = this.seededRandom(daySeed);
        const fixedRules = ['EXPIRY', 'ID_FORMAT'];
        const countryRule = this.pickOne(['ARSTOTZKA_ONLY', 'NO_UNITED_FEDERATION', 'NO_KOLECHIA', 'NO_OBRISTAN'], rand);
        const ageRule = this.pickOne(['BORN_BEFORE_1965', 'BORN_BEFORE_1955', 'BORN_AFTER_1935'], rand);
        this.currentRules = [...fixedRules, countryRule, ageRule].map((id) => this.ruleCatalog[id]);
    }

    validate(passport, today) {
        const violations = [];
        for (const rule of this.currentRules) {
            if (!rule.check(passport, today)) violations.push(rule.id);
        }
        return violations;
    }
}

class Game {
    constructor() {
        this.state = {
            credits: 50,
            date: new Date(1982, 10, 23),
            quotaMet: 0,
            quotaTotal: 5,
            citations: 0,
            earnedToday: 0,
            currentTraveler: null,
            isDayActive: false,
            wanted: { profileIndex: 0, name: 'UNKNOWN' },
            dayPolicy: { requireVaxCard: false }
        };

        this.rules = new RuleEngine(this.state.date);
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.prepareDay();
        this.updateUI();
        this.showBriefing();
    }

    cacheDOM() {
        this.dom = {
            credits: document.getElementById('game-credits'),
            date: document.getElementById('game-date'),
            quota: document.getElementById('game-quota'),
            desk: document.getElementById('document-drop-zone'),
            messageLog: document.getElementById('message-log'),
            stampApprove: document.getElementById('stamp-approve'),
            stampDeny: document.getElementById('stamp-deny'),
            rulebookBtn: document.getElementById('rulebook-btn'),
            rulebookOverlay: document.getElementById('rulebook-overlay'),
            rulesList: document.getElementById('rules-list'),
            closeRulebook: document.querySelector('#rulebook-overlay .close-btn'),
            summaryOverlay: document.getElementById('day-summary-overlay'),
            summaryCitations: document.getElementById('summary-citations'),
            summaryEarned: document.getElementById('summary-earned'),
            summaryBalance: document.getElementById('summary-balance'),
            nextDayBtn: document.getElementById('next-day-btn'),
            travelerVisual: document.querySelector('.avatar-placeholder'),
            wantedFace: document.getElementById('wanted-face'),
            wantedName: document.getElementById('wanted-name'),
            questionPurpose: document.getElementById('question-purpose'),
            questionDestination: document.getElementById('question-destination'),
            dialogueAnswer: document.getElementById('dialogue-answer'),
            briefingOverlay: document.getElementById('briefing-overlay'),
            briefingRules: document.getElementById('briefing-rules'),
            briefingWanted: document.getElementById('briefing-wanted'),
            startShiftBtn: document.getElementById('start-shift-btn')
        };
    }

    bindEvents() {
        this.dom.stampApprove.addEventListener('click', () => this.handleStamp('APPROVE'));
        this.dom.stampDeny.addEventListener('click', () => this.handleStamp('DENY'));
        this.dom.rulebookBtn.addEventListener('click', () => this.toggleRulebook(true));
        this.dom.closeRulebook.addEventListener('click', () => this.toggleRulebook(false));
        this.dom.nextDayBtn.addEventListener('click', () => this.nextDay());
        this.dom.questionPurpose.addEventListener('click', () => this.askQuestion('purpose'));
        this.dom.questionDestination.addEventListener('click', () => this.askQuestion('destination'));
        this.dom.startShiftBtn.addEventListener('click', () => this.startShift());

        this.dom.desk.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        window.addEventListener('pointerup', () => this.handlePointerUp());
        window.addEventListener('pointercancel', () => this.handlePointerUp());
    }

    seededRandom(seed) {
        let s = seed >>> 0;
        return () => {
            s = (s + 0x6D2B79F5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    prepareDay() {
        this.rules.refreshRulesForDate(this.state.date);
        const seed = Date.UTC(this.state.date.getFullYear(), this.state.date.getMonth(), this.state.date.getDate());
        const rand = this.seededRandom(seed);

        this.state.dayPolicy = {
            requireVaxCard: rand() > 0.5
        };

        this.state.wanted = {
            profileIndex: Math.floor(rand() * AVATAR_PROFILES.length),
            name: DocumentGenerator.generateName().toUpperCase()
        };

        const wantedImg = createAvatarImage(AVATAR_PROFILES[this.state.wanted.profileIndex], 'doc');
        this.dom.wantedFace.style.backgroundImage = `url("${wantedImg}")`;
        this.dom.wantedName.textContent = this.state.wanted.name;
    }

    showBriefing() {
        const briefLines = this.rules.currentRules.map((r) => `<li>${r.description}</li>`);
        if (this.state.dayPolicy.requireVaxCard) {
            briefLines.push('<li>Vaccination card required for all entrants</li>');
        }
        this.dom.briefingRules.innerHTML = briefLines.join('');
        this.dom.briefingWanted.textContent = `Wanted criminal face posted. Name on file: ${this.state.wanted.name}.`;
        this.dom.briefingOverlay.classList.remove('hidden');
    }

    startShift() {
        this.state.isDayActive = true;
        this.dom.briefingOverlay.classList.add('hidden');
        this.spawnTraveler();
        this.logMessage('Shift started. Watch for mismatched papers and wanted faces.');
    }

    askQuestion(kind) {
        if (!this.state.currentTraveler) return;
        const t = this.state.currentTraveler;

        let answer = '';
        if (kind === 'purpose') {
            answer = t.purpose === 'work' ? 'I come to work in Grestin.' : 'I visit for family and tourism.';
            if (t.lieProfile === 'evasive' && Math.random() > 0.55) answer = 'Uh... just visiting. Maybe work too. Not sure yet.';
        } else {
            answer = `I go to ${t.destination}.`;
            if (t.lieProfile === 'evasive' && Math.random() > 0.55) answer = 'East side... or maybe central. I forget name.';
        }

        this.dom.dialogueAnswer.textContent = answer;
        this.logMessage(`Traveler response: ${answer}`);
    }

    handleStamp(selection) {
        if (!this.state.currentTraveler || !this.state.isDayActive) return;

        const violations = this.validateTraveler(this.state.currentTraveler);
        const isActuallyValid = violations.length === 0;

        let result = '';
        if (selection === 'APPROVE') {
            if (isActuallyValid) {
                result = 'Correct. Entry allowed.';
                this.state.credits += 10;
                this.state.earnedToday += 10;
                this.state.quotaMet++;
            } else {
                result = `CITATION: Invalid traveler approved. ${violations.join(', ')}`;
                this.state.credits -= 15;
                this.state.citations++;
            }
        } else {
            if (!isActuallyValid) {
                result = 'Correct. Entry denied.';
                this.state.credits += 10;
                this.state.earnedToday += 10;
                this.state.quotaMet++;
            } else {
                result = 'CITATION: Traveler was valid. Entry should have been allowed.';
                this.state.credits -= 15;
                this.state.citations++;
            }
        }

        this.logMessage(result);
        this.updateUI();
        this.clearDesk();
        this.state.currentTraveler = null;
        this.dom.dialogueAnswer.textContent = 'Ask a question to hear the traveler answer.';

        if (this.state.quotaMet >= this.state.quotaTotal) {
            setTimeout(() => this.endDay(), 900);
        } else {
            setTimeout(() => this.spawnTraveler(), 900);
        }
    }

    validateTraveler(traveler) {
        const passport = traveler.document;
        const docs = traveler.documents;
        const violations = this.rules.validate(passport, this.state.date);

        const permit = docs.find((d) => d.type === 'entry_permit');
        const work = docs.find((d) => d.type === 'work_pass');
        const vax = docs.find((d) => d.type === 'vax_card');

        if (passport.country !== 'Arstotzka' && !permit) violations.push('MISSING_ENTRY_PERMIT');
        if (traveler.purpose === 'work' && !work) violations.push('MISSING_WORK_PASS');
        if (this.state.dayPolicy.requireVaxCard && !vax) violations.push('MISSING_VAX_CARD');
        if (traveler.isWanted) violations.push('WANTED_CRIMINAL');

        const nameSet = new Set();
        const idSet = new Set();
        for (const doc of docs) {
            if (doc.fields.NAME) nameSet.add(doc.fields.NAME);
            if (doc.fields.ID) idSet.add(doc.fields.ID);
        }
        if (nameSet.size > 1) violations.push('NAME_MISMATCH_DOCS');
        if (idSet.size > 1) violations.push('ID_MISMATCH_DOCS');

        return [...new Set(violations)];
    }

    logMessage(msg) {
        const p = document.createElement('p');
        p.textContent = `> ${msg}`;
        this.dom.messageLog.prepend(p);
    }

    updateUI() {
        this.dom.credits.textContent = this.state.credits;
        this.dom.date.textContent = this.formatDate(this.state.date);
        this.dom.quota.textContent = `${this.state.quotaMet}/${this.state.quotaTotal}`;
    }

    formatDate(date) {
        const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    activeDoc = null;
    offset = { x: 0, y: 0 };

    handlePointerDown(e) {
        const doc = e.target.closest('.document');
        if (!doc) return;

        e.preventDefault();
        this.activeDoc = doc;
        const rect = doc.getBoundingClientRect();
        this.offset.x = e.clientX - rect.left;
        this.offset.y = e.clientY - rect.top;
        doc.style.zIndex = 1000;
        if (typeof doc.setPointerCapture === 'function') doc.setPointerCapture(e.pointerId);
    }

    handlePointerMove(e) {
        if (!this.activeDoc) return;

        const deskRect = this.dom.desk.getBoundingClientRect();
        const x = e.clientX - deskRect.left - this.offset.x;
        const y = e.clientY - deskRect.top - this.offset.y;
        this.activeDoc.style.left = `${x}px`;
        this.activeDoc.style.top = `${y}px`;
    }

    handlePointerUp() {
        if (!this.activeDoc) return;
        this.activeDoc.style.zIndex = 10;
        this.activeDoc = null;
    }

    toggleRulebook(show) {
        if (show) {
            const rows = this.rules.currentRules.map((r) => `<li>${r.description}</li>`);
            if (this.state.dayPolicy.requireVaxCard) rows.push('<li>Vaccination card required for all entrants</li>');
            rows.push('<li>Deny wanted criminal face match</li>');
            this.dom.rulesList.innerHTML = rows.join('');
            this.dom.rulebookOverlay.classList.remove('hidden');
        } else {
            this.dom.rulebookOverlay.classList.add('hidden');
        }
    }

    endDay() {
        this.state.isDayActive = false;
        this.dom.summaryCitations.textContent = this.state.citations;
        this.dom.summaryEarned.textContent = this.state.earnedToday;

        const expenses = 25;
        const net = this.state.earnedToday - expenses;
        this.dom.summaryBalance.textContent = net;
        this.dom.summaryOverlay.classList.remove('hidden');
    }

    nextDay() {
        this.state.date.setDate(this.state.date.getDate() + 1);
        this.state.quotaMet = 0;
        this.state.citations = 0;
        this.state.earnedToday = 0;
        this.state.currentTraveler = null;
        this.clearDesk();
        this.dom.summaryOverlay.classList.add('hidden');

        this.prepareDay();
        this.updateUI();
        this.showBriefing();
    }

    clearDesk() {
        this.dom.desk.innerHTML = '';
    }

    spawnTraveler() {
        if (!this.state.isDayActive) return;

        this.logMessage('Next traveler approaching...');
        const traveler = DocumentGenerator.createTraveler(this.state.dayPolicy, this.state.wanted.profileIndex);
        this.state.currentTraveler = traveler;

        traveler.documents.forEach((doc, index) => {
            this.createDocument(doc.type, doc.fields, index);
        });

        this.dom.travelerVisual.style.backgroundImage =
            `linear-gradient(to top, rgba(25, 18, 12, 0.82), rgba(49, 36, 24, 0.44)), url("${traveler.document.boothPhoto}")`;
    }

    createDocument(type, fields, index) {
        const doc = document.createElement('div');
        doc.className = `document ${type}`;
        doc.style.left = `${60 + index * 34}px`;
        doc.style.top = `${84 + index * 16}px`;

        const titleMap = {
            passport: 'PASSPORT',
            entry_permit: 'ENTRY PERMIT',
            work_pass: 'WORK PASS',
            vax_card: 'VACCINATION CARD'
        };

        let topPhoto = '';
        if (type === 'passport') {
            topPhoto = `<div class="doc-photo"><img class="doc-photo-img" src="${this.state.currentTraveler.document.photo}" alt="Traveler portrait" draggable="false"></div>`;
        }

        const rows = Object.entries(fields)
            .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
            .join('');

        doc.innerHTML = `
            <div class="doc-header">${titleMap[type] || type.toUpperCase()}</div>
            <div class="doc-body">
                ${topPhoto}
                <div class="doc-info">${rows}</div>
            </div>
        `;

        this.dom.desk.appendChild(doc);
    }
}

window.game = new Game();
