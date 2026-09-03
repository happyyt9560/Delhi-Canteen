let taskOrders = [];
let deliveredTodayOrders = [];

const taskTotal = order => Number(order.total ?? order.items.reduce((sum, item) => sum + item.quantity * item.price, 0) + (Number(order.deliveryCharge) || 0));
const itemCount = order => order.items.reduce((sum, item) => sum + item.quantity, 0);
const empty = () => `<div class="empty"><div>📦</div><b>No orders assigned for today.</b><p>You're all caught up!</p></div>`;

function orderRow(order) {
  return `<tr><td><b>#${order.id}</b></td><td>${order.customerName}<br><small>${order.phone}</small></td><td>${order.address}</td><td>${itemCount(order)} Items</td><td><span class="badge ${order.paymentMode === 'COD' ? 'cod' : 'online'}">${order.paymentMode === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span></td><td>${statusBadge(order.status)}</td><td><button class="primary" data-order="${order.id}">${order.status === 'Reached' ? 'Continue' : 'Reached'}</button></td></tr>`;
}

function deliveredRow(order) {
  const deliveredAt = order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';
  return `<tr><td><b>#${order.id}</b></td><td>${order.customerName}<br><small>${order.phone}</small></td><td>${order.address}</td><td>${itemCount(order)} Items</td><td>${deliveryMoney(taskTotal(order))}</td><td>${statusBadge('Delivered')}</td><td>${deliveredAt}</td></tr>`;
}

async function renderTasks() {
  try {
    [taskOrders, deliveredTodayOrders] = await Promise.all([deliveryApi('/delivery/orders/today').then(response => response.data), deliveryApi('/delivery/orders/today/delivered').then(response => response.data)]);
    shell(`<div class="page-head"><div><h1 class="page-title">Today's Tasks</h1><p class="muted">Review your assigned orders and confirm each delivery.</p></div></div><section class="panel"><div class="table-wrap"><table class="tasks-table"><thead><tr><th>Order No.</th><th>Customer Name</th><th>Address</th><th>Total Items</th><th>Payment Mode</th><th>Status</th><th>Action</th></tr></thead><tbody>${taskOrders.length ? taskOrders.map(orderRow).join('') : `<tr><td colspan="7">${empty()}</td></tr>`}</tbody></table></div><div class="task-cards">${taskOrders.length ? taskOrders.map(order => `<article class="task-card"><h3>#${order.id}</h3><b>${order.customerName}</b><p>📍 ${order.address}</p><div class="task-meta">${statusBadge(order.status)}<button class="primary" data-order="${order.id}">${order.status === 'Reached' ? 'Continue' : 'Reached'}</button></div></article>`).join('') : empty()}</div></section><section class="panel delivered-history"><div class="panel-head"><div><h2>Today's Delivered Orders</h2><p class="muted">${deliveredTodayOrders.length} delivery${deliveredTodayOrders.length === 1 ? '' : 'ies'} completed today.</p></div></div><div class="table-wrap"><table class="tasks-table"><thead><tr><th>Order No.</th><th>Customer Name</th><th>Address</th><th>Items</th><th>Amount</th><th>Status</th><th>Delivered at</th></tr></thead><tbody>${deliveredTodayOrders.length ? deliveredTodayOrders.map(deliveredRow).join('') : '<tr><td colspan="7" class="empty">No orders delivered today yet.</td></tr>'}</tbody></table></div><div class="task-cards">${deliveredTodayOrders.map(order => `<article class="task-card"><h3>#${order.id}</h3><b>${order.customerName}</b><p>${itemCount(order)} items · ${deliveryMoney(taskTotal(order))}</p><div class="task-meta">${statusBadge('Delivered')}<small>${order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—'}</small></div></article>`).join('') || '<p class="empty">No orders delivered today yet.</p>'}</div></section>`);
    document.querySelectorAll('[data-order]').forEach(button => { button.onclick = () => openOrder(button.dataset.order); });
  } catch (error) {
    shell(`<div class="panel empty"><div>⚠</div><b>Could not load tasks.</b><p>${error.message}</p></div>`);
  }
}

async function openOrder(id) {
  try {
    let order = (await deliveryApi(`/delivery/orders/${id}`)).data;
    if (order.status !== 'Reached') order = (await deliveryApi(`/delivery/orders/${id}/reached`, { method: 'POST' })).data;
    const total = taskTotal(order);
    document.querySelector('#order-modal')?.remove();
    document.body.insertAdjacentHTML('beforeend', `<div id="order-modal" class="modal-backdrop"><section class="modal"><header class="modal-head"><h2>Order #${order.id}</h2><button class="close" id="close-modal" aria-label="Close">×</button></header><div class="modal-content"><div class="customer-grid"><div><small>Customer</small><b>${order.customerName}</b></div><div><small>Address</small><b>${order.address}</b></div><div><small>Phone</small><b>${order.phone}</b></div></div><h3>Order Items</h3><button class="secondary verify-all" id="verify-all-items" type="button">✓ Check all items</button><table class="product-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th><th>Check</th></tr></thead><tbody>${order.items.map(item => `<tr><td>${item.name}</td><td>${item.quantity}</td><td>${deliveryMoney(item.price * item.quantity)}</td><td><input class="verify" data-item="${item.productId}" type="checkbox" aria-label="Verify ${item.name}"></td></tr>`).join('')}</tbody></table><div class="total-box"><div class="total-line total"><b>Total Amount</b><b>${deliveryMoney(total)}</b></div></div>${order.paymentMode === 'COD' ? `<div class="collect-box"><strong>Collect ${deliveryMoney(total)}</strong><input id="received-amount" class="amount-input" type="number" min="0" placeholder="Received amount"><div class="radio-row"><label><input type="radio" name="method" value="Cash"> Cash</label><label><input type="radio" name="method" value="Online Payment"> Online Payment</label></div></div>` : ''}</div><footer class="modal-actions"><button class="secondary" id="cancel-delivery">Cancel</button><button class="primary" id="complete-delivery">Complete Delivery</button></footer></section></div>`);
    const close = () => document.querySelector('#order-modal')?.remove();
    document.querySelector('#close-modal').onclick = close;
    document.querySelector('#cancel-delivery').onclick = close;
    document.querySelector('#verify-all-items').onclick = event => {
      document.querySelectorAll('.verify').forEach(checkbox => { checkbox.checked = true; });
      event.currentTarget.textContent = '✓ All items checked';
      event.currentTarget.disabled = true;
    };
    document.querySelectorAll('.verify').forEach(checkbox => checkbox.onchange = () => checkbox.closest('tr')?.classList.remove('needs-verification'));
    document.querySelector('#complete-delivery').onclick = () => startCompletion(order, close);
  } catch (error) { toast(error.message, 'error'); }
}

function collectCompletionDetails(order) {
  const checkboxes = [...document.querySelectorAll('#order-modal .verify')];
  const verifiedItems = checkboxes.filter(input => input.checked).map(input => input.dataset.item);
  if (checkboxes.length !== order.items.length || verifiedItems.length !== order.items.length) {
    checkboxes.filter(input => !input.checked).forEach(input => input.closest('tr')?.classList.add('needs-verification'));
    toast('Please check all products before completing delivery.', 'warning');
    return null;
  }
  const body = { verifiedItems };
  if (order.paymentMode === 'COD') {
    body.receivedAmount = Number(document.querySelector('#received-amount').value);
    body.paymentReceivedMode = document.querySelector('input[name="method"]:checked')?.value;
    if (body.receivedAmount < taskTotal(order)) { toast(`Please collect the complete amount of ${deliveryMoney(taskTotal(order))}.`, 'error'); return null; }
    if (!body.paymentReceivedMode) { toast('Select a payment method.', 'warning'); return null; }
  }
  return body;
}

function startCompletion(order, close) {
  const body = collectCompletionDetails(order);
  if (body) openCustomerIdDialog(order, body, close);
}

function openCustomerIdDialog(order, body, closeOrderModal) {
  document.querySelector('#dc-id-confirm-backdrop')?.remove();
  document.body.insertAdjacentHTML('beforeend', `<div id="dc-id-confirm-backdrop" class="dc-id-confirm-backdrop"><section class="dc-id-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="customer-id-verification-title"><button id="close-dc-id-confirm" class="dc-id-confirm-close" type="button" aria-label="Close customer ID verification">×</button><section class="customer-id-verification" data-state="idle"><p class="customer-id-verification-label">DELIVERY CONFIRMATION</p><h3 id="customer-id-verification-title">Verify customer DC ID</h3><p class="customer-id-verification-copy">Enter the six digits after <b>DC-</b> shown by the customer.</p><div class="customer-id-code" role="group" aria-label="Six-digit customer DC ID"><span class="customer-id-prefix" aria-hidden="true">DC-</span>${Array.from({ length: 6 }, (_, index) => `<input class="customer-id-slot" type="text" inputmode="numeric" maxlength="1" autocomplete="one-time-code" aria-label="DC ID digit ${index + 1} of 6">`).join('')}</div><p class="customer-id-verification-error" aria-live="polite"></p><button class="primary wide" id="confirm-dc-id" type="button">Verify & Complete Delivery</button></section></section></div>`);
  const backdrop = document.querySelector('#dc-id-confirm-backdrop'), verification = backdrop.querySelector('.customer-id-verification'), digits = [...backdrop.querySelectorAll('.customer-id-slot')], error = backdrop.querySelector('.customer-id-verification-error'), button = backdrop.querySelector('#confirm-dc-id');
  const dismiss = () => backdrop.remove();
  backdrop.querySelector('#close-dc-id-confirm').onclick = dismiss;
  backdrop.addEventListener('click', event => { if (event.target === backdrop) dismiss(); });
  const clearError = () => { if (verification.dataset.state === 'error') verification.dataset.state = 'filling'; error.textContent = ''; };
  const fill = (start, value) => {
    const numbers = String(value || '').replace(/\D/g, '').slice(0, 6 - start);
    if (!numbers) { digits[start].value = ''; clearError(); return; }
    numbers.split('').forEach((number, offset) => { digits[start + offset].value = number; });
    clearError(); digits[Math.min(start + numbers.length, digits.length - 1)].focus();
  };
  digits.forEach((input, index) => {
    input.addEventListener('input', event => fill(index, event.target.value));
    input.addEventListener('paste', event => { event.preventDefault(); fill(index, event.clipboardData.getData('text')); });
    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && index) { digits[index - 1].value = ''; digits[index - 1].focus(); clearError(); }
      if (event.key === 'ArrowLeft' && index) digits[index - 1].focus();
      if (event.key === 'ArrowRight' && index < digits.length - 1) digits[index + 1].focus();
    });
  });
  button.onclick = async () => {
    if (digits.some(input => !input.value)) return showIdError(verification, error, digits, 'Enter all six digits to continue.');
    button.disabled = true; button.textContent = 'Verifying...'; verification.dataset.state = 'checking';
    try {
      await deliveryApi(`/delivery/orders/${order.id}/complete`, { method: 'POST', body: JSON.stringify({ ...body, customerId: `DC-${digits.map(input => input.value).join('')}` }) });
      closeOrderModal(); dismiss(); toast(`Order #${order.id} delivered successfully!`); renderTasks();
    } catch (requestError) {
      button.disabled = false; button.textContent = 'Verify & Complete Delivery';
      showIdError(verification, error, digits, requestError.message.includes('Customer DC ID') ? 'That DC ID does not match this order. Please try again.' : requestError.message);
    }
  };
  setTimeout(() => digits[0].focus(), 0);
}

function showIdError(verification, error, digits, message) {
  verification.dataset.state = 'error'; error.textContent = message;
  const code = verification.querySelector('.customer-id-code');
  code.classList.remove('is-shaking'); void code.offsetWidth; code.classList.add('is-shaking'); digits[0].focus();
}

renderTasks();
