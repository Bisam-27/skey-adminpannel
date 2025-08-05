// Unfulfilled Orders Management JavaScript
class UnfulfilledOrdersManager {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.currentPage = 1;
    this.ordersPerPage = 10;
    this.init();
  }

  init() {
    // Check authentication on page load
    this.checkAuthentication();
    
    // Load orders (AdminUtils handles stats)
    this.loadOrders();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  checkAuthentication() {
    if (!this.token) {
      alert('You need to login first to access the admin panel.');
      window.location.href = '../frontend/login.html';
      return false;
    }
    return true;
  }

  setupEventListeners() {
    // Retry button
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.loadOrders());
    }

    // Pagination buttons
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    
    if (prevButton) {
      prevButton.addEventListener('click', () => this.previousPage());
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', () => this.nextPage());
    }

    // Search functionality
    const searchForm = document.getElementById('js-search-form');
    const searchInput = document.getElementById('js-search');
    
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.searchOrders(searchInput.value);
      });
    }

    // Note: AdminUtils now handles logout functionality
  }

  async loadOrders(page = 1, search = '') {
    try {
      this.showLoading();
      this.currentPage = page;

      const queryParams = new URLSearchParams({
        page: page,
        limit: this.ordersPerPage,
        sortBy: 'created_at',
        sortOrder: 'DESC'
      });

      if (search) {
        queryParams.append('search', search);
      }

      const response = await fetch(`${this.apiBaseUrl}/admin/orders/unfulfilled?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          alert('Your session has expired. Please login again.');
          localStorage.removeItem('skeyy_auth_token');
          window.location.href = '../frontend/login.html';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        this.displayOrders(result.data.orders);
        this.updatePagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      this.showError(error.message || 'Failed to load orders');
    } finally {
      this.hideLoading();
    }
  }

  // Note: Order stats functionality moved to AdminUtils

  displayOrders(orders) {
    const container = document.getElementById('orders-container');
    const emptyState = document.getElementById('empty-state');
    
    if (!orders || orders.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    container.style.display = 'block';
    
    container.innerHTML = orders.map(order => this.createOrderHTML(order)).join('');
    
    // Add event listeners for fulfill buttons
    this.setupOrderActions();
  }

  createOrderHTML(order) {
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    const itemsHTML = (order.items || []).map(item => {
      // Get product image from the product relationship or use placeholder
      let productImage = item.product?.image_1_url || item.product?.img_url || item.product_image;

      // Add correct path prefix for product images
      if (productImage && !productImage.startsWith('http') && !productImage.startsWith('../')) {
        productImage = `../frontend/${productImage}`;
      }

      // Use placeholder if no image found
      if (!productImage) {
        productImage = '../frontend/img/prod-1.jpg';
      }

      // Get product attributes (size, color) from the item
      const attributes = item.product_attributes || {};
      const size = attributes.size || '';
      const color = attributes.color || '';

      // Get vendor information
      const vendorInfo = item.product?.vendor ? item.product.vendor.email : 'Admin Product';
      const vendorBadge = item.product?.vendor ? 'vendor-item' : 'admin-item';

      return `
        <div class="orders__item">
          <img src="${productImage}" alt="${item.product_name || 'Product'}" class="orders__img" />
          <div class="orders__item-details">
            <div class="s bold orders__item-name">${item.product_name || 'Unknown Product'}</div>
            <div class="orders__item-vendor ${vendorBadge}">
              <strong>Vendor:</strong> ${vendorInfo}
            </div>
            <div class="orders__item-info">
              ${size ? `Size <span class="bold">${size}</span>` : ''}
              ${color ? ` | Color <span class="bold">${color}</span>` : ''}
            </div>
            <div class="orders__item-totals">
              <div class="orders__item-info">
                Qty <span class="bold">${item.quantity}</span>
              </div>
              <div class="orders__item-info">
                Unit Price <span class="bold">₹${parseFloat(item.final_price || item.unit_price || 0).toFixed(2)}</span>
              </div>
              <div class="orders__item-info">
                Line Total <span class="bold">₹${parseFloat(item.line_total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="orders__single" data-order-id="${order.id}">
        <div class="orders__preview-wrapper">
          <div class="bold orders__number">Order #: ${order.order_number || order.id}</div>
          <button class="btn btn-success fulfill-btn" data-order-id="${order.id}">
            Mark as Fulfilled
          </button>
        </div>
        <div class="orders__details-wrapper">
          <div class="orders__title-wrapper">
            <div class="brand">Order placed on: ${orderDate}</div>
            <div class="bold">Total: ₹${parseFloat(order.total_amount || 0).toFixed(2)}</div>
          </div>
          <div class="order-customer-info">
            <div class="customer-details">
              <strong>Customer:</strong> ${order.user?.email || order.customer_email || 'Guest'}
              ${order.user?.role ? `(${order.user.role})` : ''}
            </div>
            ${order.coupon_code ? `<div class="coupon-info"><strong>Coupon Applied:</strong> ${order.coupon_code} (-₹${parseFloat(order.discount_amount || 0).toFixed(2)})</div>` : ''}
            ${order.delivery_fee > 0 ? `<div class="delivery-info"><strong>Delivery Fee:</strong> ₹${parseFloat(order.delivery_fee || 0).toFixed(2)}</div>` : ''}
          </div>
          ${itemsHTML}
        </div>
      </div>
    `;
  }

  setupOrderActions() {
    const fulfillButtons = document.querySelectorAll('.fulfill-btn');
    fulfillButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const orderId = e.target.getAttribute('data-order-id');
        this.fulfillOrder(orderId);
      });
    });
  }

  async fulfillOrder(orderId) {
    try {
      const button = document.querySelector(`[data-order-id="${orderId}"]`);
      if (button) {
        button.disabled = true;
        button.textContent = 'Fulfilling...';
      }

      const response = await fetch(`${this.apiBaseUrl}/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'fulfilled' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        // Remove the order from the list
        const orderElement = document.querySelector(`[data-order-id="${orderId}"]`);
        if (orderElement) {
          orderElement.remove();
        }
        
        // Reload orders to update the list
        this.loadOrders(this.currentPage);
        this.loadOrderStats();
        
        // Show success message
        this.showSuccessMessage('Order marked as fulfilled successfully!');
      } else {
        throw new Error(result.message || 'Failed to fulfill order');
      }
    } catch (error) {
      console.error('Error fulfilling order:', error);
      
      // Reset button state
      const button = document.querySelector(`[data-order-id="${orderId}"]`);
      if (button) {
        button.disabled = false;
        button.textContent = 'Mark as Fulfilled';
      }
      
      alert('Failed to fulfill order: ' + error.message);
    }
  }

  // Note: Navigation counts functionality moved to AdminUtils

  updatePagination(pagination) {
    const paginationContainer = document.getElementById('pagination-container');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    if (pagination.totalPages > 1) {
      paginationContainer.style.display = 'block';
      
      prevButton.disabled = !pagination.hasPrevPage;
      nextButton.disabled = !pagination.hasNextPage;
      pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    } else {
      paginationContainer.style.display = 'none';
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.loadOrders(this.currentPage - 1);
    }
  }

  nextPage() {
    this.loadOrders(this.currentPage + 1);
  }

  searchOrders(query) {
    this.currentPage = 1;
    this.loadOrders(1, query);
  }

  showLoading() {
    document.getElementById('loading-state').style.display = 'block';
    document.getElementById('error-state').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
    document.getElementById('orders-container').style.display = 'none';
  }

  hideLoading() {
    document.getElementById('loading-state').style.display = 'none';
  }

  showError(message) {
    document.getElementById('error-state').style.display = 'block';
    document.getElementById('error-message-text').textContent = message;
    document.getElementById('orders-container').style.display = 'none';
    document.getElementById('empty-state').style.display = 'none';
  }

  showSuccessMessage(message) {
    // You can implement a toast notification here
    console.log('Success:', message);
  }

  // Note: Logout functionality moved to AdminUtils
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.unfulfilledOrdersManager = new UnfulfilledOrdersManager();
});
