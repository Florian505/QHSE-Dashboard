# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a German QHSE (Quality, Health, Safety, Environment) Management System for Hoffmann & Voss GmbH, built as a single-page web application. The system provides role-based access control for managing quality, safety, environmental, and health documentation across different organizational levels.

## Tech Stack & Architecture

- **Frontend**: Vanilla HTML5, CSS3, and JavaScript (ES6+)
- **Storage**: LocalStorage for data persistence (client-side only)
- **Styling**: Custom CSS with CSS Grid/Flexbox, Google Fonts (Inter), Font Awesome icons
- **Language**: German UI with extensive internationalization

## Key Architecture Components

### Role-Based Access Control (RBAC)
The system implements a hierarchical user role system:
- `root-admin`: Full system access, user management
- `admin`: Administrative access, user management 
- `geschaeftsfuehrung`: Management level access
- `betriebsleiter`: Operations management
- `abteilungsleiter`: Department management
- `qhse`: QHSE specialist (staff position)
- `mitarbeiter`: Regular employee access
- `techniker`: Maintenance technician with machine management access

Each role has specific `allowedSections` defined in `script.js:roleDefinitions`.

### Dynamic Area Management
The system supports custom areas beyond the default QHSE categories (Arbeitsschutz, Qualität, Umwelt, Datenschutz, Gesundheit). Areas are stored in localStorage and dynamically added to the navigation menu.

### Document Management System
- File upload with drag-and-drop support
- Document categorization by area
- Revision history tracking
- File preview capabilities (images, PDFs)
- Role-based document visibility

### Digital Time Tracking System
- Individual employee time entry with date, start/end times, breaks
- Automatic calculation of net working hours
- Monthly overview with statistics (total hours, working days, overtime)
- Edit and delete functionality for personal entries
- Admin evaluation interface with filtering by employee, month, and department
- Comprehensive reporting with overtime calculations
- Role-based access (employees see only own data, admins see all)

### Maintenance Management System
- Machine registration and management with status tracking
- Department-based machine organization
- Real-time status monitoring (In Betrieb, Wartung, Störung, Außer Betrieb)
- Maintenance planning with calendar view and task scheduling
- Issue reporting system with priority levels and photo upload
- Status tracking for maintenance issues (Offen, In Bearbeitung, Behoben)
- KPI dashboard with MTBF, MTTR, and availability calculations
- Comprehensive analytics and reporting
- Role-based access (technicians can manage machines, supervisors can view reports)

### Data Persistence
All data is stored in localStorage with these keys:
- `qhse_documents`: Document storage with revisions
- `qhse_users`: User accounts and profiles  
- `qhse_areas`: Custom areas configuration
- `qhse_departments`: Organizational departments
- `qhse_company_name`: Editable company name
- `qhse_dashboard_name`: Customizable dashboard label
- `qhse_time_entries`: Employee time tracking data
- `qhse_machines`: Machine inventory and status data
- `qhse_maintenance_tasks`: Maintenance scheduling and tasks
- `qhse_issues`: Issue tracking and resolution data

## File Structure

- `index.html`: Complete single-page application structure with all sections and modals
- `script.js`: Core JavaScript class `QHSEDashboard` handling all functionality
- `styles.css`: Comprehensive styling with responsive design and role-based visibility

## Key JavaScript Patterns

### Main Class Structure
```javascript
class QHSEDashboard {
    constructor() {
        // Initialize data from localStorage
        // Setup default users, areas, departments
    }
    
    init() {
        // Setup all event listeners and UI components
    }
}
```

### Navigation System
Navigation uses `data-section` attributes to show/hide content sections. Access control is enforced through the `updateMenuVisibility()` method.

### Modal Management
Multiple modals for document preview, user management, area management, and department management. All use consistent styling and event handling patterns.

## Development Practices

### Data Management
- Always check user permissions before showing UI elements
- Use `getCurrentUser()` to get current user context
- Save to localStorage immediately after data changes
- Populate dropdowns dynamically based on current data

### UI State Management
- Use CSS classes `.active`, `.hidden` for show/hide
- Update page title and breadcrumbs on navigation
- Maintain current section state in `this.currentSection`

### Error Handling
- Use `confirm()` dialogs for destructive actions
- Show `alert()` for user feedback
- Graceful fallbacks for missing data

## Common Development Tasks

### Adding New User Roles
1. Update `roleDefinitions` in script.js
2. Add role to default users if needed
3. Update CSS role-based styling
4. Test access control and navigation

### Adding New Areas
Areas are created through the UI, but to add default areas, modify `initializeDefaultAreas()` in script.js.

### Modifying Document Categories
Document categories are tied to areas. Use the area management system to control available categories.

### Customizing UI Labels
The system supports customizable labels for key UI elements:
- Company name: Managed via settings page and localStorage key `qhse_company_name`
- Dashboard name: Managed via settings page and localStorage key `qhse_dashboard_name`
- Labels are loaded on startup via `loadCustomLabels()` method

### Internationalization Notes
All text is in German. When adding new features, maintain consistent German terminology and formatting (e.g., date format: DD.MM.YYYY).

## Testing Approach

The application uses localStorage, so testing involves:
1. Clear localStorage to reset to default state
2. Test role switching via the user dropdown
3. Verify access control by switching between different user roles
4. Test file upload with various file types
5. Verify modal interactions and form submissions

## Browser Compatibility

Targets modern browsers with ES6+ support. Uses:
- CSS Grid and Flexbox
- LocalStorage API
- FileReader API for file uploads
- Modern JavaScript features (const/let, arrow functions, template literals)

## Deployment

The project is deployed on **Vercel** and automatically deployed from the **master branch**.

### Deployment Process
1. **Development**: Make changes locally and test thoroughly
2. **Commit**: Create meaningful commits with descriptive messages
3. **Push to Master**: Push changes to the master branch to trigger automatic deployment
   ```bash
   git add .
   git commit -m "Your descriptive commit message"
   git push origin master
   ```
4. **Automatic Deploy**: Vercel automatically detects the push to master and deploys the updated application
5. **Live Update**: Changes are live within minutes of pushing to master

### Git Authentication
If you encounter authentication issues when pushing, use one of these methods:

#### Option 1: Personal Access Token (Recommended)
```bash
git push https://USERNAME:YOUR_TOKEN@github.com/Florian505/QHSE-Dashboard.git master
```
- Replace `USERNAME` with your GitHub username (e.g., `QHSE`)
- Replace `YOUR_TOKEN` with your GitHub Personal Access Token
- **Note**: Store your actual token securely outside of version control

#### Option 2: Store Credentials
```bash
git config credential.helper store
git push origin master
# Enter your username and Personal Access Token when prompted
```

#### Option 3: SSH Key
```bash
git remote set-url origin git@github.com:Florian505/QHSE-Dashboard.git
git push origin master
```

#### Creating a Personal Access Token
1. Go to GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "QHSE Dashboard Deploy")
4. Set expiration (e.g., 90 days)
5. Select "repo" scope (Full control of private repositories)
6. Click "Generate token"
7. Copy the token (it's only shown once)

**Security Note**: Never commit tokens or credentials to the repository. Regenerate tokens periodically for security.

### Deployment Configuration
- **Platform**: Vercel
- **Branch**: master (automatic deployment)
- **Build Command**: None required (static files)
- **Output Directory**: Root directory (index.html, script.js, styles.css)

### Important Notes
- **Only push to master when ready for production** - all changes go live immediately
- Test all functionality locally before pushing
- Use meaningful commit messages for better change tracking
- The application is client-side only, so no server-side deployment configuration is needed

### Vercel Features Used
- Automatic deployments from GitHub master branch
- Global CDN for fast loading times
- HTTPS by default
- Custom domain support (if configured)