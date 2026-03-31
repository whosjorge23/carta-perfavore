/**
 * Game Core Logic
 */

const COUNTRIES = ["Arstotzka", "Kolechia", "Antegria", "Impor", "Obristan", "Republia", "United Federation"];

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
    static generatePassport() {
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        const name = this.generateName();
        const id = this.generateID();
        const dob = this.generateDate(1930, 1960);
        const expiry = this.generateDate(1982, 1985);
        const sex = Math.random() > 0.5 ? 'M' : 'F';
        const profileIndex = Math.floor(Math.random() * AVATAR_PROFILES.length);

        return {
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
    }

    static generateName() {
        const first = ["Jorji", "Sergiu", "Dimitri", "Mikhail", "Ivan", "Natalya", "Elena", "Ludmila"];
        const last = ["Costava", "Vuko", "Petrov", "Romanov", "Smirnov", "Ivanova", "Kuznetsov"];
        return `${first[Math.floor(Math.random() * first.length)]} ${last[Math.floor(Math.random() * last.length)]}`;
    }

    static generateID() {
        // Randomly 6, 7 or 8 chars to test ID length rule
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

    static createDiscrepancy(doc, type) {
        const fake = { ...doc };
        switch (type) {
            case 'EXPIRED':
                fake.expiry = '1981-01-01';
                break;
            case 'NAME_MISMATCH':
                fake.name = "NOT " + fake.name;
                break;
            case 'ID_MISMATCH':
                fake.id = "FAKE-ID";
                break;
            case 'TOO_YOUNG':
                fake.dob = '1975-01-01';
                break;
            case 'SHORT_ID':
                fake.id = "ABC-12";
                break;
        }
        return fake;
    }
}

class RuleEngine {
    constructor(gameDate) {
        this.ruleCatalog = {
            EXPIRY: { id: 'EXPIRY', description: 'Documents must not be expired', check: (doc, today) => new Date(doc.expiry) >= today },
            ID_FORMAT: { id: 'ID_FORMAT', description: 'ID must be exactly 7 characters', check: (doc) => doc.id.length === 7 },
            ARSTOTZKA_ONLY: { id: 'ARSTOTZKA_ONLY', description: 'Only Arstotzka citizens allowed', check: (doc) => doc.country === 'Arstotzka' },
            NO_UNITED_FEDERATION: { id: 'NO_UNITED_FEDERATION', description: 'No entry for United Federation citizens', check: (doc) => doc.country !== 'United Federation' },
            NO_KOLECHIA: { id: 'NO_KOLECHIA', description: 'No entry for Kolechia citizens', check: (doc) => doc.country !== 'Kolechia' },
            NO_OBRISTAN: { id: 'NO_OBRISTAN', description: 'No entry for Obristan citizens', check: (doc) => doc.country !== 'Obristan' },
            BORN_BEFORE_1965: { id: 'BORN_BEFORE_1965', description: 'Travelers must be born before 1965', check: (doc) => new Date(doc.dob).getFullYear() < 1965 },
            BORN_BEFORE_1955: { id: 'BORN_BEFORE_1955', description: 'Travelers must be born before 1955', check: (doc) => new Date(doc.dob).getFullYear() < 1955 },
            BORN_AFTER_1935: { id: 'BORN_AFTER_1935', description: 'Travelers must be born after 1935', check: (doc) => new Date(doc.dob).getFullYear() > 1935 },
            SEX_M_ONLY: { id: 'SEX_M_ONLY', description: 'Only male travelers allowed today', check: (doc) => doc.sex === 'M' },
            SEX_F_ONLY: { id: 'SEX_F_ONLY', description: 'Only female travelers allowed today', check: (doc) => doc.sex === 'F' },
            ID_NO_DASH: { id: 'ID_NO_DASH', description: 'ID must not contain dashes', check: (doc) => !doc.id.includes('-') }
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
        const optionalSexRule = this.pickOne(['NONE', 'SEX_M_ONLY', 'SEX_F_ONLY'], rand);
        const optionalExtraRule = this.pickOne(['NONE', 'ID_NO_DASH'], rand);

        const selected = [...fixedRules, countryRule, ageRule];
        if (optionalSexRule !== 'NONE') selected.push(optionalSexRule);
        if (optionalExtraRule !== 'NONE') selected.push(optionalExtraRule);

        this.currentRules = selected.map((id) => this.ruleCatalog[id]);
    }

    validate(doc, today) {
        const violations = [];
        for (const rule of this.currentRules) {
            if (!rule.check(doc, today)) {
                violations.push(rule.id);
            }
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
            isDayActive: true
        };

        this.rules = new RuleEngine(this.state.date);
        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.updateUI();
        this.spawnTraveler();
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
            travelerVisual: document.querySelector('.avatar-placeholder')
        };
    }

    bindEvents() {
        this.dom.stampApprove.addEventListener('click', () => this.handleStamp('APPROVE'));
        this.dom.stampDeny.addEventListener('click', () => this.handleStamp('DENY'));

        this.dom.desk.addEventListener('pointerdown', (e) => this.handlePointerDown(e));
        window.addEventListener('pointermove', (e) => this.handlePointerMove(e));
        window.addEventListener('pointerup', () => this.handlePointerUp());
        window.addEventListener('pointercancel', () => this.handlePointerUp());

        this.dom.rulebookBtn.addEventListener('click', () => this.toggleRulebook(true));
        this.dom.closeRulebook.addEventListener('click', () => this.toggleRulebook(false));
        this.dom.nextDayBtn.addEventListener('click', () => this.nextDay());
    }

    handleStamp(selection) {
        if (!this.state.currentTraveler || !this.state.isDayActive) return;

        const doc = this.state.currentTraveler.document;
        const violations = this.rules.validate(doc, this.state.date);
        const isActuallyValid = violations.length === 0;

        let result = "";
        if (selection === 'APPROVE') {
            if (isActuallyValid) {
                result = "Correct. Entry allowed.";
                this.state.credits += 5;
                this.state.earnedToday += 5;
                this.state.quotaMet++;
            } else {
                result = `CITATION: Entry denied. Violation: ${violations.join(', ')}`;
                this.state.credits -= 10;
                this.state.citations++;
            }
        } else {
            if (!isActuallyValid) {
                result = "Correct. Entry denied.";
                this.state.credits += 5;
                this.state.earnedToday += 5;
                this.state.quotaMet++;
            } else {
                result = "CITATION: Traveler was valid. Entry should have been allowed.";
                this.state.credits -= 10;
                this.state.citations++;
            }
        }

        this.logMessage(result);
        this.updateUI();
        this.clearDesk();
        this.state.currentTraveler = null;

        if (this.state.quotaMet >= this.state.quotaTotal) {
            setTimeout(() => this.endDay(), 1000);
        } else {
            setTimeout(() => this.spawnTraveler(), 1500);
        }
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

    // --- Interaction ---

    activeDoc = null;
    offset = { x: 0, y: 0 };

    handlePointerDown(e) {
        const doc = e.target.closest('.document');
        if (doc) {
            e.preventDefault();
            this.activeDoc = doc;
            const rect = doc.getBoundingClientRect();
            this.offset.x = e.clientX - rect.left;
            this.offset.y = e.clientY - rect.top;
            doc.style.zIndex = 1000;
            if (typeof doc.setPointerCapture === 'function') {
                doc.setPointerCapture(e.pointerId);
            }
        }
    }

    handlePointerMove(e) {
        if (!this.activeDoc) return;

        const deskRect = this.dom.desk.getBoundingClientRect();
        let x = e.clientX - deskRect.left - this.offset.x;
        let y = e.clientY - deskRect.top - this.offset.y;

        this.activeDoc.style.left = `${x}px`;
        this.activeDoc.style.top = `${y}px`;
    }

    handlePointerUp() {
        if (this.activeDoc) {
            this.activeDoc.style.zIndex = 10;
            this.activeDoc = null;
        }
    }

    toggleRulebook(show) {
        if (show) {
            this.dom.rulesList.innerHTML = this.rules.currentRules.map(r => `<li>${r.description}</li>`).join('');
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
        this.state.isDayActive = true;
        this.rules.refreshRulesForDate(this.state.date);

        this.dom.summaryOverlay.classList.add('hidden');
        this.logMessage(`Daily bulletin updated. ${this.rules.currentRules.length} active rules.`);
        this.updateUI();
        this.spawnTraveler();
    }

    clearDesk() {
        this.dom.desk.innerHTML = '';
    }

    spawnTraveler() {
        this.logMessage("Next traveler approaching...");

        let docData = DocumentGenerator.generatePassport();

        // Randomly introduce a discrepancy (50% chance)
        if (Math.random() < 0.5) {
            const types = ['EXPIRED', 'NAME_MISMATCH', 'ID_MISMATCH', 'TOO_YOUNG', 'SHORT_ID'];
            const type = types[Math.floor(Math.random() * types.length)];
            docData = DocumentGenerator.createDiscrepancy(docData, type);
            console.log(`Discrepancy created: ${type}`);
        }

        this.state.currentTraveler = { document: docData };
        this.createDocument('passport', docData);

        if (this.dom.travelerVisual) {
            this.dom.travelerVisual.style.backgroundImage = `linear-gradient(to top, rgba(25, 18, 12, 0.82), rgba(49, 36, 24, 0.44)), url("${docData.boothPhoto}")`;
        }
    }

    createDocument(type, data) {
        const doc = document.createElement('div');
        doc.className = `document ${type}`;
        doc.style.left = '100px';
        //doc.style.top = '100px';

        let content = `
            <div class="doc-header">${type.toUpperCase()}</div>
            <div class="doc-body">
                <div class="doc-photo">
                    <img class="doc-photo-img" src="${data.photo}" alt="Traveler portrait" draggable="false">
                </div>
                <div class="doc-info">
                    <p><strong>NAME:</strong> ${data.name}</p>
                    <p><strong>ID:</strong> ${data.id}</p>
                    <p><strong>DOB:</strong> ${data.dob}</p>
                    <p><strong>SEX:</strong> ${data.sex}</p>
                    <p><strong>ISS:</strong> ${data.country}</p>
                    <p><strong>EXP:</strong> ${data.expiry}</p>
                </div>
            </div>
        `;

        doc.innerHTML = content;
        this.dom.desk.appendChild(doc);
    }
}

window.game = new Game();
