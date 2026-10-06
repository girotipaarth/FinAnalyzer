/**
 * FinAnalyzer - Financial Analysis & Investment Tracking Application
 * Full-Website 3D Animations & Light/Dark Mode
 * Author Branding: Made by Paarth Giroti
 */

// Application State
const AppState = {
  transactions: [],
  filteredTransactions: [],
  currentDatasetTitle: 'Demo Dataset',
  currentTheme: 'dark',
  charts: {
    incomeExpense: null,
    expenseCategory: null,
    investmentComparison: null
  },
  currentPage: 1,
  pageSize: 8,
  sortField: 'date',
  sortOrder: 'desc',
  filterType: 'all',
  filterCategory: 'all',
  searchQuery: '',
  threeScene: null
};

// Strict Indian Rupee (INR / ₹) Formatter using Intl.NumberFormat('en-IN')
const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

/**
 * Format any number into Indian Rupee string (e.g. ₹1,50,000.00)
 */
function formatINR(amount) {
  const num = Number(amount) || 0;
  return inrFormatter.format(num);
}

/**
 * Format numbers compactly for Chart axes (e.g. ₹1.5L, ₹25k)
 */
function formatCompactINR(val) {
  const num = Number(val) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${sign}₹${(abs / 1000).toFixed(0)}k`;
  }
  return `${sign}₹${abs}`;
}

// Curated INR Sample Dataset
const RAW_SAMPLE_CSV = `Date,Description,Amount,Category,Type
2026-01-05,Tech Corp Monthly Salary,125000.00,Salary,Income
2026-01-08,Downtown Luxury Apartment Rent,28000.00,Housing,Expense
2026-01-10,Whole Foods Market Groceries,12400.00,Food & Dining,Expense
2026-01-12,Nifty 50 Index Fund SIP,25000.00,Stocks,Investment
2026-01-15,Electric & Water Utility Bill,3600.00,Utilities,Expense
2026-01-18,Freelance Web Architecture Consulting,45000.00,Consulting,Income
2026-01-20,Quarterly Stock Dividend Payout,6800.00,Stocks,Investment Return
2026-01-22,Fine Dining & Weekend Socials,4800.00,Food & Dining,Expense
2026-01-25,Tech Opportunities Mutual Fund,18000.00,Mutual Funds,Investment
2026-01-28,High-Speed Fiber Internet & Mobile,1999.00,Utilities,Expense
2026-02-02,High Yield Fixed Deposit Interest,4500.00,Fixed Deposit,Investment Return
2026-02-05,Tech Corp Monthly Salary,125000.00,Salary,Income
2026-02-07,Downtown Luxury Apartment Rent,28000.00,Housing,Expense
2026-02-09,Supermarket Groceries & Provisions,11800.00,Food & Dining,Expense
2026-02-12,Commercial REIT Property Fund,30000.00,Real Estate,Investment
2026-02-14,Valentine Concert & Entertainment,5400.00,Entertainment,Expense
2026-02-16,Health Insurance & Pharmacy,4200.00,Healthcare,Expense
2026-02-18,Quarterly Rental Property Yield,16500.00,Real Estate,Investment Return
2026-02-20,E-Commerce UI Kit Royalties,22000.00,Side Business,Income
2026-02-22,12-Month High Yield Fixed Deposit,50000.00,Fixed Deposit,Investment
2026-02-24,Mutual Fund SIP Dividend Distribution,5800.00,Mutual Funds,Investment Return
2026-02-26,Gym Membership & Wellness,2800.00,Healthcare,Expense
2026-02-28,Gas & City Transit Pass,4200.00,Transportation,Expense
2026-03-02,Sovereign Gold Bonds & Precious Metals,20000.00,Gold/Precious Metals,Investment
2026-03-05,Tech Corp Monthly Salary,125000.00,Salary,Income
2026-03-08,Downtown Luxury Apartment Rent,28000.00,Housing,Expense
2026-03-10,Wholesale Provisions Shopping,13500.00,Food & Dining,Expense
2026-03-12,Gold Sovereign Quarterly Dividend,3800.00,Gold/Precious Metals,Investment Return
2026-03-15,Streaming Services & Gaming Subscriptions,1499.00,Entertainment,Expense
2026-03-18,Bluechip Growth Stocks Portfolio,30000.00,Stocks,Investment
2026-03-20,Software Architecture Workshop Mentoring,35000.00,Consulting,Income
2026-03-22,Hardware Tech & Laptop Upgrade,18500.00,Shopping,Expense
2026-03-25,Auto Maintenance & Oil Change,4500.00,Transportation,Expense
2026-03-28,Realized Equities Capital Gains,19500.00,Stocks,Investment Return`;

// Utility: Toast Notifications
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const icons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-500 text-lg"></i>',
    error: '<i class="fa-solid fa-triangle-exclamation text-rose-500 text-lg"></i>',
    warning: '<i class="fa-solid fa-circle-exclamation text-amber-500 text-lg"></i>',
    info: '<i class="fa-solid fa-circle-info text-indigo-500 text-lg"></i>'
  };

  toast.innerHTML = `
    ${icons[type] || icons.info}
    <div class="text-sm font-medium leading-snug">${message}</div>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease-out';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// =========================================================================
// 1. LIGHT / DARK MODE TOGGLE SYSTEM
// =========================================================================
function initThemeToggle() {
  const savedTheme = localStorage.getItem('finanalyzer_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark'); // Default dark
  
  applyTheme(initialTheme);

  const toggleBtn = document.getElementById('themeToggleBtn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      const newTheme = isDark ? 'light' : 'dark';
      applyTheme(newTheme);
      showToast(`Switched to ${newTheme.toUpperCase()} theme`, 'info');
    });
  }
}

function applyTheme(theme) {
  AppState.currentTheme = theme;
  const html = document.documentElement;
  const icon = document.getElementById('themeToggleIcon');
  const label = document.getElementById('themeToggleLabel');

  if (theme === 'dark') {
    html.classList.add('dark');
    if (icon) {
      icon.className = 'fa-solid fa-sun text-amber-400 text-sm';
    }
    if (label) {
      label.textContent = 'Light Mode';
    }
  } else {
    html.classList.remove('dark');
    if (icon) {
      icon.className = 'fa-solid fa-moon text-indigo-600 text-sm';
    }
    if (label) {
      label.textContent = 'Dark Mode';
    }
  }

  localStorage.setItem('finanalyzer_theme', theme);

  // If Three.js scene is active, update light intensities
  if (AppState.threeScene) {
    updateThreeJSTheme(theme);
  }

  // Re-render charts with matching colors if transactions are loaded
  if (AppState.transactions.length > 0) {
    const metrics = calculateMetrics();
    renderIncomeExpenseChart(metrics);
    renderExpenseCategoryChart(metrics);
    renderInvestmentComparisonChart(metrics);
  }
}

// =========================================================================
// 2. FULL-WEBSITE THREE.JS 3D INTERACTIVE SCENE
// =========================================================================
function initThreeJS() {
  const canvas = document.getElementById('threeCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  let width = window.innerWidth;
  let height = window.innerHeight;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Ambient and Point Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const indigoLight = new THREE.PointLight(0x6366f1, 2.8, 60);
  indigoLight.position.set(-12, 12, 10);
  scene.add(indigoLight);

  const emeraldLight = new THREE.PointLight(0x10b981, 2.8, 60);
  emeraldLight.position.set(12, -10, 10);
  scene.add(emeraldLight);

  const goldLight = new THREE.PointLight(0xf59e0b, 2.2, 50);
  goldLight.position.set(0, 0, 14);
  scene.add(goldLight);

  // Group for floating 3D meshes
  const floatingGroup = new THREE.Group();
  scene.add(floatingGroup);

  const meshes = [];

  // 1. 3D Golden Rupee Coins
  const coinGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.35, 32);
  const coinMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    metalness: 0.88,
    roughness: 0.22
  });

  for (let i = 0; i < 5; i++) {
    const coin = new THREE.Mesh(coinGeo, coinMat);
    const angle = (i / 5) * Math.PI * 2;
    coin.position.set(Math.cos(angle) * 14, Math.sin(angle) * 8 + (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 8);
    coin.rotation.x = Math.PI / 3 + Math.random();
    coin.rotation.z = Math.random() * Math.PI;
    coin.userData = {
      rotX: (Math.random() * 0.01 + 0.004),
      rotY: (Math.random() * 0.012 + 0.005),
      baseY: coin.position.y,
      speed: 1.4 + Math.random()
    };
    floatingGroup.add(coin);
    meshes.push(coin);
  }

  // 2. 3D Emerald Gems (Octahedrons)
  const gemGeo = new THREE.OctahedronGeometry(1.3, 0);
  const gemMat = new THREE.MeshPhysicalMaterial({
    color: 0x10b981,
    metalness: 0.25,
    roughness: 0.1,
    transmission: 0.8,
    transparent: true,
    opacity: 0.85
  });

  for (let i = 0; i < 6; i++) {
    const gem = new THREE.Mesh(gemGeo, gemMat);
    gem.position.set((Math.random() - 0.5) * 28, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8);
    gem.userData = {
      rotX: (Math.random() * 0.015 - 0.007),
      rotY: (Math.random() * 0.015 - 0.007),
      baseY: gem.position.y,
      speed: 1.8 + Math.random()
    };
    floatingGroup.add(gem);
    meshes.push(gem);
  }

  // 3. 3D Indigo Tech Prisms (Icosahedrons)
  const prismGeo = new THREE.IcosahedronGeometry(1.2, 0);
  const prismMat = new THREE.MeshPhysicalMaterial({
    color: 0x6366f1,
    metalness: 0.3,
    roughness: 0.12,
    transmission: 0.85,
    transparent: true,
    opacity: 0.85
  });

  for (let i = 0; i < 6; i++) {
    const prism = new THREE.Mesh(prismGeo, prismMat);
    prism.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 8);
    prism.userData = {
      rotX: (Math.random() * 0.012 - 0.006),
      rotY: (Math.random() * 0.012 - 0.006),
      baseY: prism.position.y,
      speed: 1.6 + Math.random()
    };
    floatingGroup.add(prism);
    meshes.push(prism);
  }

  // 4. Ambient 3D Glowing Dust Starfield
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 160;
  const positions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 45;
    positions[i + 1] = (Math.random() - 0.5) * 28;
    positions[i + 2] = (Math.random() - 0.5) * 18;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x818cf8,
    size: 0.28,
    transparent: true,
    opacity: 0.65
  });

  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Mouse interaction
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  });

  // Handle Resize
  function onResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', onResize);

  // Animation Loop
  let clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth camera mouse follow
    targetX += (mouseX - targetX) * 0.04;
    targetY += (mouseY - targetY) * 0.04;
    camera.position.x = targetX * 3.5;
    camera.position.y = targetY * 2.5;
    camera.lookAt(0, 0, 0);

    // Rotate meshes and float
    meshes.forEach((mesh) => {
      mesh.rotation.x += mesh.userData.rotX;
      mesh.rotation.y += mesh.userData.rotY;
      mesh.position.y = mesh.userData.baseY + Math.sin(elapsedTime * mesh.userData.speed) * 0.5;
    });

    // Particle field slow drift
    particleSystem.rotation.y = elapsedTime * 0.015;
    particleSystem.rotation.x = elapsedTime * 0.008;

    renderer.render(scene, camera);
  }

  animate();
  AppState.threeScene = { scene, renderer, ambientLight, particleMat };
}

function updateThreeJSTheme(theme) {
  if (!AppState.threeScene) return;
  const { ambientLight, particleMat } = AppState.threeScene;
  if (theme === 'dark') {
    if (ambientLight) ambientLight.intensity = 0.8;
    if (particleMat) particleMat.color.setHex(0x818cf8);
  } else {
    if (ambientLight) ambientLight.intensity = 1.3;
    if (particleMat) particleMat.color.setHex(0x4f46e5);
  }
}

// =========================================================================
// 3. 3D CARD PERSPECTIVE TILT ACROSS WHOLE WEBSITE
// =========================================================================
function init3DCardTilt() {
  const cards = document.querySelectorAll('.card-3d');
  cards.forEach(card => {
    // Avoid duplicate event listener binding
    if (card.dataset.tiltAttached) return;
    card.dataset.tiltAttached = 'true';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotX = ((y - centerY) / centerY) * -6.5; // degrees
      const rotY = ((x - centerX) / centerX) * 6.5;

      card.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}

// VIEW SWITCHING HELPERS
function switchToDashboard(datasetTitle, recordCount) {
  const landingScreen = document.getElementById('landingScreen');
  const dashboardSection = document.getElementById('dashboardSection');
  const headerBackBtn = document.getElementById('headerBackToUploadBtn');
  const headerResetBtn = document.getElementById('headerResetBtn');
  const datasetLabel = document.getElementById('activeDatasetLabel');
  const recordCountBadge = document.getElementById('activeRecordCount');

  if (landingScreen) landingScreen.classList.add('hidden');
  if (dashboardSection) dashboardSection.classList.remove('hidden');

  if (headerBackBtn) headerBackBtn.classList.remove('hidden');
  if (headerResetBtn) headerResetBtn.classList.remove('hidden');

  if (datasetLabel) datasetLabel.textContent = datasetTitle || 'Uploaded Dataset';
  if (recordCountBadge) recordCountBadge.textContent = `${recordCount} records`;

  // Attach 3D tilt to any freshly revealed dashboard cards
  setTimeout(init3DCardTilt, 50);

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function switchToLanding() {
  const landingScreen = document.getElementById('landingScreen');
  const dashboardSection = document.getElementById('dashboardSection');
  const headerBackBtn = document.getElementById('headerBackToUploadBtn');
  const headerResetBtn = document.getElementById('headerResetBtn');
  const fileInput = document.getElementById('csvFileInput');

  if (landingScreen) landingScreen.classList.remove('hidden');
  if (dashboardSection) dashboardSection.classList.add('hidden');

  if (headerBackBtn) headerBackBtn.classList.add('hidden');
  if (headerResetBtn) headerResetBtn.classList.add('hidden');

  if (fileInput) fileInput.value = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Normalize Transaction Object from CSV Row
function normalizeTransactionRow(row, index) {
  const keys = Object.keys(row);
  const findVal = (possibleNames) => {
    for (const name of possibleNames) {
      const match = keys.find(k => k.trim().toLowerCase() === name.toLowerCase());
      if (match && row[match] !== undefined) return row[match];
    }
    return '';
  };

  const rawDate = findVal(['date', 'transaction date', 'tx_date', 'timestamp', 'time']);
  const rawDesc = findVal(['description', 'desc', 'name', 'details', 'title', 'memo', 'narration']);
  const rawAmount = findVal(['amount', 'value', 'price', 'cost', 'total', 'amt']);
  const rawCategory = findVal(['category', 'cat', 'sector', 'type_category']);
  const rawType = findVal(['type', 'transaction type', 'txn_type', 'flow', 'classification']);

  // Clean Amount
  let cleanedAmount = 0;
  if (typeof rawAmount === 'number') {
    cleanedAmount = rawAmount;
  } else if (typeof rawAmount === 'string') {
    const sanitized = rawAmount.replace(/[^0-9.-]/g, '');
    cleanedAmount = parseFloat(sanitized) || 0;
  }

  // Normalize Type
  let type = 'Expense';
  const tStr = String(rawType).trim().toLowerCase();
  if (tStr.includes('income') || tStr.includes('salary') || tStr.includes('revenue') || tStr.includes('earning')) {
    type = 'Income';
  } else if (tStr.includes('return') || tStr.includes('dividend') || tStr.includes('gain') || tStr.includes('yield') || tStr.includes('interest')) {
    type = 'Investment Return';
  } else if (tStr.includes('invest') || tStr.includes('equity') || tStr.includes('asset') || tStr.includes('fund') || tStr.includes('deposit') || tStr.includes('sip')) {
    type = 'Investment';
  } else if (tStr.includes('expense') || tStr.includes('spend') || tStr.includes('debit') || tStr.includes('cost')) {
    type = 'Expense';
  }

  // Normalize Category
  let category = String(rawCategory).trim();
  if (!category || category.toLowerCase() === 'uncategorized') {
    category = type === 'Income' ? 'General Income' :
               type === 'Investment' ? 'Equities & Assets' :
               type === 'Investment Return' ? 'Yield & Dividends' : 'Miscellaneous Expense';
  }

  return {
    id: index + 1,
    date: rawDate ? String(rawDate).trim() : new Date().toISOString().split('T')[0],
    description: rawDesc ? String(rawDesc).trim() : 'Transaction Item',
    amount: Math.abs(cleanedAmount),
    category: category,
    type: type
  };
}

// Process Raw CSV text using PapaParse
function parseCSVData(csvText, sourceName = 'Custom CSV') {
  Papa.parse(csvText, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false,
    complete: function (results) {
      if (!results.data || results.data.length === 0) {
        showToast('The uploaded CSV file is empty or formatted incorrectly.', 'error');
        return;
      }

      const parsed = results.data
        .map((row, idx) => normalizeTransactionRow(row, idx))
        .filter(t => t.amount > 0);

      if (parsed.length === 0) {
        showToast('No valid transactions found. Ensure "Amount" and "Type" columns exist.', 'warning');
        return;
      }

      AppState.transactions = parsed;
      AppState.currentDatasetTitle = sourceName;
      AppState.currentPage = 1;
      AppState.filterType = 'all';
      AppState.filterCategory = 'all';
      AppState.searchQuery = '';

      // Reset filter UI controls
      const searchInput = document.getElementById('tableSearchInput');
      const typeFilter = document.getElementById('typeFilter');
      if (searchInput) searchInput.value = '';
      if (typeFilter) typeFilter.value = 'all';

      updateCategoryFilterOptions();
      filterAndSortTransactions();
      computeAndRenderDashboard();

      switchToDashboard(sourceName, parsed.length);
      showToast(`Successfully analyzed ${parsed.length} transactions in INR (₹)!`, 'success');
    },
    error: function (error) {
      console.error('CSV Parsing Error:', error);
      showToast('Error parsing CSV file: ' + error.message, 'error');
    }
  });
}

// Calculate Summary Metrics & Insights
function calculateMetrics() {
  const data = AppState.transactions;

  let totalIncome = 0;
  let totalExpenses = 0;
  let totalInvestments = 0;
  let totalInvestmentReturns = 0;

  const expenseCategoryMap = {};
  const investmentMap = {}; // { [category]: { invested: 0, returns: 0 } }
  let maxExpenseTx = null;

  data.forEach(t => {
    if (t.type === 'Income') {
      totalIncome += t.amount;
    } else if (t.type === 'Expense') {
      totalExpenses += t.amount;
      expenseCategoryMap[t.category] = (expenseCategoryMap[t.category] || 0) + t.amount;
      if (!maxExpenseTx || t.amount > maxExpenseTx.amount) {
        maxExpenseTx = t;
      }
    } else if (t.type === 'Investment') {
      totalInvestments += t.amount;
      if (!investmentMap[t.category]) investmentMap[t.category] = { invested: 0, returns: 0 };
      investmentMap[t.category].invested += t.amount;
    } else if (t.type === 'Investment Return') {
      totalInvestmentReturns += t.amount;
      if (!investmentMap[t.category]) investmentMap[t.category] = { invested: 0, returns: 0 };
      investmentMap[t.category].returns += t.amount;
    }
  });

  // Net Cash Flow: Total Income - Total Expenses - Total Investments
  const netCashFlow = totalIncome - totalExpenses - totalInvestments;

  // ROI: (Total Investment Returns / Total Investments) * 100
  const roiPercentage = totalInvestments > 0 ? (totalInvestmentReturns / totalInvestments) * 100 : 0;

  // Savings Rate: ((Total Income - Total Expenses) / Total Income) * 100
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Categorize Most & Least Expense Categories
  const expenseCategories = Object.keys(expenseCategoryMap).map(cat => ({
    category: cat,
    amount: expenseCategoryMap[cat],
    percentage: totalExpenses > 0 ? (expenseCategoryMap[cat] / totalExpenses) * 100 : 0
  })).sort((a, b) => b.amount - a.amount);

  const mostExpenseCat = expenseCategories.length > 0 ? expenseCategories[0] : { category: 'None', amount: 0, percentage: 0 };
  const leastExpenseCat = expenseCategories.length > 0 ? expenseCategories[expenseCategories.length - 1] : { category: 'None', amount: 0, percentage: 0 };

  // Investment Yield Leader
  let topYieldCategory = { category: 'None', roi: 0, invested: 0, returns: 0 };
  Object.keys(investmentMap).forEach(cat => {
    const inv = investmentMap[cat].invested;
    const ret = investmentMap[cat].returns;
    const roi = inv > 0 ? (ret / inv) * 100 : 0;
    if (roi > topYieldCategory.roi) {
      topYieldCategory = { category: cat, roi, invested: inv, returns: ret };
    }
  });

  // Financial Health Score Calculation (0 to 100)
  let healthScore = 50;
  if (savingsRate >= 40) healthScore += 20;
  else if (savingsRate >= 20) healthScore += 10;
  else if (savingsRate < 0) healthScore -= 20;

  if (totalInvestments > 0) healthScore += 15;
  if (roiPercentage > 10) healthScore += 10;
  if (netCashFlow > 0) healthScore += 5;
  healthScore = Math.min(100, Math.max(10, Math.round(healthScore)));

  return {
    totalIncome,
    totalExpenses,
    totalInvestments,
    totalInvestmentReturns,
    netCashFlow,
    roiPercentage,
    savingsRate,
    expenseCategoryMap,
    expenseCategories,
    investmentMap,
    mostExpenseCat,
    leastExpenseCat,
    topYieldCategory,
    maxExpenseTx,
    healthScore
  };
}

// Render Summary Metrics in UI
function renderMetricCards(metrics) {
  const { totalIncome, totalExpenses, totalInvestments, totalInvestmentReturns, netCashFlow, roiPercentage, savingsRate } = metrics;

  // Income Card
  document.getElementById('metricTotalIncome').innerText = formatINR(totalIncome);

  // Expense Card
  document.getElementById('metricTotalExpenses').innerText = formatINR(totalExpenses);

  // Investment & ROI Card
  document.getElementById('metricTotalInvestments').innerText = formatINR(totalInvestments);
  const roiSign = roiPercentage >= 0 ? '+' : '';
  const roiBadgeEl = document.getElementById('metricRoiBadge');
  roiBadgeEl.innerText = `${roiSign}${roiPercentage.toFixed(1)}% ROI (${formatINR(totalInvestmentReturns)})`;
  if (roiPercentage >= 0) {
    roiBadgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
  } else {
    roiBadgeEl.className = 'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
  }

  // Net Cash Flow Card
  const netCashFlowEl = document.getElementById('metricNetCashFlow');
  netCashFlowEl.innerText = formatINR(netCashFlow);
  if (netCashFlow >= 0) {
    netCashFlowEl.classList.remove('text-rose-500', 'dark:text-rose-400');
    netCashFlowEl.classList.add('text-emerald-600', 'dark:text-emerald-400');
  } else {
    netCashFlowEl.classList.remove('text-emerald-600', 'dark:text-emerald-400');
    netCashFlowEl.classList.add('text-rose-500', 'dark:text-rose-400');
  }

  // Savings Rate sub-badge
  const savingsRateBadge = document.getElementById('metricSavingsRateBadge');
  savingsRateBadge.innerText = `${savingsRate.toFixed(1)}% Savings Rate`;
}

// Render Insights & Analytics Callout
function renderInsights(metrics) {
  const { mostExpenseCat, leastExpenseCat, topYieldCategory, healthScore } = metrics;

  // Most Expense Card
  document.getElementById('insightMostExpenseName').innerText = mostExpenseCat.category;
  document.getElementById('insightMostExpenseAmount').innerText = formatINR(mostExpenseCat.amount);
  document.getElementById('insightMostExpensePct').innerText = `${mostExpenseCat.percentage.toFixed(1)}% of total expenses`;

  // Least Expense Card
  document.getElementById('insightLeastExpenseName').innerText = leastExpenseCat.category;
  document.getElementById('insightLeastExpenseAmount').innerText = formatINR(leastExpenseCat.amount);
  document.getElementById('insightLeastExpensePct').innerText = `${leastExpenseCat.percentage.toFixed(1)}% of total expenses`;

  // Top Yield Investment
  const topYieldEl = document.getElementById('insightTopYieldName');
  if (topYieldEl) {
    topYieldEl.innerText = topYieldCategory.category !== 'None' ? topYieldCategory.category : 'None tracked';
    document.getElementById('insightTopYieldRate').innerText = topYieldCategory.category !== 'None' ? `+${topYieldCategory.roi.toFixed(1)}% Yield` : '0.0% Return';
    document.getElementById('insightTopYieldValues').innerText = `Invested: ${formatINR(topYieldCategory.invested)} | Returns: ${formatINR(topYieldCategory.returns)}`;
  }

  // Financial Health Indicator
  const healthScoreEl = document.getElementById('metricHealthScore');
  if (healthScoreEl) {
    healthScoreEl.innerText = `${healthScore}/100`;
    let healthLabel = 'Excellent';
    let healthColor = 'text-emerald-600 dark:text-emerald-400';
    if (healthScore < 45) { healthLabel = 'Needs Attention'; healthColor = 'text-rose-500 dark:text-rose-400'; }
    else if (healthScore < 70) { healthLabel = 'Balanced'; healthColor = 'text-amber-500 dark:text-amber-400'; }

    const healthLabelEl = document.getElementById('metricHealthLabel');
    if (healthLabelEl) {
      healthLabelEl.innerText = healthLabel;
      healthLabelEl.className = `text-xs font-semibold uppercase tracking-wider ${healthColor}`;
    }
  }
}

// Render Strategy & Savings Tips Engine
function renderStrategyTips(metrics) {
  const { savingsRate, mostExpenseCat, totalExpenses, totalInvestments, roiPercentage } = metrics;
  const container = document.getElementById('strategyTipsContainer');
  if (!container) return;

  container.innerHTML = '';
  const tips = [];

  // Tip 1: Savings Strategy based on Savings Rate
  if (savingsRate >= 45) {
    tips.push({
      icon: 'fa-rocket',
      color: 'emerald',
      title: `High Wealth Velocity (Savings Rate: ${savingsRate.toFixed(1)}%)`,
      desc: `Your savings discipline is exceptional. With over ${savingsRate.toFixed(0)}% of earnings retained, prioritize allocating surplus into long-term compounding equity portfolios, Nifty index funds, and sovereign bonds rather than keeping excess idle liquidity in low-yield savings accounts.`,
      badge: 'Aggressive Accumulation'
    });
  } else if (savingsRate >= 20) {
    tips.push({
      icon: 'fa-scale-balanced',
      color: 'indigo',
      title: `Healthy Financial Equilibrium (Savings Rate: ${savingsRate.toFixed(1)}%)`,
      desc: `You comfortably exceed the standard 50/30/20 guideline. To accelerate your wealth creation, automate a monthly scheduled sweep of 5% additional income directly into systematic investment plans (SIPs) before discretionary expenses happen.`,
      badge: 'Balanced Growth'
    });
  } else if (savingsRate > 0) {
    tips.push({
      icon: 'fa-triangle-exclamation',
      color: 'amber',
      title: `Cautious Margin Cushion (Savings Rate: ${savingsRate.toFixed(1)}%)`,
      desc: `Your current savings buffer is slim. Unforeseen medical or household expenses could compel relying on high-interest credit lines. Aim to scale savings to at least 20% by auditing recurring subscriptions, dining, and discretionary outings.`,
      badge: 'Buffer Alert'
    });
  } else {
    tips.push({
      icon: 'fa-circle-exclamation',
      color: 'rose',
      title: 'Deficit Alert: Cash Outflow Exceeds Inflow',
      desc: `Your monthly expenses and outgoings exceed your earned income. This signals negative cash burn. Immediately implement an essential-only budget freeze, postpone luxury shopping, and examine secondary freelance income streams to restore balance.`,
      badge: 'Urgent Action'
    });
  }

  // Tip 2: Category-Specific Expense Reduction Target
  if (mostExpenseCat && mostExpenseCat.amount > 0) {
    const monthly12 = mostExpenseCat.amount * 0.12;
    const annualSavings = monthly12 * 12;
    tips.push({
      icon: 'fa-scissors',
      color: 'rose',
      title: `Targeted Trim: Optimize "${mostExpenseCat.category}" Outlays`,
      desc: `"${mostExpenseCat.category}" accounts for ${formatINR(mostExpenseCat.amount)} (${mostExpenseCat.percentage.toFixed(1)}% of your total expense budget). Trimming just 12% in this category recaptures ${formatINR(monthly12)}/month, compounding to ${formatINR(annualSavings)} in extra annual capital for investments!`,
      badge: 'Actionable Cutback'
    });
  }

  // Tip 3: Investment Allocation Advice
  const emergencyTarget = totalExpenses * 3;
  if (totalInvestments === 0) {
    tips.push({
      icon: 'fa-chart-pie',
      color: 'indigo',
      title: 'Capital Deployment Missing',
      desc: `You currently have ₹0 active investment transactions recorded. Even conservative allocations in fixed deposits, Sovereign Gold Bonds, or broad-market index funds yield vital inflation defense. Begin with a modest micro-SIP allocation today.`,
      badge: 'Start Investing'
    });
  } else if (roiPercentage < 5) {
    tips.push({
      icon: 'fa-compass',
      color: 'cyan',
      title: 'Portfolio Optimization & Yield Expansion',
      desc: `Your overall recorded investment ROI is ${roiPercentage.toFixed(1)}%. Consider analyzing fee drag, reallocating low-interest accounts into diversified bluechip equities, index funds, or high-yield fixed deposits to enhance returns.`,
      badge: 'Rebalance Portfolio'
    });
  } else {
    tips.push({
      icon: 'fa-shield-halved',
      color: 'emerald',
      title: `Investment Yield Strong (+${roiPercentage.toFixed(1)}% ROI)`,
      desc: `Your investment assets are yielding strong returns (${formatINR(metrics.totalInvestmentReturns)}). Maintain a 3-to-6 month liquid safety reserve (${formatINR(emergencyTarget)} target) in high-yield savings or liquid funds before expanding higher-risk equity allocations.`,
      badge: 'Solid Diversification'
    });
  }

  // Render cards with card-3d class
  tips.forEach(tip => {
    const card = document.createElement('div');
    const colorClasses = {
      emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
      amber: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      rose: 'border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400',
      cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400'
    }[tip.color] || 'border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400';

    card.className = `p-5 rounded-2xl border ${colorClasses} glass-panel flex flex-col justify-between card-3d`;
    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-black/5 dark:bg-white/10 text-lg">
            <i class="fa-solid ${tip.icon}"></i>
          </div>
          <span class="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10">${tip.badge}</span>
        </div>
        <h4 class="text-base font-bold text-slate-900 dark:text-white mb-2 font-heading">${tip.title}</h4>
        <p class="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">${tip.desc}</p>
      </div>
    `;
    container.appendChild(card);
  });

  // Re-bind tilt
  setTimeout(init3DCardTilt, 50);
}

// Chart theme helper
function getChartThemeColors() {
  const isDark = document.documentElement.classList.contains('dark');
  return {
    isDark,
    textColor: isDark ? '#cbd5e1' : '#334155',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    borderColor: isDark ? '#0f172a' : '#ffffff',
    tooltipBg: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.96)',
    tooltipTitle: isDark ? '#ffffff' : '#0f172a',
    tooltipBody: isDark ? '#cbd5e1' : '#334155'
  };
}

// Chart 1: Doughnut Chart: Income vs Expense vs Investments breakdown
function renderIncomeExpenseChart(metrics) {
  const ctx = document.getElementById('incomeExpenseChart');
  if (!ctx) return;

  if (AppState.charts.incomeExpense) {
    AppState.charts.incomeExpense.destroy();
  }

  const { totalIncome, totalExpenses, totalInvestments } = metrics;
  const theme = getChartThemeColors();

  AppState.charts.incomeExpense = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Total Income', 'Total Expenses', 'Total Investments'],
      datasets: [{
        data: [
          totalIncome,
          totalExpenses,
          totalInvestments
        ],
        backgroundColor: [
          '#10b981', // Emerald for Income
          '#f43f5e', // Rose for Expenses
          '#6366f1'  // Indigo for Investments
        ],
        borderColor: theme.borderColor,
        borderWidth: 3,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: theme.textColor,
            padding: 16,
            font: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipTitle,
          bodyColor: theme.tooltipBody,
          borderColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: function(context) {
              const val = context.raw || 0;
              const sum = context.dataset.data.reduce((a, b) => a + b, 0);
              const pct = sum > 0 ? ((val / sum) * 100).toFixed(1) : '0.0';
              return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
            }
          }
        }
      },
      cutout: '68%'
    }
  });
}

// Chart 2: Category-wise Expense Bar Chart
function renderExpenseCategoryChart(metrics) {
  const ctx = document.getElementById('expenseCategoryChart');
  if (!ctx) return;

  if (AppState.charts.expenseCategory) {
    AppState.charts.expenseCategory.destroy();
  }

  const { expenseCategories } = metrics;
  const topCategories = expenseCategories.slice(0, 7);

  const labels = topCategories.map(c => c.category);
  const data = topCategories.map(c => c.amount);
  const theme = getChartThemeColors();

  AppState.charts.expenseCategory = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Expense Amount (₹)',
        data: data,
        backgroundColor: [
          'rgba(244, 63, 94, 0.85)',
          'rgba(249, 115, 22, 0.85)',
          'rgba(245, 158, 11, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(6, 182, 212, 0.85)',
          'rgba(99, 102, 241, 0.85)',
          'rgba(168, 85, 247, 0.85)'
        ],
        borderRadius: 8,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipTitle,
          bodyColor: theme.tooltipBody,
          borderColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return ` Total Spend: ${formatINR(context.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: theme.gridColor },
          ticks: {
            color: theme.textColor,
            callback: function(value) {
              return formatCompactINR(value);
            }
          }
        },
        y: {
          grid: { display: false },
          ticks: { color: theme.textColor, font: { weight: '600' } }
        }
      }
    }
  });
}

// Chart 3: Grouped Bar Chart: Investment Amount vs Return Comparison by source
function renderInvestmentComparisonChart(metrics) {
  const ctx = document.getElementById('investmentComparisonChart');
  if (!ctx) return;

  if (AppState.charts.investmentComparison) {
    AppState.charts.investmentComparison.destroy();
  }

  const { investmentMap } = metrics;
  const categories = Object.keys(investmentMap);
  const theme = getChartThemeColors();

  if (categories.length === 0) {
    categories.push('Stocks', 'Mutual Funds', 'Real Estate', 'Fixed Deposit', 'Gold/Precious Metals');
    categories.forEach(cat => {
      investmentMap[cat] = { invested: 0, returns: 0 };
    });
  }

  const investedData = categories.map(cat => investmentMap[cat]?.invested || 0);
  const returnsData = categories.map(cat => investmentMap[cat]?.returns || 0);

  AppState.charts.investmentComparison = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: categories,
      datasets: [
        {
          label: 'Invested Capital (₹)',
          data: investedData,
          backgroundColor: 'rgba(99, 102, 241, 0.85)',
          borderRadius: 6,
          borderWidth: 0
        },
        {
          label: 'Returns Generated (₹)',
          data: returnsData,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 6,
          borderWidth: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: theme.textColor,
            padding: 14,
            font: { family: 'Plus Jakarta Sans', size: 12 }
          }
        },
        tooltip: {
          backgroundColor: theme.tooltipBg,
          titleColor: theme.tooltipTitle,
          bodyColor: theme.tooltipBody,
          borderColor: 'rgba(99, 102, 241, 0.2)',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${formatINR(context.raw)}`;
            },
            afterBody: function(contexts) {
              const catIndex = contexts[0].dataIndex;
              const cat = categories[catIndex];
              const inv = investmentMap[cat]?.invested || 0;
              const ret = investmentMap[cat]?.returns || 0;
              const roi = inv > 0 ? ((ret / inv) * 100).toFixed(1) : '0.0';
              return ` Category Yield: +${roi}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: theme.textColor, font: { weight: '600' } }
        },
        y: {
          grid: { color: theme.gridColor },
          ticks: {
            color: theme.textColor,
            callback: function(value) {
              return formatCompactINR(value);
            }
          }
        }
      }
    }
  });
}

// Master Render Function
function computeAndRenderDashboard() {
  const metrics = calculateMetrics();

  renderMetricCards(metrics);
  renderInsights(metrics);
  renderStrategyTips(metrics);

  renderIncomeExpenseChart(metrics);
  renderExpenseCategoryChart(metrics);
  renderInvestmentComparisonChart(metrics);

  renderTransactionsTable();
}

// Populate Category Filter dropdown dynamically
function updateCategoryFilterOptions() {
  const select = document.getElementById('categoryFilter');
  if (!select) return;

  const categories = Array.from(new Set(AppState.transactions.map(t => t.category))).sort();
  select.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    select.appendChild(opt);
  });
}

// Transaction Table Filtering & Sorting
function filterAndSortTransactions() {
  let list = [...AppState.transactions];

  // Filter Type
  if (AppState.filterType !== 'all') {
    list = list.filter(t => t.type === AppState.filterType);
  }

  // Filter Category
  if (AppState.filterCategory !== 'all') {
    list = list.filter(t => t.category === AppState.filterCategory);
  }

  // Search Query
  if (AppState.searchQuery) {
    const q = AppState.searchQuery.toLowerCase();
    list = list.filter(t =>
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.date.includes(q) ||
      formatINR(t.amount).toLowerCase().includes(q)
    );
  }

  // Sorting
  list.sort((a, b) => {
    let fieldA = a[AppState.sortField];
    let fieldB = b[AppState.sortField];

    if (AppState.sortField === 'amount') {
      return AppState.sortOrder === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }

    fieldA = String(fieldA).toLowerCase();
    fieldB = String(fieldB).toLowerCase();

    if (AppState.sortOrder === 'asc') {
      return fieldA.localeCompare(fieldB);
    } else {
      return fieldB.localeCompare(fieldA);
    }
  });

  AppState.filteredTransactions = list;
  AppState.currentPage = 1;
}

// Render Transactions Table with Pagination
function renderTransactionsTable() {
  const tbody = document.getElementById('transactionsTableBody');
  const paginationInfo = document.getElementById('tablePaginationInfo');
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (!tbody) return;

  const list = AppState.filteredTransactions;
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / AppState.pageSize));

  if (AppState.currentPage > totalPages) AppState.currentPage = totalPages;

  const startIdx = (AppState.currentPage - 1) * AppState.pageSize;
  const endIdx = Math.min(startIdx + AppState.pageSize, total);
  const pageItems = list.slice(startIdx, endIdx);

  tbody.innerHTML = '';

  if (pageItems.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-8 text-center text-slate-400">
          <i class="fa-solid fa-folder-open text-3xl mb-2 block opacity-40"></i>
          No transactions match your search/filter criteria.
        </td>
      </tr>
    `;
  } else {
    pageItems.forEach(tx => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors';

      let typeBadgeClass = 'badge-expense';
      let icon = 'fa-arrow-down';
      let amountSign = '-';
      let amountClass = 'text-rose-500 dark:text-rose-400';

      if (tx.type === 'Income') {
        typeBadgeClass = 'badge-income';
        icon = 'fa-arrow-up';
        amountSign = '+';
        amountClass = 'text-emerald-600 dark:text-emerald-400';
      } else if (tx.type === 'Investment') {
        typeBadgeClass = 'badge-investment';
        icon = 'fa-layer-group';
        amountSign = '•';
        amountClass = 'text-indigo-600 dark:text-indigo-400';
      } else if (tx.type === 'Investment Return') {
        typeBadgeClass = 'badge-return';
        icon = 'fa-chart-line';
        amountSign = '+';
        amountClass = 'text-amber-500 dark:text-amber-400';
      }

      tr.innerHTML = `
        <td class="py-3.5 px-4 text-xs font-mono text-slate-500 dark:text-slate-400">${tx.date}</td>
        <td class="py-3.5 px-4 text-sm font-medium text-slate-900 dark:text-white">${tx.description}</td>
        <td class="py-3.5 px-4 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-black/5 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
            ${tx.category}
          </span>
        </td>
        <td class="py-3.5 px-4 text-xs">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${typeBadgeClass}">
            <i class="fa-solid ${icon} text-[10px]"></i>
            ${tx.type}
          </span>
        </td>
        <td class="py-3.5 px-4 text-right text-sm font-semibold font-mono ${amountClass}">
          ${amountSign} ${formatINR(tx.amount)}
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Pagination controls
  if (paginationInfo) {
    paginationInfo.innerText = `Showing ${total > 0 ? startIdx + 1 : 0} to ${endIdx} of ${total} records`;
  }
  if (prevBtn) prevBtn.disabled = AppState.currentPage <= 1;
  if (nextBtn) nextBtn.disabled = AppState.currentPage >= totalPages;
}

// Download Sample CSV Generator
function downloadSampleCSV() {
  const blob = new Blob([RAW_SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'finanalyzer_inr_sample_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Downloaded sample CSV template with INR figures!', 'info');
}

// Load Embedded Sample Data explicitly
function loadDemoData() {
  parseCSVData(RAW_SAMPLE_CSV, 'Demo Dataset');
}

// Reset Dashboard
function resetDashboard() {
  AppState.transactions = [];
  AppState.filteredTransactions = [];
  AppState.currentPage = 1;

  if (AppState.charts.incomeExpense) { AppState.charts.incomeExpense.destroy(); AppState.charts.incomeExpense = null; }
  if (AppState.charts.expenseCategory) { AppState.charts.expenseCategory.destroy(); AppState.charts.expenseCategory = null; }
  if (AppState.charts.investmentComparison) { AppState.charts.investmentComparison.destroy(); AppState.charts.investmentComparison = null; }

  switchToLanding();
  showToast('Dashboard reset. Ready for your custom CSV file.', 'info');
}

// Event Listeners Initialization
function initEventListeners() {
  // File Drop Zone
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('csvFileInput');

  if (dropzone && fileInput) {
    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('dragover');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('dragover');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  function handleFileSelect(file) {
    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
      showToast('Please select a valid .CSV file', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = function(evt) {
      parseCSVData(evt.target.result, file.name);
    };
    reader.onerror = function() {
      showToast('Error reading selected file', 'error');
    };
    reader.readAsText(file);
  }

  // Load Demo Data Button (Only triggered on explicit click!)
  document.getElementById('landingDemoBtn')?.addEventListener('click', loadDemoData);

  // Return to Upload / Landing Screen Buttons
  document.getElementById('headerBackToUploadBtn')?.addEventListener('click', switchToLanding);
  document.getElementById('dashboardBackBtn')?.addEventListener('click', switchToLanding);

  // Sample CSV Download Buttons
  document.getElementById('downloadSampleCsvBtn')?.addEventListener('click', downloadSampleCSV);
  document.getElementById('landingSampleCsvBtn')?.addEventListener('click', downloadSampleCSV);

  // Reset Buttons
  document.getElementById('headerResetBtn')?.addEventListener('click', resetDashboard);
  document.getElementById('dashboardResetBtn')?.addEventListener('click', resetDashboard);

  // Table Filters & Search
  document.getElementById('tableSearchInput')?.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value;
    filterAndSortTransactions();
    renderTransactionsTable();
  });

  document.getElementById('typeFilter')?.addEventListener('change', (e) => {
    AppState.filterType = e.target.value;
    filterAndSortTransactions();
    renderTransactionsTable();
  });

  document.getElementById('categoryFilter')?.addEventListener('change', (e) => {
    AppState.filterCategory = e.target.value;
    filterAndSortTransactions();
    renderTransactionsTable();
  });

  // Pagination Controls
  document.getElementById('prevPageBtn')?.addEventListener('click', () => {
    if (AppState.currentPage > 1) {
      AppState.currentPage--;
      renderTransactionsTable();
    }
  });

  document.getElementById('nextPageBtn')?.addEventListener('click', () => {
    const totalPages = Math.ceil(AppState.filteredTransactions.length / AppState.pageSize);
    if (AppState.currentPage < totalPages) {
      AppState.currentPage++;
      renderTransactionsTable();
    }
  });

  // Sorting Table Headers
  document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const field = th.getAttribute('data-sort');
      if (AppState.sortField === field) {
        AppState.sortOrder = AppState.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        AppState.sortField = field;
        AppState.sortOrder = 'desc';
      }
      filterAndSortTransactions();
      renderTransactionsTable();
    });
  });
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  initThemeToggle();
  initThreeJS();
  init3DCardTilt();

  // STRICT REQUIREMENT: Initial landing page state
  // On page load, DO NOT display any report data or auto-load demo data!
  switchToLanding();
});
