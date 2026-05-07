/**
 * ACCESS LEADER - Sistema de Tutorial e Boas-vindas
 * Versão Final: Motor de Alta Resiliência + Design & Texto Originais
 */

window.TutorialSystem = {
    attempts: 0,
    
    checkFirstAccess() {
        // Se já houver um tutorial na tela ou o usuário já viu, não faz nada
        if (document.getElementById('tutorial-overlay')) return;
        if (localStorage.getItem('hasSeenTutorial') === 'true') return;

        this.startTutorial();
    },

    startTutorial() {
        // Busca o elemento de Hashrate (ID ou Classe original)
        const target = document.getElementById('display-hashrate') || 
                       document.querySelector('.hashrate-panel');

        // Lógica de resiliência: Se o Firebase ainda não renderizou o elemento, tenta de novo
        if (!target && this.attempts < 15) {
            this.attempts++;
            setTimeout(() => this.startTutorial(), 500);
            return;
        }

        // Criar Overlay (Bloqueia interação com o fundo para foco)
        const overlay = document.createElement('div');
        overlay.id = 'tutorial-overlay';
        overlay.className = 'fixed inset-0 z-[9998] bg-black/20 pointer-events-none';
        document.body.appendChild(overlay);

        this.showStep(target, "HASH");
    },

    showStep(targetElement, type) {
        const oldBox = document.getElementById('tutorial-box');
        if (oldBox) oldBox.remove();

        const rect = targetElement?.getBoundingClientRect();
        const isMobile = window.innerWidth < 768; // Media Query Check
        
        const box = document.createElement('div');
        box.id = 'tutorial-box';
        
        // Ajuste de largura responsiva (Otimizado para iPhone SE)
        const boxWidth = isMobile ? 240 : 288;
        
        box.className = 'fixed z-[9999] bg-[#1a1a1a] border-2 border-[#40E0D0] p-5 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-center transition-all duration-300 pointer-events-auto';
        box.style.width = `${boxWidth}px`;

        let content = "";
        let nextAction = "";
        let buttonText = "Entendido";
        let arrowClass = "";

        if (type === "HASH") {
            // Posicionamento inteligente para Hashrate
            const topPos = rect ? (rect.bottom + 20) : 150;
            const leftPos = rect ? (rect.left + (rect.width / 2) - (boxWidth / 2)) : 20;
            
            box.style.top = `${topPos}px`;
            box.style.left = `${Math.max(10, Math.min(leftPos, window.innerWidth - (boxWidth + 10)))}px`;
            
            content = "Seu poder de mineração é medido em <b>TH/s</b>. Quanto maior, mais moedas você gera automaticamente.";
            nextAction = "window.TutorialSystem.goToVaultStep()";
            arrowClass = 'top-[-12px] left-1/2 -translate-x-1/2 rotate-180';
        } 
        else if (type === "VAULT") {
            // Posicionamento de precisão para o Cofre
            if (rect) {
                const leftPos = rect.left + (rect.width / 2) - (boxWidth / 2);
                box.style.left = `${Math.max(5, Math.min(leftPos, window.innerWidth - (boxWidth + 5)))}px`;
                
                // No Mobile (iPhone SE), força a caixa para cima para evitar sobreposição no rack
                if (isMobile) {
                    box.style.top = `${rect.top - 190}px`;
                    arrowClass = 'bottom-[-12px] left-1/2 -translate-x-1/2'; 
                } else {
                    box.style.top = `${rect.bottom + 20}px`;
                    arrowClass = 'top-[-12px] left-1/2 -translate-x-1/2 rotate-180'; 
                }
            }
            content = "No <b>Cofre</b>, você gerencia itens valiosos para criar máquinas e turbinar seu rack de mineração.";
            buttonText = "Adquirir Turbo MK II";
            nextAction = "window.TutorialSystem.startFirstCrafting()";
        }

        box.innerHTML = `
            <div class="text-white text-[15px] font-medium leading-relaxed mb-4 text-left">
                ${content}
            </div>
            <div class="flex justify-end">
                <button onclick="${nextAction}"
                    class="bg-[#40E0D0] text-black text-[11px] font-black px-4 py-2.5 rounded-xl uppercase hover:brightness-110 active:scale-95 transition-all shadow-lg leading-tight">
                    ${buttonText}
                </button>
            </div>
            <div class="absolute w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[12px] border-t-[#40E0D0] ${arrowClass}"></div>
        `;

        document.body.appendChild(box);
    },

    goToVaultStep() {
        // Busca o botão de cofre com seletor de precisão para evitar o 'Coletar'
        const vaultBtn = document.querySelector('[onclick*="openVault"]') || 
                         document.querySelector('.fa-gem')?.parentElement;
        
        if (vaultBtn) {
            // No Mobile, centraliza o elemento na tela antes de mostrar a caixa
            vaultBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
            
            setTimeout(() => this.showStep(vaultBtn, "VAULT"), 500);
        } else {
            this.showStep(null, "VAULT");
        }
    },

    startFirstCrafting() {
        this.closeTutorial();
        // Dispara a abertura do cofre como no script original
        if (typeof window.openVault === "function") {
            window.openVault();
        }
    },

    closeTutorial() {
        document.getElementById('tutorial-overlay')?.remove();
        document.getElementById('tutorial-box')?.remove();
        localStorage.setItem('hasSeenTutorial', 'true');
    }
};

/**
 * Inicialização Inteligente
 */
window.addEventListener('load', () => {
    // Dá um pequeno fôlego para o Firebase injetar os dados antes de checar
    setTimeout(() => window.TutorialSystem.checkFirstAccess(), 1000);
});

// Mantém compatibilidade com a chamada direta do Firebase
window.startTutorialIfReady = () => {
    if (window.TutorialSystem) window.TutorialSystem.checkFirstAccess();
};