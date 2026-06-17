
let state = {
  items: [],
  logs: [],
  theme: 'dark' 
};


const el = {

  counterView: document.getElementById('counter-view'),
  stockView: document.getElementById('stock-view'),
  summaryView: document.getElementById('summary-view'),
  

  tabCounter: document.getElementById('tab-counter'),
  tabStock: document.getElementById('tab-stock'),
  tabSummary: document.getElementById('tab-summary'),
  

  backToCounterBtn: document.getElementById('back-to-counter-btn'),
  

  themeBtns: document.querySelectorAll('.theme-btn'),
  

  addItemForm: document.getElementById('add-item-form'),
  itemNameInput: document.getElementById('item-name'),
  categoryInput: document.getElementById('item-category-input'),
  categoryDatalist: document.getElementById('category-datalist'),
  

  itemsGrid: document.getElementById('items-grid'),
  itemsCountBadge: document.getElementById('items-count-badge'),
  logList: document.getElementById('log-list'),
  clearLogsBtn: document.getElementById('clear-logs-btn'),
  stockTableBody: document.getElementById('stock-table-body'),
  

  statTotalSold: document.getElementById('stat-total-sold'),
  statTotalWithdrawn: document.getElementById('stat-total-withdrawn'),
  statActiveCategories: document.getElementById('stat-active-categories'),
  statBestSelling: document.getElementById('stat-best-selling'),
  

  categoryChartContainer: document.getElementById('category-chart-container'),
  summaryBlocksContainer: document.getElementById('summary-blocks-container'),
  exportPdfBtn: document.getElementById('export-pdf-btn')
};


const storage = {
  save() {
    localStorage.setItem('aerocount_state_v3', JSON.stringify(state));
  },
  load() {
    const saved = localStorage.getItem('aerocount_state_v3') || localStorage.getItem('aerocount_state_v2') || localStorage.getItem('aerocount_state');
    if (saved) {
      try {
        state = JSON.parse(saved);
        if (!Array.isArray(state.items)) state.items = [];
        if (!Array.isArray(state.logs)) state.logs = [];
        if (!state.theme) state.theme = 'dark';
        

        state.items.forEach(item => {
          if (item.morningStock === undefined) item.morningStock = item.morningBefore || 0;
          if (item.morningWithdrawal === undefined) item.morningWithdrawal = (item.morningBefore !== undefined && item.morningAfter !== undefined) ? Math.max(0, item.morningBefore - item.morningAfter) : 0;
          if (item.afternoonStock === undefined) item.afternoonStock = item.afternoonBefore || 0;
          if (item.afternoonWithdrawal === undefined) item.afternoonWithdrawal = (item.afternoonBefore !== undefined && item.afternoonAfter !== undefined) ? Math.max(0, item.afternoonBefore - item.afternoonAfter) : 0;
          item.stockWithdrawal = item.morningWithdrawal + item.afternoonWithdrawal;
        });
      } catch (e) {
        console.error('Failed to parse saved state:', e);
      }
    }
  }
};


function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function getFormattedTime() {
  const now = new Date();
  return now.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false 
  });
}


function addLog(text, type = 'info') {
  const timestamp = getFormattedTime();
  const logEntry = {
    id: generateId(),
    text,
    type,
    timestamp
  };
  
  state.logs.unshift(logEntry);
  if (state.logs.length > 100) {
    state.logs.pop();
  }
  
  storage.save();
  renderLogs();
}


function renderItems() {
  el.itemsGrid.innerHTML = '';
  
  if (state.items.length === 0) {
    el.itemsGrid.innerHTML = `
      <div class="empty-state">
        <svg fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"></path>
        </svg>
        <p>ยังไม่มีสินค้าที่ลงทะเบียนไว้ ใช้ฟอร์มด้านซ้ายเพื่อเพิ่มสินค้าลงในทะเบียน</p>
      </div>
    `;
    el.itemsCountBadge.textContent = '0 items';
    return;
  }
  
  el.itemsCountBadge.textContent = `${state.items.length} ชิ้น${state.items.length === 1 ? '' : 's'}`;
  
  state.items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.innerHTML = `
      <button class="item-delete-btn" title="Delete Item" data-id="${item.id}">
        <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
        </svg>
      </button>
      <div class="item-card-header">
        <span class="item-category">${escapeHTML(item.category)}</span>
        <h3 class="item-name" title="${escapeHTML(item.name)}">${escapeHTML(item.name)}</h3>
      </div>
      <div class="counter-interface">
        <button class="counter-btn counter-btn-minus" data-id="${item.id}">−</button>
        <span class="counter-display" id="count-${item.id}">${item.count}</span>
        <button class="counter-btn counter-btn-plus" data-id="${item.id}">+</button>
      </div>
    `;
    

    card.querySelector('.counter-btn-plus').addEventListener('click', () => adjustCount(item.id, 1));
    card.querySelector('.counter-btn-minus').addEventListener('click', () => adjustCount(item.id, -1));
    card.querySelector('.item-delete-btn').addEventListener('click', () => removeItem(item.id));
    
    el.itemsGrid.appendChild(card);
  });
}

function renderLogs() {
  el.logList.innerHTML = '';
  
  if (state.logs.length === 0) {
    el.logList.innerHTML = `
      <li class="log-item" style="justify-content: center; color: var(--text-muted); border-left: none;">
        ยังไม่มีกิจกรรมที่บันทึกไว้
      </li>
    `;
    return;
  }
  
  state.logs.forEach(log => {
    const item = document.createElement('li');
    item.className = `log-item ${log.type}`;
    item.innerHTML = `
      <span class="log-text">${log.text}</span>
      <span class="log-time">${log.timestamp}</span>
    `;
    el.logList.appendChild(item);
  });
}

function getUniqueCategories() {
  const categories = new Set();
  state.items.forEach(item => {
    if (item.category) {
      categories.add(item.category);
    }
  });
  return Array.from(categories);
}

function renderCategoryDatalist() {
  el.categoryDatalist.innerHTML = '';
  getUniqueCategories().forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    el.categoryDatalist.appendChild(option);
  });
}


function renderStockTable() {
  el.stockTableBody.innerHTML = '';
  
  if (state.items.length === 0) {
    el.stockTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
          ยังไม่มีสินค้าที่ลงทะเบียนไว้ ใช้ฟอร์มด้านซ้ายเพื่อเพิ่มสินค้าลงในทะเบียน
        </td>
      </tr>
    `;
    return;
  }
  
  state.items.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="item-col section-divider">
        <strong style="display:block;">${escapeHTML(item.name)}</strong>
        <span class="item-category" style="font-size: 0.65rem; margin-top: 0.25rem;">${escapeHTML(item.category)}</span>
      </td>
      <td>
        <input type="number" class="stock-input" min="0" data-id="${item.id}" data-field="morningStock" value="${item.morningStock}">
      </td>
      <td class="section-divider">
        <input type="number" class="stock-input" min="0" data-id="${item.id}" data-field="morningWithdrawal" value="${item.morningWithdrawal}">
      </td>
      <td>
        <input type="number" class="stock-input" min="0" data-id="${item.id}" data-field="afternoonStock" value="${item.afternoonStock}">
      </td>
      <td class="section-divider">
        <input type="number" class="stock-input" min="0" data-id="${item.id}" data-field="afternoonWithdrawal" value="${item.afternoonWithdrawal}">
      </td>
      <td>
        <span class="stock-total-val" id="total-withdrawn-${item.id}">${item.stockWithdrawal}</span>
      </td>
    `;
    
    tr.querySelectorAll('.stock-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const itemId = e.target.getAttribute('data-id');
        const fieldName = e.target.getAttribute('data-field');
        const val = parseInt(e.target.value) || 0;
        updateStockValue(itemId, fieldName, val, tr);
      });
    });
    
    el.stockTableBody.appendChild(tr);
  });
}

function updateStockValue(itemId, field, val, rowEl) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldVal = item[field];
  item[field] = val;
  
  if (field === 'morningStock') {
    item.afternoonStock = val;
    const afternoonStockInput = rowEl.querySelector('[data-field="afternoonStock"]');
    if (afternoonStockInput) {
      afternoonStockInput.value = val;
    }
  }
  
  item.stockWithdrawal = item.morningWithdrawal + item.afternoonWithdrawal;
  
  const totalWithdrawnEl = rowEl.querySelector(`#total-withdrawn-${itemId}`);
  if (totalWithdrawnEl) {
    totalWithdrawnEl.textContent = item.stockWithdrawal;
  }
  
  storage.save();
  
  if (oldVal !== val) {
    const translations = {
      morningStock: 'จำนวนของที่มีในห้องสต็อกช่วงเช้า',
      morningWithdrawal: 'จำนวนของที่เบิกจากห้องสต็อกช่วงเช้า',
      afternoonStock: 'จำนวนของที่มีในห้องสต็อกช่วงบ่าย',
      afternoonWithdrawal: 'จำนวนของที่เบิกจากห้องสต็อกช่วงบ่าย'
    };
    const cleanFieldName = translations[field] || field;
    
    let logMsg = `อัพเดท ${cleanFieldName} ${item.name} จาก ${oldVal} เป็น ${val}`;
    if (field === 'morningStock') {
      logMsg += ` (ปรับจำนวนมีในห้องสต็อกช่วงบ่ายเป็น ${val} อัตโนมัติ)`;
    }
    
    addLog(logMsg, 'info');
  }
}


function adjustCount(itemId, delta) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  
  const oldCount = item.count;
  if (delta < 0 && item.count <= 0) return; 
  
  item.count += delta;
  
  
  const countEl = document.getElementById(`count-${itemId}`);
  if (countEl) {
    countEl.textContent = item.count;
  }
  
  storage.save();
  
  const changeType = delta > 0 ? 'increment' : 'decrement';
  const actionPhrase = delta > 0 ? 'เพิ่มจำนวน' : 'ลดจำนวน';
  addLog(`${actionPhrase} <strong>${item.name}</strong> sold count (${oldCount} &rarr; ${item.count})`, changeType);
}


function addItem(name, category) {
  const isDuplicate = state.items.some(
    item => item.name.toLowerCase() === name.toLowerCase() && item.category.toLowerCase() === category.toLowerCase()
  );
  
  if (isDuplicate) {
    alert(`"${name}" หมวดหมู่ "${category}" ถูกลงทะเบียนไว้แล้ว.`);
    return false;
  }
  
  const newItem = {
    id: generateId(),
    name,
    category,
    count: 0,
    morningStock: 0,
    morningWithdrawal: 0,
    afternoonStock: 0,
    afternoonWithdrawal: 0,
    stockWithdrawal: 0
  };
  
  state.items.push(newItem);
  storage.save();
  renderItems();
  
  addLog(`ลงทะเบียน <strong>${name}</strong> หมวดหมู่ <strong>${category}</strong>`, 'เพิ่มสินค้า');
  return true;
}


function removeItem(itemId) {
  const item = state.items.find(i => i.id === itemId);
  if (!item) return;
  
  if (confirm(`คุณต้องการลบ "${item.name}" ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้`)) {
    state.items = state.items.filter(i => i.id !== itemId);
    storage.save();
    renderItems();
    addLog(`ลบสินค้า <strong>${item.name}</strong> จากทะเบียน`, 'ลบสินค้า');
  }
}


function clearLogs() {
  if (confirm('คุณแน่ใจหรือไม่ที่จะล้างประวัติการทำรายการทั้งหมด?')) {
    state.logs = [];
    storage.save();
    renderLogs();
    addLog('ประวัติการทำรายการถูกล้างแล้ว', 'clear');
  }
}


function updateSummaryDashboard() {
  let totalSold = 0;
  let totalWithdrawn = 0;
  const categories = new Set();
  const categoryTotals = {};
  
  let bestSellingItem = null;
  let maxCount = -1;
  
  state.items.forEach(item => {
    totalSold += item.count;
    totalWithdrawn += item.stockWithdrawal;
    categories.add(item.category);
    
    categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.count;
    
    if (item.count > maxCount) {
      maxCount = item.count;
      bestSellingItem = item;
    }
  });
  
  el.statTotalSold.textContent = totalSold;
  el.statTotalWithdrawn.textContent = totalWithdrawn;
  el.statActiveCategories.textContent = categories.size;
  
  if (bestSellingItem && maxCount > 0) {
    el.statBestSelling.innerHTML = `<strong>${escapeHTML(bestSellingItem.name)}</strong> (${maxCount} ขายแล้ว)`;
  } else {
    el.statBestSelling.textContent = 'ไม่มี';
  }
  

  el.categoryChartContainer.innerHTML = '';
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  
  if (sortedCategories.length === 0) {
    el.categoryChartContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.95rem; text-align: center; padding: 2rem 0;">No sales recorded to generate category distribution.</p>`;
  } else {
    const maxCategoryVal = Math.max(...Object.values(categoryTotals), 1);
    
    sortedCategories.forEach(([categoryName, total]) => {
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      
      const percentOfMax = (total / maxCategoryVal) * 100;
      
      barWrapper.innerHTML = `
        <div class="chart-bar-info">
          <span class="chart-bar-label">${escapeHTML(categoryName)}</span>
          <span class="chart-bar-val">${total} sold</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: 0%; --print-width: ${percentOfMax}%"></div>
        </div>
      `;
      
      el.categoryChartContainer.appendChild(barWrapper);
      
      requestAnimationFrame(() => {
        barWrapper.querySelector('.chart-bar-fill').style.width = `${percentOfMax}%`;
      });
    });
  }
  

  el.summaryBlocksContainer.innerHTML = '';
  
  if (state.items.length === 0) {
    el.summaryBlocksContainer.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>No items registered.</p>
      </div>
    `;
  } else {
    const itemsByCategory = {};
    state.items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push(item);
    });
    
    Object.entries(itemsByCategory).forEach(([categoryName, categoryItems]) => {
      let categorySold = 0;
      categoryItems.forEach(item => {
        categorySold += item.count;
      });
      
      const block = document.createElement('div');
      block.className = 'glass-panel category-block-card';
      
      let rowsHtml = '';
      categoryItems.sort((a, b) => b.count - a.count).forEach(item => {
        const remainingInStock = Math.max(0, item.afternoonStock - item.afternoonWithdrawal);
        rowsHtml += `
          <tr>
            <td style="padding: 0.5rem 0;"><strong>${escapeHTML(item.name)}</strong></td>
            <td style="text-align: right; padding: 0.5rem 0; font-feature-settings: 'tnum';">${item.stockWithdrawal}</td>
            <td style="text-align: right; padding: 0.5rem 0; font-feature-settings: 'tnum';">${remainingInStock}</td>
            <td style="text-align: right; padding: 0.5rem 0; font-weight: 600; font-feature-settings: 'tnum';">${item.count}</td>
          </tr>
        `;
      });
      
      block.innerHTML = `
        <div class="category-block-header">
          <span class="category-block-title">${escapeHTML(categoryName)}</span>
          <span class="category-block-badge">${categorySold} ขายแล้ว</span>
        </div>
        <table class="summary-table" style="font-size: 0.9rem; margin-top: 0; width: 100%;">
          <thead>
            <tr>
              <th style="padding: 0.25rem 0; background: none; font-size: 0.8rem;">สินค้า</th>
              <th style="text-align: right; padding: 0.25rem 0; background: none; font-size: 0.8rem;">เบิกจากห้องสต็อก</th>
              <th style="text-align: right; padding: 0.25rem 0; background: none; font-size: 0.8rem;">เหลือในห้องสต็อก</th>
              <th style="text-align: right; padding: 0.25rem 0; background: none; font-size: 0.8rem;">ขายได้</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
      el.summaryBlocksContainer.appendChild(block);
    });
  }
}


function showView(viewId) {

  el.tabCounter.classList.toggle('active', viewId === 'counter');
  el.tabStock.classList.toggle('active', viewId === 'stock');
  el.tabSummary.classList.toggle('active', viewId === 'summary');
  

  el.counterView.classList.add('hidden');
  el.stockView.classList.add('hidden');
  el.summaryView.classList.add('hidden');
  

  if (viewId === 'counter') {
    el.counterView.classList.remove('hidden');
    renderItems();
  } else if (viewId === 'stock') {
    el.stockView.classList.remove('hidden');
    renderStockTable();
  } else if (viewId === 'summary') {
    el.summaryView.classList.remove('hidden');
    updateSummaryDashboard();
  }
}


function applyTheme(themeName) {
  document.body.className = ''; 
  document.body.classList.add(`theme-${themeName}`);
  state.theme = themeName;
  storage.save();
  

  el.themeBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
  });
}


el.addItemForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const name = el.itemNameInput.value.trim();
  const category = el.categoryInput.value.trim();
  
  if (name && category) {
    const success = addItem(name, category);
    if (success) {
      el.addItemForm.reset();
      renderCategoryDatalist();
    }
  }
});


function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}


el.tabCounter.addEventListener('click', () => showView('counter'));
el.tabStock.addEventListener('click', () => showView('stock'));
el.tabSummary.addEventListener('click', () => showView('summary'));

el.backToCounterBtn.addEventListener('click', () => showView('counter'));
el.clearLogsBtn.addEventListener('click', clearLogs);


el.themeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.getAttribute('data-theme'));
  });
});


el.exportPdfBtn.addEventListener('click', () => {
  try {
    window.print();
  } catch (e) {
    alert('ไม่สามารถเปิดหน้าต่างพิมพ์ได้เนื่องจากข้อจำกัดของเบราว์เซอร์ กรุณากดปุ่ม Ctrl + P (หรือ Cmd + P บน Mac) เพื่อบันทึกเป็น PDF แทน');
  }
});

window.addEventListener('beforeprint', () => {
  updateSummaryDashboard();
});


function init() {
  storage.load();
  applyTheme(state.theme);
  renderCategoryDatalist();
  showView('counter');
  renderLogs();
}

init();
