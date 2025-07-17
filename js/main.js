// Store current data
let currentWallet = '';
let currentData = null;

// API endpoint - will be provided by Vercel serverless function
const API_ENDPOINT = '/api/wallet-data';

function calculate() {
    const wallet = document.getElementById('walletAddress').value.trim();
    
    if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
        showError('Please enter a valid wallet address');
        return;
    }

    currentWallet = wallet;

    // Show loading
    document.getElementById('loading').classList.add('show');
    hideError();
    
    // Fetch data from API
    fetchWalletData(wallet);
}

async function fetchWalletData(wallet) {
    try {
        const response = await fetch(`${API_ENDPOINT}?wallet=${wallet}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch wallet data');
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentData = data;
        updateResults(data);
        
        document.getElementById('loading').classList.remove('show');
        document.getElementById('results').classList.add('show');
        
        // Smooth scroll to results
        document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
        
    } catch (error) {
        console.error('Error fetching wallet data:', error);
        document.getElementById('loading').classList.remove('show');
        showError(error.message || 'Failed to fetch wallet data. Please try again.');
    }
}

function updateResults(data) {
    // Update HypurrFi
    if (data.hypurrfi) {
        for (let phase = 1; phase <= 3; phase++) {
            if (data.hypurrfi.phases[phase]) {
                const phaseData = data.hypurrfi.phases[phase];
                document.getElementById(`hypurrfiP${phase}Percent`).textContent = `${phaseData.percentage}%`;
                document.getElementById(`hypurrfiP${phase}Points`).textContent = formatNumber(phaseData.points);
            }
        }
        document.getElementById('hypurrfiTotal').textContent = formatNumber(data.hypurrfi.total || 0);
    }

    // Update Hyperlend
    if (data.hyperlend) {
        for (let phase = 1; phase <= 3; phase++) {
            if (data.hyperlend.phases[phase]) {
                const phaseData = data.hyperlend.phases[phase];
                document.getElementById(`hyperlendP${phase}Percent`).textContent = `${phaseData.percentage}%`;
                document.getElementById(`hyperlendP${phase}Points`).textContent = formatNumber(phaseData.points);
            }
        }
        document.getElementById('hyperlendTotal').textContent = formatNumber(data.hyperlend.total || 0);
    }
}

function formatNumber(num) {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
}

function showError(message) {
    let errorElement = document.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        document.querySelector('.input-card').appendChild(errorElement);
    }
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function hideError() {
    const errorElement = document.querySelector('.error-message');
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function generateSocialCard() {
    if (!currentWallet || !currentData) return;

    const canvas = document.getElementById('socialCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set size for 2x2 layout
    canvas.width = 600;
    canvas.height = 600;
    
    // Background gradient
    const bgGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    bgGradient.addColorStop(0, '#F8FAFC');
    bgGradient.addColorStop(1, '#E2E8F0');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add infinity logo background
    ctx.globalAlpha = 0.1;
    
    // Draw multiple infinity symbols
    drawInfinity(ctx, 100, 100, 80, '#6366F1');
    drawInfinity(ctx, 500, 150, 60, '#EC4899');
    drawInfinity(ctx, 150, 450, 70, '#14B8A6');
    drawInfinity(ctx, 450, 500, 50, '#F59E0B');
    
    ctx.globalAlpha = 1;
    
    // Logo
    ctx.font = 'bold 48px Inter, sans-serif';
    const logoGradient = ctx.createLinearGradient(150, 30, 450, 80);
    logoGradient.addColorStop(0, '#6366F1');
    logoGradient.addColorStop(0.5, '#EC4899');
    logoGradient.addColorStop(1, '#14B8A6');
    ctx.fillStyle = logoGradient;
    ctx.textAlign = 'center';
    ctx.fillText('Looped Hype', canvas.width / 2, 60);
    
    // Subtitle
    ctx.font = '18px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('LOOPDROP ESTIMATOR RESULTS', canvas.width / 2, 85);
    
    // Wallet
    ctx.font = '14px monospace';
    ctx.fillStyle = '#1E293B';
    const shortWallet = currentWallet.slice(0, 6) + '...' + currentWallet.slice(-4);
    ctx.fillText('Wallet: ' + shortWallet, canvas.width / 2, 110);
    
    // Protocol boxes - 2x2 layout
    const boxWidth = 250;
    const boxHeight = 180;
    const spacing = 30;
    const startX = (canvas.width - (boxWidth * 2 + spacing)) / 2;
    const startY = 150;
    
    // Draw protocol cards in 2x2 grid
    drawCard(ctx, startX, startY, boxWidth, boxHeight, 'HypurrFi', currentData.hypurrfi?.total || 0, '#6366F1', '#EC4899');
    drawCard(ctx, startX + boxWidth + spacing, startY, boxWidth, boxHeight, 'Hyperlend', currentData.hyperlend?.total || 0, '#14B8A6', '#6366F1');
    drawCard(ctx, startX, startY + boxHeight + spacing, boxWidth, boxHeight, 'Felix', 'Phase 3 Only', '#F59E0B', '#EC4899');
    drawCard(ctx, startX + boxWidth + spacing, startY + boxHeight + spacing, boxWidth, boxHeight, 'Kinetiq', 'Phase 3 Only', '#8B5CF6', '#10B981');
    
    // Footer
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#64748B';
    ctx.fillText('Generated at loopedhype.io', canvas.width / 2, 570);
    
    // Show modal
    document.getElementById('socialModal').classList.add('show');
}

function drawInfinity(ctx, x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 100, size / 100);
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    
    // Draw infinity shape
    for (let t = 0; t < Math.PI * 2; t += 0.01) {
        const x = 50 * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        const y = 50 * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        if (t === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.stroke();
    ctx.restore();
}

function drawCard(ctx, x, y, width, height, name, points, color1, color2) {
    // Card background with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = 'white';
    ctx.fillRect(x, y, width, height);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // Card border top
    ctx.strokeStyle = color1;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();
    
    // Protocol name
    ctx.font = 'bold 24px Inter, sans-serif';
    const gradient = ctx.createLinearGradient(x, y, x + width, y);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    ctx.fillStyle = gradient;
    ctx.textAlign = 'center';
    ctx.fillText(name, x + width / 2, y + 40);
    
    // Points
    if (typeof points === 'number') {
        ctx.font = 'bold 32px Inter, sans-serif';
        ctx.fillStyle = '#1E293B';
        ctx.fillText(formatNumber(points), x + width / 2, y + 90);
        
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText('POINTS', x + width / 2, y + 115);
    } else {
        ctx.font = '18px Inter, sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.fillText(points, x + width / 2, y + 80);
        ctx.font = '16px Inter, sans-serif';
        ctx.fillText('Coming Soon', x + width / 2, y + 105);
    }
}

function closeSocialModal(event) {
    if (!event || event.target.id === 'socialModal') {
        document.getElementById('socialModal').classList.remove('show');
    }
}

function downloadSocialCard() {
    const canvas = document.getElementById('socialCanvas');
    const link = document.createElement('a');
    link.download = `looped-hype-${currentWallet.slice(0, 8)}-loopdrop.png`;
    link.href = canvas.toDataURL();
    link.click();
}

// Function to update progress bar (can be called from backend)
function updateProgress(percentage) {
    const progressBar = document.getElementById('progressBar');
    const progressPercentage = document.getElementById('progressPercentage');
    
    if (progressBar && progressPercentage) {
        progressBar.style.width = percentage + '%';
        progressPercentage.textContent = percentage + '%';
        progressPercentage.style.left = percentage + '%';
    }
}

// Enter key support
document.getElementById('walletAddress').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') calculate();
});

// Auto-format wallet
document.getElementById('walletAddress').addEventListener('input', function(e) {
    e.target.value = e.target.value.toLowerCase();
});
