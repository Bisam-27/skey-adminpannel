// Admin Dashboard JavaScript
class AdminDashboard {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token'); // Use same token key as frontend
    this.init();
  }

  init() {
    // Check authentication on page load
    this.checkAuthentication();
    
    // Load dashboard data
    this.loadDashboardData();
    
    // Set up periodic refresh (every 5 minutes)
    setInterval(() => {
      this.loadDashboardData();
    }, 5 * 60 * 1000);
  }

  checkAuthentication() {
    if (!this.token) {
      // Redirect to frontend login if no token
      window.location.href = '../frontend/login.html';
      return;
    }

    // Verify token with backend and check admin role
    this.verifyToken();
  }

  async verifyToken() {
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
    } catch (error) {
      console.error('Authentication error:', error);
      localStorage.removeItem('skeyy_auth_token');
      localStorage.removeItem('skeyy_user_data');
      window.location.href = '../frontend/login.html';
    }
  }

  async loadDashboardData() {
    try {
      this.showLoading();

      // Load dashboard stats and order stats in parallel
      const [dashboardResponse, orderStatsResponse] = await Promise.all([
        fetch(`${this.apiBaseUrl}/admin/dashboard/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }),
        fetch(`${this.apiBaseUrl}/admin/orders/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (!dashboardResponse.ok) {
        throw new Error(`HTTP error! status: ${dashboardResponse.status}`);
      }

      const dashboardResult = await dashboardResponse.json();

      if (dashboardResult.success) {
        this.updateDashboard(dashboardResult.data);
      } else {
        throw new Error(dashboardResult.message || 'Failed to load dashboard data');
      }

      // Update order counts in navigation if available
      if (orderStatsResponse.ok) {
        const orderStatsResult = await orderStatsResponse.json();
        if (orderStatsResult.success) {
          this.updateNavigationOrderCounts(orderStatsResult.data);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showError('Failed to load dashboard data. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  updateDashboard(data) {
    // Update sales cards
    this.updateSalesCard('today', data.sales.today);
    this.updateSalesCard('month', data.sales.thisMonth);
    
    // Update navigation counts
    this.updateNavigationCounts(data);
    
    // Update charts section with summary
    this.updateChartsSection(data);
  }

  updateSalesCard(period, salesData) {
    if (period === 'today') {
      const todaySalesElement = document.getElementById('today-sales');
      const todayGrowthElement = document.getElementById('today-growth');

      if (todaySalesElement) {
        todaySalesElement.textContent = `₹${this.formatNumber(salesData.amount)}`;
      }

      if (todayGrowthElement) {
        todayGrowthElement.innerHTML = '&nbsp;'; // No growth calculation for today
        todayGrowthElement.className = 'dashboard__status';
      }
    } else if (period === 'month') {
      const monthSalesElement = document.getElementById('month-sales');
      const monthGrowthElement = document.getElementById('month-growth');

      if (monthSalesElement) {
        monthSalesElement.textContent = `₹${this.formatNumber(salesData.amount)}`;
      }

      if (monthGrowthElement && salesData.growthPercentage !== undefined) {
        const growth = salesData.growthPercentage || 0;
        if (growth > 0) {
          monthGrowthElement.textContent = `↑ ${growth.toFixed(1)}%`;
          monthGrowthElement.className = 'dashboard__status dashboard__status--positive';
        } else if (growth < 0) {
          monthGrowthElement.textContent = `↓ ${Math.abs(growth).toFixed(1)}%`;
          monthGrowthElement.className = 'dashboard__status dashboard__status--negative';
        } else {
          monthGrowthElement.innerHTML = '&nbsp;';
          monthGrowthElement.className = 'dashboard__status';
        }
      }
    }
  }

  updateNavigationCounts(data) {
    // Update unfulfilled orders count (using active carts as proxy)
    const unfulfilledLink = document.querySelector('a[href="orders-unfulfilled.html"]');
    if (unfulfilledLink) {
      unfulfilledLink.textContent = `Unfulfilled (${data.carts.active})`;
    }

    // Update fulfilled orders count (using checked out carts as proxy)
    const fulfilledLink = document.querySelector('a[href="orders-fulfilled.html"]');
    if (fulfilledLink) {
      fulfilledLink.textContent = `Fulfilled (${data.carts.checkedOut})`;
    }
  }

  updateChartsSection(data) {
    const chartsSection = document.getElementById('dashboard-charts');
    if (!chartsSection) return;

    chartsSection.innerHTML = `
      <div class="dashboard-summary">
        <h3>System Overview</h3>
        <div class="summary-grid">
          <div class="summary-item">
            <div class="summary-number">${data.users.total}</div>
            <div class="summary-label">Total Users</div>
            <div class="summary-breakdown">
              ${data.users.customers} Customers, ${data.users.vendors} Vendors, ${data.users.admins} Admins
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.products.total}</div>
            <div class="summary-label">Total Products</div>
            <div class="summary-breakdown">
              ${data.products.active} Active, ${data.products.lowStock} Low Stock
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.sales.thisMonth.orders}</div>
            <div class="summary-label">Orders This Month</div>
            <div class="summary-breakdown">
              ${data.sales.today.orders} Today
            </div>
          </div>
          <div class="summary-item">
            <div class="summary-number">${data.carts.total}</div>
            <div class="summary-label">Total Carts</div>
            <div class="summary-breakdown">
              ${data.carts.active} Active, ${data.carts.checkedOut} Completed
            </div>
          </div>
        </div>
        ${data.users.recent > 0 ? `<div class="recent-activity">📈 ${data.users.recent} new users in the last 30 days</div>` : ''}
      </div>
    `;
  }

  formatNumber(num) {
    if (num >= 10000000) {
      return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
      return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(0);
  }

  showLoading() {
    const chartsSection = document.querySelector('.dashboard__charts');
    if (chartsSection) {
      chartsSection.innerHTML = '<div class="loading">Loading dashboard data...</div>';
    }
  }

  hideLoading() {
    // Loading will be hidden when updateDashboard is called
  }

  showError(message) {
    const chartsSection = document.querySelector('.dashboard__charts');
    if (chartsSection) {
      chartsSection.innerHTML = `<div class="error">⚠️ ${message}</div>`;
    }
  }

  // Logout functionality
  updateNavigationOrderCounts(orderStats) {
    // Update order counts in navigation
    const unfulfilledCount = document.querySelector('a[href="orders-unfulfilled.html"] span');
    const fulfilledCount = document.querySelector('a[href="orders-fulfilled.html"] span');

    if (unfulfilledCount) {
      unfulfilledCount.textContent = orderStats.unfulfilled || 0;
    }

    if (fulfilledCount) {
      fulfilledCount.textContent = orderStats.fulfilled || 0;
    }

    // If spans don't exist, update the text content directly
    const unfulfilledLink = document.querySelector('a[href="orders-unfulfilled.html"]');
    const fulfilledLink = document.querySelector('a[href="orders-fulfilled.html"]');

    if (unfulfilledLink && !unfulfilledCount) {
      unfulfilledLink.innerHTML = `Unfulfilled (${orderStats.unfulfilled || 0})`;
    }

    if (fulfilledLink && !fulfilledCount) {
      fulfilledLink.innerHTML = `Fulfilled (${orderStats.fulfilled || 0})`;
    }
  }

  logout() {
    localStorage.removeItem('skeyy_auth_token');
    localStorage.removeItem('skeyy_user_data');
    window.location.href = '../frontend/login.html';
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
  
  // Add logout functionality to logout link
  const logoutLink = document.querySelector('a[href="logout.html"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.adminDashboard.logout();
    });
  }
});
