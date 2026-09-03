const CUSTOMER_API_URL='http://localhost:5000/api';

async function customerApi(path,options={}){
  const token=localStorage.getItem('dc_customer_token');
  const response=await fetch(`${CUSTOMER_API_URL}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(options.headers||{})}});
  const data=response.status===204?{}:await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.message||'Request failed');
  return data;
}

// A booking charge must be reviewed before either COD or online-payment orders
// are created. This capture handler runs before the older direct-checkout code.
document.addEventListener('submit', event => {
  if (event.target.id !== 'checkout-form' || !localStorage.getItem('dc_customer_token')) return;
  const form = event.target, fields = Object.fromEntries(new FormData(form));
  const onlinePayment = fields.mode === 'Online Payment';
  if (!onlinePayment && !bookingChargeApplies(fields.mode, bookingChargeSettings())) return;
  event.preventDefault(); event.stopImmediatePropagation();
  if (!form.reportValidity()) return;
  const totals = cartTotals(), paymentSettings = onlinePaymentSettings(), pickup = fields.mode.includes('Self');
  // Store the API product ID in the draft. The payment page must be able to
  // submit the order without waiting for (or reloading) the product catalogue.
  const items=totals.items.map(item=>({id:item.id,apiId:item.p.apiId,qty:item.qty,product:{name:item.p.name,unit:item.p.unit,image:item.p.image,price:item.p.price}}));
  if(items.some(item=>!item.apiId)){toast('Product details are still loading. Please try checkout again.');return;}
  const shop=shopSettings(), order = { id:`DC${Date.now().toString().slice(-7)}`, placedAt:new Date().toISOString(), items, total:totals.final, payment:fields.mode, address:pickup?`${shop.name || 'Delhi Canteen'} — ${shop.address || ''}`:fields.address, customer:{name:fields.name.trim(),phone:fields.phone.trim()}, status:'Pending' };
  sessionStorage.setItem('dc_booking_checkout', JSON.stringify({order,settings:{amount:onlinePayment?Number(totals.final):Number(bookingChargeSettings().amount),paymentType:onlinePayment?'onlinePayment':'bookingCharge',upiId:paymentSettings.upiId||bookingChargeSettings().upiId,qrCodeUrl:paymentSettings.qrCodeUrl||bookingChargeSettings().qrCodeUrl||''}}));
  location.href=onlinePayment?'checkout/online_payment.html':'checkout/booking_charge.html';
}, true);

document.addEventListener('submit', async event => {
  if (event.target.id !== 'booking-charge-form' || !localStorage.getItem('dc_customer_token')) return;
  event.preventDefault(); event.stopImmediatePropagation();
  const form=event.target, draft=JSON.parse(sessionStorage.getItem('dc_booking_checkout')||'null');
  if (!form.reportValidity() || !draft?.order) return;
  const values=new FormData(form), transactionNumber=String(values.get('upiTransactionNumber')||'').trim(), screenshotFile=values.get('upiScreenshot');
  if (!transactionNumber) { toast('Enter the required UPI transaction/reference number'); return; }
  if (screenshotFile?.size > 1024*1024) { toast('Payment screenshot must be smaller than 1 MB'); return; }
  const button=form.querySelector('[type="submit"]'); button.disabled=true; button.textContent='Placing order...';
  try {
    // API IDs are captured at checkout, so this submission is independent of
    // the asynchronously loaded catalogue on the payment page.
    const items=draft.order.items.map(item=>({productId:item.apiId,quantity:item.qty}));
    if (items.some(item=>!item.productId)) throw new Error('Checkout information is incomplete. Please return to checkout and try again.');
    const screenshot=screenshotFile?.size ? await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(screenshotFile)}) : '';
    const bookingCharge={type:draft.settings.paymentType,amount:Number(draft.settings.amount),upiId:draft.settings.upiId,payerName:String(values.get('paymentPayerName')||'').trim(),transactionNumber,screenshotName:screenshotFile?.name||'',screenshot,status:'pending',submittedAt:new Date().toISOString()};
    const response=await customerApi('/orders',{method:'POST',body:JSON.stringify({items,paymentMode:draft.order.payment==='Cash on Delivery'?'COD':'Online Payment',address:draft.order.address,bookingCharge,paymentStatus:'pending'})}), saved=response.data;
    store.set('dc_orders',[{...draft.order,id:saved.id,placedAt:saved.createdAt,status:saved.status,paymentStatus:'pending',bookingCharge},...store.get('dc_orders')]);
    store.set('dc_cart',[]); localStorage.removeItem('dc_coupon'); sessionStorage.removeItem('dc_booking_checkout'); toast('Payment submitted for verification'); setTimeout(()=>location.href='orders.html',500);
  } catch(error) { toast(error.message); button.disabled=false; button.textContent='Place order →'; }
}, true);

function saveCustomerSession(data){
  localStorage.setItem('dc_customer_token',data.token);
  const user={...data.user,customerId:data.user.customerId||data.user.id};
  store.set('dc_user',user);
}

function postLoginDestination(){
  const requested=new URLSearchParams(location.search).get('redirect');
  return requested==='checkout.html'?'checkout.html':'index.html';
}

function bindCustomerAuthentication(){
  const loginForm=document.querySelector('#auth-form');
  if(loginForm)loginForm.onsubmit=async event=>{
    event.preventDefault();
    if(!loginForm.reportValidity())return;
    const button=loginForm.querySelector('[type="submit"]');if(!button)return;button.disabled=true;button.textContent='Logging in...';
    try{
      const fields=Object.fromEntries(new FormData(loginForm));
      const result=await customerApi('/auth/login',{method:'POST',body:JSON.stringify({identifier:fields.email.trim(),password:fields.password,role:'customer'})});
      saveCustomerSession(result);toast('Welcome back!');
      setTimeout(()=>location.href=postLoginDestination(),400);
    }catch(error){toast(error.message);button.disabled=false;button.innerHTML='Login →'}
  };

  const signupForm=document.querySelector('#signup-form');
  if(signupForm)signupForm.onsubmit=async event=>{
    event.preventDefault();
    if(!signupForm.reportValidity())return;
    const button=signupForm.querySelector('[type="submit"]');if(!button)return;button.disabled=true;button.textContent='Creating account...';
    try{
      const fields=Object.fromEntries(new FormData(signupForm));
      const result=await customerApi('/auth/customer/register',{method:'POST',body:JSON.stringify({name:fields.name.trim(),email:fields.email.trim(),phone:fields.phone.trim(),password:fields.password})});
      saveCustomerSession(result);toast('Account created successfully. Please log in.');
      localStorage.removeItem('dc_customer_token');
      localStorage.removeItem('dc_user');
      setTimeout(()=>location.href='login.html',500);
    }catch(error){toast(error.message);button.disabled=false;button.innerHTML='Create account →'}
  };
}

// app.js attaches its legacy localStorage handlers on DOMContentLoaded. Register
// this listener after it, so the real API-backed handlers take precedence.
document.addEventListener('DOMContentLoaded',bindCustomerAuthentication);

const legacyCustomerLogout=store.logout.bind(store);
store.logout=()=>{localStorage.removeItem('dc_customer_token');legacyCustomerLogout()};

const categoryLabels={CAT001:'Grocery Essentials',CAT002:'Dairy & Eggs'};
function customerProduct(item){const fallback=products.find(product=>product.name.toLowerCase()===String(item.name||'').toLowerCase())||{};return {...fallback,id:String(item.id),apiId:item.id,name:item.name,category:categoryLabels[item.categoryId]||fallback.category||'Grocery Essentials',unit:item.unit||fallback.unit||'1 unit',price:Number(item.price)||0,mrp:Number(item.mrp)||Number(item.price)||0,stockQty:Number(item.stock)||0,stock:Number(item.stock)>0,active:item.active!==false,maxBuy:Math.max(1,Number(item.maxBuy)||Number(fallback.maxBuy)||5),maxLimitEnabled:item.maxLimitEnabled===true,minBuy:Math.max(1,Number(item.minBuy)||Number(fallback.minBuy)||1),minLimitEnabled:item.minLimitEnabled===true,popular:true,new:false,image:item.image||fallback.image||''}}
async function syncBackendOrders({render=true}={}){if(!localStorage.getItem('dc_customer_token'))return;const response=await customerApi('/customer/orders');const localOrders=response.data.map(order=>({id:order.id,date:new Date(order.createdAt).toLocaleDateString('en-IN'),placedAt:order.createdAt,items:order.items.map(item=>({id:products.find(product=>product.apiId===item.productId)?.id,qty:item.quantity})).filter(item=>item.id),total:order.total,payment:order.paymentMode,address:order.address,status:order.status,paymentStatus:order.paymentStatus,bookingCharge:order.bookingCharge}));const currentOrders=store.get('dc_orders',[]),hasChanged=JSON.stringify(currentOrders.map(order=>[order.id,order.status,order.paymentStatus,order.bookingCharge?.status]))!==JSON.stringify(localOrders.map(order=>[order.id,order.status,order.paymentStatus,order.bookingCharge?.status]));if(!hasChanged)return false;store.set('dc_orders',localOrders);if(render){if(typeof renderActiveOrders==='function')renderActiveOrders();else renderOrders()}return true}

// Keep the open order history in sync with an administrator's payment review.
// Polling is deliberately limited to this page and only redraws when data changed.
let customerOrdersRefreshTimer;
function startCustomerOrdersLiveSync(){
  if(!location.pathname.endsWith('orders.html')||!localStorage.getItem('dc_customer_token'))return;
  const refresh=()=>syncBackendOrders().catch(error=>console.warn('Could not refresh orders:',error.message));
  clearInterval(customerOrdersRefreshTimer);
  customerOrdersRefreshTimer=setInterval(()=>{if(document.visibilityState==='visible')refresh()},3000);
  window.addEventListener('focus',refresh,{once:true});
}
document.addEventListener('DOMContentLoaded',startCustomerOrdersLiveSync);
async function loadBackendProducts(){try{const categoryResponse=await customerApi('/categories'),categoryImages=Object.fromEntries(categoryResponse.data.filter(category=>category.image).map(category=>[category.name,category.image]));Object.assign(categoryLabels,Object.fromEntries(categoryResponse.data.map(category=>[category.id,category.name])));categories=categoryResponse.data.map(category=>[category.name,'basket']);window.customerCatalogueReady=true;store.set('dc_category_images',categoryImages);const productListPage=location.pathname.endsWith('products.html')&&!new URLSearchParams(location.search).has('id');if(productListPage&&typeof startCustomerProductPagination==='function'){startCustomerProductPagination(async({page,limit,q,categoryId,sort})=>{const params=new URLSearchParams({page,limit});if(q)params.set('q',q);if(categoryId)params.set('categoryId',categoryId);if(sort)params.set('sort',sort);const response=await customerApi(`/products?${params}`);return {items:response.data.map(customerProduct),pagination:response.pagination}});return}const productResponse=await customerApi('/products');products=productResponse.data.map(customerProduct);products.forEach(product=>{if(/^[A-Za-z_$][\w$]*$/.test(product.id))window[product.id]=product.id});home();renderProducts();renderCart();renderWishlist();if(location.pathname.endsWith('checkout.html'))checkout();updateBadge();if(location.pathname.endsWith('orders.html'))await syncBackendOrders()}catch(error){console.warn('Backend catalogue could not be loaded:',error.message)}}
if(!document.querySelector('.auth-page'))loadBackendProducts();

// Keep customer-facing product and category changes in sync with the admin
// panel without asking the customer to reload. The API is the source of truth,
// so this works even if both panels are open in different browsers.
let customerCatalogueLiveSyncBusy=false;
let customerCatalogueLiveSignature='';
let customerCatalogueLiveInitialized=false;
const customerCatalogueSignature=items=>JSON.stringify(items.map(item=>[
  item.id,item.name,item.categoryId,item.unit,item.price,item.mrp,item.stock,
  item.active,item.maxBuy,item.minBuy,item.maxLimitEnabled,item.minLimitEnabled,item.image
]));
async function syncCustomerCatalogueLive(){
  if(customerCatalogueLiveSyncBusy||document.hidden||document.querySelector('.auth-page'))return;
  customerCatalogueLiveSyncBusy=true;
  try{
    const [categoryResponse,productResponse]=await Promise.all([customerApi('/categories'),customerApi('/products')]);
    const nextSignature=customerCatalogueSignature(productResponse.data||[]);
    if(customerCatalogueLiveInitialized&&nextSignature===customerCatalogueLiveSignature)return;
    Object.assign(categoryLabels,Object.fromEntries(categoryResponse.data.map(category=>[category.id,category.name])));
    categories=categoryResponse.data.map(category=>[category.name,'basket']);
    store.set('dc_category_images',Object.fromEntries(categoryResponse.data.filter(category=>category.image).map(category=>[category.name,category.image])));
    products=productResponse.data.map(customerProduct);
    customerCatalogueLiveSignature=nextSignature;
    customerCatalogueLiveInitialized=true;
    home();
    const productListPage=location.pathname.endsWith('products.html')&&!new URLSearchParams(location.search).has('id');
    if(productListPage&&typeof window.refreshCustomerProductPagination==='function')window.refreshCustomerProductPagination();
    else renderProducts();
    renderCart();
    renderWishlist();
    updateBadge();
  }catch(error){
    console.warn('Customer catalogue live sync failed:',error.message);
  }finally{
    customerCatalogueLiveSyncBusy=false;
  }
}
if(!document.querySelector('.auth-page')){
  setInterval(syncCustomerCatalogueLive,5000);
  window.addEventListener('focus',syncCustomerCatalogueLive);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)syncCustomerCatalogueLive();});
}

document.addEventListener('submit',async event=>{if(event.target.id!=='checkout-form'||!localStorage.getItem('dc_customer_token'))return;event.preventDefault();event.stopImmediatePropagation();const form=event.target,submit=form.querySelector('[type="submit"]'),fields=Object.fromEntries(new FormData(form)),items=cartTotals().items;if(!items.length)return;submit.disabled=true;submit.textContent='Placing order...';try{const paymentMode=fields.mode?.includes('Cash')?'COD':fields.mode?.includes('Online')?'Online Payment':'Self Pickup',shop=shopSettings(),address=fields.mode?.includes('Self')?`${shop.name || 'Delhi Canteen'} — ${shop.address || ''}`:fields.address;const response=await customerApi('/orders',{method:'POST',body:JSON.stringify({items:items.map(item=>({productId:item.p.apiId,quantity:item.qty})),paymentMode,address})});const order=response.data;const localOrder={id:order.id,date:new Date(order.createdAt).toLocaleDateString('en-IN'),placedAt:order.createdAt,items:items.map(item=>({id:item.p.id,qty:item.qty})),total:order.total,payment:paymentMode,address:order.address,status:order.status};store.set('dc_orders',[localOrder,...store.get('dc_orders')]);store.set('dc_cart',[]);toast('Order placed successfully!');setTimeout(()=>location.href='orders.html',500)}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Place order →'}},true);

document.addEventListener('submit',async event=>{if(event.target.id!=='profile-form'||!localStorage.getItem('dc_customer_token'))return;event.preventDefault();event.stopImmediatePropagation();const form=event.target;if(!form.reportValidity())return;const submit=form.querySelector('[type="submit"]');if(submit)submit.disabled=true;try{const fields=Object.fromEntries(new FormData(form)),result=await customerApi('/customer/profile',{method:'PUT',body:JSON.stringify({name:fields.name.trim(),email:fields.email.trim(),phone:fields.phone.trim()})}),user={...store.user(),...result.data,customerId:result.data.id};store.set('dc_user',user);toast('Profile details saved');setTimeout(()=>location.reload(),300)}catch(error){toast(error.message);if(submit)submit.disabled=false;}},true);
