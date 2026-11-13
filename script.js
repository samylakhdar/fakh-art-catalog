document.addEventListener("DOMContentLoaded", () => {
  // التأكد من تحميل البيانات بشكل سليم
  const data = window.FAKH_ART_DATA;
  if (!data || !data.products) {
    console.error("FAKH_ART_DATA is not defined!");
    return;
  }

  const productGrid = document.getElementById("productGrid");
  const categoryFilters = document.getElementById("categoryFilters");
  const searchInput = document.getElementById("productSearch");
  const emptyState = document.getElementById("emptyState");

  let activeCategory = "all";
  let searchQuery = "";

  // 1. بناء أزرار التصنيفات
  function renderCategories() {
    if (!categoryFilters) return;
    categoryFilters.innerHTML = "";
    
    data.categories.forEach(cat => {
      const btn = document.createElement("button");
      btn.className = "tab-btn" + (cat.id === activeCategory ? " active" : "");
      btn.textContent = cat.name;
      btn.addEventListener("click", () => {
        activeCategory = cat.id;
        renderCategories();
        renderProducts();
      });
      categoryFilters.appendChild(btn);
    });
  }

  // 2. عرض المنتجات والسلع
  function renderProducts() {
    if (!productGrid) return;
    productGrid.innerHTML = "";
    
    const filtered = data.products.filter(p => {
      const matchesCat = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = p.title.toLowerCase().includes(searchQuery) || (p.specs && p.specs.toLowerCase().includes(searchQuery));
      return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
      if (emptyState) emptyState.hidden = false;
      return;
    }
    if (emptyState) emptyState.hidden = true;

    filtered.forEach((product, index) => {
      const card = document.createElement("div");
      card.className = "product-card";

      // رابط الواتساب المباشر للطلب
      const phoneClean = data.storePhone ? data.storePhone.replace(/^0/, "") : "541420166";
      const whatsappMsg = encodeURIComponent(`السلام عليكم، مهتم بطلب بالجملة لمنتج: ${product.title} (${product.specs})`);
      const whatsappUrl = `https://wa.me/213${phoneClean}?text=${whatsappMsg}`;

      const images = product.images || [];
      let currentImgIdx = 0;

      let imageHtml = '';
      if (images.length > 0) {
        imageHtml = `
          <div class="product-image-wrap" id="img-wrap-${index}">
            <span class="wholesale-badge">جملة</span>
            <img id="product-img-${index}" src="${images[0]}" alt="${product.title}" loading="lazy">
            ${images.length > 1 ? `
              <button class="slider-btn prev-btn" data-index="${index}" data-dir="prev">&#10094;</button>
              <button class="slider-btn next-btn" data-index="${index}" data-dir="next">&#10095;</button>
              <div class="slider-dots" id="dots-${index}">
                ${images.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-pindex="${index}" data-imgindex="${i}"></span>`).join('')}
              </div>
            ` : ''}
          </div>
        `;
      } else {
        imageHtml = `
          <div class="product-image-wrap">
            <span class="wholesale-badge">جملة</span>
            <img src="logo.png" alt="${product.title}">
          </div>
        `;
      }

      card.innerHTML = `
        ${imageHtml}
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-specs">${product.specs}</p>
          <div class="product-price-box">
            <span class="price-label">سعر الجملة المقترح</span>
            <span class="price-value">${product.price} دج</span>
          </div>
          <a href="${whatsappUrl}" target="_blank" rel="noreferrer" class="btn-order">طلب عبر واتساب</a>
        </div>
      `;

      productGrid.appendChild(card);

      // تفاعل سلايدر الصور المتعددة لكل منتج
      if (images.length > 1) {
        const wrap = card.querySelector(`#img-wrap-${index}`);
        const imgElement = card.querySelector(`#product-img-${index}`);
        const dots = card.querySelectorAll(`#dots-${index} .dot`);

        function updateSlider(newIdx) {
          currentImgIdx = newIdx;
          imgElement.src = images[currentImgIdx];
          dots.forEach((d, di) => {
            if (di === currentImgIdx) d.classList.add('active');
            else d.classList.remove('active');
          });
        }

        wrap.querySelectorAll('.slider-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            const dir = btn.getAttribute('data-dir');
            if (dir === 'next') {
              currentImgIdx = (currentImgIdx + 1) % images.length;
            } else {
              currentImgIdx = (currentImgIdx - 1 + images.length) % images.length;
            }
            updateSlider(currentImgIdx);
          });
        });

        dots.forEach(dot => {
          dot.addEventListener('click', (e) => {
            e.preventDefault();
            const imgIdx = parseInt(dot.getAttribute('data-imgindex'));
            updateSlider(imgIdx);
          });
        });
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      renderProducts();
    });
  }

  renderCategories();
  renderProducts();
});
