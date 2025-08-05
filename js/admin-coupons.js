// Admin Coupon Management JavaScript
class AdminCouponManager {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.totalPages = 1;
    this.currentFilters = {
      vendor_id: '',
      coupon_type: '',
      is_active: ''
    };
    this.vendors = [];
    this.collections = [];
    this.products = [];
    this.init();
  }

  init() {
    // Check authentication
    this.checkAuthentication();
    
    // Load initial data
    this.loadVendors();
    this.loadCollections();
    this.loadCoupons();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  checkAuthentication() {
    if (!this.token) {
      window.location.href = '../frontend/login.html';
      return;
    }
  }

  setupEventListeners() {
    // Button click for form submission
    const submitBtn = document.getElementById('js-discount-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => this.handleFormSubmit(e));
    }

    // Product type change
    const productTypeSelect = document.getElementById('js-type');
    if (productTypeSelect) {
      productTypeSelect.addEventListener('change', (e) => this.handleProductTypeChange(e));
    }

    // Vendor change for product loading
    const vendorSelect = document.getElementById('js-vendor');
    if (vendorSelect) {
      vendorSelect.addEventListener('change', (e) => this.handleVendorChange(e));
    }

    // Coupon type change
    const couponTypeSelect = document.getElementById('js-discount-type');
    if (couponTypeSelect) {
      couponTypeSelect.addEventListener('change', (e) => this.handleCouponTypeChange(e));
    }
  }

  async makeApiCall(endpoint, options = {}) {
    try {
      const url = `${this.apiBaseUrl}${endpoint}`;
      const config = {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  async loadVendors() {
    try {
      console.log('Loading vendors...');
      const response = await this.makeApiCall('/admin/coupons/vendors');
      this.vendors = response.data || [];
      this.populateVendorDropdowns();
      console.log(`Loaded ${this.vendors.length} vendors`);
    } catch (error) {
      console.error('Error loading vendors:', error);
      this.vendors = [];
      this.populateVendorDropdowns();
      this.showError('Failed to load vendors: ' + error.message);
    }
  }

  async loadCollections() {
    try {
      console.log('Loading collections...');
      const response = await this.makeApiCall('/admin/coupons/collections');
      this.collections = response.data || [];
      this.populateCollectionDropdown();
      console.log(`Loaded ${this.collections.length} collections`);
    } catch (error) {
      console.error('Error loading collections:', error);
      this.collections = [];
      this.populateCollectionDropdown();
      this.showError('Failed to load collections: ' + error.message);
    }
  }

  async loadProducts(vendorId = '') {
    try {
      const params = new URLSearchParams();
      if (vendorId) {
        params.append('vendor_id', vendorId);
      }

      console.log('Loading products with params:', params.toString());

      const response = await this.makeApiCall(`/admin/coupons/products?${params}`);
      this.products = response.data || [];
      this.populateProductDropdown();

      console.log(`Loaded ${this.products.length} products`);
    } catch (error) {
      console.error('Error loading products:', error);
      this.products = [];
      this.populateProductDropdown();
      this.showError('Failed to load products: ' + error.message);
    }
  }

  populateVendorDropdowns() {
    // Populate main vendor dropdown
    const vendorSelect = document.getElementById('js-vendor');
    if (vendorSelect) {
      vendorSelect.innerHTML = '<option value="">Select Vendor</option>';
      this.vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.id;
        option.textContent = vendor.email;
        vendorSelect.appendChild(option);
      });
    }
  }

  populateCollectionDropdown() {
    const collectionSelect = document.getElementById('js-collection');
    if (collectionSelect) {
      collectionSelect.innerHTML = '<option value="">Select Collection</option>';
      this.collections.forEach(collection => {
        const option = document.createElement('option');
        option.value = collection.id;
        option.textContent = collection.name;
        collectionSelect.appendChild(option);
      });
    }
  }

  populateProductDropdown() {
    const productSelect = document.getElementById('js-product');
    if (productSelect) {
      productSelect.innerHTML = '<option value="">Select Product</option>';
      this.products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} - ₹${product.price}`;
        productSelect.appendChild(option);
      });
    }
  }

  handleProductTypeChange(e) {
    const productType = e.target.value;
    const collectionGroup = document.getElementById('collection-group');
    const productGroup = document.getElementById('product-group');
    const productSelect = document.getElementById('js-product');
    const collectionSelect = document.getElementById('js-collection');

    if (productType === 'collection') {
      if (collectionGroup) collectionGroup.style.display = 'block';
      if (productGroup) productGroup.style.display = 'none';
      if (productSelect) productSelect.value = '';
    } else if (productType === 'product') {
      if (collectionGroup) collectionGroup.style.display = 'none';
      if (productGroup) productGroup.style.display = 'block';
      if (collectionSelect) collectionSelect.value = '';
    } else {
      if (collectionGroup) collectionGroup.style.display = 'none';
      if (productGroup) productGroup.style.display = 'none';
    }
  }

  async handleVendorChange(e) {
    const vendorId = e.target.value;
    if (vendorId) {
      await this.loadProducts(vendorId);
    } else {
      this.products = [];
      this.populateProductDropdown();
    }
  }

  handleCouponTypeChange(e) {
    const couponType = e.target.value;
    const discountLabel = document.getElementById('discount-label');
    const discountHelp = document.getElementById('discount-help');
    const discountInput = document.getElementById('js-discount');

    if (couponType === 'discount') {
      if (discountLabel) discountLabel.textContent = 'Discount Percentage';
      if (discountHelp) discountHelp.textContent = 'Enter percentage (0-100)';
      if (discountInput) {
        discountInput.max = '100';
        discountInput.placeholder = '20';
      }
    } else if (couponType === 'flat_off') {
      if (discountLabel) discountLabel.textContent = 'Flat Amount Off';
      if (discountHelp) discountHelp.textContent = 'Enter flat amount in ₹';
      if (discountInput) {
        discountInput.removeAttribute('max');
        discountInput.placeholder = '100';
      }
    } else {
      if (discountLabel) discountLabel.textContent = 'Discount % / Amount';
      if (discountHelp) discountHelp.textContent = 'Enter percentage (0-100) or flat amount';
      if (discountInput) {
        discountInput.removeAttribute('max');
        discountInput.placeholder = '';
      }
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();

    try {
      // Basic validation - get form values with null checks
      const codeEl = document.getElementById('js-code');
      const vendorEl = document.getElementById('js-vendor');
      const productTypeEl = document.getElementById('js-type');
      const couponTypeEl = document.getElementById('js-discount-type');
      const discountValueEl = document.getElementById('js-discount');
      const expirationDateEl = document.getElementById('js-date');

      if (!codeEl || !vendorEl || !productTypeEl || !couponTypeEl || !discountValueEl || !expirationDateEl) {
        this.showError('Form elements not found. Please refresh the page.');
        return;
      }

      const code = codeEl.value.trim();
      const vendorId = vendorEl.value;
      const productType = productTypeEl.value;
      const couponType = couponTypeEl.value;
      const discountValue = discountValueEl.value;
      const expirationDate = expirationDateEl.value;

      if (!code) {
        this.showError('Please enter a coupon code');
        return;
      }

      if (!vendorId) {
        this.showError('Please select a vendor');
        return;
      }

      if (!productType) {
        this.showError('Please select a product type');
        return;
      }

      if (!couponType) {
        this.showError('Please select a coupon type');
        return;
      }

      if (!discountValue || discountValue <= 0) {
        this.showError('Please enter a valid discount value');
        return;
      }

      if (!expirationDate) {
        this.showError('Please select an expiration date');
        return;
      }

      // Validate discount value based on coupon type
      if (couponType === 'discount' && (parseFloat(discountValue) > 100 || parseFloat(discountValue) <= 0)) {
        this.showError('Discount percentage must be between 1 and 100');
        return;
      }

      const collectionEl = document.getElementById('js-collection');
      const productEl = document.getElementById('js-product');

      if (productType === 'collection' && (!collectionEl || !collectionEl.value)) {
        this.showError('Please select a collection');
        return;
      }

      if (productType === 'product' && (!productEl || !productEl.value)) {
        this.showError('Please select a product');
        return;
      }

      this.showLoading();

      const usageLimitEl = document.getElementById('js-usage-limit');
      const minAmountEl = document.getElementById('js-min-amount');

      const couponData = {
        code: code.toUpperCase(),
        vendor_id: parseInt(vendorId),
        product_type: productType,
        coupon_type: couponType,
        discount_value: parseFloat(discountValue),
        expiration_date: expirationDate,
        usage_limit: (usageLimitEl && usageLimitEl.value) ? parseInt(usageLimitEl.value) : null,
        minimum_order_amount: (minAmountEl && minAmountEl.value) ? parseFloat(minAmountEl.value) : null
      };

      // Add collection_id or product_id based on product_type
      if (couponData.product_type === 'collection') {
        const collectionId = collectionEl ? collectionEl.value : '';
        couponData.collection_id = collectionId ? parseInt(collectionId) : null;
      } else if (couponData.product_type === 'product') {
        const productId = productEl ? productEl.value : '';
        couponData.product_id = productId ? parseInt(productId) : null;
      }

      console.log('Creating coupon with data:', couponData);

      const response = await this.makeApiCall('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(couponData)
      });

      this.showSuccess('Coupon created successfully!');
      this.resetForm();
      this.loadCoupons(); // Reload coupons list

    } catch (error) {
      console.error('Error creating coupon:', error);
      this.showError(error.message || 'Failed to create coupon');
    } finally {
      this.hideLoading();
    }
  }

  resetForm() {
    const elements = [
      'js-code', 'js-vendor', 'js-type', 'js-collection',
      'js-product', 'js-discount-type', 'js-discount',
      'js-date', 'js-usage-limit', 'js-min-amount'
    ];

    elements.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });

    this.handleProductTypeChange({ target: { value: '' } }); // Reset form visibility
  }

  async loadCoupons() {
    try {
      this.showCouponsLoading();

      console.log('Loading coupons...');
      const response = await this.makeApiCall('/admin/coupons?limit=50');
      const coupons = response.data?.coupons || [];
      this.displayCoupons(coupons);
      console.log(`Loaded ${coupons.length} coupons`);

    } catch (error) {
      console.error('Error loading coupons:', error);
      this.showError('Failed to load coupons: ' + error.message);
      this.showCouponsEmpty();
    }
  }

  displayCoupons(coupons) {
    const container = document.getElementById('coupons-container');
    const loading = document.getElementById('coupons-loading');
    const empty = document.getElementById('coupons-empty');

    loading.style.display = 'none';
    empty.style.display = 'none';
    container.style.display = 'block';
    container.innerHTML = '';

    if (coupons.length === 0) {
      // Show a message when no coupons exist
      container.innerHTML = '<div style="text-align: center; padding: 20px; color: #6c757d;">No coupons created yet. Create your first coupon above!</div>';
      return;
    }

    coupons.forEach(coupon => {
      const couponCard = this.createCouponCard(coupon);
      container.appendChild(couponCard);
    });
  }

  createCouponCard(coupon) {
    const card = document.createElement('div');
    card.className = 'cards__single';

    const expirationDate = new Date(coupon.expiration_date);
    const isExpired = expirationDate < new Date();
    const status = coupon.is_active ? (isExpired ? 'Expired' : 'Active') : 'Inactive';

    card.innerHTML = `
      <div class="cards__title-wrapper">
        <div class="bold s">Coupon Code: ${coupon.code}</div>
        <button class="btn btn--trash" onclick="adminCouponManager.deleteCoupon(${coupon.id})">
          <img src="img/icon-trash.svg" alt="" class="btn__icon" />
        </button>
      </div>
      <div class="cards__item">Coupon Type: ${coupon.coupon_type === 'discount' ? 'Discount %' : 'Flat off'}</div>
      <div class="cards__item">Discount: ${coupon.coupon_type === 'discount' ? coupon.discount_value + '%' : '₹' + coupon.discount_value}</div>
      <div class="cards__item">
        ${coupon.product_type === 'collection'
          ? `Collection affected: ${coupon.collection ? coupon.collection.name : 'All Products'}`
          : `Product affected: ${coupon.product ? coupon.product.name : 'N/A'}`}
      </div>
      <div class="cards__item">Expires: ${expirationDate.toLocaleDateString()}</div>
      <div class="cards__item">Status: ${status}</div>
      <div class="cards__item">Vendor: ${coupon.vendor ? coupon.vendor.email : 'N/A'}</div>
    `;

    return card;
  }



  async deleteCoupon(couponId) {
    if (!confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      await this.makeApiCall(`/admin/coupons/${couponId}`, {
        method: 'DELETE'
      });

      this.showSuccess('Coupon deleted successfully!');
      this.loadCoupons();

    } catch (error) {
      console.error('Error deleting coupon:', error);
      this.showError(error.message || 'Failed to delete coupon');
    }
  }

  showCouponsLoading() {
    const loading = document.getElementById('coupons-loading');
    const container = document.getElementById('coupons-container');
    const empty = document.getElementById('coupons-empty');

    if (loading) loading.style.display = 'block';
    if (container) container.style.display = 'none';
    if (empty) empty.style.display = 'none';
  }

  showCouponsEmpty() {
    const loading = document.getElementById('coupons-loading');
    const container = document.getElementById('coupons-container');
    const empty = document.getElementById('coupons-empty');

    if (loading) loading.style.display = 'none';
    if (container) container.style.display = 'none';
    if (empty) empty.style.display = 'block';
  }

  showLoading() {
    const btn = document.getElementById('js-discount-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating...';
    }
  }

  hideLoading() {
    const btn = document.getElementById('js-discount-btn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Add Coupon';
    }
  }

  showSuccess(message) {
    // You can implement a toast notification system here
    alert(message);
  }

  showError(message) {
    // You can implement a toast notification system here
    alert('Error: ' + message);
  }
}

// Initialize the admin coupon manager when the page loads
let adminCouponManager;
document.addEventListener('DOMContentLoaded', () => {
  adminCouponManager = new AdminCouponManager();
});
