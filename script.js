let allFishData = [];
let allCookingData = [];

// --- 全局分頁與切換 ---
function switchTab(tabId, btnElement) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btnElement) btnElement.classList.add('active');
}

function switchMonth(monthId, btnElement) {
  document.querySelectorAll('.calendar-panel').forEach(el => el.classList.remove('active'));
  btnElement.parentElement.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('cal-' + monthId).classList.add('active');
  if (btnElement) btnElement.classList.add('active');
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
}

// --- 釣魚圖鑑邏輯 ---
async function initFishModule() {
  const levelContainer = document.getElementById('fishLevelOptions');
  if (levelContainer) {
    let html = '';
    for (let i = 1; i <= 14; i++) {
      html += `<label class="checkbox-btn"><input type="checkbox" name="fishLevel" value="${i}" onchange="filterFishData()"> Lv.${i}</label>`;
    }
    levelContainer.innerHTML = html;
  }
  try {
    const res = await fetch('fishData.json');
    allFishData = await res.json();
    renderFishCards(allFishData);
  } catch (e) {
    document.getElementById('fishStatusBar').innerText = '無法載入 fishData.json';
  }
}

function renderFishCards(data) {
  const grid = document.getElementById('fishGrid');
  const statusBar = document.getElementById('fishStatusBar');
  grid.innerHTML = '';
  statusBar.innerText = `顯示筆數：${data.length} / ${allFishData.length} 筆魚類`;

  if (data.length === 0) {
    grid.innerHTML = '<p style="color: #888; grid-column: 1/-1; text-align: center;">沒有符合條件的魚類資料</p>';
    return;
  }

  data.forEach(fish => {
    const card = document.createElement('div');
    card.className = 'item-card';
    const locText = fish.locations && fish.locations.length > 0 ? fish.locations.join('、') : '無資料';
    card.innerHTML = `
      <div>
        <div class="item-img-container">
          <img src="images/${fish.name}.webp" alt="${fish.name}" onerror="this.onerror=null; this.src='https://api.iconify.design/lucide:fish.svg?color=%237ca982';">
        </div>
        <h3>${fish.name} <span class="level-badge">Lv.${fish.level}</span></h3>
        <p class="item-info">🌤️ 天氣：${fish.weather.join(', ')}</p>
        <p class="item-info">⏰ 時間：${fish.time.join(', ')}</p>
        <p class="item-info">📍 地點：${locText}</p>
        <p class="item-info">🐟 魚影：<strong>${fish.shadow}</strong></p>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterFishData() {
  const search = document.getElementById('fishSearchInput').value.toLowerCase();
  const levels = getCheckedValues('fishLevel');
  const weathers = getCheckedValues('fishWeather');
  const times = getCheckedValues('fishTime');

  const filtered = allFishData.filter(fish => {
    const matchSearch = fish.name.toLowerCase().includes(search);
    const matchLevel = levels.length === 0 || levels.includes(fish.level.toString());
    const matchTime = times.length === 0 || times.some(t => fish.time.includes(t));

    let matchWeather = true;
    if (weathers.length > 0) {
      const isOnlyRainbow = weathers.length === 1 && weathers.includes('彩');
      if (isOnlyRainbow) {
        const hasOther = fish.weather.some(w => ['晴', '雨', '雪'].includes(w));
        matchWeather = fish.weather.includes('彩') && !hasOther;
      } else {
        matchWeather = weathers.every(w => fish.weather.includes(w));
      }
    }
    return matchSearch && matchLevel && matchTime && matchWeather;
  });
  renderFishCards(filtered);
}

function resetFishFilters() {
  document.getElementById('fishSearchInput').value = '';
  document.querySelectorAll('#fish input[type="checkbox"]').forEach(cb => cb.checked = false);
  renderFishCards(allFishData);
}

// --- 烹飪圖鑑邏輯 ---
async function initCookingModule() {
  const levelContainer = document.getElementById('cookLevelOptions');
  if (levelContainer) {
    let html = '';
    for (let i = 1; i <= 13; i++) {
      html += `<label class="checkbox-btn"><input type="checkbox" name="cookLevel" value="${i}" onchange="filterCookingData()"> Lv.${i}</label>`;
    }
    html += `<label class="checkbox-btn"><input type="checkbox" name="cookLevel" value="special" onchange="filterCookingData()"> 活動/特殊</label>`;
    levelContainer.innerHTML = html;
  }
  try {
    const res = await fetch('cookingData.json');
    allCookingData = await res.json();
    renderCookingCards(allCookingData);
  } catch (e) {
    document.getElementById('cookStatusBar').innerText = '無法載入 cookingData.json';
  }
}

function formatIngredients(ingList) {
  if (!ingList || ingList.length === 0) return '無資料';
  const counts = {};
  ingList.forEach(item => counts[item] = (counts[item] || 0) + 1);
  return Object.entries(counts).map(([name, count]) => count > 1 ? `${name}×${count}` : name).join(' + ');
}

function formatMoney(val) {
  if (val === null || val === undefined) return '-';
  return val < 0 ? `-$${Math.abs(val).toLocaleString()}` : `$${val.toLocaleString()}`;
}

function toggleStarPrices(btn) {
  const detail = btn.nextElementSibling;
  detail.classList.toggle('open');
  btn.innerText = detail.classList.contains('open') ? '🔼 收合各星級售價與淨利' : '🔽 查看 1～5 星售價與淨利';
}

function renderCookingCards(data) {
  const grid = document.getElementById('cookGrid');
  const statusBar = document.getElementById('cookStatusBar');
  grid.innerHTML = '';
  statusBar.innerText = `顯示筆數：${data.length} / ${allCookingData.length} 道食譜`;

  if (data.length === 0) {
    grid.innerHTML = '<p style="color: #888; grid-column: 1/-1; text-align: center;">沒有符合條件的食譜資料</p>';
    return;
  }

  data.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    const lvlText = item.level ? `Lv.${item.level}` : '特殊';
    const p1 = item.sellPrices ? formatMoney(item.sellPrices['1star']) : '-';
    const p5 = item.sellPrices ? formatMoney(item.sellPrices['5star']) : '-';

    card.innerHTML = `
      <div>
        <div class="item-img-container">
          <img src="images/${item.name}.webp" alt="${item.name}" onerror="this.onerror=null; this.src='https://api.iconify.design/lucide:utensils.svg?color=%237ca982';">
        </div>
        <h3>${item.name} <span class="level-badge">${lvlText}</span></h3>
        <p class="item-info">🧺 食材：${formatIngredients(item.ingredients)}</p>
        <p class="item-info">📦 成本：${formatMoney(item.actualCost)}</p>
        <p class="item-info">💰 售價：<strong>${p1}</strong> ～ <strong>${p5}</strong> (5★)</p>
        <button class="star-price-toggle" onclick="toggleStarPrices(this)">🔽 查看 1～5 星售價與淨利</button>
        <div class="star-price-detail">
          ⭐1星：${formatMoney(item.sellPrices?.['1star'])}（利 ${formatMoney(item.profits?.['1star'])}）<br>
          ⭐2星：${formatMoney(item.sellPrices?.['2star'])}（利 ${formatMoney(item.profits?.['2star'])}）<br>
          ⭐3星：${formatMoney(item.sellPrices?.['3star'])}（利 ${formatMoney(item.profits?.['3star'])}）<br>
          ⭐4星：${formatMoney(item.sellPrices?.['4star'])}（利 ${formatMoney(item.profits?.['4star'])}）<br>
          ⭐5星：${formatMoney(item.sellPrices?.['5star'])}（利 ${formatMoney(item.profits?.['5star'])}）
        </div>
      </div>
      <div class="cook-stats">
        <span>🔥 次數：${item.cookCount ?? 0}</span>
        <span>⭐ 精通：${item.masteryCount ?? 0}</span>
      </div>
    `;
    grid.appendChild(card);
  });
}

function filterCookingData() {
  const search = document.getElementById('cookSearchInput').value.toLowerCase();
  const levels = getCheckedValues('cookLevel');

  const filtered = allCookingData.filter(item => {
    const nameMatch = (item.name || '').toLowerCase().includes(search);
    const ingMatch = (item.ingredients || []).some(ing => ing.toLowerCase().includes(search));
    const matchSearch = search === '' || nameMatch || ingMatch;

    let matchLevel = true;
    if (levels.length > 0) {
      const key = item.level ? item.level.toString() : 'special';
      matchLevel = levels.includes(key);
    }
    return matchSearch && matchLevel;
  });
  renderCookingCards(filtered);
}

function resetCookingFilters() {
  document.getElementById('cookSearchInput').value = '';
  document.querySelectorAll('#cooking input[type="checkbox"]').forEach(cb => cb.checked = false);
  renderCookingCards(allCookingData);
}

// 頁面載入自動初始化
window.onload = function() {
  initFishModule();
  initCookingModule();
};