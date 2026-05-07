/**
 * ACCESS LEADER - Interface e Temas
 * Versão Pro Sync - Estabilidade Visual Sem Rolagem (PC Optimized)
 */

window.showInfo = function() {
    // Uso de Optional Chaining para garantir que a caixa abra mesmo se o motor de linguagem demorar a carregar
    const currentLang = window.LanguageEngine?.current || 'PT';
    
    const infoMsg = currentLang === 'PT' ?
        "SISTEMA PRO SYNC:\n\n1. O layout se adapta à altura da sua tela.\n2. O Rack ajusta o tamanho das máquinas para evitar rolagem.\n3. Modo Full Screen recomendado para melhor experiência.\n4. Mínimo para saque: $5.00." :
        "PRO SYNC SYSTEM:\n\n1. Layout adapts to your screen height.\n2. Mining Rack resizes machines to prevent scrolling.\n3. Full Screen mode recommended for best experience.\n4. Minimum withdrawal: $5.00.";
    
    alert(infoMsg);
};

window.toggleTheme = function() {
    const isDark = document.documentElement.classList.toggle('dark');
    const icon = document.getElementById('theme-icon');
    
    if (icon) icon.className = isDark ? 'fas fa-moon' : 'fas fa-sun';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
};

(function() {
    // 1. Inicialização de Tema
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(savedTheme);
    
    // 2. Injeção do Tooltip de Precisão no Header
    document.addEventListener('DOMContentLoaded', () => {
        const chipContainer = document.querySelector('.app-card.px-2.py-1.rounded-lg.flex.items-center');
        if (chipContainer) {
            chipContainer.style.position = 'relative';
            chipContainer.style.cursor = 'pointer';
            
            const overlay = document.createElement('div');
            overlay.id = 'chip-precision-overlay';
            overlay.className = 'chip-precision-overlay';
            overlay.innerHTML = `
                <div class="text-[9px] uppercase opacity-50 font-bold text-white mb-1">Status de Saldo</div>
                <div id="prec-ldc" class="text-[#40E0D0] text-sm font-black">0.0000 LDC</div>
                <div id="prec-usd" class="text-yellow-400 text-[11px] font-bold">$ 0.0000</div>
            `;
            chipContainer.appendChild(overlay);
            
            chipContainer.addEventListener('mouseenter', () => window.updatePrecisionTooltip(true));
            chipContainer.addEventListener('mouseleave', () => window.updatePrecisionTooltip(false));
            chipContainer.addEventListener('click', () => window.updatePrecisionTooltip(true));
        }
    });
    
    window.optimizeMachineGrid = function() {
        const grid = document.getElementById('machine-grid');
        if (!grid) return;
        
        // Fixar Grid para evitar colapso antes do carregamento (Auxilia o Tutorial)
        grid.style.minHeight = "200px";
        grid.style.transition = "all 0.3s ease-in-out";
        
        const count = grid.children.length;
        if (window.innerWidth > 1024) {
            if (count <= 4) grid.style.gridTemplateColumns = "repeat(2, 1fr)";
            else if (count <= 9) grid.style.gridTemplateColumns = "repeat(3, 1fr)";
            else grid.style.gridTemplateColumns = "repeat(4, 1fr)";
        }
    };
    
    const observer = new MutationObserver(() => window.optimizeMachineGrid());
    document.addEventListener('DOMContentLoaded', () => {
        const rack = document.getElementById('machine-grid');
        if (rack) observer.observe(rack, { childList: true });
        window.optimizeMachineGrid();
    });
    
})();

// Função para Atualizar o Tooltip
window.updatePrecisionTooltip = function(show = true) {
    const overlay = document.getElementById('chip-precision-overlay');
    const ldcText = document.getElementById('prec-ldc');
    const usdText = document.getElementById('prec-usd');
    
    if (overlay && window.GameState) {
        if (show) {
            ldcText.innerText = (window.GameState.leaderCoin || 0).toFixed(4) + " LDC";
            usdText.innerText = "$ " + ((window.GameState.leaderCoin || 0) * (window.GameState.ldcPrice || 0)).toFixed(4);
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
};

// Sistema de Notificações - Ajustado para Z-INDEX Máximo
window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    const color = type === 'success' ? '#40E0D0' : '#ef4444';
    // Z-INDEX ajustado para 1000 para sobrepor tudo
    toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[1000] px-6 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-500 opacity-0';
    toast.style.backgroundColor = 'rgba(0,0,0,0.9)';
    toast.style.borderColor = color;
    toast.style.color = color;
    toast.innerHTML = `<b class="uppercase text-[10px] tracking-widest font-black">${message}</b>`;
    document.body.appendChild(toast);
    
    setTimeout(() => { toast.classList.add('opacity-100', '-translate-y-2'); }, 100);
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
};

// Extensão da Função de Coleta com Efeitos Visuais
if (window.GameState) {
    const originalCollect = window.GameState.collect;
    window.GameState.collect = function() {
        if (this.miningValue <= 0) return;
        
        const btn = document.getElementById('btn-collect');
        const target = document.querySelector('.fa-microchip.text-yellow-400');
        
        if (btn && target) {
            const targetRect = target.getBoundingClientRect();
            const btnRect = btn.getBoundingClientRect();
            
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    const particle = document.createElement('div');
                    particle.className = 'collect-particle';
                    
                    const startX = btnRect.left + (btnRect.width / 2);
                    const startY = btnRect.top + (btnRect.height / 2);
                    
                    particle.style.width = '8px';
                    particle.style.height = '8px';
                    particle.style.left = startX + 'px';
                    particle.style.top = startY + 'px';
                    
                    document.body.appendChild(particle);
                    particle.offsetHeight; // Força reflow
                    
                    particle.style.left = (targetRect.left + 5) + 'px';
                    particle.style.top = (targetRect.top + 5) + 'px';
                    particle.style.opacity = '0';
                    
                    setTimeout(() => {
                        particle.remove();
                        target.classList.add('chip-impact');
                        
                        window.updatePrecisionTooltip(true);
                        setTimeout(() => window.updatePrecisionTooltip(false), 2000);
                        
                        setTimeout(() => target.classList.remove('chip-impact'), 500);
                    }, 800);
                }, i * 100);
            }
        }
        
        originalCollect.apply(this);
    };
}