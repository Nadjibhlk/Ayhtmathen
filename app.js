// Set this to your deployed FastAPI backend URL
const API_BASE = 'https://ayhtmathen-production.up.railway.app';

// DOM elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const inventoryTableWrapper = document.getElementById('inventoryTableWrapper');

// Interactive Search: Enter key triggers search
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') runSearch();
});
searchBtn.addEventListener('click', runSearch);

// Initial inventory load
window.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});

// Search logic
async function runSearch() {
    const term = searchInput.value.trim();
    if (!term) {
        showResultMessage('Please enter a reference or description.');
        return;
    }
    resultsSection.innerHTML = loaderAnimation();
    let found = false;
    try {
        const res = await fetch(`${API_BASE}/search?reference=${encodeURIComponent(term)}`);
        if (res.ok) {
            const item = await res.json();
            if (Object.keys(item).length > 0) {
                showResult(item);
                found = true;
            }
        }
    } catch (err) { /* ignore */ }
    if (found) return;

    // Fallback: search by description
    try {
        const res = await fetch(`${API_BASE}/inventory`);
        const items = await res.json();
        const filtered = items.filter(i => i.description.toLowerCase().includes(term.toLowerCase()) || i.reference.toLowerCase().includes(term.toLowerCase()));
        if (filtered.length === 0) {
            showResultMessage('No item found.');
        } else {
            showResult(filtered[0]); // show first match
        }
    } catch (err) {
        showResultMessage('Network error.');
    }
}

// Animated loader
function loaderAnimation() {
    return `<div style="text-align:center;padding:1.2rem;">
        <span style="font-size:2rem;animation:spin 1s linear infinite;display:inline-block;">🔄</span>
        <style>@keyframes spin{100%{transform:rotate(360deg);}}</style>
    </div>`;
}

// Show result card
function showResult(item) {
    resultsSection.innerHTML = `
      <div class="result-card">
        <div class="result-title">DA ${item.sell_price?.toLocaleString(undefined, {minimumFractionDigits:2}) || '??'} <span style="font-size:1.1rem;color:#22c55e;font-weight:700;margin-left:1.2em;">(${item.reference})</span></div>
        <div class="result-desc">${item.description || ''}</div>
        <div class="result-info-row">
            <div class="result-info-item"><span class="icon">🔢</span>Ref: <span class="reference">${item.reference}</span></div>
            <div class="result-info-item"><span class="icon">📦</span>Qty: <span class="quantity">${item.quantity}</span> ${item.quantity < 5 ? '<span style="color:#ef4444;font-weight:900;">LOW!</span>' : ''}</div>
            <div class="result-info-item"><span class="icon">💸</span>Cost: DA ${item.cost_price?.toLocaleString(undefined, {minimumFractionDigits:2}) || '??'}</div>
            <div class="result-info-item"><span class="icon">👗</span>Series: ${item.pieces_in_series ?? '-'}</div>
            <div class="result-info-item"><span class="icon">🎨</span>Colors: ${item.colors ?? '-'}</div>
        </div>
      </div>
    `;
}

// Show message
function showResultMessage(msg) {
    resultsSection.innerHTML = `<div style="text-align:center;font-size:1.18rem;color:#ef4444;padding:1.2rem;">${msg}</div>`;
}

// Load full inventory
async function loadInventory() {
    inventoryTableWrapper.innerHTML = loaderAnimation();
    try {
        const res = await fetch(`${API_BASE}/inventory`);
        const items = await res.json();
        renderInventoryTable(items);
    } catch (err) {
        inventoryTableWrapper.innerHTML = `<div style="color:#ef4444;text-align:center;padding:1.2rem;">Network error loading inventory.</div>`;
    }
}

function renderInventoryTable(items) {
    if (!items || !items.length) {
        inventoryTableWrapper.innerHTML = `<div style="color:#ef4444;text-align:center;padding:1.2rem;">No items in inventory.</div>`;
        return;
    }
    let html = `<table class="inventory-table"><thead><tr>
        <th>Ref</th>
        <th>Description</th>
        <th>Cost Price</th>
        <th>Sell Price</th>
        <th>Qty</th>
        <th>Series</th>
        <th>Colors</th>
    </tr></thead><tbody>`;
    for (const item of items) {
        const lowStock = item.quantity < 5 ? 'low-stock' : '';
        html += `<tr class="${lowStock}">
            <td class="reference">${item.reference}</td>
            <td>${item.description}</td>
            <td>DA ${item.cost_price?.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td>DA ${item.sell_price?.toLocaleString(undefined, {minimumFractionDigits:2})}</td>
            <td class="quantity">${item.quantity}</td>
            <td>${item.pieces_in_series ?? '-'}</td>
            <td>${item.colors ?? '-'}</td>
        </tr>`;
    }
    html += '</tbody></table>';
    inventoryTableWrapper.innerHTML = html;
}
