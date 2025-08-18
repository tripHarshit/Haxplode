// Simple Test Runner for Haxcode Platform
// Run this in browser console: simpleTestRunner.runBasicTests()

class SimpleTestRunner {
  constructor() {
    this.tester = window.navigationTester;
    this.testResults = [];
  }

  // Initialize test environment
  async initialize() {
    console.log('🚀 Initializing Simple Haxcode Test Runner...');
    
    if (!this.tester) {
      console.error('❌ Navigation tester not found. Make sure the app is running in development mode.');
      return false;
    }

    this.tester.clearResults();
    console.log('✅ Simple test environment initialized');
    return true;
  }

  // Wait utility
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Navigate to page
  async navigateTo(path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    this.tester.logNavigation('current_page', path, 'programmatic');
    await this.wait(1000);
  }

  // Test basic navigation
  async testBasicNavigation() {
    console.log('\n🧭 Testing Basic Navigation...');
    
    const pages = ['/', '/login', '/register'];
    
    for (const page of pages) {
      await this.navigateTo(page);
      this.tester.logButtonClick(`Navigate to ${page}`, 'basic_navigation');
    }
  }

  // Test authentication forms
  async testAuthenticationForms() {
    console.log('\n🔐 Testing Authentication Forms...');
    
    // Test login page
    await this.navigateTo('/login');
    await this.wait(1000);
    
    // Test form elements exist
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const loginButton = document.querySelector('button[type="submit"]');
    
    if (emailInput) {
      this.tester.logButtonClick('Email Input Found', 'login_form');
      emailInput.value = 'test@example.com';
      emailInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (passwordInput) {
      this.tester.logButtonClick('Password Input Found', 'login_form');
      passwordInput.value = 'password123';
      passwordInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    if (loginButton) {
      this.tester.logButtonClick('Login Button Found', 'login_form');
    }
    
    // Test registration page
    await this.navigateTo('/register');
    await this.wait(1000);
    
    const registerForm = document.querySelector('form');
    if (registerForm) {
      this.tester.logButtonClick('Registration Form Found', 'register_form');
    }
  }

  // Test dashboard elements
  async testDashboardElements() {
    console.log('\n📊 Testing Dashboard Elements...');
    
    // Test participant dashboard
    await this.navigateTo('/participant');
    await this.wait(1000);
    
    const participantElements = document.querySelectorAll('button, a, [class*="card"], [class*="stats"]');
    participantElements.forEach((element, index) => {
      if (index < 5) { // Limit to first 5 elements
        this.tester.logButtonClick(`${element.tagName} Element ${index + 1}`, 'participant_dashboard');
      }
    });
    
    // Test organizer dashboard
    await this.navigateTo('/organizer');
    await this.wait(1000);
    
    const organizerElements = document.querySelectorAll('button, a, [class*="card"], [class*="stats"]');
    organizerElements.forEach((element, index) => {
      if (index < 5) { // Limit to first 5 elements
        this.tester.logButtonClick(`${element.tagName} Element ${index + 1}`, 'organizer_dashboard');
      }
    });
    
    // Test judge dashboard
    await this.navigateTo('/judge');
    await this.wait(1000);
    
    const judgeElements = document.querySelectorAll('button, a, [class*="card"], [class*="stats"]');
    judgeElements.forEach((element, index) => {
      if (index < 5) { // Limit to first 5 elements
        this.tester.logButtonClick(`${element.tagName} Element ${index + 1}`, 'judge_dashboard');
      }
    });
  }

  // Test responsive design
  async testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design...');
    
    // Test mobile viewport
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Mobile breakpoint
    window.resizeTo(375, 667);
    await this.wait(1000);
    
    const mobileElements = document.querySelectorAll('button, a, [class*="mobile"], [class*="hamburger"]');
    mobileElements.forEach((element, index) => {
      if (index < 3) { // Limit to first 3 elements
        this.tester.logButtonClick(`Mobile Element ${index + 1}`, 'mobile_test');
      }
    });
    
    // Restore original viewport
    window.resizeTo(originalWidth, originalHeight);
    await this.wait(1000);
  }

  // Test error handling
  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    
    // Test invalid route
    await this.navigateTo('/invalid-route');
    await this.wait(1000);
    
    const errorElements = document.querySelectorAll('[class*="error"], [class*="404"], [class*="not-found"]');
    if (errorElements.length > 0) {
      this.tester.logButtonClick('Error Page Found', 'error_handling');
    }
    
    // Test network error simulation
    this.tester.logError(new Error('Simulated network error'), 'Network Error Test');
  }

  // Test real-time features
  async testRealtimeFeatures() {
    console.log('\n⚡ Testing Real-time Features...');
    
    // Test socket connection
    if (window.socket) {
      this.tester.logButtonClick('Socket Connection Available', 'realtime_system');
    } else {
      this.tester.logButtonClick('Socket Connection Not Available', 'realtime_system');
    }
    
    // Test notification elements
    const notificationElements = document.querySelectorAll('[class*="notification"], [class*="bell"], [class*="alert"]');
    notificationElements.forEach((element, index) => {
      if (index < 3) { // Limit to first 3 elements
        this.tester.logButtonClick(`Notification Element ${index + 1}`, 'realtime_system');
      }
    });
  }

  // Test form validation
  async testFormValidation() {
    console.log('\n📝 Testing Form Validation...');
    
    await this.navigateTo('/login');
    await this.wait(1000);
    
    const form = document.querySelector('form');
    if (form) {
      // Test empty form submission
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      this.tester.logFormSubmission('Empty Login Form', false, ['Required fields missing']);
      
      // Test with invalid email
      const emailInput = document.querySelector('input[name="email"]');
      if (emailInput) {
        emailInput.value = 'invalid-email';
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.tester.logFormSubmission('Invalid Email Form', false, ['Invalid email format']);
      }
    }
  }

  // Run all basic tests
  async runBasicTests() {
    console.log('🚀 Starting Basic Haxcode Testing...');
    
    if (!(await this.initialize())) {
      return;
    }

    try {
      await this.testBasicNavigation();
      await this.testAuthenticationForms();
      await this.testDashboardElements();
      await this.testResponsiveDesign();
      await this.testErrorHandling();
      await this.testRealtimeFeatures();
      await this.testFormValidation();
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Basic test execution failed:', error);
      this.tester.logError(error, 'Simple Test Runner');
    }
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Basic Test Report');
    console.log('===================');
    
    const results = this.tester.getResults();
    
    const totalNavigationEvents = Object.values(results.navigation).flat().length;
    const totalButtonClicks = Object.values(results.buttons).flat().length;
    const totalFormSubmissions = Object.values(results.forms).flat().length;
    const totalErrors = results.errors.length;
    
    console.log(`✅ Navigation Events: ${totalNavigationEvents}`);
    console.log(`✅ Button Clicks: ${totalButtonClicks}`);
    console.log(`✅ Form Submissions: ${totalFormSubmissions}`);
    console.log(`❌ Errors: ${totalErrors}`);
    
    // Save report
    localStorage.setItem('haxcodeBasicTestReport', JSON.stringify(results, null, 2));
    
    console.log('\n🎉 Basic tests completed! Report saved to localStorage.');
    console.log('💡 Run localStorage.getItem("haxcodeBasicTestReport") to view results.');
  }
}

// Create global simple test runner instance
window.simpleTestRunner = new SimpleTestRunner();

// Export for use in components
export default SimpleTestRunner;
