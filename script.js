/* ==========================================
   天衍智投 - TianYan AI Trading Platform
   Interactive Scripts
   ========================================== */

// === Background Particle System ===
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.connections = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.bindEvents();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(80, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.1,
            });
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update & draw particles
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;

            // Wrap around
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(99, 102, 241, ${p.opacity})`;
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const opacity = (1 - dist / 150) * 0.15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }

            // Mouse interaction
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const opacity = (1 - dist / 200) * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// === Mini Trading Chart (Hero Card) ===
class MiniChart {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.container.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.data = this.generateData();
        this.resize();
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.draw();
    }

    generateData() {
        const data = [];
        let price = 65000 + Math.random() * 5000;
        for (let i = 0; i < 60; i++) {
            price += (Math.random() - 0.45) * 400;
            data.push(price);
        }
        return data;
    }

    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, w, h);

        const min = Math.min(...this.data);
        const max = Math.max(...this.data);
        const range = max - min || 1;
        const stepX = w / (this.data.length - 1);

        // Draw gradient area
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');

        ctx.beginPath();
        ctx.moveTo(0, h);
        this.data.forEach((val, i) => {
            const x = i * stepX;
            const y = h - ((val - min) / range) * h * 0.85 - h * 0.05;
            if (i === 0) ctx.lineTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw line
        const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
        lineGrad.addColorStop(0, '#22c55e');
        lineGrad.addColorStop(1, '#06b6d4');

        ctx.beginPath();
        this.data.forEach((val, i) => {
            const x = i * stepX;
            const y = h - ((val - min) / range) * h * 0.85 - h * 0.05;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Pulse dot at the end
        const lastX = (this.data.length - 1) * stepX;
        const lastY = h - ((this.data[this.data.length - 1] - min) / range) * h * 0.85 - h * 0.05;

        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
        ctx.fill();
    }

    animate() {
        // Shift data and add new point
        this.data.shift();
        const last = this.data[this.data.length - 1];
        this.data.push(last + (Math.random() - 0.47) * 300);
        this.draw();
        setTimeout(() => this.animate(), 1500);
    }
}

// === Demo Candlestick Chart ===
class DemoChart {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.candles = this.generateCandles(80);
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const parent = this.canvas.parentElement;
        const rect = parent.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = 400;
        this.draw();
    }

    generateCandles(count) {
        const candles = [];
        let price = 66000;
        for (let i = 0; i < count; i++) {
            const open = price;
            const change = (Math.random() - 0.47) * 1200;
            const close = open + change;
            const high = Math.max(open, close) + Math.random() * 600;
            const low = Math.min(open, close) - Math.random() * 600;
            candles.push({ open, close, high, low });
            price = close;
        }
        return candles;
    }

    draw() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const ctx = this.ctx;
        const padding = { top: 20, bottom: 40, left: 60, right: 20 };
        const chartW = w - padding.left - padding.right;
        const chartH = h - padding.top - padding.bottom;

        ctx.clearRect(0, 0, w, h);

        // Find min/max
        let allMin = Infinity, allMax = -Infinity;
        this.candles.forEach(c => {
            allMin = Math.min(allMin, c.low);
            allMax = Math.max(allMax, c.high);
        });
        const range = allMax - allMin || 1;

        // Draw grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding.top + (i / gridLines) * chartH;
            const price = allMax - (i / gridLines) * range;

            ctx.beginPath();
            ctx.moveTo(padding.left, y);
            ctx.lineTo(w - padding.right, y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Price labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.font = '10px Orbitron';
            ctx.textAlign = 'right';
            ctx.fillText(price.toFixed(0), padding.left - 10, y + 4);
        }

        // Draw MA lines
        this.drawMA(ctx, this.candles, 20, '#f59e0b', padding, chartW, chartH, allMin, range);
        this.drawMA(ctx, this.candles, 50, '#06b6d4', padding, chartW, chartH, allMin, range);

        // Draw candles
        const candleW = chartW / this.candles.length;
        const bodyW = candleW * 0.6;

        this.candles.forEach((c, i) => {
            const x = padding.left + i * candleW + candleW / 2;
            const bullish = c.close >= c.open;
            const color = bullish ? '#22c55e' : '#ef4444';
            const colorAlpha = bullish ? 'rgba(34, 197, 94, 0.7)' : 'rgba(239, 68, 68, 0.7)';

            // Wick
            const highY = padding.top + ((allMax - c.high) / range) * chartH;
            const lowY = padding.top + ((allMax - c.low) / range) * chartH;
            ctx.beginPath();
            ctx.moveTo(x, highY);
            ctx.lineTo(x, lowY);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.stroke();

            // Body
            const openY = padding.top + ((allMax - c.open) / range) * chartH;
            const closeY = padding.top + ((allMax - c.close) / range) * chartH;
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1);

            ctx.fillStyle = colorAlpha;
            ctx.fillRect(x - bodyW / 2, bodyTop, bodyW, bodyHeight);
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x - bodyW / 2, bodyTop, bodyW, bodyHeight);
        });

        // Draw AI signals
        this.drawSignals(ctx, padding, chartW, chartH, allMin, allMax, range);

        // Volume bars at bottom
        this.drawVolume(ctx, padding, chartW, h);
    }

    drawMA(ctx, candles, period, color, padding, chartW, chartH, allMin, range) {
        if (candles.length < period) return;
        const allMax = allMin + range;
        const candleW = chartW / candles.length;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.6;

        for (let i = period - 1; i < candles.length; i++) {
            let sum = 0;
            for (let j = i - period + 1; j <= i; j++) {
                sum += candles[j].close;
            }
            const ma = sum / period;
            const x = padding.left + i * candleW + candleW / 2;
            const y = padding.top + ((allMax - ma) / range) * chartH;

            if (i === period - 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
    }

    drawSignals(ctx, padding, chartW, chartH, allMin, allMax, range) {
        const signals = [
            { index: 15, type: 'buy' },
            { index: 35, type: 'sell' },
            { index: 55, type: 'buy' },
            { index: 70, type: 'buy' },
        ];
        const candleW = chartW / this.candles.length;

        signals.forEach(signal => {
            if (signal.index >= this.candles.length) return;
            const c = this.candles[signal.index];
            const x = padding.left + signal.index * candleW + candleW / 2;

            if (signal.type === 'buy') {
                const y = padding.top + ((allMax - c.low) / range) * chartH + 18;
                // Triangle up
                ctx.beginPath();
                ctx.moveTo(x, y - 12);
                ctx.lineTo(x - 7, y);
                ctx.lineTo(x + 7, y);
                ctx.closePath();
                ctx.fillStyle = 'rgba(34, 197, 94, 0.8)';
                ctx.fill();
            } else {
                const y = padding.top + ((allMax - c.high) / range) * chartH - 18;
                // Triangle down
                ctx.beginPath();
                ctx.moveTo(x, y + 12);
                ctx.lineTo(x - 7, y);
                ctx.lineTo(x + 7, y);
                ctx.closePath();
                ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.fill();
            }
        });
    }

    drawVolume(ctx, padding, chartW, totalH) {
        const volH = 40;
        const y0 = totalH - 10;
        const candleW = chartW / this.candles.length;

        this.candles.forEach((c, i) => {
            const vol = Math.random() * volH;
            const x = padding.left + i * candleW + candleW / 2;
            const bullish = c.close >= c.open;
            const color = bullish ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)';

            ctx.fillStyle = color;
            ctx.fillRect(x - candleW * 0.25, y0 - vol, candleW * 0.5, vol);
        });
    }
}

// === Scroll Animations ===
function initScrollAnimations() {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    // Select all animatable elements
    const elements = document.querySelectorAll(
        '.about-card, .feature-card, .tech-item, .tech-detail-card, .team-card, .contact-item, .signal-item'
    );
    elements.forEach((el, i) => {
        el.classList.add('animate-in');
        el.style.transitionDelay = `${i % 4 * 0.1}s`;
        observer.observe(el);
    });
}

// === Navbar Scroll Effect ===
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section, .hero');

    window.addEventListener('scroll', () => {
        // Add scrolled class
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Update active nav link
        let current = '';
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 120) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // Mobile nav toggle
    const toggle = document.getElementById('nav-toggle');
    const navLinksContainer = document.getElementById('nav-links');

    toggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('open');
        toggle.classList.toggle('active');
    });

    // Close mobile nav on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('open');
            toggle.classList.remove('active');
        });
    });
}

// === Counter Animation ===
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.target);
                    const isDecimal = target % 1 !== 0;
                    const duration = 2000;
                    const startTime = performance.now();

                    function update(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        // Ease out
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = target * eased;

                        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

                        if (progress < 1) {
                            requestAnimationFrame(update);
                        }
                    }

                    requestAnimationFrame(update);
                    observer.unobserve(el);
                }
            });
        },
        { threshold: 0.5 }
    );

    counters.forEach(counter => observer.observe(counter));
}

// === Toolbar Buttons ===
function initToolbar() {
    const buttons = document.querySelectorAll('.toolbar-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// === Contact Form ===
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>消息已发送 ✓</span>';
        btn.style.background = 'linear-gradient(135deg, #22c55e, #06b6d4)';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
    // Background particles
    const bgCanvas = document.getElementById('bgCanvas');
    if (bgCanvas) new ParticleSystem(bgCanvas);

    // Mini chart in hero
    const miniChartContainer = document.getElementById('miniChart');
    if (miniChartContainer) new MiniChart(miniChartContainer);

    // Demo candlestick chart
    const demoChartCanvas = document.getElementById('demoChart');
    if (demoChartCanvas) new DemoChart(demoChartCanvas);

    // Other initializations
    initNavbar();
    initScrollAnimations();
    initCounters();
    initToolbar();
    initContactForm();
});
