/* Keep the product edit modal in sync with the exact row the admin selected. */
(function () {
  window.addEventListener('load', () => {
    if (document.body.dataset.page !== 'products') return;

    const previousOpenProduct = window.openProduct;
    if (typeof previousOpenProduct !== 'function') return;

    window.openProduct = function openProductWithSavedValues(id) {
      const product = products().find(item => String(item.id) === String(id));
      previousOpenProduct(product ? product.id : id);

      if (!product) return;
      const form = document.querySelector('#product-form');
      if (!form) return;

      const setValue = (field, value) => {
        const input = form.elements[field];
        if (input) input.value = value ?? '';
      };
      const unitMatch = String(product.unit || '1 piece').trim().match(/^([\d.]+)\s*(.*)$/);
      const quantity = unitMatch?.[1] || '1';
      const unit = unitMatch?.[2] || 'piece';
      const mrp = Number(product.mrp) || 0;
      const price = Number(product.price) || 0;

      setValue('name', product.name);
      setValue('category', product.category);
      setValue('quantityValue', quantity);
      setValue('unitType', unit);
      setValue('stockQty', Number(product.stockQty ?? product.stock) || 0);
      setValue('maxBuy', Math.max(1, Number(product.maxBuy) || 5));
      setValue('minBuy', Math.max(1, Number(product.minBuy) || 1));
      setValue('mrp', mrp);
      setValue('discount', product.discount === undefined ? Math.max(0, mrp - price) : Number(product.discount) || 0);
      setValue('price', price);
      const savedBarcodes = get('dc_product_barcodes', {});
      setValue('productCode', savedBarcodes[product.apiId] ?? product.productCode ?? '');

      if (form.elements.maxLimitEnabled) form.elements.maxLimitEnabled.checked = product.maxLimitEnabled === true;
      if (form.elements.minLimitEnabled) form.elements.minLimitEnabled.checked = product.minLimitEnabled === true;
      if (form.elements.productCode) {
        form.elements.productCode.required = false;
        form.elements.productCode.placeholder = 'Enter barcode (optional)';
      }
    };
  });
}());
