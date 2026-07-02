// =============================================
// 1. PRODUCT DATA
// To use real images, replace emoji with:
// image: "images/tshirt.jpg"
// and in renderProducts use:
// <img src="${p.image}" style="width:100%;height:100%;object-fit:cover">
// =============================================
const products = [
  {
    id: 1,
    name: "ML Club T-Shirt",
    description: "Premium cotton tee with the ML Club logo. Available in all sizes.",
    price: 499,
    images: ["tshirt.png", "front.png", "back.png"],
    bgColor: "#1a1a2e",
    inStock: true
  },
  {
    id: 2,
    name: "ML Club Hoodie",
    description: "Warm fleece hoodie with embroidered ML Club branding.",
    price: 999,
    images: ["ML Club Hoodie.png"],
    bgColor: "#1a2a1a",
    inStock: true
  },
  {
    id: 3,
    name: "ML Club Cap",
    description: "Structured snapback cap with the ML Club patch.",
    price: 349,
    images: ["ML Club Cap.png"],
    bgColor: "#2a1a1a",
    inStock: true
  },
  {
    id: 5,
    name: "ML Club Mug",
    description: "Ceramic mug — perfect for late-night model training sessions.",
    price: 249,
    images: ["ML Club Mug.png"],
    bgColor: "#2a2a1a",
    inStock: false
  },
];

// =============================================
// 2. STATE
// =============================================
let cart = {};          // { productId: quantity }
let generatedOTP = "";  // stores the OTP (demo only — use backend in production)
let userInfo = {}; 
 let users = JSON.parse(localStorage.getItem("mlclub_users") || "{}");
let currentUser = localStorage.getItem("mlclub_currentUser") || null;
let pendingOrder = null;    // stores form data

// =============================================
// 3. RENDER PRODUCTS
// =============================================
function renderProducts() {
  const grid = document.getElementById("productGrid");

  grid.innerHTML = products.map(p => `
    <div class="product-card">
      <div class="product-img" style="background-color:${p.bgColor}" onclick="openProductModal(${p.id})">
        <img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;cursor:pointer">
        ${!p.inStock ? '<div class="out-of-stock-badge">Out of Stock</div>' : ''}
      </div>
      <div class="product-info">
        <div class="product-name" onclick="openProductModal(${p.id})" style="cursor:pointer">${p.name}</div>
        <div class="product-description">${p.description}</div>
        <div class="product-footer">
          <span class="product-price">₹${p.price}</span>
          <button class="add-btn" onclick="addToCart(${p.id})" ${!p.inStock ? 'disabled' : ''}>
            ${p.inStock ? '+ Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </div>
  `).join("");
}
// =============================================
// 4. CART FUNCTIONS
// =============================================
function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  updateBadge();
  const p = products.find(x => x.id === productId);
  showToast(`<img src="${p.images[0]}" alt="${p.name}" style="width:20px;height:20px;margin-right:10px"> Added to cart!`);
}

function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  updateBadge();
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  updateBadge();
  renderCart();
}

function updateBadge() {
  const total = Object.values(cart).reduce((s, q) => s + q, 0);
  document.getElementById("cartBadge").textContent = total;
}

function getCartTotal() {
  return Object.keys(cart).reduce((sum, id) => {
    const p = products.find(x => x.id == id);
    return sum + p.price * cart[id];
  }, 0);
}

function renderCart() {
  const body   = document.getElementById("cartBody");
  const footer = document.getElementById("cartFooter");
  const total  = document.getElementById("cartTotal");
  const ids    = Object.keys(cart).filter(id => cart[id] > 0);

  if (ids.length === 0) {
    body.innerHTML = `<div class="cart-empty">🛒<br>Your cart is empty.<br>Add some items to get started.</div>`;
    footer.style.display = "none";
    return;
  }

  footer.style.display = "block";
  total.textContent = "₹" + getCartTotal();

  body.innerHTML = ids.map(id => {
    const p = products.find(x => x.id == id);
    return `
      <div class="cart-item">
        <div class="cart-item-image">
          <img src="${p.images[0]}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover">
            </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${p.name}</div>
          <div class="cart-item-price">₹${p.price} × ${cart[id]} = ₹${p.price * cart[id]}</div>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="changeQty(${id}, -1)">−</button>
          <span class="qty-num">${cart[id]}</span>
          <button class="qty-btn" onclick="changeQty(${id}, +1)">+</button>
        </div>
        <button class="remove-btn" onclick="removeFromCart(${id})">✕</button>
      </div>
    `;
  }).join("");
}

// =============================================
// 5. CART OPEN / CLOSE
// =============================================
function openCart() {
  renderCart();
  document.getElementById("cartSidebar").classList.add("open");
  document.getElementById("overlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cartSidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
}

// =============================================
// 6. USER INFO MODAL
// =============================================
function openUserInfoModal() {
  closeCart();
  document.getElementById("userInfoModal").classList.add("open");
}

function closeUserInfoModal() {
  document.getElementById("userInfoModal").classList.remove("open");
}

function validateUserInfo() {
  let valid = true;
  const name    = document.getElementById("inputName").value.trim();
  const email   = document.getElementById("inputEmail").value.trim();
  const phone   = document.getElementById("inputPhone").value.trim();
  const address = document.getElementById("inputAddress").value.trim();

  const errName = document.getElementById("errName");
  if (name.length < 2) { errName.classList.add("visible"); valid = false; }
  else errName.classList.remove("visible");

  const errEmail = document.getElementById("errEmail");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errEmail.classList.add("visible"); valid = false; }
  else errEmail.classList.remove("visible");

  const errPhone = document.getElementById("errPhone");
  if (!/^\d{10}$/.test(phone)) { errPhone.classList.add("visible"); valid = false; }
  else errPhone.classList.remove("visible");

  const errAddress = document.getElementById("errAddress");
  if (address.length < 10) { errAddress.classList.add("visible"); valid = false; }
  else errAddress.classList.remove("visible");

  if (valid) userInfo = { name, email, phone, address };
  return valid;
}

// =============================================
// 7. SEND OTP
// In production: call your backend API here instead
// POST /api/send-otp { email: userInfo.email }
// =============================================
function sendOTP() {
  if (!validateUserInfo()) return;

  const btn = document.getElementById("sendOtpBtn");
  btn.disabled = true;
  btn.textContent = "Sending OTP...";

  // Generate 6-digit OTP (DEMO ONLY — do this on backend in production)
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = "Send OTP to Email →";
    closeUserInfoModal();
    openOTPModal();
    showToast("📧 OTP sent to " + userInfo.email);
  }, 1500);
}

function openOTPModal() {
  document.getElementById("otpEmailDisplay").textContent = userInfo.email;
  document.getElementById("demoOtpDisplay").textContent = generatedOTP;
  for (let i = 0; i < 6; i++) document.getElementById("otp" + i).value = "";
  document.getElementById("errOtp").style.display = "none";
  document.getElementById("otpModal").classList.add("open");
  document.getElementById("otp0").focus();
}

function resendOTP() {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("demoOtpDisplay").textContent = generatedOTP;
  showToast("📧 OTP resent to " + userInfo.email);
}

function goBackToForm() {
  document.getElementById("otpModal").classList.remove("open");
  document.getElementById("userInfoModal").classList.add("open");
}

// =============================================
// 8. OTP INPUT — auto-jump between boxes
// =============================================
function otpFocus(index) {
  const current = document.getElementById("otp" + index);
  current.value = current.value.replace(/[^0-9]/g, "");
  if (current.value.length === 1 && index < 5) {
    document.getElementById("otp" + (index + 1)).focus();
  }
}

// =============================================
// 9. VERIFY OTP
// In production: POST /api/verify-otp { email, otp }
// and let the backend confirm it
// =============================================
function verifyOTP() {
  const entered = [0,1,2,3,4,5]
    .map(i => document.getElementById("otp" + i).value)
    .join("");

  if (entered === generatedOTP) {
    document.getElementById("errOtp").style.display = "none";
    document.getElementById("otpModal").classList.remove("open");
    placeOrder();
  } else {
    document.getElementById("errOtp").style.display = "block";
  }
}

// =============================================
// 10. PLACE ORDER
// In production: POST /api/place-order { customer, items, total, timestamp }
// =============================================
function placeOrder() {
  const ids   = Object.keys(cart);
  const total = getCartTotal();
  const orderId = "ML" + Date.now().toString().slice(-8);

  const itemsData = ids.map(id => {
    const p = products.find(x => x.id == id);
    return { name: p.name, qty: cart[id], subtotal: p.price * cart[id] };
  });

  pendingOrder = {
    orderId,
    date: new Date().toLocaleDateString(),
    items: itemsData,
    total
  };

  const itemsHTML = itemsData.map(it => `
    <div class="order-row">
      <span class="label">${it.name} × ${it.qty}</span>
      <span class="value">₹${it.subtotal}</span>
    </div>
  `).join("");

  document.getElementById("confirmItems").innerHTML     = itemsHTML;
  document.getElementById("confirmTotal").textContent   = "₹" + total;
  document.getElementById("confirmName").textContent    = userInfo.name;
  document.getElementById("confirmEmail").textContent   = userInfo.email;
  document.getElementById("confirmPhone").textContent   = userInfo.phone;
  document.getElementById("confirmAddress").textContent = userInfo.address;
  document.getElementById("confirmOrderId").textContent = "Order ID: " + orderId;

  document.getElementById("confirmModal").classList.add("open");
}

// =============================================
// 11. FINISH — reset everything
// =============================================
function finishOrder() {
  if (currentUser && users[currentUser] && pendingOrder) {
    users[currentUser].orders.push(pendingOrder);
    saveUsers();
  }
  cart = {};
  userInfo = {};
  generatedOTP = "";
  pendingOrder = null;
  updateBadge();
  document.getElementById("confirmModal").classList.remove("open");
  showToast("🎉 Thank you for your order!");
}
// =============================================
// 12. TOAST
// =============================================
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// =============================================
// START
// =============================================
let currentModalProduct = null;

function openProductModal(id) {
  const p = products.find(x => x.id === id);
  currentModalProduct = p;

  document.getElementById("modalName").textContent = p.name;
  document.getElementById("modalDescription").textContent = p.description;
  document.getElementById("modalPrice").textContent = "₹" + p.price;

  const addBtn = document.getElementById("modalAddBtn");
  addBtn.textContent = p.inStock ? "+ Add to Cart" : "Sold Out";
  addBtn.disabled = !p.inStock;
  addBtn.onclick = () => { addToCart(p.id); closeProductModal(); };

  setModalImage(0);

  document.getElementById("modalThumbRow").innerHTML = p.images.map((img, i) => `
    <img src="${img}" class="${i === 0 ? 'active' : ''}" id="modalThumb-${i}" onclick="setModalImage(${i})">
  `).join("");

  document.getElementById("productModal").classList.add("open");
}

function setModalImage(index) {
  const p = currentModalProduct;
  document.getElementById("modalMainImg").src = p.images[index];
  p.images.forEach((_, i) => {
    const thumb = document.getElementById("modalThumb-" + i);
    if (thumb) thumb.classList.toggle("active", i === index);
  });
}

function closeProductModal() {
  document.getElementById("productModal").classList.remove("open");
}

function closeProductModalOnOverlay(e) {
  if (e.target.id === "productModal") closeProductModal();
}
// =============================================
// ACCOUNT FUNCTIONS
// =============================================
function saveUsers() {
  localStorage.setItem("mlclub_users", JSON.stringify(users));
}

function updateAccountUI() {
  const label = document.getElementById("accountLabel");
  label.textContent = (currentUser && users[currentUser])
    ? users[currentUser].name.split(" ")[0]
    : "Account";
}

function handleAccountClick() {
  if (currentUser && users[currentUser]) openAccountModal();
  else openAuthModal();
}

function openAuthModal() {
  switchAuthTab('login');
  document.getElementById("authModal").classList.add("open");
}
function closeAuthModal() {
  document.getElementById("authModal").classList.remove("open");
}
function switchAuthTab(tab) {
  document.getElementById("tabLogin").classList.toggle("active", tab === "login");
  document.getElementById("tabSignup").classList.toggle("active", tab === "signup");
  document.getElementById("loginForm").style.display = tab === "login" ? "block" : "none";
  document.getElementById("signupForm").style.display = tab === "signup" ? "block" : "none";
}

function handleSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const err = document.getElementById("errSignup");

  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 4) {
    err.textContent = "Please fill all fields correctly (password min 4 characters).";
    err.classList.add("visible");
    return;
  }
  if (users[email]) {
    err.textContent = "An account with this email already exists.";
    err.classList.add("visible");
    return;
  }

  users[email] = { name, email, password, orders: [] };
  saveUsers();
  currentUser = email;
  localStorage.setItem("mlclub_currentUser", email);
  closeAuthModal();
  updateAccountUI();
  showToast("🎉 Welcome, " + name + "!");
}

function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const err = document.getElementById("errLogin");

  if (!users[email] || users[email].password !== password) {
    err.classList.add("visible");
    return;
  }
  err.classList.remove("visible");
  currentUser = email;
  localStorage.setItem("mlclub_currentUser", email);
  closeAuthModal();
  updateAccountUI();
  showToast("👋 Welcome back, " + users[email].name);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem("mlclub_currentUser");
  updateAccountUI();
  closeAccountModal();
  showToast("Logged out");
}

function openAccountModal() {
  const u = users[currentUser];
  document.getElementById("accountName").textContent = u.name;
  document.getElementById("accountEmail").textContent = u.email;

  const list = document.getElementById("orderHistoryList");
  if (!u.orders || u.orders.length === 0) {
    list.innerHTML = `<div class="cart-empty" style="margin-top:1rem">No orders yet.</div>`;
  } else {
    list.innerHTML = u.orders.slice().reverse().map(o => `
      <div class="order-summary-box" style="margin-bottom:10px">
        <h3>${o.orderId} — ${o.date}</h3>
        ${o.items.map(it => `
          <div class="order-row">
            <span class="label">${it.name} × ${it.qty}</span>
            <span class="value">₹${it.subtotal}</span>
          </div>
        `).join("")}
        <div class="order-total-row"><span>Total</span><span>₹${o.total}</span></div>
      </div>
    `).join("");
  }
  document.getElementById("accountModal").classList.add("open");
}
function closeAccountModal() {
  document.getElementById("accountModal").classList.remove("open");
}
renderProducts();
updateAccountUI();