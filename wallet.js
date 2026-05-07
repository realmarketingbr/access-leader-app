const WalletSystem = {
  currentTab: 'withdraw',
  
  toggle() {
    const modal = document.getElementById('wallet-modal');
    if (!modal) return;
    
    modal.classList.toggle('hidden');
    
    if (!modal.classList.contains('hidden')) {
      // ATUALIZAÇÃO: Preenchimento dinâmico do conteúdo para evitar tela preta
      const content = document.getElementById('wallet-content');
      if (content) {
        content.innerHTML = `
              <div class="app-card p-6 rounded-[2rem] text-center border-[#40E0D0]/20 mb-6">
                  <span class="text-[10px] uppercase opacity-40 font-black tracking-widest">Saldo Disponível</span>
                  <h2 id="wallet-display-balance" class="text-3xl font-black text-white mt-2">$ 0.0000</h2>
              </div>
              <div id="tx-history-list" class="space-y-3 overflow-y-auto max-h-[300px]">
                  <!-- Histórico aparecerá aqui -->
              </div>
          `;
      }
      
      this.updateDisplay();
      this.loadHistory(); // Carrega o histórico do Firestore e transações locais
    }
  },
  
  updateDisplay() {
    const balance = window.GameState.balance || 0;
    const balanceEl = document.getElementById('wallet-display-balance');
    if (balanceEl) balanceEl.innerText = `$ ${balance.toFixed(4)}`;
    
    const isLocked = balance < 5.00;
    const lockedEl = document.getElementById('withdraw-locked');
    const unlockedEl = document.getElementById('withdraw-unlocked');
    
    if (lockedEl) lockedEl.classList.toggle('hidden', !isLocked);
    if (unlockedEl) unlockedEl.classList.toggle('hidden', isLocked);
  },
  
  switchTab(tab) {
    this.currentTab = tab;
    document.querySelectorAll('.wallet-tab-content').forEach(c => c.classList.add('hidden'));
    const targetContent = document.getElementById(`wallet-content-${tab}`);
    if (targetContent) targetContent.classList.remove('hidden');
    
    document.querySelectorAll('[id^="tab-"]').forEach(btn => {
      btn.style.opacity = btn.id === `tab-${tab}` ? "1" : "0.5";
      btn.classList.toggle('bg-white/10', btn.id === `tab-${tab}`);
    });
  },
  
  /**
   * NOVA FUNÇÃO: Recebe transações locais (como compras da loja)
   * Integrado com o playmining.js
   */
  async addLocalTransaction(data) {
    if (!window.GameState.transacoesLocais) {
      window.GameState.transacoesLocais = [];
    }
    
    const transaction = {
      date: new Date().toISOString(),
      amount: data.amount,
      type: data.type || 'Compra',
      detail: data.detail || 'Item da Loja',
      status: 'completed'
    };
    
    window.GameState.transacoesLocais.unshift(transaction);
    
    // Se a aba de histórico estiver aberta, atualiza a lista na hora
    if (this.currentTab === 'history') {
      this.loadHistory();
    }
    
    // Salva no Firebase para persistência
    if (window.saveUserData) await window.saveUserData();
  },
  
  async processWithdraw() {
    const addressEl = document.getElementById('wallet-address');
    if (!addressEl) return;
    
    const address = addressEl.value;
    const amount = window.GameState.balance;
    
    if (address.length < 32) {
      alert("Endereço Solana Inválido");
      return;
    }
    
    try {
      const transaction = {
        date: new Date().toISOString(),
        amount: amount,
        address: address,
        status: 'pending',
        type: 'Withdraw'
      };
      
      if (window.db && window.currentUserUid) {
        const { doc, updateDoc, arrayUnion } = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js");
        const userRef = doc(window.db, "usuarios", window.currentUserUid);
        
        await updateDoc(userRef, {
          transacoes: arrayUnion(transaction),
          balance: 0
        });
        
        window.GameState.balance = 0;
        const displayBal = document.getElementById('display-balance');
        if (displayBal) displayBal.innerText = "$ 0.0000";
        
        this.updateDisplay();
        alert("Saque solicitado com sucesso!");
        this.switchTab('history');
        this.loadHistory();
      }
    } catch (error) {
      console.error("Erro ao processar saque:", error);
      alert("Erro na transação. Tente novamente.");
    }
  },
  
  async loadHistory() {
    const list = document.getElementById('tx-history-list');
    if (!list) return;
    
    list.innerHTML = '<p class="text-center py-10 opacity-30 text-[10px] uppercase font-black">Carregando...</p>';
    
    try {
      let allTxs = [];
      
      // 1. Puxa transações do banco (Withdraws)
      if (window.db && window.currentUserUid) {
        const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js");
        const userDoc = await getDoc(doc(window.db, "usuarios", window.currentUserUid));
        if (userDoc.exists() && userDoc.data().transacoes) {
          allTxs = [...userDoc.data().transacoes];
        }
      }
      
      // 2. Adiciona as transações locais (Compras)
      if (window.GameState.transacoesLocais) {
        allTxs = [...allTxs, ...window.GameState.transacoesLocais];
      }
      
      // Ordena por data (mais recente primeiro)
      allTxs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      if (allTxs.length > 0) {
        list.innerHTML = allTxs.map(tx => `
          <div class="app-card p-4 rounded-2xl flex justify-between items-center border-l-2 ${tx.type === 'Withdraw' ? 'border-yellow-500' : 'border-[#40E0D0]'}">
            <div>
              <b class="text-[10px] block uppercase">${tx.type}${tx.detail ? ': ' + tx.detail : ''}</b>
              <small class="text-[8px] opacity-40">${new Date(tx.date).toLocaleDateString()}</small>
            </div>
            <div class="text-right">
              <b class="${tx.type === 'Withdraw' ? 'text-white' : 'text-[#40E0D0]'} block text-xs">
                ${tx.type === 'Withdraw' ? '$' : 'L$'} ${tx.amount.toFixed(tx.type === 'Withdraw' ? 4 : 2)}
              </b>
              <span class="text-[8px] uppercase font-bold ${tx.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}">${tx.status}</span>
            </div>
          </div>
        `).join('');
      } else {
        list.innerHTML = '<p class="text-center py-10 opacity-30 text-[10px] uppercase font-black">Nenhum histórico.</p>';
      }
    } catch (e) {
      console.error(e);
      list.innerHTML = '<p class="text-center py-10 text-red-500 text-[8px]">Erro ao carregar histórico.</p>';
    }
  }
};