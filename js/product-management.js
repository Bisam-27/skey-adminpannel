// Admin Product Management JavaScript
class AdminProductManager {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.categories = [];
    this.subcategories = [];
    this.vendors = [];
    this.brands = [];
    this.currentProduct = null;
    this.isEditMode = false;
    this.init();
  }

  init() {
    // Check authentication
    this.checkAuthentication();
    
    // Load initial data
    this.loadCategories();
    this.loadVendors();
    this.loadBrands();

    // Set up event listeners
    this.setupEventListeners();
    
    // Check if we're in edit mode (URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    if (productId) {
      this.isEditMode = true;
      this.loadProductForEdit(productId);
    }
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
      this.showError('Failed to load categories');
    }
  }

  populateCategoryDropdown() {
    const categorySelect = document.getElementById('js-collection');
    if (!categorySelect) return;

    // Clear existing options except the first one
    categorySelect.innerHTML = '<option value="">Select Category</option>';

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
        // Subcategories API returns data as array directly
        this.subcategories = Array.isArray(data.data) ? data.data : (data.data.subcategories || []);
        this.populateSubcategoryDropdown();
      } else {
        this.subcategories = [];
        this.populateSubcategoryDropdown();
      }
    } catch (error) {
      console.error('Failed to load subcategories:', error);
      this.subcategories = [];
      this.populateSubcategoryDropdown();
      this.showError('Failed to load subcategories');
    }
  }

  populateSubcategoryDropdown() {
    // Create subcategory dropdown if it doesn't exist
    let subcategorySelect = document.getElementById('js-subcategory');
    if (!subcategorySelect) {
      // Create subcategory dropdown after category dropdown
      const categoryWrapper = document.getElementById('js-collection').parentElement;
      const subcategoryWrapper = document.createElement('div');
      subcategoryWrapper.className = 'input';
      subcategoryWrapper.innerHTML = `
        <label for="js-subcategory" class="input__label">Product Subcategory*</label>
        <select id="js-subcategory" class="input__control">
          <option value="">Select Subcategory</option>
        </select>
        <span class="input__error">Please select a subcategory</span>
      `;
      categoryWrapper.parentElement.insertBefore(subcategoryWrapper, categoryWrapper.nextSibling);
      subcategorySelect = document.getElementById('js-subcategory');
    }

    // Clear existing options except the first one
    subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';

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
      this.showError('Failed to load vendors');
    }
  }

  populateVendorDropdown() {
    const vendorSelect = document.getElementById('js-vendor-select');
    if (!vendorSelect) return;

    // Clear existing options except the first one
    vendorSelect.innerHTML = '<option value="">No Vendor (Admin Product)</option>';

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

  async loadBrands() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/brands`, {
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
      if (data.success && data.data && data.data.brands) {
        this.brands = data.data.brands;
        this.populateBrandDropdown();
      } else {
        console.warn('No brands data received:', data);
        this.brands = [];
        this.populateBrandDropdown();
      }
    } catch (error) {
      console.error('Failed to load brands:', error);
      this.brands = [];
      this.populateBrandDropdown();
      this.showError('Failed to load brands');
    }
  }

  populateBrandDropdown() {
    const brandSelect = document.getElementById('js-product-brand');
    if (!brandSelect) return;

    // Clear existing options except the first one
    brandSelect.innerHTML = '<option value="">Select Brand</option>';

    // Check if brands is an array before using forEach
    if (Array.isArray(this.brands)) {
      this.brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand.id;
        option.textContent = brand.name;
        brandSelect.appendChild(option);
      });
    }
  }

  setupEventListeners() {
    // Category change event
    const categorySelect = document.getElementById('js-collection');
    if (categorySelect) {
      categorySelect.addEventListener('change', (e) => {
        const categoryId = e.target.value;

        // Always clear subcategory dropdown first
        const subcategorySelect = document.getElementById('js-subcategory');
        if (subcategorySelect) {
          subcategorySelect.innerHTML = '<option value="">Select Subcategory</option>';
          subcategorySelect.value = ''; // Ensure value is cleared
        }

        if (categoryId && categoryId !== '') {
          this.loadSubcategories(categoryId);
        } else {
          // Clear subcategories array when no category is selected
          this.subcategories = [];
        }
      });
    }

    // Form submission
    const submitBtn = document.getElementById('js-product-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleFormSubmission();
      });
    }

    // Image upload previews
    this.setupImagePreviews();
  }

  setupImagePreviews() {
    for (let i = 1; i <= 8; i++) {
      const imageInput = document.getElementById(`js-product-image-${i}`);
      if (imageInput) {
        imageInput.addEventListener('change', (e) => {
          this.handleImagePreview(e, i);
        });
      }
    }
  }

  handleImagePreview(event, imageNumber) {
    const file = event.target.files[0];
    const thumbnail = event.target.parentElement.nextElementSibling;
    
    if (file && thumbnail) {
      const reader = new FileReader();
      reader.onload = (e) => {
        thumbnail.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async handleFormSubmission() {
    try {
      // Starting form submission

      // Validate form
      if (!this.validateForm()) {
        return;
      }

      // Collect form data
      const formData = this.collectFormData();

      // Show loading state
      this.showLoading();

      let response;
      if (this.isEditMode && this.currentProduct) {
        // Update existing product
        response = await fetch(`${this.apiBaseUrl}/admin/products/${this.currentProduct.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${this.token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData // Send FormData directly
        });
      } else {
        // Create new product
        response = await fetch(`${this.apiBaseUrl}/admin/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
            // Don't set Content-Type for FormData, let browser set it with boundary
          },
          body: formData // Send FormData directly
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save product');
      }

      const data = await response.json();
      if (data.success) {
        this.showSuccess(this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        
        // Redirect to product list after a delay
        setTimeout(() => {
          window.location.href = 'select-product.html';
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to save product');
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(error.message || 'Failed to save product');
    } finally {
      this.hideLoading();
    }
  }

  validateForm() {
    let isValid = true;
    const errors = [];

    // Required fields
    const productName = document.getElementById('js-product-name');
    const productPrice = document.getElementById('js-product-price');
    const categorySelect = document.getElementById('js-collection');

    if (!productName || !productName.value.trim()) {
      errors.push('Product name is required');
      this.showFieldError(productName, 'Please enter a product name');
      isValid = false;
    }

    if (!productPrice || !productPrice.value || parseFloat(productPrice.value) <= 0) {
      errors.push('Valid product price is required');
      this.showFieldError(productPrice, 'Please enter a valid product price');
      isValid = false;
    }

    // Categories and subcategories are completely optional for admin

    if (!isValid) {
      this.showError('Please fix the following errors: ' + errors.join(', '));
    }

    return isValid;
  }

  collectFormData() {
    const formData = new FormData();

    // Basic product information
    const productName = document.getElementById('js-product-name');
    const productPrice = document.getElementById('js-product-price');
    const productDescription = document.getElementById('js-product-description');
    const productSpecification = document.getElementById('js-product-specification');
    const productStock = document.getElementById('js-product-stock');
    const productDiscount = document.getElementById('js-product-discount');
    const categorySelect = document.getElementById('js-collection');
    const subcategorySelect = document.getElementById('js-subcategory');
    const brandSelect = document.getElementById('js-product-brand');
    const colorInput = document.getElementById('js-product-colour');
    const sizeInput = document.getElementById('js-product-size');
    const vendorSelect = document.getElementById('js-vendor-select');

    // Add text fields to FormData
    if (productName && productName.value.trim()) formData.append('name', productName.value.trim());
    if (productPrice && productPrice.value) formData.append('price', parseInt(productPrice.value));
    if (productDescription && productDescription.value.trim()) formData.append('description', productDescription.value.trim());
    if (productSpecification && productSpecification.value.trim()) formData.append('specification', productSpecification.value.trim());
    if (productStock && productStock.value) formData.append('stock', parseInt(productStock.value) || 0);
    if (productDiscount && productDiscount.value) formData.append('discount', parseInt(productDiscount.value) || 0);

    // Include all optional fields without validation
    if (subcategorySelect && subcategorySelect.value) formData.append('subcategory_id', subcategorySelect.value);
    if (brandSelect && brandSelect.value) formData.append('brand_id', brandSelect.value);
    if (colorInput && colorInput.value.trim()) formData.append('color', colorInput.value.trim());
    if (sizeInput && sizeInput.value.trim()) formData.append('size', sizeInput.value.trim());
    if (vendorSelect && vendorSelect.value) formData.append('vendor_id', vendorSelect.value);

    // Add image files to FormData
    for (let i = 1; i <= 8; i++) {
      const imageInput = document.getElementById(`js-product-image-${i}`);
      if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append(`image_${i}`, imageInput.files[0]);
      }
    }

    return formData;
  }

  showFieldError(field, message) {
    if (!field) return;
    
    const errorSpan = field.parentElement.querySelector('.input__error');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
    }
    
    field.classList.add('input__control--error');
  }

  clearFieldErrors() {
    const errorSpans = document.querySelectorAll('.input__error');
    errorSpans.forEach(span => {
      span.style.display = 'none';
    });

    const errorFields = document.querySelectorAll('.input__control--error');
    errorFields.forEach(field => {
      field.classList.remove('input__control--error');
    });
  }

  showLoading() {
    const submitBtn = document.getElementById('js-product-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = this.isEditMode ? 'Updating...' : 'Adding...';
    }
  }

  hideLoading() {
    const submitBtn = document.getElementById('js-product-btn');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = this.isEditMode ? 'Update Product' : 'Add Product';
    }
  }

  showSuccess(message) {
    // Create or update success message
    this.showMessage(message, 'success');
  }

  showError(message) {
    // Create or update error message
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

  async loadProductForEdit(productId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/admin/products/${productId}`, {
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
        this.currentProduct = data.data.product;
        this.populateFormWithProduct(this.currentProduct);

        // Update page title and button text
        const pageTitle = document.querySelector('.nav-up__current-page');
        if (pageTitle) pageTitle.textContent = 'Edit Product';

        const submitBtn = document.getElementById('js-product-btn');
        if (submitBtn) submitBtn.textContent = 'Update Product';
      } else {
        throw new Error(data.message || 'Failed to load product');
      }
    } catch (error) {
      console.error('Failed to load product for edit:', error);
      this.showError('Failed to load product for editing');
    }
  }

  populateFormWithProduct(product) {
    // Basic fields
    const productName = document.getElementById('js-product-name');
    if (productName) productName.value = product.name || '';

    const productPrice = document.getElementById('js-product-price');
    if (productPrice) productPrice.value = product.price || '';

    const productDescription = document.getElementById('js-product-description');
    if (productDescription) productDescription.value = product.description || '';

    const productSpecification = document.getElementById('js-product-specification');
    if (productSpecification) productSpecification.value = product.specification || '';

    const productStock = document.getElementById('js-product-stock');
    if (productStock) productStock.value = product.stock || 0;

    const productDiscount = document.getElementById('js-product-discount');
    if (productDiscount) productDiscount.value = product.discount || 0;

    // Vendor selection
    const vendorSelect = document.getElementById('js-vendor-select');
    if (vendorSelect && product.vendor_id) vendorSelect.value = product.vendor_id;

    // Category and subcategory
    if (product.subcategory) {
      const categorySelect = document.getElementById('js-collection');
      if (categorySelect && product.subcategory.category) {
        categorySelect.value = product.subcategory.category.id;
        // Trigger change event to load subcategories
        categorySelect.dispatchEvent(new Event('change'));

        // Set subcategory after a short delay to allow subcategories to load
        setTimeout(() => {
          const subcategorySelect = document.getElementById('js-subcategory');
          if (subcategorySelect) {
            subcategorySelect.value = product.subcategory.id;
          }
        }, 500);
      }
    }

    // Other fields
    const brandSelect = document.getElementById('js-product-brand');
    if (brandSelect && product.brand_id) brandSelect.value = product.brand_id;

    const colorInput = document.getElementById('js-product-colour');
    if (colorInput && product.color) colorInput.value = product.color;

    const sizeInput = document.getElementById('js-product-size');
    if (sizeInput && product.size) sizeInput.value = product.size;
  }
}

// Initialize the product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AdminProductManager();
});
