/**
 * ACCESS LEADER - Motor de Tradução
 */
window.LanguageEngine = {
  current: 'PT',
  texts: {
    PT: {
      hashrate_label: "Hashrate Ativo",
      yield_label: "Rendimento:",
      processing_label: "Processando",
      btn_collect: "Coletar Lucros"
    },
    EN: {
      hashrate_label: "Active Hashrate",
      yield_label: "Yield:",
      processing_label: "Processing",
      btn_collect: "Collect Profits"
    }
  },
  toggle() {
    this.current = this.current === 'PT' ? 'EN' : 'PT';
    const label = document.getElementById('lang-label');
    if (label) label.innerText = this.current;
    this.updateDOM();
  },
  updateDOM() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (this.texts[this.current][key]) {
        el.innerText = this.texts[this.current][key];
      }
    });
  }
};