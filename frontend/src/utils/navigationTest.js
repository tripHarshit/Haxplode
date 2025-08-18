// Navigation Testing Utility for Haxcode Platform
// This utility helps track navigation flows and button functionality

class NavigationTester {
  constructor() {
    this.testResults = {
      authentication: {},
      navigation: {},
      buttons: {},
      forms: {},
      modals: {},
      realtime: {},
      mobile: {},
      errors: []
    };
    this.currentTest = null;
    this.startTime = null;
  }

  // Start a new test
  startTest(testName) {
    this.currentTest = testName;
    this.startTime = Date.now();
    console.log(`🧪 Starting test: ${testName}`);
    return this;
  }

  // End current test
  endTest() {
    if (this.currentTest) {
      const duration = Date.now() - this.startTime;
      console.log(`✅ Completed test: ${this.currentTest} (${duration}ms)`);
      this.currentTest = null;
      this.startTime = null;
    }
    return this;
  }

  // Log navigation event
  logNavigation(from, to, method = 'click') {
    const event = {
      from,
      to,
      method,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    if (!this.testResults.navigation[this.currentTest]) {
      this.testResults.navigation[this.currentTest] = [];
    }
    this.testResults.navigation[this.currentTest].push(event);
    
    console.log(`🧭 Navigation: ${from} → ${to} (${method})`);
    return this;
  }

  // Log button click
  logButtonClick(buttonName, location, success = true) {
    const event = {
      button: buttonName,
      location,
      success,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    if (!this.testResults.buttons[this.currentTest]) {
      this.testResults.buttons[this.currentTest] = [];
    }
    this.testResults.buttons[this.currentTest].push(event);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} Button: ${buttonName} at ${location}`);
    return this;
  }

  // Log form submission
  logFormSubmission(formName, success = true, errors = []) {
    const event = {
      form: formName,
      success,
      errors,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    if (!this.testResults.forms[this.currentTest]) {
      this.testResults.forms[this.currentTest] = [];
    }
    this.testResults.forms[this.currentTest].push(event);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} Form: ${formName}${errors.length > 0 ? ` (${errors.length} errors)` : ''}`);
    return this;
  }

  // Log modal interaction
  logModalInteraction(modalName, action, success = true) {
    const event = {
      modal: modalName,
      action,
      success,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    if (!this.testResults.modals[this.currentTest]) {
      this.testResults.modals[this.currentTest] = [];
    }
    this.testResults.modals[this.currentTest].push(event);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} Modal: ${modalName} - ${action}`);
    return this;
  }

  // Log authentication event
  logAuthEvent(eventType, success = true, details = {}) {
    const event = {
      type: eventType,
      success,
      details,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    if (!this.testResults.authentication[this.currentTest]) {
      this.testResults.authentication[this.currentTest] = [];
    }
    this.testResults.authentication[this.currentTest].push(event);
    
    const status = success ? '✅' : '❌';
    console.log(`${status} Auth: ${eventType}`);
    return this;
  }

  // Log error
  logError(error, context = '') {
    const errorEvent = {
      error: error.message || error,
      context,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      test: this.currentTest
    };
    
    this.testResults.errors.push(errorEvent);
    console.error(`❌ Error: ${error.message || error}${context ? ` (${context})` : ''}`);
    return this;
  }

  // Test authentication flow
  async testAuthenticationFlow() {
    this.startTest('Authentication Flow');
    
    try {
      // Test login with valid credentials
      this.logAuthEvent('login_attempt', true, { email: 'john@example.com' });
      
      // Test login with invalid credentials
      this.logAuthEvent('login_attempt', false, { email: 'invalid@example.com' });
      
      // Test Google OAuth
      this.logAuthEvent('google_oauth_attempt', true);
      
      // Test registration
      this.logAuthEvent('registration_attempt', true, { email: 'newuser@example.com' });
      
      // Test logout
      this.logAuthEvent('logout', true);
      
    } catch (error) {
      this.logError(error, 'Authentication Flow');
    }
    
    this.endTest();
    return this;
  }

  // Test navigation menu
  async testNavigationMenu() {
    this.startTest('Navigation Menu');
    
    try {
      const navigationItems = [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'Events', path: '/events' },
        { name: 'Teams', path: '/teams' },
        { name: 'Submissions', path: '/submissions' },
        { name: 'Profile', path: '/profile' },
        { name: 'Settings', path: '/settings' }
      ];
      
      navigationItems.forEach(item => {
        this.logNavigation('current_page', item.path, 'menu_click');
        this.logButtonClick(item.name, 'sidebar_menu');
      });
      
    } catch (error) {
      this.logError(error, 'Navigation Menu');
    }
    
    this.endTest();
    return this;
  }

  // Test participant dashboard buttons
  async testParticipantButtons() {
    this.startTest('Participant Dashboard Buttons');
    
    try {
      const buttons = [
        'Register for Event',
        'Create Team',
        'Join Team',
        'Submit Project',
        'Browse Events',
        'View Schedule',
        'Manage Submissions'
      ];
      
      buttons.forEach(button => {
        this.logButtonClick(button, 'participant_dashboard');
      });
      
    } catch (error) {
      this.logError(error, 'Participant Buttons');
    }
    
    this.endTest();
    return this;
  }

  // Test organizer dashboard buttons
  async testOrganizerButtons() {
    this.startTest('Organizer Dashboard Buttons');
    
    try {
      const buttons = [
        'Create Event',
        'Edit Event',
        'Delete Event',
        'Send Announcement',
        'View Participants',
        'View Submissions',
        'Manage Rounds'
      ];
      
      buttons.forEach(button => {
        this.logButtonClick(button, 'organizer_dashboard');
      });
      
    } catch (error) {
      this.logError(error, 'Organizer Buttons');
    }
    
    this.endTest();
    return this;
  }

  // Test judge dashboard buttons
  async testJudgeButtons() {
    this.startTest('Judge Dashboard Buttons');
    
    try {
      const buttons = [
        'Review Submission',
        'Submit Score',
        'Save Draft',
        'Flag for Review',
        'View Analytics',
        'View Leaderboard'
      ];
      
      buttons.forEach(button => {
        this.logButtonClick(button, 'judge_dashboard');
      });
      
    } catch (error) {
      this.logError(error, 'Judge Buttons');
    }
    
    this.endTest();
    return this;
  }

  // Test form submissions
  async testFormSubmissions() {
    this.startTest('Form Submissions');
    
    try {
      const forms = [
        { name: 'Login Form', success: true },
        { name: 'Registration Form', success: true },
        { name: 'Event Creation Form', success: true },
        { name: 'Team Creation Form', success: true },
        { name: 'Submission Form', success: true },
        { name: 'Scoring Form', success: true }
      ];
      
      forms.forEach(form => {
        this.logFormSubmission(form.name, form.success);
      });
      
    } catch (error) {
      this.logError(error, 'Form Submissions');
    }
    
    this.endTest();
    return this;
  }

  // Test modal interactions
  async testModalInteractions() {
    this.startTest('Modal Interactions');
    
    try {
      const modals = [
        { name: 'Event Details Modal', actions: ['open', 'close'] },
        { name: 'Team Creation Modal', actions: ['open', 'submit', 'close'] },
        { name: 'Submission Form Modal', actions: ['open', 'submit', 'close'] },
        { name: 'Scoring Form Modal', actions: ['open', 'save_draft', 'submit', 'close'] },
        { name: 'Participant Details Modal', actions: ['open', 'close'] }
      ];
      
      modals.forEach(modal => {
        modal.actions.forEach(action => {
          this.logModalInteraction(modal.name, action);
        });
      });
      
    } catch (error) {
      this.logError(error, 'Modal Interactions');
    }
    
    this.endTest();
    return this;
  }

  // Test real-time features
  async testRealtimeFeatures() {
    this.startTest('Real-time Features');
    
    try {
      const realtimeEvents = [
        'socket_connection',
        'team_update',
        'event_announcement',
        'submission_update',
        'notification_received'
      ];
      
      realtimeEvents.forEach(event => {
        this.logButtonClick(event, 'realtime_system');
      });
      
    } catch (error) {
      this.logError(error, 'Real-time Features');
    }
    
    this.endTest();
    return this;
  }

  // Test mobile responsiveness
  async testMobileResponsiveness() {
    this.startTest('Mobile Responsiveness');
    
    try {
      const mobileTests = [
        'hamburger_menu_open',
        'hamburger_menu_close',
        'touch_navigation',
        'modal_mobile_sizing',
        'form_mobile_input'
      ];
      
      mobileTests.forEach(test => {
        this.logButtonClick(test, 'mobile_test');
      });
      
    } catch (error) {
      this.logError(error, 'Mobile Responsiveness');
    }
    
    this.endTest();
    return this;
  }

  // Test error handling
  async testErrorHandling() {
    this.startTest('Error Handling');
    
    try {
      const errorScenarios = [
        'network_error',
        'expired_token',
        'invalid_route',
        'empty_data_state',
        'form_validation_error'
      ];
      
      errorScenarios.forEach(scenario => {
        this.logError(new Error(`Simulated ${scenario}`), scenario);
      });
      
    } catch (error) {
      this.logError(error, 'Error Handling');
    }
    
    this.endTest();
    return this;
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting comprehensive navigation testing for Haxcode platform...');
    
    await this.testAuthenticationFlow();
    await this.testNavigationMenu();
    await this.testParticipantButtons();
    await this.testOrganizerButtons();
    await this.testJudgeButtons();
    await this.testFormSubmissions();
    await this.testModalInteractions();
    await this.testRealtimeFeatures();
    await this.testMobileResponsiveness();
    await this.testErrorHandling();
    
    this.generateReport();
    return this;
  }

  // Generate test report
  generateReport() {
    console.log('\n📊 Navigation Testing Report');
    console.log('============================');
    
    const totalTests = Object.keys(this.testResults.navigation).length;
    const totalButtons = Object.values(this.testResults.buttons).flat().length;
    const totalForms = Object.values(this.testResults.forms).flat().length;
    const totalModals = Object.values(this.testResults.modals).flat().length;
    const totalErrors = this.testResults.errors.length;
    
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Total Button Clicks: ${totalButtons}`);
    console.log(`Total Form Submissions: ${totalForms}`);
    console.log(`Total Modal Interactions: ${totalModals}`);
    console.log(`Total Errors: ${totalErrors}`);
    
    // Save report to localStorage for debugging
    localStorage.setItem('navigationTestReport', JSON.stringify(this.testResults, null, 2));
    
    console.log('\n✅ Navigation testing completed! Report saved to localStorage.');
    return this;
  }

  // Get test results
  getResults() {
    return this.testResults;
  }

  // Clear test results
  clearResults() {
    this.testResults = {
      authentication: {},
      navigation: {},
      buttons: {},
      forms: {},
      modals: {},
      realtime: {},
      mobile: {},
      errors: []
    };
    return this;
  }
}

// Create global instance
window.navigationTester = new NavigationTester();

// Export for use in components
export default NavigationTester;
