// Admin Product Listing JavaScript
class AdminProductListing {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.totalPages = 1;
    this.currentFilters = {
      search: '',
      category: '',
      subcategory: '',
      vendor_id: ''
    };
    this.categories = [];
    this.subcategories = [];
    this.vendors = [];
    this.init();
  }

  init() {
    // Check authentication
    this.checkAuthentication();
    
    // Load initial data
    this.loadCategories();
    this.loadVendors();
    this.loadProducts();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  checkAuthentication() {
    if (!this.token) {
      window.location.href = '../frontend/login.html';
      return;
    }
  }

  async loadCategories() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Categories API returns data as array directly, not data.categories
        this.categories = Array.isArray(data.data) ? data.data : (data.data.categories || []);
        this.populateCategoryDropdown();
      } else {
        console.warn('No categories data received:', data);
        this.categories = [];
        this.populateCategoryDropdown();
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      this.categories = [];
      this.populateCategoryDropdown();
    }
  }

  async loadVendors() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/vendors`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data && data.data.vendors) {
        this.vendors = data.data.vendors;
        this.populateVendorDropdown();
      } else {
        console.warn('No vendors data received:', data);
        this.vendors = [];
        this.populateVendorDropdown();
      }
    } catch (error) {
      console.error('Failed to load vendors:', error);
      this.vendors = [];
      this.populateVendorDropdown();
    }
  }

  populateVendorDropdown() {
    const vendorSelect = document.getElementById('js-vendor-filter');
    if (!vendorSelect) return;

    // Clear existing options except the first one
    vendorSelect.innerHTML = '<option value="">All Vendors</option>';

    // Check if vendors is an array before using forEach
    if (Array.isArray(this.vendors)) {
      this.vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.id;
        option.textContent = vendor.email;
        vendorSelect.appendChild(option);
      });
    }
  }

  populateCategoryDropdown() {
    const categorySelect = document.getElementById('js-collection');
    if (!categorySelect) return;

    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">All Categories</option>';

    // Check if categories is an array before using forEach
    if (Array.isArray(this.categories)) {
      this.categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    }
  }

  async loadSubcategories(categoryId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/categories/${categoryId}/subcategories`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Handle both possible response structures
        this.subcategories = data.data.subcategories || data.data;
        this.populateSubcategoryDropdown();
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
    }
  }

  populateSubcategoryDropdown() {
    const subcategorySelect = document.getElementById('js-subcategory');
    if (!subcategorySelect) return;

    // Clear existing options except the first one
    subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';

    // Check if subcategories is an array before using forEach
    if (Array.isArray(this.subcategories)) {
      this.subcategories.forEach(subcategory => {
        const option = document.createElement('option');
        option.value = subcategory.id;
        option.textContent = subcategory.name;
        subcategorySelect.appendChild(option);
      });
    }
  }

  async loadProducts() {
    try {
      this.showLoading();

      const queryParams = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        ...this.currentFilters
      });

      // Remove empty filters
      for (const [key, value] of queryParams.entries()) {
        if (!value) {
          queryParams.delete(key);
        }
      }

      const response = await fetch(`${this.apiBaseUrl}/admin/products?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        this.displayProducts(data.data.products);
        this.updatePagination(data.data.pagination);
        this.updateProductCount(data.data.pagination.totalItems);
      } else {
        throw new Error(data.message || 'Failed to load products');
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      this.showError('Failed to load products: ' + error.message);
    } finally {
      this.hideLoading();
    }
  }

  displayProducts(products) {
    const container = document.getElementById('js-products-container');
    if (!container) return;

    if (products.length === 0) {
      container.innerHTML = `
        <div class="no-products">
          <p>No products found matching your criteria.</p>
          <a href="add-product.html" class="btn btn--primary">Add New Product</a>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => this.createProductCard(product)).join('');
  }

  createProductCard(product) {
    const imageUrl = product.image_1_url || product.img_url || 'img/placeholder.jpg';
    const categoryName = product.subcategory?.category?.name || 'No Category';
    const subcategoryName = product.subcategory?.name || 'No Subcategory';
    const vendorInfo = product.vendor ? product.vendor.email : 'Admin Product';
    const vendorBadge = product.vendor ? 'vendor-product' : 'admin-product';

    return `
      <div class="product-card" data-product-id="${product.id}">
        <img src="${imageUrl}" alt="${product.name}" class="product-card__img"
             onerror="this.src='img/placeholder.jpg'" />

        <div class="product-card__content">
          <div class="product-card__info">
            <div class="bold s product-card__name">${product.name}</div>
            <div class="product-card__category">${categoryName} > ${subcategoryName}</div>
            <div class="product-card__vendor ${vendorBadge}">
              <strong>Owner:</strong> ${vendorInfo}
            </div>
            <div class="product-card__price">₹${product.price}</div>
            <div class="product-card__stock">Stock: ${product.stock || 0}</div>
            ${product.discount > 0 ? `<div class="product-card__discount">${product.discount}% off</div>` : ''}
          </div>

          <div class="product-card__actions">
            <a href="modify-product.html?id=${product.id}" class="btn btn--primary btn--small">
              Edit
            </a>
            <button class="btn btn--danger btn--small" onclick="productListing.deleteProduct(${product.id})">
              Delete
            </button>
          </div>
        </div>
      </div>
    `;
  }

  updatePagination(pagination) {
    const paginationContainer = document.getElementById('js-pagination');
    if (!paginationContainer) return;

    this.totalPages = pagination.totalPages;
    this.currentPage = pagination.currentPage;

    if (this.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    let paginationHTML = '<div class="pagination">';

    // Previous button
    if (pagination.hasPrevPage) {
      paginationHTML += `<button class="btn btn--secondary" onclick="productListing.goToPage(${this.currentPage - 1})">Previous</button>`;
    }

    // Page numbers
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === this.currentPage ? 'btn--primary' : 'btn--secondary';
      paginationHTML += `<button class="btn ${isActive}" onclick="productListing.goToPage(${i})">${i}</button>`;
    }

    // Next button
    if (pagination.hasNextPage) {
      paginationHTML += `<button class="btn btn--secondary" onclick="productListing.goToPage(${this.currentPage + 1})">Next</button>`;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
  }

  updateProductCount(totalItems) {
    const countElement = document.getElementById('js-product-count');
    if (countElement) {
      countElement.textContent = `${totalItems} product${totalItems !== 1 ? 's' : ''} found`;
    }
  }

  setupEventListeners() {
    // Category change event
    const categorySelect = document.getElementById('js-collection');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        const categoryId = e.target.value;
        if (categoryId) {
          this.loadSubcategories(categoryId);
        } else {
          // Clear subcategory dropdown
          const subcategorySelect = document.getElementById('js-subcategory');
          if (subcategorySelect) {
            subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
          }
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('js-search');
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentFilters.search = e.target.value;
          this.currentPage = 1;
          this.loadProducts();
        }, 500);
      });
    }

    // Apply filters button
    const applyFiltersBtn = document.getElementById('js-apply-filters');
    if (applyFiltersBtn) {
      applyFiltersBtn.addEventListener('click', () => {
        this.applyFilters();
      });
    }

    // Clear filters button
    const clearFiltersBtn = document.getElementById('js-clear-filters');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        this.clearFilters();
      });
    }
  }

  applyFilters() {
    const categorySelect = document.getElementById('js-collection');
    const subcategorySelect = document.getElementById('js-subcategory');
    const vendorSelect = document.getElementById('js-vendor-filter');
    const searchInput = document.getElementById('js-search');

    this.currentFilters = {
      search: searchInput?.value || '',
      category: categorySelect?.value || '',
      subcategory: subcategorySelect?.value || '',
      vendor_id: vendorSelect?.value || ''
    };

    this.currentPage = 1;
    this.loadProducts();
  }

  clearFilters() {
    // Clear form inputs
    const searchInput = document.getElementById('js-search');
    const categorySelect = document.getElementById('js-collection');
    const subcategorySelect = document.getElementById('js-subcategory');
    const vendorSelect = document.getElementById('js-vendor-filter');

    if (searchInput) searchInput.value = '';
    if (categorySelect) categorySelect.value = '';
    if (subcategorySelect) subcategorySelect.innerHTML = '<option value="">All Subcategories</option>';
    if (vendorSelect) vendorSelect.value = '';

    // Clear filters and reload
    this.currentFilters = {
      search: '',
      category: '',
      subcategory: '',
      vendor_id: ''
    };

    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      const data = await response.json();
      if (data.success) {
        this.showSuccess('Product deleted successfully!');
        this.loadProducts(); // Reload the product list
      } else {
        throw new Error(data.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Delete product error:', error);
      this.showError('Failed to delete product: ' + error.message);
    }
  }

  showLoading() {
    const loadingElement = document.getElementById('js-loading');
    if (loadingElement) {
      loadingElement.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingElement = document.getElementById('js-loading');
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.admin-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `admin-message admin-message--${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 1000;
      background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
    `;

    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentElement) {
        messageDiv.remove();
      }
    }, 5000);
  }
}

// Initialize the product listing when DOM is loaded
let productListing;
document.addEventListener('DOMContentLoaded', () => {
  productListing = new AdminProductListing();
});
