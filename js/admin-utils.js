// Universal Admin Panel Utilities
// This file provides common functionality for all admin panel pages

class AdminUtils {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.adminData = null;
    this.init();
  }

  init() {
    // Check authentication on page load
    this.checkAuthentication();
    
    // Setup logout functionality
    this.setupLogout();
    
    // Load and display admin info
    this.loadAdminInfo();

    // Note: Sidebar counts are loaded after admin verification in verifyAdminRole()

    // Setup page-specific functionality
    this.setupPageSpecific();
  }

  checkAuthentication() {
    if (!this.token) {
      alert('You need to login first to access the admin panel.');
      window.location.href = '../frontend/login.html';
      return false;
    }
    
    // Verify admin role
    this.verifyAdminRole();
    return true;
  }

  async verifyAdminRole() {
    try {
      // Check if user is admin by trying to access admin-only endpoint
      const response = await fetch(`${this.apiBaseUrl}/users/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Token verification failed or insufficient permissions');
      }

      // If admin verification successful, load sidebar counts
      this.loadSidebarCounts();

    } catch (error) {
      console.error('Authentication error:', error);
      this.clearAuthData();
      alert('You do not have admin privileges or your session has expired.');
      window.location.href = '../frontend/login.html';
    }
  }

  setupLogout() {
    // Find all logout links and buttons
    const logoutElements = document.querySelectorAll('a[href="logout.html"], .logout-btn, [data-action="logout"]');
    
    logoutElements.forEach(element => {
      element.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });
  }

  handleLogout() {
    // Show confirmation dialog
    if (confirm('Are you sure you want to logout? You will be redirected to the main login page.')) {
      this.performLogout();
    }
  }

  async performLogout() {
    try {
      // Show logout message
      this.showMessage('Logging out... Redirecting to main login page.', 'info');

      // Call logout API
      await this.makeApiCall('/auth/logout', { method: 'POST' });
      
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear authentication data
      this.clearAuthData();
      
      // Redirect after short delay to show message
      setTimeout(() => {
        window.location.href = '../frontend/login.html';
      }, 1000);
    }
  }

  clearAuthData() {
    localStorage.removeItem('skeyy_auth_token');
    localStorage.removeItem('skeyy_user_data');
    localStorage.removeItem('skeyy_admin_profile');
  }

  async loadAdminInfo() {
    try {
      // Get basic user info from token
      const userData = this.getUserFromToken();
      if (userData) {
        this.updateAdminDisplay(userData.email.split('@')[0]);
      }

      // Try to load full admin profile if available
      try {
        const profileResponse = await this.makeApiCall('/admin/profile');
        if (profileResponse.success) {
          this.adminData = profileResponse.data;
          const profile = profileResponse.data.admin?.profile;
          
          // Update display with admin name if available
          const displayName = profile?.name || profile?.full_name || userData?.email?.split('@')[0] || 'Admin';
          this.updateAdminDisplay(displayName);
          
          // Update page title if applicable
          this.updatePageTitle(displayName);
          
          // Store admin data for other components
          localStorage.setItem('skeyy_admin_profile', JSON.stringify(profileResponse.data));
        }
      } catch (profileError) {
        // Profile endpoint might not exist, use basic display
        console.log('Admin profile endpoint not available, using basic display');
        this.updateAdminDisplay(userData?.email?.split('@')[0] || 'Admin');
      }
      
    } catch (error) {
      console.error('Error loading admin info:', error);
      // Fallback to basic display
      this.updateAdminDisplay('Admin');
    }
  }

  getUserFromToken() {
    try {
      const userData = localStorage.getItem('skeyy_user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  updateAdminDisplay(displayName) {
    // Update all admin name elements
    const adminNameElements = document.querySelectorAll('.nav-up__user');
    adminNameElements.forEach(element => {
      const iconWrapper = element.querySelector('.nav-up__user-icon-wrapper');
      if (iconWrapper) {
        // Keep the icon but update the text
        element.innerHTML = '';
        element.appendChild(iconWrapper);
        element.appendChild(document.createTextNode(displayName));
      } else {
        // If no icon wrapper, just update text content
        element.textContent = displayName;
      }
    });

    // Update any other admin display elements
    const adminDisplayElements = document.querySelectorAll('.admin-name, .administrator-name');
    adminDisplayElements.forEach(element => {
      element.textContent = displayName;
    });
  }

  updatePageTitle(adminName) {
    // Update page title elements
    const pageTitleElements = document.querySelectorAll('.nav-up__current-page');
    pageTitleElements.forEach(element => {
      const currentText = element.textContent;
      if (currentText === 'Dashboard') {
        element.textContent = `${adminName} - Dashboard`;
      }
      // For other pages, we can add similar logic if needed
    });

    // Update browser title if on dashboard
    if (document.title.includes('Dashboard') || window.location.pathname.includes('index.html')) {
      document.title = `${adminName} - Admin Dashboard | Skeyy`;
    }
  }

  setupPageSpecific() {
    // Setup page-specific functionality based on current page
    const currentPage = this.getCurrentPage();
    
    switch (currentPage) {
      case 'dashboard':
        this.setupDashboardSpecific();
        break;
      case 'users':
        this.setupUsersSpecific();
        break;
      case 'products':
        this.setupProductsSpecific();
        break;
      case 'orders':
        this.setupOrdersSpecific();
        break;
      case 'coupons':
        this.setupCouponsSpecific();
        break;
      default:
        // Common setup for all pages
        break;
    }
  }

  getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('index.html') || path.endsWith('/')) return 'dashboard';
    if (path.includes('user')) return 'users';
    if (path.includes('product')) return 'products';
    if (path.includes('order')) return 'orders';
    if (path.includes('discount') || path.includes('coupon')) return 'coupons';
    return 'other';
  }

  setupDashboardSpecific() {
    // Dashboard-specific setup
    console.log('Setting up admin dashboard-specific functionality');
  }

  setupUsersSpecific() {
    // Users-specific setup
    console.log('Setting up admin users-specific functionality');
  }

  setupProductsSpecific() {
    // Products-specific setup
    console.log('Setting up admin products-specific functionality');
  }

  setupOrdersSpecific() {
    // Orders-specific setup
    console.log('Setting up admin orders-specific functionality');
  }

  setupCouponsSpecific() {
    // Coupons-specific setup
    console.log('Setting up admin coupons-specific functionality');
  }

  async makeApiCall(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      ...options
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.clearAuthData();
        window.location.href = '../frontend/login.html';
        return;
      }
      
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If we can't parse the error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'API call failed');
    }

    return data;
  }

  showMessage(message, type = 'info') {
    // Simple message display - can be enhanced with toast notifications
    console.log(`${type.toUpperCase()}: ${message}`);
    
    // You can implement a more sophisticated notification system here
    if (type === 'error') {
      alert(`Error: ${message}`);
    } else if (type === 'success') {
      // For success messages, we might want to show them differently
      console.log(`Success: ${message}`);
    } else {
      // For info messages
      console.log(`Info: ${message}`);
    }
  }

  // Utility method to get admin data
  getAdminData() {
    return this.adminData;
  }

  // Utility method to get admin name
  getAdminName() {
    const profile = this.adminData?.admin?.profile;
    return profile?.name || profile?.full_name || 'Admin';
  }

  async loadSidebarCounts() {
    try {
      // Load order statistics for sidebar navigation
      const orderResponse = await this.makeApiCall('/admin/orders/stats');

      if (orderResponse && orderResponse.success) {
        this.updateOrderCounts(orderResponse.data);
      } else {
        console.error('Failed to load order statistics');
      }
    } catch (error) {
      console.error('Error loading sidebar counts:', error);

      // Fallback: try to show 0 counts instead of leaving old values
      this.updateOrderCounts({ fulfilled: 0, unfulfilled: 0, total: 0 });
    }
  }

  updateOrderCounts(stats) {
    // Update order navigation counts using multiple selector strategies

    // Strategy 1: Update spans within the links
    const unfulfilledSpan = document.querySelector('a[href="orders-unfulfilled.html"] span');
    const fulfilledSpan = document.querySelector('a[href="orders-fulfilled.html"] span');

    if (unfulfilledSpan) {
      unfulfilledSpan.textContent = stats.unfulfilled || 0;
    }

    if (fulfilledSpan) {
      fulfilledSpan.textContent = stats.fulfilled || 0;
    }

    // Strategy 2: Update the entire link text if spans don't exist
    const unfulfilledLink = document.querySelector('a[href="orders-unfulfilled.html"]');
    const fulfilledLink = document.querySelector('a[href="orders-fulfilled.html"]');

    if (unfulfilledLink && !unfulfilledSpan) {
      unfulfilledLink.innerHTML = `Unfulfilled (${stats.unfulfilled || 0})`;
    }

    if (fulfilledLink && !fulfilledSpan) {
      fulfilledLink.innerHTML = `Fulfilled (${stats.fulfilled || 0})`;
    }

    // Strategy 3: Update by ID if available (for specific pages)
    const unfulfilledCountById = document.getElementById('unfulfilled-count');
    const fulfilledCountById = document.getElementById('fulfilled-count');

    if (unfulfilledCountById) {
      unfulfilledCountById.textContent = stats.unfulfilled || 0;
    }

    if (fulfilledCountById) {
      fulfilledCountById.textContent = stats.fulfilled || 0;
    }
  }
}

// Initialize AdminUtils when the page loads
let adminUtils;
document.addEventListener('DOMContentLoaded', () => {
  adminUtils = new AdminUtils();
});

// Export for use in other scripts
window.AdminUtils = AdminUtils;
