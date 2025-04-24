let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarItem(nome, preco) {
  carrinho.push({ nome, preco });
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  alert(`${nome} adicionada ao carrinho!`);
}
