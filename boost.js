/**
 * ACCESS LEADER - Sistema de Boost & Bônus Estruturado v6.6
 * Inclui: Faucets (Anúncios), Parcerias e Social Bonus (Grupo + Canal)
 */

window.BoostSystem = {
    activeBonuses: [],
    completedSocial: JSON.parse(localStorage.getItem('completedSocialTasks')) || [],
    timerInterval: null,
    
    // Função para abrir/fechar o modal chamada pelo botão inferior
    toggle() {
        const modal = document.getElementById('boost-modal');
        if (modal) {
            modal.classList.toggle('hidden');
            // Ao abrir, renderiza as tarefas e inicia a atualização visual
            if (!modal.classList.contains('hidden')) {
                this.renderTasks();
            }
        }
    },
    
    renderTasks() {
        // ATUALIZAÇÃO: Seletor alterado para o ID específico do seu HTML atual
        const container = document.getElementById('boost-items');
        if (!container) return;
        
        container.innerHTML = `
            <!-- 1. BÔNUS ESPECIAIS PERMANENTES -->
            <div class="mb-6 space-y-3">
                <b class="text-[10px] block uppercase opacity-50 mb-2 tracking-widest text-[#40E0D0]">Social Power-Up (Fixo)</b>
                
                <!-- Canal Telegram -->
                <button onclick="BoostSystem.claimSocial('tg_channel', 0.7)" class="w-full app-card p-4 rounded-2xl flex items-center gap-4 text-left border-l-4 border-[#40E0D0]">
                    <div class="w-10 h-10 bg-[#40E0D0]/10 text-[#40E0D0] flex items-center justify-center rounded-xl"><i class="fas fa-bullhorn"></i></div>
                    <div class="flex-grow">
                        <b class="text-[11px] block uppercase">Canal Oficial</b>
                        <span class="text-[9px] opacity-50">+0.70 TH/s Permanente</span>
                    </div>
                    <i class="fas ${this.completedSocial.includes('tg_channel') ? 'fa-check text-green-500' : 'fa-chevron-right opacity-20'}"></i>
                </button>

                <!-- Grupo Telegram -->
                <button onclick="BoostSystem.claimSocial('tg_group', 0.5)" class="w-full app-card p-4 rounded-2xl flex items-center gap-4 text-left border-l-4 border-[#0088cc]">
                    <div class="w-10 h-10 bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center rounded-xl"><i class="fab fa-telegram-plane"></i></div>
                    <div class="flex-grow">
                        <b class="text-[11px] block uppercase">Grupo de Suporte</b>
                        <span class="text-[9px] opacity-50">+0.50 TH/s Permanente</span>
                    </div>
                    <i class="fas ${this.completedSocial.includes('tg_group') ? 'fa-check text-green-500' : 'fa-chevron-right opacity-20'}"></i>
                </button>
            </div>

            <!-- 2. FAUCETS & ANÚNCIOS (TEMPORÁRIOS ACUMULATIVOS) -->
            <div class="mb-6">
                <b class="text-[10px] block uppercase opacity-50 mb-3 tracking-widest">Mining Turbo (Faucets)</b>
                <div class="p-4 rounded-2xl bg-[#40E0D0]/5 border border-[#40E0D0]/20 text-center">
                    <p class="text-[10px] text-white font-bold mb-3 uppercase italic">
                        <span class="text-[#40E0D0]">BÔNUS DISPONÍVEL:</span> +1.0 TH/s DURANTE 1 HORA POR ANÚNCIO!
                    </p>
                    <button onclick="BoostSystem.startTempBoost('faucet_ad', 1.0, 60)" class="w-full bg-[#40E0D0] text-black font-black py-4 rounded-xl text-[10px] uppercase shadow-[0_0_15px_rgba(64,224,208,0.2)]">
                        Ver Anúncio e Ativar
                    </button>
                </div>
            </div>

            <!-- 3. VISITAR PARCERIAS -->
            <div class="mb-6">
                <b class="text-[10px] block uppercase opacity-50 mb-3 tracking-widest">Visitar Parcerias</b>
                <div class="space-y-2">
                    <button onclick="BoostSystem.startTempBoost('partner_alpha', 0.8, 30)" class="w-full app-card p-3 rounded-xl flex justify-between items-center border border-white/5">
                        <span class="text-[10px] font-bold uppercase">Parceiro Alpha</span>
                        <b class="text-[9px] text-[#40E0D0] uppercase italic">+0.8 TH/s POR 30 MINUTOS</b>
                    </button>
                    <button onclick="BoostSystem.startTempBoost('partner_beta', 1.2, 45)" class="w-full app-card p-3 rounded-xl flex justify-between items-center border border-white/5">
                        <span class="text-[10px] font-bold uppercase">Parceiro Beta</span>
                        <b class="text-[9px] text-[#40E0D0] uppercase italic">+1.2 TH/s POR 45 MINUTOS</b>
                    </button>
                </div>
            </div>

            <!-- PAINEL DE CRONÔMETROS -->
            <div id="boost-timers-container" class="mt-4 space-y-2"></div>
        `;
        this.updateTimerUI();
    },
    
    async claimSocial(taskId, amount) {
        if (this.completedSocial.includes(taskId)) return alert("Você já resgatou este bônus!");
        
        const url = taskId === 'tg_channel' ? 'https://t.me/seucanal' : 'https://t.me/seugrupo';
        window.open(url, '_blank');
        
        if (window.GameState) {
            window.GameState.hashrate += amount;
            this.completedSocial.push(taskId);
            localStorage.setItem('completedSocialTasks', JSON.stringify(this.completedSocial));
            
            this.refreshAll();
            alert(`BÔNUS ATIVADO!\nSeu poder aumentou permanentemente em +${amount} TH/s.`);
            if (window.saveUserData) await window.saveUserData();
        }
    },
    
    async startTempBoost(id, amount, minutes) {
        window.open('https://google.com', '_blank');
        
        if (window.GameState) {
            window.GameState.hashrate += amount;
            const endTime = Date.now() + (minutes * 60 * 1000);
            
            this.activeBonuses.push({ id, amount, endTime });
            
            this.refreshAll();
            alert(`TURBO ATIVADO!\nVocê recebeu +${amount} TH/s por ${minutes} MINUTOS.`);
            
            this.initGlobalTimer();
            if (window.saveUserData) await window.saveUserData();
        }
    },
    
    initGlobalTimer() {
        if (this.timerInterval) return;
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            let changed = false;
            
            this.activeBonuses = this.activeBonuses.filter(boost => {
                if (now >= boost.endTime) {
                    window.GameState.hashrate -= boost.amount;
                    changed = true;
                    return false;
                }
                return true;
            });
            
            if (changed) this.refreshAll();
            if (this.activeBonuses.length === 0) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            this.updateTimerUI();
        }, 1000);
    },
    
    updateTimerUI() {
        const timerBox = document.getElementById('boost-timers-container');
        if (!timerBox) return;
        
        if (this.activeBonuses.length === 0) {
            timerBox.innerHTML = '';
            return;
        }
        
        let html = `<p class="text-[8px] font-black uppercase text-[#40E0D0] mb-2 animate-pulse tracking-[0.2em]">Bônus Ativos Acumulados</p>`;
        this.activeBonuses.forEach(b => {
            const remaining = Math.max(0, Math.floor((b.endTime - Date.now()) / 1000));
            const m = Math.floor(remaining / 60);
            const s = remaining % 60;
            html += `
                <div class="flex justify-between items-center bg-white/5 p-2 rounded-lg border border-white/10">
                    <span class="text-[9px] font-bold text-[#40E0D0]">+${b.amount} TH/s</span>
                    <span class="text-[9px] font-mono font-black text-white/50">${m}m ${s}s restantes</span>
                </div>
            `;
        });
        timerBox.innerHTML = html;
    },
    
    refreshAll() {
        const display = document.getElementById('display-hashrate');
        if (display && window.GameState) {
            display.innerText = window.GameState.hashrate.toFixed(1);
        }
        // Atualiza a lista visual apenas se o modal estiver aberto
        const modal = document.getElementById('boost-modal');
        if (modal && !modal.classList.contains('hidden')) {
            this.renderTasks();
        }
    }
};