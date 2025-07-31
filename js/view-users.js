// View Users JavaScript
class ViewUsers {
  constructor() {
    this.apiBaseUrl = 'http://localhost:5000/api';
    this.token = localStorage.getItem('skeyy_auth_token');
    this.currentPage = 1;
    this.usersPerPage = 12; // Show 12 users per page to match the grid layout
    this.init();
  }

  init() {
    // Check authentication
    this.checkAuthentication();
    
    // Load users data
    this.loadUsers();
    
    // Set up search functionality
    this.setupSearch();
    
    // Set up logout functionality
    this.setupLogout();
  }

  checkAuthentication() {
    if (!this.token) {
      window.location.href = '../frontend/login.html';
      return;
    }
  }

  async loadUsers(searchTerm = '', role = '') {
    try {
      this.showLoading();
      
      const queryParams = new URLSearchParams({
        page: this.currentPage,
        limit: this.usersPerPage,
        sortBy: 'id',
        sortOrder: 'ASC' // Show oldest users first (ascending order)
      });

      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      if (role) {
        queryParams.append('role', role);
      }

      const response = await fetch(`${this.apiBaseUrl}/users?${queryParams}`, {
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
        this.displayUsers(result.data.users);
        this.updatePagination(result.data.pagination);
      } else {
        throw new Error(result.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      this.showError('Failed to load users. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  displayUsers(users) {
    const cardsContainer = document.querySelector('.cards');
    if (!cardsContainer) return;

    if (users.length === 0) {
      cardsContainer.innerHTML = `
        <div class="no-users">
          <p>No users found.</p>
        </div>
      `;
      return;
    }

    cardsContainer.innerHTML = users.map(user => `
      <a href="view-user.html?id=${user.id}" class="cards__single cards__single--link">
        <div class="cards__title-wrapper">
          <div class="bold s">${this.escapeHtml(user.email)}</div>
          <div class="user-role user-role--${user.role}">${user.role.toUpperCase()}</div>
        </div>
        <div class="cards__item">User ID: ${user.id}</div>
        <div class="cards__item">Role: ${this.formatRole(user.role)}</div>
        <div class="cards__item">Email: ${this.escapeHtml(user.email)}</div>
        <div class="cards__item">Status: Active</div>
      </a>
    `).join('');
  }

  updatePagination(pagination) {
    // Create pagination controls if they don't exist
    let paginationContainer = document.querySelector('.pagination-container');
    if (!paginationContainer) {
      paginationContainer = document.createElement('div');
      paginationContainer.className = 'pagination-container';
      
      const discountsWrapper = document.querySelector('.discounts__wrapper');
      if (discountsWrapper) {
        discountsWrapper.appendChild(paginationContainer);
      }
    }

    if (pagination.totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    paginationContainer.innerHTML = `
      <div class="pagination">
        <button 
          class="pagination__btn ${!pagination.hasPrevPage ? 'pagination__btn--disabled' : ''}" 
          onclick="viewUsers.changePage(${pagination.currentPage - 1})"
          ${!pagination.hasPrevPage ? 'disabled' : ''}
        >
          Previous
        </button>
        
        <span class="pagination__info">
          Page ${pagination.currentPage} of ${pagination.totalPages} 
          (${pagination.totalUsers} total users)
        </span>
        
        <button 
          class="pagination__btn ${!pagination.hasNextPage ? 'pagination__btn--disabled' : ''}" 
          onclick="viewUsers.changePage(${pagination.currentPage + 1})"
          ${!pagination.hasNextPage ? 'disabled' : ''}
        >
          Next
        </button>
      </div>
    `;
  }

  changePage(page) {
    if (page < 1) return;
    this.currentPage = page;
    const searchTerm = document.getElementById('js-search')?.value || '';
    this.loadUsers(searchTerm);
  }

  setupSearch() {
    const searchForm = document.getElementById('js-search-form');
    const searchInput = document.getElementById('js-search');
    
    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.currentPage = 1; // Reset to first page when searching
        this.loadUsers(searchInput.value.trim());
      });

      // Also search on input change with debounce
      let searchTimeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.currentPage = 1;
          this.loadUsers(e.target.value.trim());
        }, 500);
      });
    }
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

  formatRole(role) {
    const roleMap = {
      'user': 'Customer',
      'admin': 'Administrator',
      'vendor': 'Vendor'
    };
    return roleMap[role] || role;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showLoading() {
    const cardsContainer = document.querySelector('.cards');
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div class="loading-container">
          <div class="loading">Loading users...</div>
        </div>
      `;
    }
  }

  hideLoading() {
    // Loading will be hidden when displayUsers is called
  }

  showError(message) {
    const cardsContainer = document.querySelector('.cards');
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div class="error-container">
          <div class="error">⚠️ ${message}</div>
          <button onclick="viewUsers.loadUsers()" class="retry-btn">Retry</button>
        </div>
      `;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.viewUsers = new ViewUsers();
});
