/* Dedicated Orders page renderer.
   This replaces the legacy, overlapping order renderers with one stable layout. */
(function () {
  const byId = id => document.getElementById(id);
  const escapeHtml = value => typeof esc === 'function' ? esc(value) : String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char]);
  const orderList = () => typeof orders === 'function' ? orders() : [];
  const customerOf = order => order?.customer || {};
  const customerIdOf = order => customerOf(order).customerId || customerOf(order).id || order?.customerId || '—';
  const addressOf = order => order?.address || customerOf(order).address || '—';
  const itemsOf = order => Array.isArray(order?.items) ? order.items : [];
  const itemCount = order => itemsOf(order).reduce((sum, item) => sum + Math.max(1, Number(item.qty ?? item.quantity ?? 1) || 1), 0);
  const statusOf = order => {
    const value = String(order?.status || 'pending').toLowerCase();
    return ({ pending: 'Pending', accepted: 'Accepted', packed: 'Packed', 'out for delivery': 'Out for delivery', 'out of delivery': 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled', canceled: 'Cancelled', rejected: 'Cancelled' })[value] || 'Pending';
  };
  const paymentStatusOf = order => {
    const value = String(order?.paymentStatus || 'pending').toLowerCase();
    return ['verified', 'confirmed'].includes(value) ? 'verified' : ['rejected', 'failed'].includes(value) ? 'rejected' : 'pending';
  };
  const paymentStatusLabel = value => ({ pending: 'Pending', verified: 'Confirmed', rejected: 'Rejected' })[value] || 'Pending';
  const transactionOf = order => order?.bookingCharge?.transactionNumber || order?.transactionNumber || order?.transactionId || order?.transactionRef || '—';
  const amount = value => typeof money === 'function' ? money(Number(value) || 0) : `₹${Number(value) || 0}`;

  let orderPageEvents;

  const appliedCharges = order => {
    const readAmount = (...values) => values.filter(value => value !== undefined && value !== null && value !== '').map(Number).find(value => Number.isFinite(value));
    const settings = typeof get === 'function' ? get('dc_customer_charge_settings', {}) : {};
    const isPickup = order?.payment === 'Self Take (Store Pickup)' || String(order?.address || '').startsWith('Store Pickup');
    const configuredDelivery = settings.deliveryEnabled !== false && !isPickup ? Math.max(0, Number(settings.deliveryAmount ?? 35) || 0) : undefined;
    const configuredHandling = settings.handlingEnabled !== false ? Math.max(0, Number(settings.handlingAmount ?? 5) || 0) : undefined;
    return {
      delivery: readAmount(order?.deliveryCharge, order?.delivery, order?.charges?.delivery) ?? configuredDelivery,
      handling: readAmount(order?.handlingCharge, order?.handling, order?.charges?.handling) ?? configuredHandling
    };
  };

  // Opens a dedicated print document so browser printing never includes the admin dashboard.
  window.printOrderedProducts = function (orderIndex) {
    const order = orderList()[Number(orderIndex)];
    if (!order) return;
    const store = typeof shop === 'function' ? shop() : { name: 'Delhi Canteen', phone: '', address: '' };
    const customer = customerOf(order), catalogue = typeof products === 'function' ? products() : [];
    const data = itemsOf(order).map((item, index) => {
      const product = { ...catalogue.find(p => String(p.id) === String(item.id ?? item.productId)), ...(item.product || item.productDetails || {}) };
      const qty = Math.max(1, Number(item.qty ?? item.quantity ?? 1) || 1), price = Number(item.price ?? product.price ?? 0), mrp = Number(item.mrp ?? product.mrp ?? price);
      return { index, qty, price, mrp, name: item.name || product.name || 'Product', unit: item.unit || product.unit || '' };
    });
    const totals = data.reduce((sum, item) => ({ mrp: sum.mrp + item.mrp * item.qty, discount: sum.discount + Math.max(0, item.mrp - item.price) * item.qty, price: sum.price + item.price * item.qty }), { mrp: 0, discount: 0, price: 0 });
    const payable = Number(order.total) || totals.price;
    const printWindow = window.open('', '_blank', 'width=850,height=700');
    if (!printWindow) { toast('Please allow popups to print this receipt.'); return; }
    const date = order.placedAt ? new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : new Date().toLocaleString('en-IN');
    printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Order receipt ${escapeHtml(order.id || '')}</title><style>@page{margin:12mm}*{box-sizing:border-box}body{color:#222;font:12px Arial,sans-serif;margin:0}header{border-bottom:2px solid #d92736;padding-bottom:12px;text-align:center}h1{color:#c61f30;font-size:24px;margin:0 0 5px}p{margin:4px 0}.meta{display:grid;gap:12px;grid-template-columns:repeat(3,1fr);margin:18px 0}.meta div{border-bottom:1px solid #ddd;padding:0 0 8px}.meta span{color:#666;display:block;font-size:10px;font-weight:bold;text-transform:uppercase}.meta b{display:block;margin-top:3px;overflow-wrap:anywhere}table{border-collapse:collapse;margin:18px 0;width:100%}th,td{border-bottom:1px solid #ddd;padding:8px 5px;text-align:left}th{background:#fff2f3;color:#6b5558;font-size:10px;text-transform:uppercase}.right{text-align:right}.totals{margin-left:auto;max-width:300px}.totals p{display:flex;justify-content:space-between}.grand{border-top:2px solid #222;font-size:15px;font-weight:bold;padding-top:8px}@media print{body{margin:0}}</style></head><body><header><h1>${escapeHtml(store.name || 'Delhi Canteen')}</h1><p>${escapeHtml(store.address || '')}</p><p>${escapeHtml(store.phone || '')}</p></header><p><b>Order no.:</b> ${escapeHtml(order.id || `Order ${Number(orderIndex) + 1}`)} &nbsp; <b>Date:</b> ${escapeHtml(date)}</p><section class="meta"><div><span>Customer name</span><b>${escapeHtml(customer.name || 'Customer')}</b></div><div><span>Phone no.</span><b>${escapeHtml(customer.phone || '—')}</b></div><div><span>Customer ID</span><b>${escapeHtml(customerIdOf(order))}</b></div><div><span>Payment method</span><b>${escapeHtml(order.payment || '—')}</b></div><div><span>Order status</span><b>${escapeHtml(statusOf(order))}</b></div><div><span>Delivery address</span><b>${escapeHtml(addressOf(order))}</b></div></section><table><thead><tr><th>#</th><th>Product</th><th>Qty</th><th>MRP</th><th>Discount</th><th>Price</th><th class="right">Amount</th></tr></thead><tbody>${data.map(item => `<tr><td>${item.index + 1}</td><td><b>${escapeHtml(item.name)}</b>${item.unit ? `<br><small>${escapeHtml(item.unit)}</small>` : ''}</td><td>${item.qty}</td><td>${amount(item.mrp)}</td><td>${amount(Math.max(0, item.mrp - item.price) * item.qty)}</td><td>${amount(item.price)}</td><td class="right">${amount(item.price * item.qty)}</td></tr>`).join('')}</tbody></table><section class="totals"><p><span>Total MRP</span><b>${amount(totals.mrp)}</b></p><p><span>Total discount</span><b>${amount(totals.discount)}</b></p><p><span>Item total</span><b>${amount(totals.price)}</b></p><p class="grand"><span>Payable amount</span><b>${amount(payable)}</b></p></section><p style="border-top:1px solid #ddd;margin-top:22px;padding-top:12px;text-align:center">Thank you for shopping with us.</p><script>window.onload=function(){window.print()}<\/script></body></html>`);
    const readAmount = (...values) => values.filter(value => value !== undefined && value !== null && value !== '').map(Number).find(value => Number.isFinite(value));
    const { delivery, handling } = appliedCharges(order);
    const coupon = order.coupon || order.couponDetails;
    const couponAmount = readAmount(order.couponDiscount, order.couponDiscountAmount, order.charges?.couponDiscount);
    const booking = readAmount(order.bookingCharge?.amount, order.bookingAmount);
    const extraRows = [
      delivery !== undefined ? `<p class="charge-row"><span>Delivery charge</span><b>${amount(delivery)}</b></p>` : '',
      handling !== undefined ? `<p class="charge-row"><span>Handling charge</span><b>${amount(handling)}</b></p>` : '',
      coupon ? `<p class="charge-row coupon-row"><span>Coupon ${escapeHtml(coupon.code || coupon.name || '')}${coupon.label ? ` (${escapeHtml(coupon.label)})` : ''}</span><b>${couponAmount !== undefined ? `− ${amount(couponAmount)}` : 'Applied'}</b></p>` : '',
      booking !== undefined ? `<p class="charge-row order-value"><span>Total order value</span><b>${amount(payable)}</b></p><p class="charge-row booking-row"><span>${order.bookingCharge?.type === 'onlinePayment' ? 'Online payment paid' : 'Booking charge paid'}</span><b>− ${amount(booking)}</b></p>` : ''
    ].filter(Boolean).join('');
    const totalsPanel = printWindow.document.querySelector('.totals');
    if (totalsPanel && extraRows) totalsPanel.querySelector('.grand').insertAdjacentHTML('beforebegin', extraRows);
    if (totalsPanel && booking !== undefined) {
      totalsPanel.querySelector('.grand span').textContent = order.bookingCharge?.type === 'onlinePayment' ? 'Payment pending' : 'Remaining COD amount';
      totalsPanel.querySelector('.grand b').textContent = amount(Math.max(0, payable - booking));
    }
    printWindow.document.head.insertAdjacentHTML('beforeend', '<style>@page{size:3in auto;margin:0}html,body{width:3in!important;margin:0!important;padding:0!important}body{max-width:none!important;background:#fff!important;padding:.1in!important;font-size:10px!important}header{padding:0 0 9px!important}header p{color:#686868;font-size:8px!important}h1{font-size:16px!important;letter-spacing:.3px}.meta{border:1px dashed #bbb;gap:7px!important;grid-template-columns:repeat(2,1fr)!important;margin:10px 0!important;padding:7px}.meta span{font-size:8px!important}.meta b{font-size:9px!important}table{font-size:7px!important;table-layout:fixed}th,td{overflow-wrap:anywhere;padding:4px 2px!important}th:first-child,td:first-child{width:6%}th:nth-child(2),td:nth-child(2){width:34%}th:nth-child(3),td:nth-child(3){width:8%}th:nth-child(4),td:nth-child(4),th:nth-child(5),td:nth-child(5),th:nth-child(6),td:nth-child(6),th:nth-child(7),td:nth-child(7){font-size:6px;white-space:nowrap}.totals{border-top:1px dashed #999;font-size:10px!important;margin-top:10px;padding-top:6px;width:100%!important}.charge-row{color:#333}.coupon-row{color:#087443}.booking-row{color:#9a202b}.order-value{font-weight:bold}.grand{background:#fff2f3;font-size:12px!important;margin-top:7px!important;padding:7px 5px!important}</style>');
    printWindow.document.head.insertAdjacentHTML('beforeend', '<style>th:nth-child(3),td:nth-child(3){white-space:nowrap!important;overflow-wrap:normal!important;word-break:normal!important}</style>');
    printWindow.document.close();
  };

  // View products as a complete receipt, matching the customer order receipt.
  window.openOrderedProducts = function (orderIndex) {
    const order = orderList()[Number(orderIndex)];
    if (!order) return;
    const store = typeof shop === 'function' ? shop() : { name: 'Delhi Canteen', phone: '+91 99999 99999', address: '24 Market Road, New Delhi - 110001' };
    const customer = customerOf(order), catalogue = typeof products === 'function' ? products() : [];
    const data = itemsOf(order).map((item, index) => {
      const product = { ...catalogue.find(p => String(p.id) === String(item.id ?? item.productId)), ...(item.product || item.productDetails || {}) };
      const qty = Math.max(1, Number(item.qty ?? item.quantity ?? 1) || 1), price = Number(item.price ?? product.price ?? 0), mrp = Number(item.mrp ?? product.mrp ?? price);
      return { index, qty, price, mrp, name: item.name || product.name || 'Product', image: item.image || product.image || '', unit: item.unit || product.unit || '' };
    });
    const totals = data.reduce((sum, item) => ({ mrp: sum.mrp + item.mrp * item.qty, discount: sum.discount + Math.max(0, item.mrp - item.price) * item.qty, price: sum.price + item.price * item.qty }), { mrp: 0, discount: 0, price: 0 });
    const total = Number(order.total) || totals.price, items = data.reduce((sum, item) => sum + item.qty, 0), logo = store.logo || store.logoUrl || store.logo_url;
    const deliveredAt = statusOf(order) === 'Delivered' && order.deliveredAt && !Number.isNaN(new Date(order.deliveredAt).getTime())
      ? new Date(order.deliveredAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
      : '';
    const rows = data.map(item => `<tr><td>${item.index + 1}</td><td>${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : '<span class="admin-receipt-no-image">—</span>'}</td><td><b>${escapeHtml(item.name)}</b>${item.unit ? `<small>${escapeHtml(item.unit)}</small>` : ''}</td><td>${item.qty}</td><td>${amount(item.mrp)}</td><td>${amount(Math.max(0, item.mrp - item.price) * item.qty)}</td><td>${amount(item.price)}</td><td><b>${amount(item.price * item.qty)}</b></td></tr>`).join('');
    modal(`<section class="admin-receipt" role="dialog" aria-modal="true" aria-labelledby="admin-receipt-title"><header class="admin-receipt-shop">${logo ? `<img src="${escapeHtml(logo)}" alt="${escapeHtml(store.name)} logo">` : `<span class="admin-receipt-mark">${escapeHtml(String(store.name || 'D').slice(0, 1).toUpperCase())}</span>`}<div><h2 id="admin-receipt-title">${escapeHtml(store.name)}</h2><p>${escapeHtml(store.address || '—')}</p></div><p><span>Phone no.</span><b>${escapeHtml(store.phone || '—')}</b></p></header><p class="admin-receipt-order">Order no. ${escapeHtml(order.id || `Order ${Number(orderIndex) + 1}`)}</p><div class="admin-receipt-details"><p><span>Customer name</span><b>${escapeHtml(customer.name || 'Customer')}</b></p><p><span>Customer phone no.</span><b>${escapeHtml(customer.phone || '—')}</b></p><p><span>Customer ID</span><b>${escapeHtml(customerIdOf(order))}</b></p><p><span>Items</span><b>${items}</b></p><p><span>Order status</span><b>${escapeHtml(statusOf(order))}</b></p>${deliveredAt ? `<p><span>Delivered on</span><b>${escapeHtml(deliveredAt)}</b></p>` : ''}<p><span>Payment method</span><b>${escapeHtml(order.payment || '—')}</b></p><p class="admin-receipt-address"><span>Delivery address</span><b>${escapeHtml(addressOf(order))}</b></p></div>${rows ? `<div class="admin-receipt-table"><table><thead><tr><th>S.No.</th><th>Product</th><th>Product name</th><th>Qty</th><th>MRP</th><th>Discount</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="4">Total</td><td>${amount(totals.mrp)}</td><td>${amount(totals.discount)}</td><td>${amount(totals.price)}</td><td><b>${amount(total)}</b></td></tr></tfoot></table></div>` : '<p class="empty">No products are available for this order.</p>'}<div class="admin-receipt-total"><span>Payable amount</span><b>${amount(total)}</b></div></section>`);
    const receipt = document.querySelector('.admin-receipt');
    if (receipt) {
      const readAmount = (...values) => values.filter(value => value !== undefined && value !== null && value !== '').map(Number).find(value => Number.isFinite(value));
      const { delivery, handling } = appliedCharges(order);
      const booking = readAmount(order.bookingCharge?.amount, order.bookingAmount);
      const isCod = /cash\s*on\s*delivery|\bcod\b/i.test(String(order.payment || ''));
      const breakdown = document.createElement('section');
      breakdown.className = 'admin-receipt-breakdown';
      breakdown.innerHTML = `
        <p><span>Total MRP</span><b>${amount(totals.mrp)}</b></p>
        <p><span>Total discount</span><b>${amount(totals.discount)}</b></p>
        <p><span>Item total</span><b>${amount(totals.price)}</b></p>
        ${delivery !== undefined ? `<p><span>Delivery charge</span><b>${amount(delivery)}</b></p>` : ''}
        ${handling !== undefined ? `<p><span>Handling charge</span><b>${amount(handling)}</b></p>` : ''}
        <p class="order-value"><span>Total order value</span><b>${amount(total)}</b></p>
        ${booking !== undefined ? `<p class="booking-charge"><span>${order.bookingCharge?.type === 'onlinePayment' ? 'Online payment paid' : 'Booking charge paid'}</span><b>− ${amount(booking)}</b></p>` : ''}`;
      receipt.querySelector('.admin-receipt-total')?.before(breakdown);
      if (booking !== undefined && isCod) {
        const finalTotal = receipt.querySelector('.admin-receipt-total');
        if (finalTotal) {
          finalTotal.querySelector('span').textContent = 'COD remaining amount';
          finalTotal.querySelector('b').textContent = amount(Math.max(0, total - booking));
        }
      }

      const actions = document.createElement('div');
      actions.className = 'form-actions';
      const print = document.createElement('button');
      print.className = 'secondary';
      print.type = 'button';
      print.textContent = 'Print receipt';
      print.addEventListener('click', () => window.printOrderedProducts(orderIndex));
      const done = document.createElement('button');
      done.className = 'primary';
      done.type = 'button';
      done.textContent = 'Done';
      done.addEventListener('click', () => closeModal());
      actions.append(print, done);
      receipt.append(actions);
    }
  };

  window.renderProfessionalOrders = function renderProfessionalOrders() {
    if (document.body.dataset.page !== 'orders') return;
    // Rendering happens after API refreshes. Abort the prior delegated handlers
    // so a dropdown update is saved (and toasted) exactly once.
    orderPageEvents?.abort();
    orderPageEvents = new AbortController();
    const eventOptions = { signal: orderPageEvents.signal };
    const all = orderList();
    const inProgress = all.filter(order => !['Delivered', 'Cancelled', 'Rejected'].includes(statusOf(order))).length;
    const delivered = all.filter(order => statusOf(order) === 'Delivered').length;
    const paymentReview = all.filter(order => /pending/i.test(paymentStatusOf(order))).length;

    shell('Orders', 'Review customer orders and keep fulfilment on track', `
      <section class="orders-pro" aria-label="Order management">
        <div class="orders-pro-summary">
          <article><span>Total orders</span><strong>${all.length}</strong><small>All orders received</small></article>
          <article class="is-progress"><span>In progress</span><strong>${inProgress}</strong><small>Awaiting completion</small></article>
          <article class="is-delivered"><span>Delivered</span><strong>${delivered}</strong><small>Successfully completed</small></article>
          <article class="is-review"><span>Payment review</span><strong>${paymentReview}</strong><small>Needs verification</small></article>
        </div>
        <section class="panel orders-pro-panel">
          <div class="orders-pro-toolbar">
            <div class="order-search-box orders-pro-search">
              <input class="search" id="order-search" type="search" placeholder="Search orders" aria-label="Search orders">
              <button class="order-search-button" type="button" aria-label="Focus order search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"></circle><path d="m16 16 4 4"></path></svg></button>
            </div>
            <label class="orders-pro-filter" for="order-payment-filter">
              <span>Payment status</span>
              <select id="order-payment-filter" aria-label="Filter orders by payment status">
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="verified">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>
            <label class="orders-pro-filter" for="order-date-filter">
              <span>Order date</span>
              <input id="order-date-filter" type="date" aria-label="Filter orders by date">
            </label>
            <button class="secondary orders-pro-clear-filters" id="order-clear-filters" type="button" hidden>Clear filters</button>
          </div>
          <div class="table-wrap"><table class="orders-table orders-pro-table">
            <thead><tr><th>Order no.</th><th>Customer ID</th><th>Address</th><th>Payment mode</th><th>Transaction no.</th><th>Payment status</th><th>Status</th><th>Products</th></tr></thead>
            <tbody id="order-rows"></tbody>
          </table></div>
        </section>
      </section>`);

    const search = byId('order-search');
    const paymentFilter = byId('order-payment-filter');
    const dateFilter = byId('order-date-filter');
    const clearFilters = byId('order-clear-filters');
    const rows = byId('order-rows');
    const orderDate = order => {
      if (!order?.placedAt) return '';
      const date = new Date(order.placedAt);
      if (Number.isNaN(date.getTime())) return '';
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 10);
    };
    const draw = () => {
      const term = search.value.trim().toLowerCase();
      const paymentStatus = paymentFilter.value;
      const selectedDate = dateFilter.value;
      clearFilters.hidden = !(term || paymentStatus !== 'all' || selectedDate);
      const visible = all.map((order, index) => ({ order, index })).filter(({ order }) => {
        const matchesSearch = !term || [order.id, customerIdOf(order), addressOf(order), order.payment, transactionOf(order), paymentStatusOf(order), statusOf(order)].join(' ').toLowerCase().includes(term);
        return matchesSearch && (paymentStatus === 'all' || paymentStatusOf(order) === paymentStatus) && (!selectedDate || orderDate(order) === selectedDate);
      });
      rows.innerHTML = visible.length ? visible.map(({ order, index }) => {
        const paymentStatus = paymentStatusOf(order);
        const status = statusOf(order);
        return `<tr><td><b>${escapeHtml(order.id || `Order ${index + 1}`)}</b><small>${order.placedAt ? new Date(order.placedAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</small></td><td><b>${escapeHtml(customerIdOf(order))}</b></td><td><small>${escapeHtml(addressOf(order))}</small></td><td>${escapeHtml(order.payment || '—')}</td><td><code class="transaction-ref">${escapeHtml(transactionOf(order))}</code></td><td><select class="orders-pro-payment-select ${paymentStatus}" data-payment-status="${index}" aria-label="Payment status">${[['pending', 'Pending'], ['verified', 'Confirmed'], ['rejected', 'Rejected']].map(([value, label]) => `<option value="${value}"${paymentStatus === value ? ' selected' : ''}>${label}</option>`).join('')}</select></td><td><select class="orders-pro-status" data-order-status="${index}" aria-label="Order status">${['Pending', 'Accepted', 'Delivered', 'Cancelled'].map(statusOption => `<option${status === statusOption ? ' selected' : ''}>${statusOption}</option>`).join('')}</select></td><td><button class="secondary order-view-products" type="button" data-order-index="${index}">View products</button><small>${itemCount(order)} item${itemCount(order) === 1 ? '' : 's'} · ${amount(order.total)}</small></td></tr>`;
      }).join('') : '<tr><td colspan="8" class="empty">No orders match these filters.</td></tr>';
    };
    search.addEventListener('input', draw, eventOptions);
    paymentFilter.addEventListener('change', draw, eventOptions);
    dateFilter.addEventListener('change', draw, eventOptions);
    clearFilters.addEventListener('click', () => {
      search.value = '';
      paymentFilter.value = 'all';
      dateFilter.value = '';
      draw();
    }, eventOptions);
    byId('admin-app').addEventListener('click', event => {
      const button = event.target.closest('.order-view-products');
      if (button && typeof openOrderedProducts === 'function') {
        event.stopPropagation();
        openOrderedProducts(Number(button.dataset.orderIndex));
      }
      if (event.target.closest('.order-search-button')) search.focus();
    }, eventOptions);
    byId('admin-app').addEventListener('change', event => {
      const payment = event.target.closest('[data-payment-status]');
      if (payment) {
        payment.className = `orders-pro-payment-select ${payment.value}`;
        if (typeof window.saveOrderPaymentStatus === 'function') {
          window.saveOrderPaymentStatus(Number(payment.dataset.paymentStatus), payment.value, payment);
        }
      }
      const select = event.target.closest('[data-order-status]');
      if (select && typeof changeStatus === 'function') changeStatus(Number(select.dataset.orderStatus), select.value);
    }, eventOptions);
    draw();
  };

  window.orderPage = window.renderProfessionalOrders;
  window.addEventListener('load', () => window.setTimeout(window.renderProfessionalOrders, 120));
}());
