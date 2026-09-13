// Clock Application
class TimezoneClockApp {
    constructor() {
        this.clocks = [];
        this.defaultTimezones = [
            'America/New_York',
            'Europe/London',
            'Asia/Tokyo',
            'Australia/Sydney',
            'UTC'
        ];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadClocks();
        this.populateTimezoneList();
        this.startClockUpdates();
    }

    setupEventListeners() {
        document.getElementById('addBtn').addEventListener('click', () => this.addClock());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('tzInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addClock();
        });
        document.getElementById('searchTz').addEventListener('input', (e) => this.filterTimezones(e.target.value));
    }

    loadClocks() {
        const saved = localStorage.getItem('clocks');
        if (saved) {
            this.clocks = JSON.parse(saved);
        } else {
            this.clocks = this.defaultTimezones;
        }
        this.renderClocks();
    }

    saveClocks() {
        localStorage.setItem('clocks', JSON.stringify(this.clocks));
    }

    addClock() {
        const input = document.getElementById('tzInput');
        const timezone = input.value.trim();

        if (!timezone) {
            alert('Please enter a timezone');
            return;
        }

        // Validate timezone
        if (!this.isValidTimezone(timezone)) {
            alert(`Invalid timezone: ${timezone}`);
            return;
        }

        if (this.clocks.includes(timezone)) {
            alert(`${timezone} is already added`);
            return;
        }

        this.clocks.push(timezone);
        this.saveClocks();
        this.renderClocks();
        input.value = '';
        input.focus();
    }

    removeClock(timezone) {
        this.clocks = this.clocks.filter(tz => tz !== timezone);
        this.saveClocks();
        this.renderClocks();
    }

    reset() {
        if (confirm('Reset to default timezones?')) {
            this.clocks = this.defaultTimezones;
            this.saveClocks();
            this.renderClocks();
        }
    }

    renderClocks() {
        const grid = document.getElementById('timezoneGrid');
        grid.innerHTML = '';

        if (this.clocks.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <p>📍 No timezones added yet</p>
                    <p>Add a timezone to get started!</p>
                </div>
            `;
            return;
        }

        this.clocks.forEach(timezone => {
            const card = this.createClockCard(timezone);
            grid.appendChild(card);
        });
    }

    createClockCard(timezone) {
        const card = document.createElement('div');
        card.className = 'clock-card';
        card.innerHTML = `
            <button class="remove-btn" onclick="app.removeClock('${timezone}')">✕</button>
            <div class="tz-name">${timezone.replace(/_/g, ' ')}</div>
            <div class="digital-time" id="time-${timezone}">--:--:--</div>
            <div class="time-info">
                <div class="info-item">
                    <div class="info-label">Date</div>
                    <div class="info-value" id="date-${timezone}">--/--/--</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Offset</div>
                    <div class="info-value" id="offset-${timezone}">UTC+0</div>
                </div>
            </div>
        `;
        return card;
    }

    updateTime() {
        this.clocks.forEach(timezone => {
            const time = this.getTimeForTimezone(timezone);
            const timeEl = document.getElementById(`time-${timezone}`);
            const dateEl = document.getElementById(`date-${timezone}`);
            const offsetEl = document.getElementById(`offset-${timezone}`);

            if (timeEl) {
                timeEl.textContent = time.timeString;
                dateEl.textContent = time.dateString;
                offsetEl.textContent = time.offsetString;
            }
        });
    }

    getTimeForTimezone(timezone) {
        try {
            const date = new Date();
            const options = {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            };
            const timeString = date.toLocaleString('en-US', options);

            // Get date
            const dateOptions = {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            };
            const dateString = date.toLocaleString('en-US', dateOptions);

            // Calculate offset
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            const offset = (tzDate - utcDate) / (1000 * 60 * 60);
            const offsetString = `UTC${offset >= 0 ? '+' : ''}${offset.toFixed(1)}`;

            return {
                timeString,
                dateString,
                offsetString
            };
        } catch (e) {
            return {
                timeString: '--:--:--',
                dateString: '--/--/--',
                offsetString: 'Invalid'
            };
        }
    }

    isValidTimezone(timezone) {
        try {
            Intl.DateTimeFormat(undefined, { timeZone: timezone });
            return true;
        } catch (e) {
            return false;
        }
    }

    populateTimezoneList() {
        const tzList = document.getElementById('tzList');
        const timezones = TIMEZONE_DATA;

        timezones.forEach(tz => {
            const li = document.createElement('li');
            li.className = 'tz-item';
            li.textContent = tz;
            li.onclick = () => {
                document.getElementById('tzInput').value = tz;
                this.addClock();
            };
            tzList.appendChild(li);
        });
    }

    filterTimezones(query) {
        const items = document.querySelectorAll('.tz-item');
        const lowerQuery = query.toLowerCase();

        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? 'block' : 'none';
        });
    }

    startClockUpdates() {
        this.updateTime();
        setInterval(() => this.updateTime(), 1000);
    }
}

// Initialize app
const app = new TimezoneClockApp();
