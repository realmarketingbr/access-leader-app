const Render = {
  area: () => document.getElementById('game-area'),
  
  createObject: (tag, className) => {
    const el = document.createElement(tag);
    el.className = className;
    const area = document.getElementById('game-area');
    if (area) area.appendChild(el);
    return el;
  },
  
  clear: () => {
    const area = document.getElementById('game-area');
    if (area) {
      area.innerHTML = '';
      // Atualização: Removido o display fixo para evitar conflitos com o grid do Neural Link
      area.style.gridTemplateColumns = '';
    }
  }
};

// Torna o Render disponível para outros scripts
window.Render = Render;