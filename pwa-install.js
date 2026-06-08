/**
 * SMART TNA BD ERP — PWA Install Helper
 * Add this to ALL HTML pages before </body>
 * 
 * <script src="pwa-install.js"></script>
 */

/* ══ 1. Register Service Worker ══ */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/smart-tna-bd/sw.js")
      .then(reg => {
        console.log("[PWA] Service Worker registered:", reg.scope);

        /* Check for updates every 60 seconds */
        setInterval(() => reg.update(), 60000);

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              showUpdateBanner();
            }
          });
        });
      })
      .catch(err => console.warn("[PWA] SW registration failed:", err));
  });
}

/* ══ 2. Install Prompt (Android Chrome) ══ */
let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

function showInstallButton() {
  /* Create floating install button */
  const btn = document.createElement("button");
  btn.id = "pwaInstallBtn";
  btn.innerHTML = `
    <span style="font-size:20px;">📲</span>
    <span style="font-size:13px;font-weight:700;font-family:'Rajdhani',sans-serif;">
      Install App
    </span>
  `;
  btn.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    background: linear-gradient(135deg, #00ff99, #00cc77);
    color: #000;
    border: none;
    border-radius: 50px;
    padding: 12px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0,255,153,0.4);
    animation: pulse 2s infinite;
    font-family: 'Rajdhani', sans-serif;
  `;

  /* Pulse animation */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes pulse {
      0%   { box-shadow: 0 4px 20px rgba(0,255,153,0.4); }
      50%  { box-shadow: 0 4px 30px rgba(0,255,153,0.8); }
      100% { box-shadow: 0 4px 20px rgba(0,255,153,0.4); }
    }
  `;
  document.head.appendChild(style);

  btn.onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      btn.remove();
      showToast("✅ App Installing...");
    }
    deferredPrompt = null;
  };

  document.body.appendChild(btn);
}

/* ══ 3. App Installed Event ══ */
window.addEventListener("appinstalled", () => {
  showToast("🎉 SMART TNA BD App Installed Successfully!");
  const btn = document.getElementById("pwaInstallBtn");
  if (btn) btn.remove();
});

/* ══ 4. Update Banner ══ */
function showUpdateBanner() {
  const banner = document.createElement("div");
  banner.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0;
    background: #16a34a;
    color: #fff;
    text-align: center;
    padding: 12px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    font-weight: 700;
    z-index: 99999;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  `;
  banner.innerHTML = `
    <span>🔄 নতুন Update পাওয়া গেছে!</span>
    <button onclick="window.location.reload()" style="
      background:#fff; color:#16a34a;
      border:none; border-radius:20px;
      padding:4px 16px; font-weight:700;
      cursor:pointer; font-family:'Rajdhani',sans-serif;
    ">Update করুন</button>
    <button onclick="this.parentElement.remove()" style="
      background:transparent; color:#fff;
      border:1px solid #fff; border-radius:20px;
      padding:4px 12px; cursor:pointer;
      font-family:'Rajdhani',sans-serif;
    ">পরে</button>
  `;
  document.body.prepend(banner);
}

/* ══ 5. Toast Notification ══ */
function showToast(message, duration = 3000) {
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #1e293b;
    color: #fff;
    border: 1px solid #00ff99;
    border-radius: 10px;
    padding: 12px 24px;
    font-family: 'Rajdhani', sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 99999;
    box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    animation: fadeIn 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), duration);
}

/* ══ 6. Online/Offline Indicator ══ */
function updateOnlineStatus() {
  const existing = document.getElementById("onlineIndicator");
  if (existing) existing.remove();

  if (!navigator.onLine) {
    const indicator = document.createElement("div");
    indicator.id = "onlineIndicator";
    indicator.style.cssText = `
      position: fixed;
      top: 60px;
      left: 50%;
      transform: translateX(-50%);
      background: #dc2626;
      color: #fff;
      padding: 6px 20px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      z-index: 9999;
      font-family: 'Share Tech Mono', monospace;
    `;
    indicator.textContent = "⚡ Offline Mode — Cached Data";
    document.body.appendChild(indicator);
  } else {
    showToast("✅ Online — Connected");
  }
}

window.addEventListener("online",  updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);
