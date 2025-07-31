// View Single User JavaScript
class ViewUser {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.userId = this.getUserIdFromUrl();
    this.init();
  }

  init() {
    // Check authentication
    this.checkAuthentication();
    
    // Load user data if we have a user ID
    if (this.userId) {
      this.loadUser();
    } else {
      this.showError('No user ID provided');
    }
    
    // Set up logout functionality
    this.setupLogout();
  }

  getUserIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
  }

  checkAuthentication() {
    if (!this.token) {
      window.location.href = '../frontend/login.html';
      return;
    }
  }

  async loadUser() {
    try {
      this.showLoading();
      
      const response = await fetch(`${this.apiBaseUrl}/users/${this.userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('User not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.displayUser(result.data.user);
      } else {
        throw new Error(result.message || 'Failed to load user');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.showError(error.message || 'Failed to load user. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  displayUser(user) {
    // Update page title
    document.title = `${user.email} - Skeyy Admin Panel`;
    
    // Update breadcrumb
    const breadcrumbItem = document.querySelector('.grid__breadcrum-item:last-child');
    if (breadcrumbItem) {
      breadcrumbItem.textContent = `View User: ${user.email}`;
    }

    // Update user info section
    const userSection = document.querySelector('.users__single');
    if (userSection) {
      userSection.innerHTML = `
        <div class="users__title-wrapper">
          <div class="bold l">${this.escapeHtml(user.email)}</div>
          <div class="user-role user-role--${user.role}">${user.role.toUpperCase()}</div>
        </div>

        <div class="users__stats">
          <div class="users__item">User ID: ${user.id}</div>
          <div class="users__item">Email: ${this.escapeHtml(user.email)}</div>
          <div class="users__item">Role: ${this.formatRole(user.role)}</div>
          <div class="users__item">Status: Active</div>
          <div class="users__item">Account Type: ${this.getAccountType(user.role)}</div>
        </div>
      `;
    }

    // Update products section based on user role
    this.updateProductsSection(user);
  }

  updateProductsSection(user) {
    const productSection = document.querySelector('.product');
    if (!productSection) return;

    if (user.role === 'vendor') {
      // For vendors, we could show their products (if we had that data)
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Vendor Information</h3>
        </div>
        <div class="vendor-info">
          <p>This user is a vendor. Product management features would be available here.</p>
          <div class="vendor-actions">
            <button class="btn btn--secondary" onclick="viewUser.viewVendorProducts()">
              View Vendor Products
            </button>
            <button class="btn btn--secondary" onclick="viewUser.viewVendorStats()">
              View Vendor Statistics
            </button>
          </div>
        </div>
      `;
    } else if (user.role === 'admin') {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Administrator Information</h3>
        </div>
        <div class="admin-info">
          <p>This user has administrator privileges and can manage the entire system.</p>
          <div class="admin-permissions">
            <div class="permission-item">✅ Manage Users</div>
            <div class="permission-item">✅ Manage Products</div>
            <div class="permission-item">✅ View Analytics</div>
            <div class="permission-item">✅ System Configuration</div>
          </div>
        </div>
      `;
    } else {
      // For regular users, show customer information
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Customer Information</h3>
        </div>
        <div class="customer-info">
          <p>This is a regular customer account.</p>
          <div class="customer-actions">
            <button class="btn btn--secondary" onclick="viewUser.viewCustomerOrders()">
              View Order History
            </button>
            <button class="btn btn--secondary" onclick="viewUser.viewCustomerWishlist()">
              View Wishlist
            </button>
          </div>
        </div>
      `;
    }
  }

  // View customer order history
  async viewCustomerOrders() {
    try {
      this.showOrdersLoading();

      const response = await fetch(`${this.apiBaseUrl}/users/${this.userId}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        this.displayOrderHistory(result.data);
      } else {
        throw new Error(result.message || 'Failed to load order history');
      }
    } catch (error) {
      console.error('Error loading order history:', error);
      this.showOrdersError(error.message || 'Failed to load order history');
    }
  }

  // View customer wishlist
  async viewCustomerWishlist() {
    try {
      this.showWishlistLoading();

      const response = await fetch(`${this.apiBaseUrl}/users/${this.userId}/wishlist`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        this.displayWishlist(result.data);
      } else {
        throw new Error(result.message || 'Failed to load wishlist');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      this.showWishlistError(error.message || 'Failed to load wishlist');
    }
  }

  // Placeholder methods for vendor functionality
  viewVendorProducts() {
    alert('Vendor products view - Feature coming soon!');
  }

  viewVendorStats() {
    alert('Vendor statistics view - Feature coming soon!');
  }

  formatRole(role) {
    const roleMap = {
      'user': 'Customer',
      'admin': 'Administrator',
      'vendor': 'Vendor'
    };
    return roleMap[role] || role;
  }

  getAccountType(role) {
    const typeMap = {
      'user': 'Customer Account',
      'admin': 'Administrative Account',
      'vendor': 'Business Account'
    };
    return typeMap[role] || 'Unknown Account Type';
  }

  setupLogout() {
    const logoutLink = document.querySelector('a[href="logout.html"]');
    if (logoutLink) {
      logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.logout();
      });
    }
  }

  logout() {
    localStorage.removeItem('skeyy_auth_token');
    localStorage.removeItem('skeyy_user_data');
    window.location.href = '../frontend/login.html';
  }

  displayOrderHistory(data) {
    const productSection = document.querySelector('.product');
    if (!productSection) return;

    const { orders, statistics } = data;

    if (orders.length === 0) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Order History</h3>
        </div>
        <div class="no-data">
          <p>This customer has no order history.</p>
          <button class="btn btn--secondary" onclick="viewUser.updateProductsSection(${JSON.stringify(data.user).replace(/"/g, '&quot;')})">
            Back to Customer Info
          </button>
        </div>
      `;
      return;
    }

    productSection.innerHTML = `
      <div class="section-header">
        <h3>Order History</h3>
        <button class="btn btn--secondary" onclick="viewUser.updateProductsSection(${JSON.stringify(data.user).replace(/"/g, '&quot;')})">
          Back to Customer Info
        </button>
      </div>

      <div class="order-statistics">
        <div class="stat-item">
          <span class="stat-label">Total Orders:</span>
          <span class="stat-value">${statistics.totalOrders}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Total Spent:</span>
          <span class="stat-value">₹${statistics.totalSpent}</span>
        </div>
      </div>

      <div class="orders-list">
        ${orders.map(order => `
          <div class="order-item">
            <div class="order-header">
              <span class="order-id">Cart #${order.id}</span>
              <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
              <span class="order-status status-${order.status}">${this.getOrderStatus(order.status)}</span>
            </div>
            <div class="order-details">
              <div class="order-total-info">
                <div class="order-pricing">
                  <div class="subtotal">Subtotal: ₹${order.total_amount || '0.00'}</div>
                  ${order.discount_amount > 0 ? `<div class="coupon-discount">Coupon Discount: -₹${order.discount_amount}</div>` : ''}
                  ${order.delivery_fee > 0 ? `<div class="delivery-fee">Delivery Fee: +₹${order.delivery_fee}</div>` : ''}
                  <div class="final-total">Final Total: ₹${this.calculateFinalAmount(order)}</div>
                </div>
                <span class="order-items">${(order.invoice_items || []).length} item(s)</span>
              </div>
              <div class="order-items-list">
                ${(order.invoice_items || []).map(item => `
                  <div class="order-item-detail">
                    <img src="${item.product_image || '/placeholder.jpg'}" alt="${item.product_name || 'Product'}" class="product-image" onerror="this.src='/placeholder.jpg'">
                    <div class="product-details">
                      <div class="product-name">${this.escapeHtml(item.product_name || 'Unknown Product')}</div>
                      <div class="product-price">
                        ${item.discount_percent > 0 ?
                          `<span class="original-price">₹${item.original_price || item.price || '0'}</span>
                           <span class="discounted-price">₹${item.discounted_price || item.price || '0'}</span> × ${item.quantity || 1}
                           <span class="discount-badge">${item.discount_percent}% OFF</span>` :
                          `₹${item.discounted_price || item.price || '0'} × ${item.quantity || 1}`
                        }
                      </div>
                      <div class="product-subtotal">Subtotal: ₹${item.subtotal || '0.00'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  displayWishlist(data) {
    const productSection = document.querySelector('.product');
    if (!productSection) return;

    const { wishlist } = data;

    if (wishlist.length === 0) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Wishlist</h3>
        </div>
        <div class="no-data">
          <p>This customer's wishlist is empty.</p>
          <button class="btn btn--secondary" onclick="viewUser.updateProductsSection(${JSON.stringify(data.user).replace(/"/g, '&quot;')})">
            Back to Customer Info
          </button>
        </div>
      `;
      return;
    }

    productSection.innerHTML = `
      <div class="section-header">
        <h3>Wishlist (${wishlist.length} items)</h3>
        <button class="btn btn--secondary" onclick="viewUser.updateProductsSection(${JSON.stringify(data.user).replace(/"/g, '&quot;')})">
          Back to Customer Info
        </button>
      </div>

      <div class="wishlist-grid">
        ${wishlist.map(item => `
          <div class="wishlist-item">
            <img src="${item.product?.primary_image || '/placeholder.jpg'}" alt="${item.product?.name || 'Product'}" class="wishlist-image" onerror="this.src='/placeholder.jpg'">
            <div class="wishlist-details">
              <div class="wishlist-name">${this.escapeHtml(item.product?.name || 'Unknown Product')}</div>
              <div class="wishlist-price">
                ${item.product?.discount > 0 ?
                  `<span class="original-price">₹${item.product?.price || '0'}</span>
                   <span class="discounted-price">₹${Math.round((item.product?.price || 0) * (1 - (item.product?.discount || 0) / 100))}</span>
                   <span class="discount-badge">${item.product?.discount}% OFF</span>` :
                  `₹${item.product?.price || '0'}`
                }
              </div>
              <div class="wishlist-status ${(item.product?.stock > 0) ? 'active' : 'inactive'}">
                ${(item.product?.stock > 0) ? `In Stock (${item.product?.stock})` : 'Out of Stock'}
              </div>
              <div class="wishlist-added">Added: ${new Date(item.created_at).toLocaleDateString()}</div>
              ${item.product?.description ? `<div class="wishlist-description">${this.escapeHtml(item.product.description.substring(0, 100))}${item.product.description.length > 100 ? '...' : ''}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  getOrderStatus(status) {
    const statusMap = {
      0: 'Active',
      1: 'Completed',
      2: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  }

  calculateFinalAmount(order) {
    const subtotal = parseFloat(order.total_amount) || 0;
    const discount = parseFloat(order.discount_amount) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;

    const finalAmount = subtotal - discount + deliveryFee;
    return finalAmount.toFixed(2);
  }

  showOrdersLoading() {
    const productSection = document.querySelector('.product');
    if (productSection) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Order History</h3>
        </div>
        <div class="loading-container">
          <div class="loading">Loading order history...</div>
        </div>
      `;
    }
  }

  showWishlistLoading() {
    const productSection = document.querySelector('.product');
    if (productSection) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Wishlist</h3>
        </div>
        <div class="loading-container">
          <div class="loading">Loading wishlist...</div>
        </div>
      `;
    }
  }

  showOrdersError(message) {
    const productSection = document.querySelector('.product');
    if (productSection) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Order History</h3>
        </div>
        <div class="error-container">
          <div class="error">⚠️ ${message}</div>
          <button onclick="viewUser.viewCustomerOrders()" class="btn btn--primary">Retry</button>
        </div>
      `;
    }
  }

  showWishlistError(message) {
    const productSection = document.querySelector('.product');
    if (productSection) {
      productSection.innerHTML = `
        <div class="section-header">
          <h3>Wishlist</h3>
        </div>
        <div class="error-container">
          <div class="error">⚠️ ${message}</div>
          <button onclick="viewUser.viewCustomerWishlist()" class="btn btn--primary">Retry</button>
        </div>
      `;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading() {
    const userSection = document.querySelector('.users__single');
    if (userSection) {
      userSection.innerHTML = `
        <div class="loading-container">
          <div class="loading">Loading user details...</div>
        </div>
      `;
    }
  }

  hideLoading() {
    // Loading will be hidden when displayUser is called
  }

  showError(message) {
    const userSection = document.querySelector('.users__single');
    if (userSection) {
      userSection.innerHTML = `
        <div class="error-container">
          <div class="error">⚠️ ${message}</div>
          <div class="error-actions">
            <button onclick="history.back()" class="btn btn--secondary">Go Back</button>
            <button onclick="viewUser.loadUser()" class="btn btn--primary">Retry</button>
          </div>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.viewUser = new ViewUser();
});
