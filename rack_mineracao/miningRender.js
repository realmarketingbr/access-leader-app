// js/miningRender.js

// Exportamos a função para que outros arquivos possam "enxergá-la"
export function renderMiningRack(slots, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = ''; // Limpa o rack antes de desenhar
  
  slots.forEach((slot, index) => {
    const slotElement = document.createElement('div');
    slotElement.className = 'mining-slot p-4 border-2 border-dashed border-gray-600 rounded-lg';
    
    // Lógica para mostrar se o slot está vazio ou com máquina
    if (slot.active) {
      slotElement.innerHTML = `<p class="text-green-400">Máquina: ${slot.name}</p>`;
    } else {
      slotElement.innerHTML = `<p class="text-gray-500">Slot Vazio ${index + 1}</p>`;
    }
    
    container.appendChild(slotElement);
  });
  
  console.log("Rack renderizado com sucesso!");
}