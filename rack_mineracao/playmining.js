/**
 * ACCESS LEADER - Play Mining Engine
 * Gerenciamento de Máquinas, Loja, Expansão de Rack e Sistema de Cofre (Inventário)
 */
window.PlayMining = {
  // Lista de peças com raridade integrada
  shopItems: [
    { id: 'gpu_v1', name: 'Placa Básica V1', power: 0.5, price: 10.00, icon: 'fa-microchip', color: '#40E0D0' },
    { id: 'gpu_v2', name: 'Placa Turbo V2', power: 1.2, price: 25.00, icon: 'fa-bolt', color: '#40E0D0' },
    { id: 'cpu_miner', name: 'Processador Miner', power: 2.5, price: 50.00, icon: 'fa-server', color: '#f59e0b' },
    { id: 'asic_pro', name: 'ASIC Ultra', power: 5.0, price: 120.00, icon: 'fa-bolt-lightning', color: '#ef4444' }
  ],
  
  // Renderiza os slots de máquinas na tela inicial
  renderRack() {
    const grid = document.getElementById('machine-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Define o limite atual de slots (padrão 6)
    const maxSlots = (window.GameState && window.GameState.maxSlots) ? window.GameState.maxSlots : 6;
    const currentMachines = window.GameState.machines || [];
    
    // Renderiza os quadrados (slots) para as máquinas de acordo com o maxSlots
    for (let i = 0; i < maxSlots; i++) {
      const machine = currentMachines[i];
      const slot = document.createElement('div');
      
      slot.className = `machine-slot ${machine ? 'machine-active' : ''}`;
      
      if (machine) {
        slot.style.borderColor = machine.color || '#40E0D0';
        slot.innerHTML = `
            <div class="text-center">
                <i class="fas ${machine.icon} text-xl mb-1" style="color: ${machine.color || '#40E0D0'}"></i>
                <span class="block text-[7px] font-black uppercase text-white/50">${machine.power} TH/s</span>
            </div>
        `;
      } else {
        // Slot vazio visível para simular o espaço disponível
        slot.innerHTML = `<i class="fas fa-plus text-white/5 opacity-20"></i>`;
      }
      grid.appendChild(slot);
    }
    
    // Botão visual para expansão do Rack usando Leader Coins
    if (maxSlots < 12) {
      const expandBtn = document.createElement('div');
      expandBtn.className = "machine-slot border-dashed border-white/10 cursor-pointer hover:bg-white/5 transition";
      expandBtn.innerHTML = `
        <div class="text-center opacity-40">
          <i class="fas fa-arrow-up-right-from-square text-xs"></i>
          <span class="block text-[6px] mt-1 uppercase font-bold">Expandir</span>
        </div>`;
      expandBtn.onclick = () => this.unlockNextSlot();
      grid.appendChild(expandBtn);
    }
  },
  
  // Renderiza as peças guardadas no Cofre (vault)
  renderVault() {
    const vaultContainer = document.getElementById('vault-items');
    if (!vaultContainer) return;
    
    const inventory = window.GameState.vault || [];
    
    if (inventory.length === 0) {
      vaultContainer.innerHTML = `
        <div class="col-span-2 flex flex-col items-center justify-center py-12 opacity-20">
            <i class="fas fa-box-open text-4xl mb-2"></i>
            <p class="text-[10px] uppercase font-black tracking-widest">Cofre Vazio</p>
        </div>
      `;
      return;
    }
    
    vaultContainer.innerHTML = inventory.map((item, index) => `
        <div class="app-card p-3 rounded-xl flex items-center justify-between border border-white/5 mb-2">
            <div class="flex items-center gap-3">
                <i class="fas ${item.icon} text-lg" style="color: ${item.color}"></i>
                <div>
                    <b class="text-[10px] block uppercase text-white">${item.name}</b>
                    <span class="text-[8px] text-white/40">${item.power} TH/s</span>
                </div>
            </div>
            <button onclick="PlayMining.installFromVault(${index})" 
                 class="bg-white/10 hover:bg-[#40E0D0] hover:text-black text-white text-[8px] font-bold px-3 py-2 rounded-lg transition-all uppercase">
                Instalar
            </button>
        </div>
    `).join('');
  },
  
  openShop() {
    const modal = document.getElementById('shop-modal');
    const container = document.getElementById('shop-items');
    if (!modal || !container) return;
    
    modal.classList.remove('hidden');
    
    container.innerHTML = this.shopItems.map(item => `
        <div class="app-card p-4 rounded-2xl flex items-center justify-between border-l-4" style="border-color: ${item.color}">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center" style="color: ${item.color}">
                    <i class="fas ${item.icon} text-xl"></i>
                </div>
                <div>
                    <b class="text-xs block uppercase">${item.name}</b>
                    <span class="text-[9px] font-bold" style="color: ${item.color}">+${item.power} TH/s</span>
                </div>
            </div>
            <button onclick="PlayMining.buyItem('${item.id}')" 
                  class="bg-[#40E0D0] text-black text-[9px] font-black px-4 py-2 rounded-lg uppercase shadow-lg active:scale-95">
                L$ ${item.price.toFixed(2)}
            </button>
        </div>
    `).join('');
  },
  
  closeShop() {
    const modal = document.getElementById('shop-modal');
    if (modal) modal.classList.add('hidden');
  },
  
  // Compra e envia para o Cofre (vault)
  async buyItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    
    if (window.GameState.leaderCoin < item.price) {
      return alert("Leader Coins insuficientes!");
    }
    
    window.GameState.leaderCoin -= item.price;
    
    if (!window.GameState.vault) window.GameState.vault = [];
    window.GameState.vault.push({ ...item, purchaseDate: Date.now() });
    
    if (window.WalletSystem && window.WalletSystem.addLocalTransaction) {
      window.WalletSystem.addLocalTransaction({
        type: 'Compra',
        amount: item.price,
        detail: item.name
      });
    }
    
    const coinEl = document.getElementById('display-leadercoin');
    if (coinEl) coinEl.innerText = window.GameState.leaderCoin.toFixed(2);
    
    if (window.GameState.updateUI) window.GameState.updateUI();
    
    alert(`${item.name} comprada e enviada para o seu COFRE!`);
    
    this.renderVault();
    if (window.saveUserData) await window.saveUserData();
  },
  
  // Instala a máquina do cofre para o Rack ativo
  async installFromVault(index) {
    const inventory = window.GameState.vault || [];
    const item = inventory[index];
    const maxSlots = window.GameState.maxSlots || 6;
    const currentMachines = window.GameState.machines || [];
    
    if (currentMachines.length >= maxSlots) {
      return alert("Rack cheia! Expanda o espaço para instalar.");
    }
    
    if (!window.GameState.machines) window.GameState.machines = [];
    
    window.GameState.machines.push(item);
    window.GameState.hashrate += item.power;
    window.GameState.vault.splice(index, 1);
    
    this.renderRack();
    this.renderVault();
    
    const hashEl = document.getElementById('display-hashrate');
    if (hashEl) hashEl.innerText = window.GameState.hashrate.toFixed(1);
    
    if (window.saveUserData) await window.saveUserData();
    alert(`${item.name} instalada e minerando!`);
  },
  
  // Lógica para desbloquear novos slots de expansão
  async unlockNextSlot() {
    const currentSlots = window.GameState.maxSlots || 6;
    const upgradePrice = currentSlots * 15;
    
    if (window.GameState.leaderCoin < upgradePrice) {
      return alert(`L$ ${upgradePrice.toFixed(2)} necessários para expandir!`);
    }
    
    if (confirm(`Deseja liberar o slot #${currentSlots + 1} por L$ ${upgradePrice.toFixed(2)}?`)) {
      window.GameState.leaderCoin -= upgradePrice;
      window.GameState.maxSlots = currentSlots + 1;
      
      const coinEl = document.getElementById('display-leadercoin');
      if (coinEl) coinEl.innerText = window.GameState.leaderCoin.toFixed(2);
      
      if (window.GameState.updateUI) window.GameState.updateUI();
      
      this.renderRack();
      if (window.saveUserData) await window.saveUserData();
    }
  }
};