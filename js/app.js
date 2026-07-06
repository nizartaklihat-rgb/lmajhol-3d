/* ============================================================
   LMAJHOL — Main Application
   Three.js 3D Scene + Interactions + Product Loading + Orders
   ============================================================ */

(function () {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const CONFIG = {
    telegram: {
      botToken: '8850867625:AAHsXjVatonaP9Ved_zpgvafR6k6BFVxFbY',    // Replace with your bot token
      chatId: '1794244881',        // Replace with your chat ID
    },
    adminPassword: 'lmajhol2025',     // Change this!
    currency: 'MAD',
    deliveryFee: 30,
  };

  // ============================================================
  // THREE.JS 3D SCENE
  // ============================================================
  let scene, camera, renderer, particles, clock, mouseX = 0, mouseY = 0;

  function init3D() {
    const canvas = document.getElementById('scene3d');
    if (!canvas) return;

    scene = new THREE.Scene();
    clock = new THREE.Clock();

    // Camera
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);

    // Renderer
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Particles — floating fiber-like effect
    const particleCount = window.innerWidth < 768 ? 800 : 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 60;
      positions[i3 + 1] = (Math.random() - 0.5) * 60;
      positions[i3 + 2] = (Math.random() - 0.5) * 40;
      velocities[i3] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.01;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.005;
      sizes[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // Store velocities for animation
    geometry.userData.velocities = velocities;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float aSize;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vec3 pos = position;
          pos.y += sin(uTime * 0.3 + position.x * 0.5) * 0.5;
          pos.x += cos(uTime * 0.2 + position.y * 0.3) * 0.3;
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = aSize * uPixelRatio * (20.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
          vAlpha = 0.15 + 0.15 * sin(uTime * 0.5 + position.x + position.y);
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
          gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Geometric accent — floating wireframe shapes
    const torusGeo = new THREE.TorusGeometry(5, 0.05, 16, 100);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const torus = new THREE.Mesh(torusGeo, wireMat);
    torus.position.set(0, 0, -10);
    scene.add(torus);

    const ring2Geo = new THREE.TorusGeometry(8, 0.03, 8, 60);
    const ring2 = new THREE.Mesh(ring2Geo, wireMat.clone());
    ring2.material.opacity = 0.025;
    ring2.position.set(5, -3, -15);
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    // Store for animation
    particles.userData.torus = torus;
    particles.userData.ring2 = ring2;

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Resize
    window.addEventListener('resize', onResize3D);

    // Start render loop
    animate3D();
  }

  function animate3D() {
    requestAnimationFrame(animate3D);
    const elapsed = clock.getElapsedTime();

    // Update particle uniforms
    if (particles) {
      particles.material.uniforms.uTime.value = elapsed;

      // Subtle rotation based on mouse
      particles.rotation.y += (mouseX * 0.02 - particles.rotation.y) * 0.02;
      particles.rotation.x += (-mouseY * 0.01 - particles.rotation.x) * 0.02;

      // Rotate geometric accents
      if (particles.userData.torus) {
        particles.userData.torus.rotation.z = elapsed * 0.05;
        particles.userData.torus.rotation.x = elapsed * 0.03;
      }
      if (particles.userData.ring2) {
        particles.userData.ring2.rotation.z = -elapsed * 0.03;
        particles.userData.ring2.rotation.y = elapsed * 0.02;
      }
    }

    renderer.render(scene, camera);
  }

  function onResize3D() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // ============================================================
  // GSAP ANIMATIONS
  // ============================================================
  function initAnimations() {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const heroTl = gsap.timeline({ delay: 2.2 });
    heroTl
      .to('.hero-eyebrow', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
      .to('.hero-line', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.4')
      .to('.hero-sub', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5')
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');

    // Nav scroll effect
    ScrollTrigger.create({
      start: 'top -80',
      onUpdate: (self) => {
        document.getElementById('nav').classList.toggle('scrolled', self.progress > 0);
      },
    });

    // Collection section reveal
    gsap.from('.section-header', {
      scrollTrigger: {
        trigger: '.collection',
        start: 'top 80%',
        once: true,
      },
      opacity: 0,
      y: 40,
      duration: 1,
      ease: 'power3.out',
    });

    // About section
    gsap.from('.about-text', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top 70%',
        once: true,
      },
      opacity: 0,
      x: -40,
      duration: 1,
      ease: 'power3.out',
    });
    gsap.from('.about-image', {
      scrollTrigger: {
        trigger: '.about',
        start: 'top 70%',
        once: true,
      },
      opacity: 0,
      x: 40,
      duration: 1,
      ease: 'power3.out',
      delay: 0.2,
    });

    // Stat counters
    gsap.utils.toArray('.stat-num').forEach((el) => {
      const endVal = parseInt(el.textContent);
      const obj = { val: 0 };
      gsap.to(obj, {
        val: endVal,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = endVal > 10 ? Math.floor(obj.val) : obj.val.toFixed(0);
        },
      });
    });
  }

  // ============================================================
  // PRODUCT LOADING
  // ============================================================
  let products = [];

  async function loadProducts() {
    try {
      // Try loading from file first
      const response = await fetch('data/products.json?' + Date.now());
      if (response.ok) {
        products = await response.json();
      }
    } catch (e) {
      console.log('Products file not found, using defaults');
    }

    // Fallback: check localStorage for admin-published products
    const stored = localStorage.getItem('lmajhol_products');
    if (stored) {
      try {
        products = JSON.parse(stored);
      } catch (e) { /* ignore */ }
    }

    renderProducts();
  }

  function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid || !products.length) return;

    grid.innerHTML = products
      .filter((p) => p.inStock !== false)
      .map(
        (p, i) => `
      <div class="product-card" data-id="${p.id}" style="transition-delay: ${i * 0.1}s">
        <div class="product-card-image">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy">
        </div>
        <div class="product-card-info">
          <span class="product-card-name">${p.name}</span>
          <span class="product-card-price">${p.price} ${p.currency || 'MAD'}</span>
        </div>
        <div class="product-card-quick">Voir le produit</div>
      </div>
    `
      )
      .join('');

    // Animate cards in
    setTimeout(() => {
      gsap.utils.toArray('.product-card').forEach((card, i) => {
        gsap.to(card, {
          scrollTrigger: { trigger: card, start: 'top 85%', once: true },
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: i * 0.1,
          ease: 'power3.out',
          onStart: () => card.classList.add('visible'),
        });
      });
    }, 100);

    // Click handlers
    grid.querySelectorAll('.product-card').forEach((card) => {
      card.addEventListener('click', () => openProductModal(card.dataset.id));
    });
  }

  // ============================================================
  // PRODUCT MODAL
  // ============================================================
  let selectedSize = null;

  function openProductModal(productId) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const modal = document.getElementById('productModal');
    document.getElementById('modalImg').src = product.images[0];
    document.getElementById('modalImg').alt = product.name;
    document.getElementById('modalTitle').textContent = product.name;
    document.getElementById('modalPrice').textContent = `${product.price} ${product.currency || 'MAD'}`;
    document.getElementById('modalDesc').textContent = product.description;

    // Details
    const detailsEl = document.getElementById('modalDetails');
    detailsEl.innerHTML = (product.details || []).map((d) => `<li>${d}</li>`).join('');

    // Sizes
    selectedSize = null;
    const sizeOptions = document.getElementById('sizeOptions');
    sizeOptions.innerHTML = (product.sizes || [])
      .map((s) => `<button type="button" class="size-btn" data-size="${s}">${s}</button>`)
      .join('');

    sizeOptions.querySelectorAll('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        sizeOptions.querySelectorAll('.size-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSize = btn.dataset.size;
        document.getElementById('orderSize').value = selectedSize;
      });
    });

    // Set product ID in form
    document.getElementById('orderProduct').value = productId;

    // Reset form state
    document.getElementById('orderForm').style.display = 'flex';
    document.getElementById('orderSuccess').style.display = 'none';
    document.getElementById('orderForm').reset();
    document.getElementById('orderProduct').value = productId;

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============================================================
  // ORDER FORM — TELEGRAM
  // ============================================================
  async function submitOrder(e) {
    e.preventDefault();

    if (!selectedSize) {
      alert('Veuillez sélectionner une taille.');
      return;
    }

    const btn = document.getElementById('btnOrder');
    btn.disabled = true;
    btn.classList.add('loading');

    const form = document.getElementById('orderForm');
    const formData = new FormData(form);
    const product = products.find((p) => p.id === formData.get('product'));

    const orderData = {
      product: product ? product.name : formData.get('product'),
      size: selectedSize,
      name: formData.get('name'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      address: formData.get('address'),
      price: product ? `${product.price} ${product.currency || 'MAD'}` : 'N/A',
      total: product ? `${product.price + CONFIG.deliveryFee} MAD (dont ${CONFIG.deliveryFee} MAD livraison)` : 'N/A',
      timestamp: new Date().toLocaleString('fr-MA'),
    };

    // Build Telegram message
    const message = `
🆕 *Nouvelle Commande LMAJHOL*

📦 *Produit:* ${orderData.product}
📏 *Taille:* ${orderData.size}
💰 *Prix:* ${orderData.price}
🚚 *Livraison:* ${CONFIG.deliveryFee} MAD
💵 *Total:* ${orderData.total}

👤 *Client:* ${orderData.name}
📞 *Téléphone:* ${orderData.phone}
🏙️ *Ville:* ${orderData.city}
📍 *Adresse:* ${orderData.address}

⏰ *Date:* ${orderData.timestamp}
    `.trim();

    try {
      // Try Netlify Function first
      const response = await fetch('/.netlify/functions/send-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: CONFIG.telegram.botToken,
          chatId: CONFIG.telegram.chatId,
          message: message,
        }),
      });

      if (!response.ok) {
        // Fallback: direct Telegram API call
        await fetch(`https://api.telegram.org/bot${CONFIG.telegram.botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CONFIG.telegram.chatId,
            text: message,
            parse_mode: 'Markdown',
          }),
        });
      }

      // Show success
      form.style.display = 'none';
      document.getElementById('orderSuccess').style.display = 'flex';
    } catch (err) {
      console.error('Order submission error:', err);
      alert("Erreur lors de l'envoi. Veuillez réessayer ou nous contacter directement.");
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================
  function initMobileMenu() {
    const btn = document.getElementById('menuBtn');
    const menu = document.getElementById('mobileMenu');

    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      menu.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    menu.querySelectorAll('.mobile-link').forEach((link) => {
      link.addEventListener('click', () => {
        btn.classList.remove('active');
        menu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // ============================================================
  // POLICY MODAL
  // ============================================================
  window.openPolicy = function (e) {
    e.preventDefault();
    document.getElementById('policyModal').classList.add('active');
  };

  // ============================================================
  // LOADER
  // ============================================================
  function hideLoader() {
    setTimeout(() => {
      document.getElementById('loader').classList.add('hidden');
    }, 2000);
  }

  // ============================================================
  // INIT
  // ============================================================
  function init() {
    init3D();
    hideLoader();
    initMobileMenu();
    loadProducts();

    // Wait for GSAP to be available
    if (typeof gsap !== 'undefined') {
      initAnimations();
    } else {
      window.addEventListener('load', initAnimations);
    }

    // Event listeners
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('productModal').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal();
    });
    document.getElementById('orderForm').addEventListener('submit', submitOrder);

    // Close modals on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.getElementById('policyModal').classList.remove('active');
      }
    });
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
