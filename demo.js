// ==========================================
// Demo App Logic (TradingView Proxy)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    try {
    // --- 1. Data Generation ---
    function generateCandleData(points, basePrice, volatility) {
        let data = [];
        let time = Math.floor(Date.now() / 1000) - (points * 3600); // 1H candles
        let currentPrice = basePrice;
        
        for(let i=0; i<points; i++) {
            let open = currentPrice;
            let high = open + (Math.random() * volatility);
            let low = open - (Math.random() * volatility);
            let close = open + (Math.random() - 0.5) * volatility * 2;
            
            // Ensure high/low are correct
            if(close > high) high = close;
            if(close < low) low = close;
            
            data.push({
                time: time + (i * 3600),
                open: open,
                high: high,
                low: low,
                close: close
            });
            
            currentPrice = close;
        }
        return data;
    }

    // --- 2. Chart Initialization ---
    const chartContainer = document.getElementById('tvchart');
    const chart = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: chartContainer.clientHeight,
        layout: {
            background: { type: 'solid', color: '#0a0a0f' },
            textColor: '#a1a1aa',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        crosshair: {
            mode: LightweightCharts.CrosshairMode.Normal,
        },
        rightPriceScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
            timeVisible: true,
        },
    });

    const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderVisible: false,
        wickUpColor: '#22c55e',
        wickDownColor: '#ef4444'
    });

    // Initial Data
    let baseData = generateCandleData(100, 68000, 500);
    candlestickSeries.setData(baseData);

    // Handle Resize
    window.addEventListener('resize', () => {
        chart.applyOptions({
            width: chartContainer.clientWidth,
            height: chartContainer.clientHeight
        });
    });

    // --- 3. Options Chain Logic ---
    const strikes = [65000, 66000, 67000, 68000, 69000, 70000, 71000];
    const optionsBody = document.getElementById('optionsBody');
    const chartTitle = document.getElementById('currentChartTitle');
    
    strikes.forEach((strike, index) => {
        const tr = document.createElement('tr');
        if(strike === 68000) tr.classList.add('active'); // Current simulated price
        
        // Mock pricing
        let cBid = Math.max(10, (68000 - strike) + Math.random() * 100);
        let cAsk = cBid + 20;
        let pBid = Math.max(10, (strike - 68000) + Math.random() * 100);
        let pAsk = pBid + 20;

        tr.innerHTML = `
            <td class="val-down">${cBid.toFixed(1)}</td>
            <td>${cAsk.toFixed(1)}</td>
            <td>${strike}</td>
            <td class="val-up">${pBid.toFixed(1)}</td>
            <td>${pAsk.toFixed(1)}</td>
        `;

        tr.addEventListener('click', () => {
            // Remove active from all
            document.querySelectorAll('.options-chain tr').forEach(r => r.classList.remove('active'));
            tr.classList.add('active');
            
            // Update Chart
            chartTitle.innerText = `BTC/USDT - ${strike} Call Option`;
            let optionData = generateCandleData(100, cBid, cBid * 0.1);
            candlestickSeries.setData(optionData);
            
            // Clear markers when switching
            if(aiOverlaysActive) {
                candlestickSeries.setMarkers([]);
            }
        });

        optionsBody.appendChild(tr);
    });

    // --- 4. AI Overlays & Signals ---
    const toggleAiBtn = document.getElementById('toggleAiBtn');
    const aiStatusDot = document.querySelector('.ai-status-dot');
    const aiOverlayInfo = document.getElementById('aiOverlayInfo');
    let aiOverlaysActive = false;

    function generateMarkers(data) {
        let markers = [];
        // Add random markers
        for(let i=10; i<data.length; i+=15) {
            let isBuy = Math.random() > 0.5;
            markers.push({
                time: data[i].time,
                position: isBuy ? 'belowBar' : 'aboveBar',
                color: isBuy ? '#22c55e' : '#ef4444',
                shape: isBuy ? 'arrowUp' : 'arrowDown',
                text: isBuy ? 'AI Buy (92%)' : 'AI Sell (88%)',
                size: 2
            });
        }
        return markers;
    }

    toggleAiBtn.addEventListener('click', () => {
        aiOverlaysActive = !aiOverlaysActive;
        
        if (aiOverlaysActive) {
            aiStatusDot.classList.add('active');
            aiOverlayInfo.classList.remove('hidden');
            // Get current series data and attach markers
            let currentData = candlestickSeries.data();
            if(currentData && currentData.length > 0) {
                 candlestickSeries.setMarkers(generateMarkers(currentData));
            }
        } else {
            aiStatusDot.classList.remove('active');
            aiOverlayInfo.classList.add('hidden');
            candlestickSeries.setMarkers([]);
        }
    });

    // --- 5. Signal Feed Logic ---
    const signalFeed = document.getElementById('signalFeed');
    const assets = ['BTC', 'ETH', 'SOL', 'AAPL'];
    
    function addSignal() {
        let isBuy = Math.random() > 0.5;
        let asset = assets[Math.floor(Math.random() * assets.length)];
        let price = asset === 'BTC' ? 68420 : (asset === 'ETH' ? 3420 : (asset === 'SOL' ? 175 : 198));
        
        const card = document.createElement('div');
        card.className = `signal-card ${isBuy ? 'buy' : 'sell'}`;
        
        let time = new Date().toLocaleTimeString('en-US', { hour12: false });
        
        card.innerHTML = `
            <div class="signal-time">${time}</div>
            <div class="signal-action">
                <span class="action-type">${isBuy ? 'LONG' : 'SHORT'} ${asset}</span>
                <span class="action-price">@ ${price}</span>
            </div>
            <div class="signal-reason">
                NLP Sentiment shift detected. Confidence: ${(80 + Math.random()*15).toFixed(1)}%
            </div>
        `;
        
        signalFeed.prepend(card);
        
        // Keep only last 10
        if(signalFeed.children.length > 10) {
            signalFeed.removeChild(signalFeed.lastChild);
        }
    }

    // Populate initial signals
    for(let i=0; i<3; i++) {
        setTimeout(addSignal, i * 500);
    }

    setInterval(addSignal, 8000);
    } catch (e) {
        document.body.innerHTML = `<div style="color:red; padding: 20px;">Error: ${e.message}<br><pre>${e.stack}</pre></div>`;
    }
});
