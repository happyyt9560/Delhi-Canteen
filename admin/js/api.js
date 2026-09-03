// API bridge for the Admin Panel. Legacy UI state is refreshed from the Express API.
const ADMIN_API_BASE='http://localhost:5000/api';
async function adminApi(path,options={}){const token=localStorage.getItem('dc_admin_token');const response=await fetch(`${ADMIN_API_BASE}${path}`,{...options,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{}),...(options.headers||{})}});const data=response.status===204?{}:await response.json();if(!response.ok)throw new Error(data.message||'Request failed');return data}
async function refreshDeliveryTeam(){const [teamResponse,ordersResponse]=await Promise.all([adminApi('/admin/delivery-boys'),adminApi('/orders')]);const team=teamResponse.data.map(member=>({id:member.id,name:member.name,phone:member.phone,vehicle:member.vehicleNo||'',licenceNo:member.licenceNo||'',aadhaarNo:member.aadhaar||'',status:member.status||'Active'})),existing=new Map(get('dc_orders',[]).map(order=>[String(order.id),order])),syncedOrders=ordersResponse.data.map(order=>{const member=team.find(item=>String(item.id)===String(order.deliveryBoyId));return {...existing.get(String(order.id)),id:order.id,placedAt:order.createdAt||order.placedAt,updatedAt:order.updatedAt,assignedAt:order.assignedAt,items:Array.isArray(order.items)?order.items.map(item=>({id:item.productId,productId:item.productId,qty:item.quantity,quantity:item.quantity,price:item.price,name:item.name})):[],total:order.total,payment:order.paymentMode,address:order.address,status:order.status,paymentStatus:order.paymentStatus,bookingCharge:order.bookingCharge,deliveryBoyId:order.deliveryBoyId,deliveryBoyName:order.deliveryBoyName||member?.name,customer:order.customer};});set('dc_orders',syncedOrders);localStorage.setItem('dc_delivery_team',JSON.stringify(team));deliveryPage()}
function apiDeliveryModal(){modal(`<h2>Add delivery boy</h2><form id="api-delivery-form"><div class="form-grid"><label>Full name<input name="name" required></label><label>Phone number<input name="phone" required pattern="[0-9]{10}" inputmode="numeric" maxlength="10"></label><label>Vehicle number<input name="vehicleNo" required></label><label>Licence number<input name="licenceNo" required></label><label>Aadhaar number<input name="aadhaar" required pattern="[0-9]{12}" inputmode="numeric" maxlength="12"></label><label>Password<input name="password" type="password" required minlength="6" autocomplete="new-password"></label></div><div class="form-actions"><button class="secondary" type="button" onclick="closeModal()">Cancel</button><button class="primary" type="submit">Add delivery boy</button></div></form>`);const form=document.querySelector('#api-delivery-form');form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;const submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Saving...';try{await adminApi('/admin/delivery-boys',{method:'POST',body:JSON.stringify(Object.fromEntries(new FormData(form)))});closeModal();await refreshDeliveryTeam();toast('Delivery boy added to backend successfully')}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Add delivery boy'}}}
window.addEventListener('load',()=>{const page=document.body.dataset.page;if(page==='login'){const form=document.querySelector('#login-form');if(!form)return;form.onsubmit=async event=>{event.preventDefault();const email=form.email.value.trim(),password=form.password.value,button=form.querySelector('[type="submit"]');button.disabled=true;button.textContent='Logging in...';try{const response=await adminApi('/auth/login',{method:'POST',body:JSON.stringify({identifier:email,password,role:'admin'})});localStorage.setItem('dc_admin_token',response.token);sessionStorage.setItem('dc_admin_session','true');toast('Login successful');setTimeout(()=>location.href='Admin.html',400)}catch(error){toast(error.message);button.disabled=false;button.textContent='Login'}};return}if(page!=='delivery'||!localStorage.getItem('dc_admin_token'))return;refreshDeliveryTeam().catch(error=>toast(`Backend sync failed: ${error.message}`));document.addEventListener('click',event=>{const button=event.target.closest('#add-delivery-member');if(!button)return;event.preventDefault();event.stopImmediatePropagation();apiDeliveryModal()},true)});

async function refreshAdminData(){const [productsResponse,categoriesResponse,ordersResponse,customersResponse,deliveryResponse]=await Promise.all([adminApi('/products?includeInactive=true'),adminApi('/categories'),adminApi('/orders'),adminApi('/admin/customers'),adminApi('/admin/delivery-boys')]),categoryNames=Object.fromEntries(categoriesResponse.data.map(category=>[category.id,category.name])),categoryImages=Object.fromEntries(categoriesResponse.data.filter(category=>category.image).map(category=>[category.name,category.image])),adminProducts=productsResponse.data.map((product,index)=>({id:index+1,apiId:product.id,name:product.name,category:categoryNames[product.categoryId]||'Uncategorized',unit:product.unit||'1 unit',image:product.image||'',price:Number(product.price)||0,mrp:Number(product.mrp)||Number(product.price)||0,stockQty:Number(product.stock)||0,stock:Number(product.stock)>0,active:product.active!==false,maxBuy:Math.max(1,Number(product.maxBuy)||5),maxLimitEnabled:product.maxLimitEnabled===true,minBuy:Math.max(1,Number(product.minBuy)||1),minLimitEnabled:product.minLimitEnabled===true,popular:false,new:false})),adminCustomers=customersResponse.data.map(customer=>({...customer,customerId:customer.id})),adminDeliveryTeam=deliveryResponse.data.map(member=>({id:member.id,name:member.name,phone:member.phone,status:member.status||'Active'})),adminOrders=ordersResponse.data.map(order=>({id:order.id,placedAt:order.createdAt,deliveredAt:order.deliveredAt,items:order.items.map(item=>({id:adminProducts.find(product=>product.apiId===item.productId)?.id,qty:item.quantity,price:item.price,name:item.name})),total:order.total,receivedAmount:order.receivedAmount,payment:order.paymentMode,address:order.address,status:order.status,paymentStatus:order.paymentStatus,bookingCharge:order.bookingCharge,deliveryBoyId:order.deliveryBoyId,deliveryBoyName:order.deliveryBoyName,customer:order.customer}));set('dc_products',adminProducts);set('dc_categories',categoriesResponse.data.map(category=>category.name));set('dc_category_images',categoryImages);set('dc_customers',adminCustomers);set('dc_delivery_team',adminDeliveryTeam);set('dc_orders',adminOrders);const page=document.body.dataset.page;({dashboard,products:productPage,categories:categoriesPage,orders:orderPage,customers:renderCustomerManagement}[page]||(()=>{}))()}
window.addEventListener('load',()=>{const page=document.body.dataset.page;if(!['dashboard','products','categories','orders','customers','inventory'].includes(page)||!localStorage.getItem('dc_admin_token'))return;refreshAdminData().then(()=>{if(page==='inventory')inventoryPage()}).catch(error=>toast(`Backend sync failed: ${error.message}`))});

// Persist the administrator's payment decision from the Orders renderer itself.
// Updating localStorage as well makes the new status immediately available to
// any customer page served from the same origin.
const savingOrderUpdates = new Set();
window.saveOrderPaymentStatus=async function(index,value,select){
  if(!localStorage.getItem('dc_admin_token')){toast('Please sign in again before updating payment status');return;}
  const list=get('dc_orders',[]),order=list[index],paymentStatus=value==='failed'?'rejected':value;
  if(!order?.id||savingOrderUpdates.has(`payment:${order.id}`))return;
  savingOrderUpdates.add(`payment:${order.id}`);
  const previous=order.paymentStatus||'pending';
  if(select)select.disabled=true;
  try{
    const response=await adminApi(`/orders/${encodeURIComponent(order.id)}/payment-status`,{method:'PATCH',body:JSON.stringify({paymentStatus})});
    const saved=response.data||{};
    list[index]={...order,paymentStatus:saved.paymentStatus||paymentStatus,bookingCharge:order.bookingCharge?{...order.bookingCharge,status:saved.paymentStatus||paymentStatus}:order.bookingCharge};
    set('dc_orders',list);
    toast('Payment status saved');
  }catch(error){
    if(select){select.value=previous==='failed'?'rejected':previous;select.className=`orders-pro-payment-select ${select.value}`;}
    toast(`Payment status could not be saved: ${error.message}`);
  }finally{savingOrderUpdates.delete(`payment:${order.id}`);if(select)select.disabled=false;}
};

window.addEventListener('load',()=>{
  if(document.body.dataset.page!=='orders')return;
  const labelRejected=()=>document.querySelectorAll('[data-payment-status] option[value="failed"]').forEach(option=>{option.value='rejected';option.textContent='Rejected'});
  setTimeout(labelRejected,100);
  new MutationObserver(labelRejected).observe(document.body,{childList:true,subtree:true});
});

// Save manually added customers in MongoDB instead of only in browser storage.
window.addEventListener('load',()=>{if(document.body.dataset.page!=='customers'||!localStorage.getItem('dc_admin_token'))return;document.addEventListener('click',event=>{const button=event.target.closest('#customer-add');if(!button)return;event.preventDefault();event.stopImmediatePropagation();modal(`<h2>Add customer</h2><form id="database-customer-form"><div class="form-grid"><label>Name<input name="name" required autocomplete="name"></label><label>Phone no.<input name="phone" required pattern="[0-9]{10}" inputmode="numeric" maxlength="10"></label><label>Email ID <small>(optional)</small><input name="email" type="email" autocomplete="email"></label><label>Password<input name="password" required type="password" minlength="6" autocomplete="new-password"></label></div><div class="form-actions"><button class="secondary" type="button" onclick="closeModal()">Cancel</button><button class="primary" type="submit">Add customer</button></div></form>`);const form=A('#database-customer-form');form.onsubmit=async submitEvent=>{submitEvent.preventDefault();if(!form.reportValidity())return;const submit=form.querySelector('[type="submit"]');submit.disabled=true;submit.textContent='Saving...';try{const fields=Object.fromEntries(new FormData(form));await adminApi('/admin/customers',{method:'POST',body:JSON.stringify({name:fields.name.trim(),phone:fields.phone.trim(),email:fields.email.trim(),password:fields.password})});closeModal();await refreshAdminData();toast('Customer saved to database successfully')}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Add customer'}}},true)});

function fileAsDataUrl(file){return new Promise((resolve,reject)=>{if(!file)return resolve('');const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)})}

// The legacy product modal generates a BAR-* fallback. Keep barcode optional
// and preserve exactly what the admin enters when the product is saved.
const productApiRequest=adminApi;
adminApi=async function(path,options={}){
  const isProductSave=/^\/products(?:\/[^/]+)?$/.test(path)&&['POST','PUT'].includes(String(options.method||'').toUpperCase());
  if(isProductSave&&A('#product-form [name="productCode"]')){
    const body=JSON.parse(options.body||'{}'),barcode=A('#product-form [name="productCode"]').value.trim();
    options={...options,body:JSON.stringify({...body,productCode:barcode})};
  }
  const response=await productApiRequest(path,options);
  if(isProductSave&&response?.data?.id){
    const saved=JSON.parse(options.body||'{}');
    const barcodes=get('dc_product_barcodes',{});
    set('dc_product_barcodes',{...barcodes,[response.data.id]:String(saved.productCode||'')});
  }
  return response;
};
async function syncProductBarcodes(){
  const response=await productApiRequest('/products'),barcodes=Object.fromEntries(response.data.map(product=>[product.id,String(product.productCode||'')]));
  set('dc_product_barcodes',barcodes);
}
window.addEventListener('load',()=>{if(document.body.dataset.page!=='products')return;setTimeout(()=>syncProductBarcodes().catch(()=>{}),150);const bulkUploadWithBarcodeSync=window.applyBulkUpload;window.applyBulkUpload=async function(){await bulkUploadWithBarcodeSync();await syncProductBarcodes()};});
async function categoryIdByName(name){const response=await adminApi('/categories');let category=response.data.find(item=>item.name.toLowerCase()===String(name).toLowerCase());if(!category){const created=await adminApi('/categories',{method:'POST',body:JSON.stringify({name})});category=created.data}return category.id}
window.addEventListener('load',()=>{const legacyOpenProduct=window.openProduct;window.openProduct=function(id){legacyOpenProduct(id);const form=A('#product-form');if(!form)return;form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;const submit=form.querySelector('button[type="submit"], button.primary');if(!submit){toast('Save button is unavailable. Please reopen the product form.');return;}submit.disabled=true;submit.textContent='Saving...';try{if(!localStorage.getItem('dc_admin_token'))throw new Error('Please sign in as admin before saving products to the database');const fields=Object.fromEntries(new FormData(form)),existing=products().find(product=>product.id===id),categoryName=String(fields.category||'').trim();if(!categoryName)throw new Error('Please select a category');const categoryId=await categoryIdByName(categoryName),imageFile=A('#product-image-file')?.files?.[0],payload={name:fields.name.trim(),categoryId,unit:`${fields.quantityValue||1} ${fields.unitType||fields.unit||'piece'}`.trim(),price:Number(fields.price),mrp:Number(fields.mrp),stock:Math.max(0,Number(fields.stockQty)),maxBuy:Math.max(1,Number(fields.maxBuy)||5),maxLimitEnabled:form.elements.maxLimitEnabled.checked,minBuy:Math.max(1,Number(fields.minBuy)||1),minLimitEnabled:form.elements.minLimitEnabled.checked,image:imageFile?await fileAsDataUrl(imageFile):existing?.image||''},path=existing?.apiId?`/products/${existing.apiId}`:'/products';await adminApi(path,{method:existing?.apiId?'PUT':'POST',body:JSON.stringify(payload)});closeModal();await refreshAdminData();toast('Product saved to database and is now visible to customers')}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Save product'}}};
const legacyDeleteProduct=window.deleteProduct;window.deleteProduct=async function(id){const product=products().find(item=>item.id===id);if(!product?.apiId)return legacyDeleteProduct(id);try{await adminApi(`/products/${product.apiId}`,{method:'DELETE'});await refreshAdminData();toast('Product deleted from backend')}catch(error){toast(error.message)}};

const legacyAddCategory=window.addCategory;window.addCategory=function(){legacyAddCategory();const form=A('#category-form');if(!form)return;form.onsubmit=async event=>{event.preventDefault();const name=form.categoryName.value.trim();if(!name)return;const submit=form.querySelector('[type="submit"]');submit.disabled=true;try{await categoryIdByName(name);closeModal();await refreshAdminData();toast('Category saved to backend')}catch(error){toast(error.message);submit.disabled=false}}};
const legacyRemoveCategory=window.removeCategory;window.removeCategory=async function(name){try{const response=await adminApi('/categories'),category=response.data.find(item=>item.name===name);if(!category)return legacyRemoveCategory(name);await adminApi(`/categories/${category.id}`,{method:'DELETE'});await refreshAdminData();toast('Category deleted from backend')}catch(error){toast(error.message)}};
const legacyChangeStatus=window.changeStatus;window.changeStatus=async function(index,value){const order=orders()[index],key=`status:${order?.id}`;if(!order)return legacyChangeStatus(index,value);if(savingOrderUpdates.has(key))return;savingOrderUpdates.add(key);try{await adminApi(`/orders/${order.id}/status`,{method:'PATCH',body:JSON.stringify({status:value})});await refreshAdminData();toast('Order status updated')}catch(error){toast(error.message)}finally{savingOrderUpdates.delete(key)}};
const legacyDeleteRecord=window.deleteRecord;window.deleteRecord=async function(type,index){if(type!=='delivery_team')return legacyDeleteRecord(type,index);const member=get('dc_delivery_team',[])[index];if(!member?.id)return legacyDeleteRecord(type,index);try{await adminApi(`/admin/delivery-boys/${member.id}`,{method:'DELETE'});await refreshDeliveryTeam();toast('Delivery boy removed from backend')}catch(error){toast(error.message)}};

const legacyApplyBulkUpload=window.applyBulkUpload;window.applyBulkUpload=async function(){const state=window.bulkImportState;if(!state)return;if(!localStorage.getItem('dc_admin_token')){toast('Please sign in again to save bulk products to the database');return}const saveButton=document.querySelector('#modal .primary[onclick="applyBulkUpload()"]');if(saveButton){saveButton.disabled=true;saveButton.textContent='Saving to database...'}try{const categoryIds=new Map(),getCategoryId=async name=>{if(!categoryIds.has(name))categoryIds.set(name,await categoryIdByName(name));return categoryIds.get(name)},payload=async product=>({name:String(product.name||'').trim(),categoryId:await getCategoryId(String(product.category||'').trim()),unit:String(product.unit||'1 piece'),price:Number(product.price)||0,mrp:Number(product.mrp)||Number(product.price)||0,stock:Math.max(0,Number(product.stockQty)||0),image:product.image||'',discount:Number(product.discount)||0,productCode:product.productCode||''}),current=products(),updates=state.duplicates.filter(item=>item.action==='replace'),creates=state.rows;for(const item of updates){const existing=current.find(product=>product.id===item.existingProduct?.id);if(existing?.apiId)await adminApi(`/products/${existing.apiId}`,{method:'PUT',body:JSON.stringify(await payload(item.product))});else await adminApi('/products',{method:'POST',body:JSON.stringify(await payload(item.product))})}for(const product of creates)await adminApi('/products',{method:'POST',body:JSON.stringify(await payload(product))});delete window.bulkImportState;closeModal();await refreshAdminData();toast(`${creates.length+updates.length} product${creates.length+updates.length===1?'':'s'} saved to database successfully`)}catch(error){console.error(error);toast(`Bulk upload failed: ${error.message}`);if(saveButton){saveButton.disabled=false;saveButton.textContent='Import products'}}};

});

window.addEventListener('load',()=>{if(document.body.dataset.page!=='categories')return;const refreshCategories=async()=>{const categories=(await adminApi('/categories')).data;set('dc_categories',categories.map(category=>category.name));set('dc_category_images',Object.fromEntries(categories.filter(category=>category.image).map(category=>[category.name,category.image])));categoriesPage()};window.addCategory=function(){modal(`<h2>Add category</h2><form id="database-category-form"><div class="form-grid"><label class="full">Category image <small>(optional)</small><input id="database-category-image" type="file" accept="image/*"></label><label class="full">Category name<input name="name" required placeholder="e.g. Frozen foods"></label></div><div class="form-actions"><button class="secondary" type="button" onclick="closeModal()">Cancel</button><button class="primary" type="submit">Save category</button></div></form>`);const form=A('#database-category-form'),nameInput=form.elements.name;form.onsubmit=async event=>{event.preventDefault();const name=nameInput.value.trim(),file=A('#database-category-image')?.files?.[0],submit=form.querySelector('[type="submit"]');if(!name){nameInput.focus();return}if(!localStorage.getItem('dc_admin_token')){toast('Please sign in again before saving categories to the database');return}submit.disabled=true;submit.textContent='Saving...';try{const categories=(await adminApi('/categories')).data;if(categories.some(category=>String(category.name).toLowerCase()===name.toLowerCase())){toast('A category with this name already exists');submit.disabled=false;submit.textContent='Save category';return}const saved=(await adminApi('/categories',{method:'POST',body:JSON.stringify({name,image:file?await fileAsDataUrl(file):''})})).data;set('dc_categories',[...new Set([...get('dc_categories',[]),saved.name])]);if(saved.image)set('dc_category_images',{...get('dc_category_images',{}),[saved.name]:saved.image});closeModal();await refreshCategories();toast('Category saved to database')}catch(error){console.error(error);toast(`Could not save category: ${error.message}`);submit.disabled=false;submit.textContent='Save category'}}};});

function openDatabaseCustomerEditor(customer){
  modal(`<h2>Edit customer</h2><form id="database-customer-edit-form"><div class="form-grid"><label>Name<input name="name" required autocomplete="name" value="${esc(customer.name||'')}"></label><label>Phone no.<input name="phone" required pattern="[0-9]{10}" inputmode="numeric" maxlength="10" value="${esc(customer.phone||'')}"></label><label>Email ID <small>(optional)</small><input name="email" type="email" autocomplete="email" value="${esc(customer.email||'')}"></label><label>New password <small>(leave blank to keep it unchanged)</small><input name="password" type="password" minlength="6" autocomplete="new-password"></label></div><div class="form-actions"><button class="secondary" type="button" onclick="closeModal()">Cancel</button><button class="primary" type="submit">Save changes</button></div></form>`);
  const form=A('#database-customer-edit-form');
  form.onsubmit=async event=>{event.preventDefault();if(!form.reportValidity())return;const submit=form.querySelector('[type="submit"]'),fields=Object.fromEntries(new FormData(form)),payload={name:fields.name.trim(),phone:fields.phone.trim(),email:fields.email.trim()};if(fields.password)payload.password=fields.password;submit.disabled=true;submit.textContent='Saving...';try{await adminApi(`/admin/customers/${encodeURIComponent(customer.id)}`,{method:'PUT',body:JSON.stringify(payload)});closeModal();await refreshAdminData();toast('Customer details updated')}catch(error){toast(error.message);submit.disabled=false;submit.textContent='Save changes'}};
}
window.addEventListener('load',()=>{if(document.body.dataset.page!=='customers'||!localStorage.getItem('dc_admin_token'))return;document.addEventListener('click',async event=>{const edit=event.target.closest('[data-customer-edit]'),remove=event.target.closest('[data-customer-delete]');if(!edit&&!remove)return;const button=edit||remove,customer=get('dc_customers',[])[Number(edit?edit.dataset.customerEdit:remove.dataset.customerDelete)];if(!customer?.id)return;event.preventDefault();event.stopImmediatePropagation();if(edit){openDatabaseCustomerEditor(customer);return}if(!confirm(`Remove customer ${customer.name}? This cannot be undone.`))return;button.disabled=true;try{await adminApi(`/admin/customers/${encodeURIComponent(customer.id)}`,{method:'DELETE'});await refreshAdminData();toast('Customer removed')}catch(error){toast(error.message);button.disabled=false;}},true)});

window.addEventListener('load', async () => { if (document.body.dataset.page !== 'dashboard' || !localStorage.getItem('dc_admin_token')) return; try { const response = await adminApi('/admin/dashboard'); set('dc_dashboard_counts', response.data || {}); dashboard(); } catch (error) { console.warn('Dashboard counts could not be refreshed:', error.message); } });

// Inventory availability must be stored in the API; localStorage alone is not
// enough because the customer catalogue is loaded from the backend.
const availabilitySaves=new Set();
const stockSaves=new Set();
window.saveStock=async function(id){
  const catalogue=products(),product=catalogue.find(item=>String(item.id)===String(id));
  const input=document.querySelector(`[data-inventory-stock-id="${String(id)}"]`),button=document.querySelector(`[data-inventory-stock-save-id="${String(id)}"]`);
  const stock=Number(input?.value);
  if(!Number.isFinite(stock)||stock<0){toast('Enter a valid stock quantity');input?.focus();return;}
  if(!localStorage.getItem('dc_admin_token')){toast('Please sign in again before updating stock');return;}
  if(!product?.apiId){toast('Product details are still syncing. Please refresh the inventory page and try again.');return;}
  if(stockSaves.has(product.apiId)){toast('This stock update is already being saved');return;}
  stockSaves.add(product.apiId);
  if(input)input.disabled=true;
  if(button){button.disabled=true;button.textContent='Saving…';}
  try{
    await adminApi(`/products/${encodeURIComponent(product.apiId)}`,{method:'PUT',body:JSON.stringify({stock:Math.floor(stock)})});
    await refreshAdminData();
    inventoryPage();
    toast(`Stock for ${product.name} updated`);
  }catch(error){
    if(input)input.disabled=false;
    if(button){button.disabled=false;button.textContent='Update';}
    toast(`Stock could not be saved: ${error.message}`);
  }finally{
    stockSaves.delete(product.apiId);
  }
};
window.toggleInventoryProduct=async function(id,active){
  const catalogue=products(),product=catalogue.find(item=>String(item.id)===String(id));
  if(!localStorage.getItem('dc_admin_token')){toast('Please sign in again before changing product availability');inventoryPage();return;}
  if(!product?.apiId){toast('Product details are still syncing. Please refresh the inventory page and try again.');inventoryPage();return;}
  if(availabilitySaves.has(product.apiId)){toast('This product availability is already being saved');inventoryPage();return;}
  const input=document.querySelector(`[data-inventory-active-id="${String(id)}"]`),label=input?.closest('.product-active-switch');
  availabilitySaves.add(product.apiId);
  if(input)input.disabled=true;
  if(label?.querySelector('b'))label.querySelector('b').textContent='Saving…';
  const previous=product.active!==false;
  product.active=Boolean(active);
  set('dc_products',catalogue);
  try{
    await adminApi(`/products/${encodeURIComponent(product.apiId)}`,{method:'PUT',body:JSON.stringify({active:Boolean(active)})});
    await refreshAdminData();
    inventoryPage();
    toast(`${product.name} is now ${active?'active and visible to customers':'inactive and hidden from customers'}`);
  }catch(error){
    product.active=previous;
    set('dc_products',catalogue);
    inventoryPage();
    toast(`Availability could not be saved: ${error.message}`);
  }finally{
    availabilitySaves.delete(product.apiId);
  }
};
