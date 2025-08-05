# ⚙️ Skeyy Admin Panel

The administrative dashboard for the Skeyy e-commerce platform, providing comprehensive platform management, user oversight, and business analytics with enhanced security.

## 🔗 Related Repositories

- **Admin Panel**: [https://github.com/Bisam-27/skey-adminpannel](https://github.com/Bisam-27/skey-adminpannel) (This Repository)
- **Backend API**: [https://github.com/Bisam-27/skey-backend](https://github.com/Bisam-27/skey-backend)
- **Frontend Portal**: [https://github.com/Bisam-27/skey-frontend](https://github.com/Bisam-27/skey-frontend)
- **Vendor Panel**: [https://github.com/Bisam-27/skey-vendorpannel](https://github.com/Bisam-27/skey-vendorpannel)

## 📚 Documentation Links

- [Backend API Documentation](https://github.com/Bisam-27/skey-backend#readme)
- [Frontend Documentation](https://github.com/Bisam-27/skey-frontend#readme)
- [Vendor Panel Documentation](https://github.com/Bisam-27/skey-vendorpannel#readme)

## 🌟 Features

### 🔐 Admin Authentication
- **Secure Login**: Email/password authentication only
- **No Google OAuth**: Enhanced security - admin accounts cannot be created via Google OAuth
- **JWT Token Management**: Secure admin session handling
- **Role-based Access**: Full platform access and control
- **Session Security**: Enhanced security measures for admin accounts

### 👥 User Management
- **User Overview**: Complete user database management
- **User Analytics**: Registration trends and user statistics
- **Account Management**: Enable/disable user accounts
- **Role Management**: Assign and modify user roles
- **User Activity**: Monitor user behavior and activity

### 🏪 Vendor Management
- **Vendor Approval**: Review and approve vendor applications
- **Vendor Analytics**: Business performance metrics
- **Vendor Oversight**: Monitor vendor activities
- **Business Verification**: Validate vendor documentation
- **Vendor Support**: Handle vendor-related issues

### 📦 Product Oversight
- **Global Product Management**: Manage products across all vendors
- **Product Approval**: Review and approve new products
- **Category Management**: Create and manage product categories
- **Content Moderation**: Review product descriptions and images
- **Inventory Oversight**: Monitor stock levels across platform

### 📊 Order Management
- **Platform-wide Orders**: View all orders across all vendors
- **Order Analytics**: Comprehensive order statistics
- **Dispute Resolution**: Handle order-related issues
- **Fulfillment Monitoring**: Track order completion rates
- **Revenue Tracking**: Platform revenue and commission tracking

### 🎫 Coupon System
- **Global Coupons**: Create platform-wide discount codes
- **Coupon Analytics**: Track coupon usage and effectiveness
- **Vendor Coupon Oversight**: Monitor vendor-created coupons
- **Promotional Campaigns**: Manage marketing campaigns
- **Usage Analytics**: Detailed coupon performance metrics

### 📈 Platform Analytics
- **Dashboard Overview**: Key platform metrics
- **Revenue Analytics**: Platform earnings and growth
- **User Growth**: Registration and engagement trends
- **Vendor Performance**: Business success metrics
- **Market Insights**: Category and product trends

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3/SCSS, Vanilla JavaScript
- **Authentication**: JWT (Email/Password only)
- **Charts & Analytics**: Chart.js, D3.js for data visualization
- **Data Tables**: Advanced sorting, filtering, pagination
- **Responsive Design**: Desktop-focused with mobile support
- **API Integration**: RESTful backend communication
- **Security**: Enhanced admin-level security measures

## 📁 File Structure

```
admin pannel/
├── index.html              # Admin dashboard homepage
├── login.html             # Admin login (no Google OAuth)
├── users.html             # User management
├── vendors.html           # Vendor management
├── products.html          # Product oversight
├── orders.html            # Order management
├── coupons.html           # Coupon system management
├── analytics.html         # Platform analytics
├── categories.html        # Category management
├── reports.html           # Reporting dashboard
├── settings.html          # Platform settings
├── css/
│   ├── abstracts/         # SCSS variables, mixins, functions
│   ├── base/              # Base styles, typography, utilities
│   ├── components/        # Reusable UI components
│   ├── layout/            # Navigation, grid, cards
│   ├── pages/             # Page-specific styles
│   ├── main.scss          # Main SCSS file
│   ├── main.css           # Compiled CSS
│   ├── main.min.css             # Minified CSS
│   ├── dashboard.css             # Dashboard-specific styles
│   └── view-users.css           # User view styles
├── js/
│   ├── dashboard.js              # Main dashboard functionality
│   ├── admin-coupons.js          # Coupon management
│   ├── orders-fulfilled.js       # Fulfilled orders management
│   ├── orders-unfulfilled.js     # Unfulfilled orders management
│   ├── product-listing.js        # Product listing management
│   ├── product-management.js     # Product CRUD operations
│   ├── view-user.js              # Individual user view
│   └── view-users.js             # User listing management
├── img/                          # Static images and icons
├── media/
│   └── products/                 # Product images
├── index.html                    # Dashboard homepage
├── add-product.html              # Add new product
├── modify-product.html           # Modify existing product
├── select-product.html           # Product selection
├── modify-discounts.html         # Discount management
├── orders-fulfilled.html         # Fulfilled orders view
├── orders-unfulfilled.html       # Unfulfilled orders view
├── view-users.html               # User listing
└── view-user.html                # Individual user view
```

## 🎨 Design System

### Color Palette
- **Primary**: #575fcf (Purple)
- **Secondary**: #3c40c6 (Dark Purple)
- **Background**: #f6f6f6 (Light Gray)
- **Card Background**: #fff (White)
- **Text**: #333 (Dark Gray)
- **Success**: #28a745 (Green)
- **Warning**: #ffc107 (Yellow)
- **Danger**: #dc3545 (Red)

### Layout Structure
- **Grid System**: CSS Grid-based responsive layout
- **Sidebar Navigation**: Fixed left navigation panel
- **Main Content Area**: Dynamic content display
- **Top Navigation**: User info and search functionality

## 🌟 Key Features

### Dashboard Overview
- **Real-time Statistics**: Sales, orders, user metrics
- **Performance Metrics**: Growth indicators and trends
- **Quick Actions**: Direct access to common tasks
- **System Health**: Server status and alerts

### Product Management
- **Product Listing**: Paginated product catalog
- **CRUD Operations**: Create, read, update, delete products
- **Image Upload**: Multiple product image support
- **Category Management**: Organize products by categories
- **Vendor Assignment**: Multi-vendor product management
- **Inventory Tracking**: Stock level monitoring

### Order Management
- **Order Processing**: Fulfill and manage orders
- **Status Updates**: Change order status (fulfilled/unfulfilled)
- **Order Details**: Comprehensive order information
- **Customer Information**: Linked customer data
- **Payment Tracking**: Payment status and amounts
- **Shipping Management**: Delivery tracking

### User Management
- **User Listing**: All registered users
- **User Details**: Individual user profiles
- **Role Management**: User, vendor, admin roles
- **Account Status**: Active/inactive user management
- **User Statistics**: Registration and activity metrics

### Coupon Management
- **Coupon Creation**: Various discount types
- **Usage Tracking**: Coupon redemption statistics
- **Expiration Management**: Time-based coupon control
- **Vendor-specific Coupons**: Multi-tenant coupon system
- **Bulk Operations**: Mass coupon management

## 🔧 Installation & Setup

### Prerequisites
- Backend API server running
- Admin user account created
- Modern web browser

### Setup Steps

1. **Access the Admin Panel**
   ```
   http://localhost:5000/admin
   ```

2. **Authentication**
   - Login with admin credentials
   - Automatic redirection from frontend login for admin users

3. **Configuration**
   - Ensure backend API is running
   - Verify admin role permissions

## 📊 Dashboard Components

### Main Dashboard (`index.html`)
- **Sales Cards**: Today and monthly sales figures
- **Growth Indicators**: Performance trends
- **System Overview**: User, product, and order statistics
- **Navigation Counts**: Dynamic sidebar counters

### Product Management
- **Add Product (`add-product.html`)**: Create new products
- **Modify Product (`modify-product.html`)**: Edit existing products
- **Select Product (`select-product.html`)**: Product selection interface
- **Product Listing**: Comprehensive product catalog

### Order Management
- **Fulfilled Orders (`orders-fulfilled.html`)**: Completed orders
- **Unfulfilled Orders (`orders-unfulfilled.html`)**: Pending orders
- **Order Actions**: Status updates and management

### User Management
- **View Users (`view-users.html`)**: User listing with filters
- **View User (`view-user.html`)**: Individual user details
- **User Statistics**: Registration and activity data

### Discount Management
- **Modify Discounts (`modify-discounts.html`)**: Coupon management
- **Coupon Creation**: Various discount types
- **Usage Analytics**: Redemption tracking

## 🔌 API Integration

### Authentication
- **JWT Token**: Stored in localStorage
- **Role Verification**: Admin role required
- **Auto-redirect**: Non-admin users redirected to frontend

### API Endpoints Used
```javascript
// Dashboard
GET /api/admin/dashboard/stats

// Products
GET /api/admin/products
POST /api/admin/products
PUT /api/admin/products/:id
DELETE /api/admin/products/:id

// Orders
GET /api/admin/orders
GET /api/admin/orders/fulfilled
GET /api/admin/orders/unfulfilled
PUT /api/admin/orders/:id/status

// Users
GET /api/users
GET /api/users/:id
GET /api/users/stats

// Coupons
GET /api/admin/coupons
POST /api/admin/coupons
PUT /api/admin/coupons/:id
DELETE /api/admin/coupons/:id
```

## 🎯 JavaScript Modules

### Core Modules
- **`dashboard.js`**: Main dashboard functionality and authentication
- **`admin-coupons.js`**: Comprehensive coupon management
- **`product-management.js`**: Product CRUD operations
- **`product-listing.js`**: Product catalog management

### Order Management
- **`orders-fulfilled.js`**: Fulfilled order operations
- **`orders-unfulfilled.js`**: Pending order management

### User Management
- **`view-users.js`**: User listing and filtering
- **`view-user.js`**: Individual user profile management

## 🔐 Security Features

### Authentication & Authorization
- **Admin-only Access**: Role-based access control
- **Token Validation**: JWT token verification
- **Session Management**: Automatic logout on token expiry
- **Secure Redirects**: Unauthorized access handling

### Data Protection
- **Input Validation**: Client-side form validation
- **XSS Prevention**: HTML escaping for user data
- **CSRF Protection**: Token-based request validation

## 📱 Responsive Design

### Layout Adaptation
- **Desktop-first**: Optimized for admin workstations
- **Tablet Support**: Responsive grid adjustments
- **Mobile Compatibility**: Touch-friendly interface

### Grid System
- **CSS Grid**: Modern layout system
- **Flexible Columns**: Adaptive content areas
- **Responsive Navigation**: Collapsible sidebar

## 📊 Data Visualization

### Dashboard Metrics
- **Sales Charts**: Revenue visualization
- **Growth Indicators**: Performance trends
- **Statistical Cards**: Key performance indicators
- **Real-time Updates**: Live data refresh

### Analytics Features
- **Order Statistics**: Fulfillment rates
- **User Analytics**: Registration trends
- **Product Performance**: Sales metrics
- **Coupon Usage**: Redemption analytics

## 🔧 Development Guidelines

### Code Organization
- **Modular JavaScript**: Separate functionality modules
- **Class-based Architecture**: Object-oriented approach
- **Error Handling**: Comprehensive error management
- **API Abstraction**: Centralized API communication

### Best Practices
- **Progressive Enhancement**: Graceful degradation
- **Accessibility**: ARIA labels and keyboard navigation
- **Performance**: Optimized loading and rendering
- **Maintainability**: Clean, documented code

## 🚀 Performance Optimizations

### Loading Performance
- **Lazy Loading**: On-demand content loading
- **Pagination**: Large dataset management
- **Caching**: Local storage for frequently accessed data
- **Minified Assets**: Compressed CSS and JavaScript

### Runtime Performance
- **Efficient DOM Updates**: Minimal reflows
- **Event Delegation**: Optimized event handling
- **Debounced Operations**: Reduced API calls
- **Memory Management**: Proper cleanup

## 🔄 Real-time Features

### Live Updates
- **Dashboard Refresh**: Periodic data updates (5 minutes)
- **Order Notifications**: Real-time order status
- **Inventory Alerts**: Stock level warnings
- **System Status**: Health monitoring

### Interactive Features
- **Instant Search**: Real-time filtering
- **Dynamic Counters**: Live navigation updates
- **Status Changes**: Immediate feedback
- **Form Validation**: Real-time input validation

## 📞 Support & Maintenance

### Troubleshooting
- **Authentication Issues**: Check admin role and token
- **API Errors**: Verify backend server status
- **Permission Errors**: Confirm admin privileges
- **Data Loading**: Check network connectivity

### Maintenance Tasks
- **Regular Updates**: Keep dependencies current
- **Performance Monitoring**: Track loading times
- **Security Audits**: Regular security reviews
- **Backup Procedures**: Data protection measures

For technical support or admin panel issues, ensure proper admin authentication and verify backend API connectivity.
