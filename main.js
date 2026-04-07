let cart = [];
let currentProductObj = null;
let currentSelection = {}; // { 'flavor_id': qty } or { 'qty': X } for singles

const products = [
  {
    id: 'caja4',
    name: 'Caja x4 Galletas NY',
    desc: 'Elige tus 4 sabores favoritos y arma tu caja perfecta.',
    price: 12.00,
    category: 'destacados', 
    images: ['./galletas/galleta_9.jpg', './galletas/galleta_1.jpg'],
    type: 'combo',
    maxSelection: 4
  },
  {
    id: 'cake',
    name: 'Cookie Cake',
    desc: 'Nuestra espectacular Galleta XL rellena para compartir en ocasiones especiales.',
    price: 25.00,
    category: 'destacados',
    images: ['./galletas/galleta_16.jpg', './galletas/galleta_14.jpg'],
    type: 'single'
  },
  {
    id: 'catira',
    name: 'La Catira',
    desc: 'Nuestra clásica galleta de masa clara sabor a vainilla con increíbles chispas de chocolate derretidas.',
    price: 3.50,
    category: 'clasicas',
    images: ['./galletas/galleta_8.jpg', './galletas/galleta_5.jpg', './galletas/galleta_11.jpg', './galletas/galleta_17.jpg'],
    type: 'single'
  },
  {
    id: 'chocho',
    name: 'Chocho',
    desc: 'Masa oscura de puro cacao para los verdaderos amantes del doble chocolate.',
    price: 3.50,
    category: 'clasicas',
    images: ['./galletas/galleta_6.jpg', './galletas/galleta_2.jpg', './galletas/galleta_15.jpg'],
    type: 'single'
  },
  {
    id: 'red',
    name: 'Red Velvet',
    desc: 'Hermosa masa vinotinto con un sabor inconfundible y full chocolate vibrante.',
    price: 4.50,
    category: 'rellenas',
    images: ['./galletas/galleta_13.jpg', './galletas/galleta_3.jpg', './galletas/galleta_4.jpg', './galletas/galleta_10.jpg', './galletas/galleta_12.jpg'],
    type: 'single'
  },
  {
    id: 'duo',
    name: 'Dúo Pack',
    desc: 'Llévate un par perfecto y prueba lo mejor de ambos mundos.',
    price: 7.00,
    category: 'rellenas',
    images: ['./galletas/galleta_7.jpg', './galletas/galleta_10.jpg'],
    type: 'combo',
    maxSelection: 2
  }
];

const availableFlavors = [
  { id: 'La Catira', name: 'La Catira' },
  { id: 'Chocho', name: 'Chocho' },
  { id: 'Red Velvet', name: 'Red Velvet' }
];

// ----------------------------------------------------
// INITIALIZATION AND RENDERING
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  setupNavigation();
});

function renderProducts() {
  const cCarousel = document.getElementById('carouselDestacados');
  const cClasicas = document.getElementById('listClasicas');
  const cRellenas = document.getElementById('listRellenas');

  let htmlCarousel = '';
  let htmlClasicas = '';
  let htmlRellenas = '';

  products.forEach(p => {
    // Generate card HTML
    if (p.category === 'destacados') {
      htmlCarousel += `
        <div class="carousel-item" onclick="openProductModal('${p.id}')">
          <img src="${p.images[0]}" alt="${p.name}" />
          <div class="carousel-info">
            <h3>${p.name}</h3>
            <p>${p.desc.substring(0, 45)}...</p>
            <div class="carousel-action">
              <span class="price">$${p.price.toFixed(2)}</span>
              <button class="add-btn">+</button>
            </div>
          </div>
        </div>
      `;
    } else {
      const isRellena = p.category === 'rellenas';
      const template = `
        <div class="product-card" onclick="openProductModal('${p.id}')">
          <div class="product-info">
            <h3>${p.name}</h3>
            <p>${p.desc}</p>
            <span class="price">$${p.price.toFixed(2)}</span>
            <button class="add-btn-text">Ver Detalles +</button>
          </div>
          <img src="${p.images[0]}" alt="${p.name}" class="product-image" />
        </div>
      `;
      if (isRellena) htmlRellenas += template;
      else htmlClasicas += template;
    }
  });

  cCarousel.innerHTML = htmlCarousel;
  cClasicas.innerHTML = htmlClasicas;
  cRellenas.innerHTML = htmlRellenas;
}

// ----------------------------------------------------
// NAVIGATION LOGIC
// ----------------------------------------------------
function setupNavigation() {
  const categoryItems = document.querySelectorAll('.category-item');
  const sections = document.querySelectorAll('.section');
  const navList = document.querySelector('.category-list');

  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      categoryItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const scrollLeftTarget = item.offsetLeft - (navList.clientWidth / 2) + (item.clientWidth / 2);
      navList.scrollTo({ left: scrollLeftTarget, behavior: 'smooth' });

      const targetId = item.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const yOffset = -160; 
        const y = targetSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({top: y, behavior: 'smooth'});
      }
    });
  });

  const observerOptions = { root: null, rootMargin: '-180px 0px -50% 0px', threshold: 0 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        const navItem = document.querySelector(`.category-item[data-target="${id}"]`);
        
        if (navItem && !navItem.classList.contains('active')) {
          categoryItems.forEach(i => i.classList.remove('active'));
          navItem.classList.add('active');
          const scrollLeftTarget = navItem.offsetLeft - (navList.clientWidth / 2) + (navItem.clientWidth / 2);
          navList.scrollTo({ left: scrollLeftTarget, behavior: 'smooth' });
        }
      }
    });
  }, observerOptions);

  sections.forEach(s => observer.observe(s));
}

// ----------------------------------------------------
// PRODUCT MODAL LOGIC (GALLERY & CONFIGURATOR)
// ----------------------------------------------------
window.openProductModal = function(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  currentProductObj = p;
  currentSelection = {};

  // Setup Gallery
  document.getElementById('mainProductImage').src = p.images[0];
  const thumbContainer = document.getElementById('thumbnailGallery');
  
  if (p.images.length > 1) {
    thumbContainer.innerHTML = p.images.map((imgUrl, idx) => `
      <img src="${imgUrl}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="changeMainImage('${imgUrl}', this)" />
    `).join('');
    thumbContainer.style.display = 'flex';
  } else {
    thumbContainer.style.display = 'none';
  }

  // Setup Info
  document.getElementById('modalProductName').textContent = p.name;
  document.getElementById('modalProductDesc').textContent = p.desc;
  document.getElementById('modalProductPrice').textContent = `$${p.price.toFixed(2)}`;

  // Setup Configurator
  const configSection = document.getElementById('flavorConfigurator');
  const helperText = document.getElementById('comboHelperText');
  let configHtml = '';

  if (p.type === 'combo') {
    configHtml += `<h4>Elige tus sabores (${p.maxSelection} galletas)</h4>`;
    availableFlavors.forEach(f => {
      currentSelection[f.name] = 0; // initialize
      configHtml += `
        <div class="config-item">
          <span class="config-name">${f.name}</span>
          <div class="config-controls">
            <button class="qty-btn" onclick="updateFlavorQty('${f.name}', -1)">-</button>
            <span id="flavor-qty-${f.name.replace(/\s/g, '')}">0</span>
            <button class="qty-btn" onclick="updateFlavorQty('${f.name}', 1)">+</button>
          </div>
        </div>
      `;
    });
    helperText.textContent = `Faltan seleccionar ${p.maxSelection} galleta(s).`;
    document.getElementById('modalAddBtn').disabled = true;
    document.getElementById('modalAddTotal').textContent = `$${p.price.toFixed(2)}`;
  } else {
    // Single Product
    currentSelection['qty'] = 1;
    configHtml += `<h4>Cantidad</h4>
      <div class="config-item">
        <span class="config-name">${p.name}</span>
        <div class="config-controls">
          <button class="qty-btn" onclick="updateSingleQty(-1)">-</button>
          <span id="single-qty">1</span>
          <button class="qty-btn" onclick="updateSingleQty(1)">+</button>
        </div>
      </div>
    `;
    helperText.textContent = '';
    document.getElementById('modalAddBtn').disabled = false;
    document.getElementById('modalAddTotal').textContent = `$${p.price.toFixed(2)}`;
  }

  configSection.innerHTML = configHtml;
  
  // Show modal
  document.getElementById('productModal').classList.remove('hidden');
}

window.changeMainImage = function(url, el) {
  document.getElementById('mainProductImage').src = url;
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
}

window.closeProductModal = function() {
  document.getElementById('productModal').classList.add('hidden');
  currentProductObj = null;
}

window.updateSingleQty = function(change) {
  let newQty = currentSelection['qty'] + change;
  if (newQty < 1) newQty = 1;
  currentSelection['qty'] = newQty;
  document.getElementById('single-qty').textContent = newQty;
  document.getElementById('modalAddTotal').textContent = `$${(currentProductObj.price * newQty).toFixed(2)}`;
}

window.updateFlavorQty = function(flavorName, change) {
  const currentTotal = Object.values(currentSelection).reduce((a,b) => a+b, 0);
  
  // If adding, check limit
  if (change > 0 && currentTotal >= currentProductObj.maxSelection) return;
  
  // If removing, check bounds
  if (change < 0 && currentSelection[flavorName] <= 0) return;

  currentSelection[flavorName] += change;
  
  // Update UI
  const safeId = flavorName.replace(/\s/g, '');
  document.getElementById(`flavor-qty-${safeId}`).textContent = currentSelection[flavorName];

  // Evaluate validity
  const newTotal = currentTotal + change;
  const remaining = currentProductObj.maxSelection - newTotal;
  const btn = document.getElementById('modalAddBtn');
  const helper = document.getElementById('comboHelperText');

  if (remaining === 0) {
    btn.disabled = false;
    helper.textContent = '¡Combo completado! Listo para agregar.';
    helper.style.color = '#25D366';
  } else {
    btn.disabled = true;
    helper.textContent = `Faltan seleccionar ${remaining} galleta(s).`;
    helper.style.color = 'var(--primary-color)';
  }
}

// ----------------------------------------------------
// CART SYSTEM
// ----------------------------------------------------
window.addConfiguredToCart = function() {
  if (!currentProductObj) return;

  if (currentProductObj.type === 'single') {
    const qty = currentSelection['qty'];
    addToCartPayload(currentProductObj.name, currentProductObj.price, qty, null);
  } else {
    // Generate a description payload for the combo
    const selections = [];
    Object.keys(currentSelection).forEach(f => {
      if (currentSelection[f] > 0) {
        selections.push(`${currentSelection[f]}x ${f}`);
      }
    });
    const subDesc = selections.join(', ');
    
    addToCartPayload(currentProductObj.name, currentProductObj.price, 1, subDesc);
  }

  closeProductModal();
}

function addToCartPayload(name, price, qty, optionsStr) {
  // Try to find exact match (same name and exact same options)
  const existingIndex = cart.findIndex(i => i.name === name && i.options === optionsStr);
  
  if (existingIndex > -1) {
    cart[existingIndex].quantity += qty;
  } else {
    cart.push({ name, price, quantity: qty, options: optionsStr });
  }
  
  updateCartUI();
  
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.style.transform = 'scale(1.05)';
  setTimeout(() => { cartBtn.style.transform = 'scale(1)'; }, 200);
}

window.changeQty = function(index, change) {
  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  updateCartUI();
  renderCartItems();
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  document.getElementById('cartCount').textContent = totalItems;
  document.getElementById('modalCartCount').textContent = totalItems;
  document.getElementById('cartTotal').textContent = totalPrice.toFixed(2);
  document.getElementById('modalTotal').textContent = `$${totalPrice.toFixed(2)}`;
  
  const fab = document.querySelector('.fab-container');
  if (totalItems > 0) {
    fab.style.display = 'flex';
  } else {
    fab.style.display = 'none';
  }
}

window.toggleCartModal = function() {
  const modal = document.getElementById('cartModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    renderCartItems();
  }
}

function renderCartItems() {
  const cartItemsContainer = document.getElementById('cartItems');
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío.</div>';
    return;
  }

  let html = '';
  cart.forEach((item, index) => {
    const itemTotal = (item.price * item.quantity).toFixed(2);
    html += `
      <div class="cart-item">
        <div class="cart-item-info">
          <div class="cart-item-title">${item.name}</div>
          ${item.options ? `<span class="cart-item-options">(${item.options})</span>` : ''}
          <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
        </div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="changeQty(${index}, -1)">-</button>
          <span>${item.quantity}</span>
          <button class="qty-btn" onclick="changeQty(${index}, 1)">+</button>
          <span style="font-weight: bold; min-width: 55px; text-align: right;">$${itemTotal}</span>
        </div>
      </div>
    `;
  });
  
  cartItemsContainer.innerHTML = html;
}

// ----------------------------------------------------
// WHATSAPP
// ----------------------------------------------------
window.sendToWhatsApp = function() {
  if (cart.length === 0) return;

  let message = "¡Hola Holly Cookies! 🍪\nQuisiera hacer el siguiente pedido:\n\n";
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `▪️ ${item.quantity}x ${item.name} - $${itemTotal.toFixed(2)}\n`;
    if (item.options) {
      message += `   ↳ Incluye: ${item.options}\n`;
    }
  });

  message += `\n*TOTAL: $${total.toFixed(2)}*\n\n`;
  message += "Por favor indíquenme los métodos de pago y el delivery. ¡Gracias!";

  const encodedMessage = encodeURIComponent(message);
  const phoneNumber = "584121234567"; // Set your real number
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}
