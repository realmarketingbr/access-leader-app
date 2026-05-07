/**
 * ACCESS LEADER - Stage Controller
 * Mantém a mecânica original, apenas organiza o DOM.
 */
window.GameRender = {
  // Prepara o container principal sem alterar estilos globais
  setupStage(gameType) {
    const area = document.getElementById('game-area');
    if (!area) return;
    
    // Limpeza de segurança para evitar sobreposição
    area.innerHTML = '';
    
    // Ajusta o layout apenas para o tipo de jogo específico
    if (gameType === 'memory') {
      area.style.display = 'grid';
      area.style.gridTemplateColumns = 'repeat(4, 1fr)';
      area.style.gridTemplateRows = 'repeat(4, 1fr)';
      area.style.gap = '5px';
      area.style.alignContent = 'center';
    } else {
      // Reseta para a mecânica original de posicionamento absoluto/relativo
      // Garante que o jogo ocupe a tela toda removendo propriedades de grid anteriores
      area.style.display = 'block';
      area.style.position = 'relative';
      area.style.gridTemplateColumns = 'none';
      area.style.gridTemplateRows = 'none';
      area.style.gap = '0px';
      area.style.overflow = 'hidden';
    }
  },
  
  // Cria elementos seguindo o padrão original do seu Render.js
  spawnEntity(tag, className) {
    return window.Render.createObject(tag, className);
  }
};