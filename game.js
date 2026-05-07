/** 
 * ACCESS LEADER - Sistema de Minijogos v6.3 (OTIMIZADO)
 * Stable Coins: Fluxo relaxado e coleta facilitada
 * Neural Link & Miner Impulse: Performance estável
 */

let score = 0;
let gameTimer = null;
let gameActive = false;
let animationFrameId = null;

// --- CONTROLE DE FLUXO (Sincronizado com HTML) ---
function selectGame(type) {
    score = 0;
    gameActive = true;
    
    // IDs das barras de topo
    const scoreEl = document.getElementById('game-score-top');
    const timerEl = document.getElementById('game-timer-top');
    const hud = document.getElementById('game-hud');
    
    // Força a exibição do HUD e limpa os valores iniciais
    if (hud) {
        hud.classList.remove('hidden');
        hud.style.display = 'flex'; // Garante que o container apareça

        // --- LÓGICA DE POSICIONAMENTO INTELIGENTE ---
        if (type === 'memory') {
            // No jogo da memória, o HUD fica fixo no topo (não flutua) para não cobrir as cartas
            hud.style.position = 'relative';
            hud.style.width = '100%';
            hud.style.backgroundColor = 'rgba(0,0,0,0.4)';
            hud.style.pointerEvents = 'auto';
        } else {
            // Nos outros jogos, o HUD flutua sobre o game-area para permitir tela cheia
            hud.style.position = 'absolute';
            hud.style.width = '100%';
            hud.style.top = '0';
            hud.style.left = '0';
            hud.style.backgroundColor = 'transparent';
            hud.style.pointerEvents = 'none'; // Cliques passam através do HUD para o jogo
        }
    }
    
    if (scoreEl) scoreEl.innerText = score;
    if (timerEl) timerEl.innerText = "0s";
    
    document.getElementById('game-menu').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    
    if (window.GameRender) {
        window.GameRender.setupStage(type);
    }
    
    if (type === 'stable') startStableCoins();
    if (type === 'memory') startCryptoMemory();
    if (type === 'pipe') startMinerPipe();
}

function stopGameLoop() {
    gameActive = false;
    if (gameTimer) clearInterval(gameTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (window.Render) window.Render.clear();
    
    const area = document.getElementById('game-area');
    if(area) {
        area.onmousedown = null;
        area.ontouchstart = null;
    }
}

function endGame() {
    if (!gameActive) return;
    gameActive = false;
    
    if (gameTimer) clearInterval(gameTimer);
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    
    const hashBoost = score * 0.1;
    
    if (window.GameState) {
        window.GameState.balance += (score / 10000);
        const balEl = document.getElementById('display-balance');
        if (balEl) balEl.innerText = "$ " + window.GameState.balance.toFixed(4);
    }

    if (score >= 15) {
        showBoostModal(hashBoost);
    } else {
        alert(`Partida finalizada!\nPontuação: ${score}\nBoost: +${hashBoost.toFixed(1)} TH/s`);
        location.reload();
    }
}

function showBoostModal(hashAmount) {
    const area = window.Render ? window.Render.area() : document.getElementById('game-area');
    if (!area) return;

    area.style.display = 'block'; 
    area.innerHTML = `
        <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-[100] p-6 text-center">
            <div class="text-[#40E0D0] text-6xl mb-4 animate-bounce"><i class="fas fa-rocket"></i></div>
            <h2 class="text-white font-black text-2xl mb-2 italic uppercase">BOOST DETECTADO!</h2>
            <p class="text-gray-400 text-[10px] mb-8 tracking-[0.2em]">REIVINDICAR +${(hashAmount * 3).toFixed(1)} TH/s AGORA?</p>
            <button onclick="window.open('https://google.com', '_blank'); location.reload();" 
               class="w-full bg-[#40E0D0] text-black font-black py-5 rounded-2xl mb-4 uppercase italic shadow-[0_0_25px_rgba(64,224,208,0.3)]">
               Multiplicar 2x (AD)
           </button>
            <button onclick="location.reload();" 
               class="w-full bg-white/5 text-gray-500 py-3 rounded-2xl uppercase text-[10px] font-bold">
               Ignorar e manter 1x
            </button>
        </div>
    `;
}

// --- 1. STABLE COINS ---
function startStableCoins() {
    let time = 30;
    const coins = [];
    const area = window.Render.area();
    const FALL_SPEED = 3.5;

    gameTimer = setInterval(() => {
        if (!gameActive) return;
        
        const rand = Math.random();
        let coinLabel, coinColor;
        
        if (rand < 0.33) { coinLabel = 'USDT'; coinColor = 'text-[#26A17B]'; }
        else if (rand < 0.66) { coinLabel = 'USDC'; coinColor = 'text-[#2775CA]'; }
        else { coinLabel = 'LDC'; coinColor = 'text-yellow-400'; }

        const coinEl = window.Render.createObject('div', 'absolute cursor-pointer select-none z-30');
        const posX = Math.random() * (area.offsetWidth - 80) + 10;
        
        coinEl.style.left = posX + "px";
        coinEl.style.top = "-80px";
        
        coinEl.innerHTML = `
            <div class="w-20 h-20 p-2 flex items-center justify-center"> 
               <div class="w-full h-full rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center shadow-xl backdrop-blur-sm active:scale-150 transition-transform">
                   <span class="${coinColor} font-black text-[14px]">${coinLabel}</span>
               </div>
           </div>
        `;

        const coinObj = { el: coinEl, y: -80, collected: false };
        
        const collect = (e) => {
            if (e) e.preventDefault();
            if (coinObj.collected) return;
            coinObj.collected = true;
            score++;
            const scoreTop = document.getElementById('game-score-top');
            if (scoreTop) scoreTop.innerText = score;
            
            coinEl.style.pointerEvents = 'none';
            coinEl.style.transform += ' scale(0)';
            coinEl.style.opacity = '0';
            setTimeout(() => coinEl.remove(), 150);
        };

        coinEl.addEventListener('touchstart', collect, { passive: false });
        coinEl.addEventListener('mousedown', collect);
        coins.push(coinObj);
    }, 900);

    function update() {
        if (!gameActive) return;
        for (let i = coins.length - 1; i >= 0; i--) {
            const c = coins[i];
            if (c.collected) { coins.splice(i, 1); continue; }
            c.y += FALL_SPEED;
            c.el.style.transform = `translateY(${c.y}px)`;
            if (c.y > area.offsetHeight + 100) {
                c.el.remove();
                coins.splice(i, 1);
            }
        }
        animationFrameId = requestAnimationFrame(update);
    }
    animationFrameId = requestAnimationFrame(update);

    const clock = setInterval(() => {
        time--;
        const timerTop = document.getElementById('game-timer-top');
        if (timerTop) timerTop.innerText = time + "s";
        if (time <= 0) { clearInterval(clock); endGame(); }
    }, 1000);
}

// --- 2. NEURAL LINK (MEMORY) ---
function startCryptoMemory() {
    let time = 40;
    const emojis = ["💎", "🔥", "🚀", "💰", "⚡", "🛡️", "💵", "⭐"];
    let pairList = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    let selected = [];
    
    const area = window.Render.area();
    area.style.display = 'grid';
    area.style.gridTemplateColumns = 'repeat(4, 1fr)';
    area.style.gap = '8px';
    area.style.padding = '10px';
    
    pairList.forEach((emoji) => {
        const card = document.createElement('div');
        card.className = 'h-20 bg-white/5 rounded-xl flex items-center justify-center text-3xl border border-white/10 transition-all active:scale-95 cursor-pointer';
        card.dataset.value = emoji;
        card.innerHTML = '<span class="opacity-10 text-xl font-bold">?</span>';
        
        card.onclick = () => {
            if (selected.length < 2 && !card.classList.contains('matched') && !selected.includes(card)) {
                card.innerHTML = emoji;
                card.classList.add('bg-white/10', 'border-[#40E0D0]/40');
                selected.push(card);
                
                if (selected.length === 2) {
                    if (selected[0].dataset.value === selected[1].dataset.value) {
                        score += 5;
                        selected.forEach(c => c.classList.add('matched', 'border-[#40E0D0]'));
                        selected = [];
                        const scoreTop = document.getElementById('game-score-top');
                        if (scoreTop) scoreTop.innerText = score;
                        if (document.querySelectorAll('.matched').length === 16) endGame();
                    } else {
                        setTimeout(() => {
                            selected.forEach(c => {
                                c.innerHTML = '<span class="opacity-10 text-xl font-bold">?</span>';
                                c.classList.remove('bg-white/10', 'border-[#40E0D0]/40');
                            });
                            selected = [];
                        }, 500);
                    }
                }
            }
        };
        area.appendChild(card);
    });
    
    gameTimer = setInterval(() => {
        time--;
        const timerTop = document.getElementById('game-timer-top');
        if (timerTop) timerTop.innerText = time + "s";
        if (time <= 0) endGame();
    }, 1000);
}

// --- 3. MINER IMPULSE ---
function startMinerPipe() {
    const area = window.Render.area();
    const bird = window.Render.createObject('div', 'w-10 h-10 bg-[#40E0D0] rounded-full absolute z-20 flex items-center justify-center shadow-[0_0_15px_#40E0D0]');
    bird.innerHTML = '<i class="fas fa-microchip text-black text-[10px]"></i>';
    
    let time = 35;
    let birdY = 150;
    let velocity = 0;
    const gravity = 0.25;
    const jump = -4.5;
    let pipes = [];
    let frame = 0;
    let lastTime = performance.now();

    bird.style.left = "50px";
    bird.style.willChange = 'transform';
    
    const doJump = (e) => { 
        if(e) e.preventDefault();
        velocity = jump; 
    };

    area.onmousedown = doJump;
    area.ontouchstart = doJump;
    
    function gameLoop(currentTime) {
        if (!gameActive) return;

        // Delta Time para suavizar flutuações de FPS
        const deltaTime = (currentTime - lastTime) / 16.67; 
        lastTime = currentTime;

        velocity += gravity * deltaTime;
        birdY += velocity * deltaTime;
        bird.style.transform = `translateY(${birdY}px) translateZ(0)`;

        if (birdY < 0 || birdY > area.offsetHeight - 20) { endGame(); return; }

        if (frame % 90 === 0) {
            const gap = 140;
            const pos = Math.random() * (area.offsetHeight - gap - 100) + 50;
            const topP = window.Render.createObject('div', 'w-12 bg-white/10 absolute right-[-50px] border-b-2 border-[#40E0D0]/30');
            topP.style.height = pos + "px";
            topP.style.top = "0";
            topP.style.left = "0px";
            topP.style.willChange = 'transform';

            const botP = window.Render.createObject('div', 'w-12 bg-white/10 absolute right-[-50px] border-t-2 border-[#40E0D0]/30');
            botP.style.height = (area.offsetHeight - pos - gap) + "px";
            botP.style.bottom = "0";
            botP.style.left = "0px";
            botP.style.willChange = 'transform';

            pipes.push({ top: topP, bot: botP, x: area.offsetWidth, passed: false });
        }

        pipes.forEach((p, index) => {
            // Movimento suavizado via GPU e Delta Time
            p.x -= 3 * (deltaTime || 1);
            p.top.style.transform = `translateX(${p.x}px) translateZ(0)`;
            p.bot.style.transform = `translateX(${p.x}px) translateZ(0)`;
            
            if (p.x < 90 && p.x > 20) {
                const tH = parseInt(p.top.style.height);
                const bT = area.offsetHeight - parseInt(p.bot.style.height);
                if (birdY < tH || (birdY + 10) > bT) {
                    endGame();
                    return;
                }
            }
            
            if (p.x < 20 && !p.passed) {
                p.passed = true;
                score++;
                const scoreTop = document.getElementById('game-score-top');
                if (scoreTop) scoreTop.innerText = score;
            }
            
            if (p.x < -60) {
                p.top.remove(); p.bot.remove();
                pipes.splice(index, 1);
            }
        });
        frame++;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    animationFrameId = requestAnimationFrame(gameLoop);

    gameTimer = setInterval(() => {
        time--;
        const timerTop = document.getElementById('game-timer-top');
        if (timerTop) timerTop.innerText = time + "s";
        if (time <= 0) endGame();
    }, 1000);
}

window.selectGame = selectGame;
window.stopGameLoop = stopGameLoop;