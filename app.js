const API_BASE = 'https://ayhtmathen-production.up.railway.app';

const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const inventoryTableWrapper = document.getElementById('inventoryTableWrapper');
const suggestionsBox = document.getElementById('suggestions');

let suggestionSelected = -1;
let currentSuggestions = [];

// Suggestion dropdown logic
searchInput.addEventListener('input', async function() {
    const q = searchInput.value.trim();
    if (!q) {
        suggestionsBox.innerHTML = '';
        return;
    }
    try {
        const res = await fetch(`${API_BASE}/suggest?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        currentSuggestions = data;
        if (!data.length) {
            suggestionsBox.innerHTML = '';
            return;
        }
        let html = '';
        data.forEach((item, idx) => {
            html += `<div class="suggestion-item" data-ref="${item.reference}" data-idx="${idx}">
                        <span style="font-weight:bold;">${item.reference}</span> — ${item.description}
                    </div>`;
        });
        suggestionsBox.innerHTML = html;
        suggestionSelected = -1;
    } catch (err) {
        suggestionsBox.innerHTML = '';
    }
});

// Keyboard navigation in suggestion dropdown
searchInput.addEventListener('keydown', function(e) {
    const items = suggestionsBox.querySelectorAll('.suggestion-item');
    if (!items.length) return;
    if (e.key === 'ArrowDown') {
        if (suggestionSelected < items.length - 1) suggestionSelected++;
        updateSuggestionHighlight(items);
        e.preventDefault();
    } else if (e.key === 'ArrowUp') {
        if (suggestionSelected > 0) suggestionSelected--;
        updateSuggestionHighlight(items);
        e.preventDefault();
    } else if (e.key === 'Enter') {
        if (suggestionSelected >= 0 && suggestionSelected < items.length) {
            selectSuggestion(items[suggestionSelected]);
            e.preventDefault();
        } else {
            runSearch();
        }
    }
});
function updateSuggestionHighlight(items) {
    items.forEach((item, idx) => {
        if (idx === suggestionSelected) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}
suggestionsBox.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('suggestion-item')) {
        selectSuggestion(e.target);
    }
});
function selectSuggestion(item) {
    searchInput.value = item.dataset.ref;
    suggestionsBox.innerHTML = '';
    runSearch();
}
searchInput.addEventListener('blur', function() {
    setTimeout(() => { suggestionsBox.innerHTML = ''; }, 160);
});

// Search button & Enter key triggers search
searchBtn.addEventListener('click', runSearch);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && suggestionSelected === -1) runSearch();
});

// Initial inventory load
window.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});

// Search logic
async function runSearch() {
    const term = searchInput.value.trim();
    suggestionsBox.innerHTML = '';
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
            showResult(filtered[0]);
        }
    } catch (err) {
        showResultMessage('Network error.');
    }
}

// Loader
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
