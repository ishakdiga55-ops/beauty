// عناصر الصفحة الأساسية
const productsGrid = document.getElementById("productsGrid");
const cartCount = document.getElementById("cartCount");
const cartModal = document.getElementById("cartModal");
const cartItemsContainer = document.getElementById("cartItems");
const cartTotalElement = document.getElementById("cartTotal");
const toast = document.getElementById("toast");
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

// السلة تخزّن معرّف المنتج والكمية
const cart = new Map();

const categoryNames = {
  makeup: "مكياج",
  skincare: "العناية بالبشرة",
  perfume: "عطور"
};

const currencyFormatter = new Intl.NumberFormat("ar-SA", {
  maximumFractionDigits: 0
});

// تنسيق السعر بالريال السعودي
function formatPrice(price) {
  return `${currencyFormatter.format(price)} ر.س`;
}

// إظهار المنتجات، مع مراعاة الفئة المختارة
function renderProducts(category = "all") {
  const visibleProducts = window.products.filter((product) => {
    return category === "all" || product.category === category;
  });

  productsGrid.innerHTML = visibleProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img
          class="product-image"
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
        >
      </div>
      <div class="product-info">
        <span class="product-category">${categoryNames[product.category] ?? ""}</span>
        <h3>${product.name}</h3>
        <p class="product-description">${product.description}</p>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(product.price)}</span>
          <button class="add-to-cart" type="button" data-add="${product.id}">
            <i class="fa-solid fa-plus" aria-hidden="true"></i>
            أضيفي للسلة
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

// حساب عدد القطع الموجودة في السلة
function getCartQuantity() {
  return [...cart.values()].reduce((total, quantity) => total + quantity, 0);
}

// حساب الإجمالي من المنتجات والكميات
function getCartTotal() {
  return [...cart.entries()].reduce((total, [productId, quantity]) => {
    const product = window.products.find((item) => item.id === productId);
    return total + (product ? product.price * quantity : 0);
  }, 0);
}

// تحديث محتوى نافذة السلة ورقمها والإجمالي
function renderCart() {
  cartCount.textContent = getCartQuantity();

  const cartEntries = [...cart.entries()];

  if (cartEntries.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-cart">
        <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
        <p>سلتكِ فارغة حالياً. أضيفي إليها ما يعجبكِ!</p>
      </div>
    `;
  } else {
    cartItemsContainer.innerHTML = cartEntries.map(([productId, quantity]) => {
      const product = window.products.find((item) => item.id === productId);
      if (!product) return "";

      return `
        <article class="cart-item">
          <img class="cart-item-image" src="${product.image}" alt="">
          <div>
            <h3 class="cart-item-name">${product.name}</h3>
            <span class="cart-item-price">${formatPrice(product.price * quantity)}</span>
            <div class="quantity-controls" aria-label="تعديل كمية ${product.name}">
              <button class="quantity-button" type="button"
                      data-quantity-action="increase" data-product-id="${product.id}"
                      aria-label="زيادة الكمية">
                <i class="fa-solid fa-plus" aria-hidden="true"></i>
              </button>
              <span class="quantity-value">${quantity}</span>
              <button class="quantity-button" type="button"
                      data-quantity-action="decrease" data-product-id="${product.id}"
                      aria-label="تقليل الكمية">
                <i class="fa-solid fa-minus" aria-hidden="true"></i>
              </button>
            </div>
          </div>
          <button class="remove-item" type="button" data-remove="${product.id}"
                  aria-label="حذف ${product.name} من السلة">
            <i class="fa-regular fa-trash-can" aria-hidden="true"></i>
          </button>
        </article>
      `;
    }).join("");
  }

  cartTotalElement.textContent = formatPrice(getCartTotal());
}

// إشعار قصير بعد إضافة منتج
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

// إضافة المنتج للسلة
function addToCart(productId) {
  const id = Number(productId);
  const product = window.products.find((item) => item.id === id);

  if (!product) return;

  cart.set(id, (cart.get(id) || 0) + 1);
  renderCart();
  showToast(`تمت إضافة ${product.name} إلى السلة`);
}

// فتح وإغلاق نافذة السلة
function openCart() {
  cartModal.hidden = false;
  document.body.classList.add("modal-open");
  document.getElementById("closeCart").focus();
}

function closeCart() {
  cartModal.hidden = true;
  document.body.classList.remove("modal-open");
  document.getElementById("openCart").focus();
}

// إعداد رسالة الطلب وفتح واتساب
function checkoutViaWhatsApp() {
  if (cart.size === 0) {
    showToast("أضيفي منتجاً إلى السلة أولاً");
    return;
  }

  // استبدلي الرقم الوهمي برقم المتجر مع رمز الدولة، من دون علامة +
  const whatsappNumber = "966500000000";

  const orderLines = [...cart.entries()].map(([productId, quantity]) => {
    const product = window.products.find((item) => item.id === productId);
    return `• ${product.name} — الكمية: ${quantity} — ${formatPrice(product.price * quantity)}`;
  });

  const message = [
    "مرحباً، أرغب في إتمام الطلب التالي:",
    "",
    ...orderLines,
    "",
    `الإجمالي: ${formatPrice(getCartTotal())}`,
    "",
    "الاسم:",
    "المدينة:"
  ].join("\n");

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, "_blank", "noopener,noreferrer");
}

// بدء عرض المنتجات عند تحميل الصفحة
renderProducts();
renderCart();
document.getElementById("currentYear").textContent = new Date().getFullYear();

// فلترة المنتجات وتحديد الزر النشط
document.querySelector(".filter-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  document.querySelectorAll(".filter-button").forEach((filterButton) => {
    const isActive = filterButton === button;
    filterButton.classList.toggle("active", isActive);
    filterButton.setAttribute("aria-pressed", String(isActive));
  });

  renderProducts(button.dataset.filter);
});

// التعامل مع أزرار إضافة المنتجات
productsGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) addToCart(button.dataset.add);
});

// زيادة الكمية أو تقليلها أو حذف المنتج من السلة
cartItemsContainer.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove]");
  if (removeButton) {
    cart.delete(Number(removeButton.dataset.remove));
    renderCart();
    return;
  }

  const quantityButton = event.target.closest("[data-quantity-action]");
  if (!quantityButton) return;

  const productId = Number(quantityButton.dataset.productId);
  const currentQuantity = cart.get(productId) || 0;

  if (quantityButton.dataset.quantityAction === "increase") {
    cart.set(productId, currentQuantity + 1);
  } else if (currentQuantity <= 1) {
    cart.delete(productId);
  } else {
    cart.set(productId, currentQuantity - 1);
  }

  renderCart();
});

// أحداث نافذة السلة
document.getElementById("openCart").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
document.getElementById("checkoutWhatsApp").addEventListener("click", checkoutViaWhatsApp);

cartModal.addEventListener("click", (event) => {
  if (event.target === cartModal) closeCart();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartModal.hidden) closeCart();
});

// قائمة الهاتف
menuToggle.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "إغلاق القائمة" : "فتح القائمة");
});

mainNav.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    mainNav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "فتح القائمة");
  }
});
