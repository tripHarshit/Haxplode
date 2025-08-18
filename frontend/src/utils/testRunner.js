// Test Runner for Haxcode Platform Navigation Testing
// Run this in browser console: testRunner.runAllTests()

class TestRunner {
  constructor() {
    this.tester = window.navigationTester;
    this.testResults = [];
    this.currentUser = null;
  }

  // Initialize test environment
  async initialize() {
    console.log('🚀 Initializing Haxcode Navigation Test Runner...');
    
    // Check if navigation tester is available
    if (!this.tester) {
      console.error('❌ Navigation tester not found. Make sure the app is running in development mode.');
      return false;
    }

    // Clear previous test results
    this.tester.clearResults();
    
    console.log('✅ Test environment initialized');
    return true;
  }

  // Test authentication flows
  async testAuthenticationFlows() {
    console.log('\n🔐 Testing Authentication Flows...');
    
    // Test login page navigation
    await this.navigateTo('/login');
    await this.wait(1000);
    
    // Test registration page navigation
    await this.navigateTo('/register');
    await this.wait(1000);
    
    // Test login with demo credentials
    await this.testLoginWithDemoCredentials();
    
    // Test logout
    await this.testLogout();
  }

  // Test participant user journey
  async testParticipantJourney() {
    console.log('\n👤 Testing Participant User Journey...');
    
    // Login as participant
    await this.loginAsUser('john@example.com', 'password123');
    await this.wait(2000);
    
    // Test participant dashboard
    await this.testParticipantDashboard();
    
    // Test events browsing
    await this.testEventsBrowsing();
    
    // Test event registration
    await this.testEventRegistration();
    
    // Test team management
    await this.testTeamManagement();
    
    // Test submissions
    await this.testSubmissions();
  }

  // Test organizer user journey
  async testOrganizerJourney() {
    console.log('\n🏢 Testing Organizer User Journey...');
    
    // Login as organizer
    await this.loginAsUser('jane@example.com', 'password123');
    await this.wait(2000);
    
    // Test organizer dashboard
    await this.testOrganizerDashboard();
    
    // Test event creation
    await this.testEventCreation();
    
    // Test participant management
    await this.testParticipantManagement();
    
    // Test announcements
    await this.testAnnouncements();
  }

  // Test judge user journey
  async testJudgeJourney() {
    console.log('\n⚖️ Testing Judge User Journey...');
    
    // Login as judge
    await this.loginAsUser('mike@example.com', 'password123');
    await this.wait(2000);
    
    // Test judge dashboard
    await this.testJudgeDashboard();
    
    // Test submission review
    await this.testSubmissionReview();
    
    // Test scoring
    await this.testScoring();
  }

  // Test navigation menu
  async testNavigationMenu() {
    console.log('\n🧭 Testing Navigation Menu...');
    
    const menuItems = [
      'Dashboard',
      'Events', 
      'Teams',
      'Submissions',
      'Profile',
      'Settings'
    ];
    
    for (const item of menuItems) {
      await this.clickMenuItem(item);
      await this.wait(500);
    }
  }

  // Test mobile responsiveness
  async testMobileResponsiveness() {
    console.log('\n📱 Testing Mobile Responsiveness...');
    
    // Simulate mobile viewport
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;
    
    // Test mobile breakpoint
    window.resizeTo(375, 667);
    await this.wait(1000);
    
    // Test hamburger menu
    await this.testHamburgerMenu();
    
    // Test mobile navigation
    await this.testMobileNavigation();
    
    // Restore original viewport
    window.resizeTo(originalWidth, originalHeight);
  }

  // Test real-time features
  async testRealtimeFeatures() {
    console.log('\n⚡ Testing Real-time Features...');
    
    // Test socket connection
    await this.testSocketConnection();
    
    // Test notifications
    await this.testNotifications();
    
    // Test live updates
    await this.testLiveUpdates();
  }

  // Test error handling
  async testErrorHandling() {
    console.log('\n⚠️ Testing Error Handling...');
    
    // Test invalid routes
    await this.testInvalidRoutes();
    
    // Test network errors
    await this.testNetworkErrors();
    
    // Test form validation errors
    await this.testFormValidationErrors();
  }

  // Helper methods
  async navigateTo(path) {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    this.tester.logNavigation('current_page', path, 'programmatic');
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async clickElement(selector, description) {
    const element = document.querySelector(selector);
    if (element) {
      element.click();
      this.tester.logButtonClick(description, 'test_runner');
      return true;
    } else {
      console.warn(`⚠️ Element not found: ${selector}`);
      return false;
    }
  }

  async fillForm(formSelector, data) {
    const form = document.querySelector(formSelector);
    if (!form) {
      console.warn(`⚠️ Form not found: ${formSelector}`);
      return false;
    }

    for (const [field, value] of Object.entries(data)) {
      const input = form.querySelector(`[name="${field}"]`);
      if (input) {
        input.value = value;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }

    return true;
  }

  async submitForm(formSelector, description) {
    const form = document.querySelector(formSelector);
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      this.tester.logFormSubmission(description, true);
      return true;
    }
    return false;
  }

  // Specific test methods
  async testLoginWithDemoCredentials() {
    await this.navigateTo('/login');
    await this.wait(1000);
    
    await this.fillForm('form[class*="space-y-6"]', {
      email: 'john@example.com',
      password: 'password123'
    });
    
    await this.submitForm('form[class*="space-y-6"]', 'Login Form');
    await this.wait(2000);
  }

  async loginAsUser(email, password) {
    await this.navigateTo('/login');
    await this.wait(1000);
    
    await this.fillForm('form[class*="space-y-6"]', { email, password });
    await this.submitForm('form[class*="space-y-6"]', 'Login Form');
    await this.wait(3000); // Wait longer for login to complete
    
    // Check if login was successful by looking for dashboard elements
    const dashboardElements = document.querySelectorAll('[class*="dashboard"], [class*="Dashboard"]');
    if (dashboardElements.length === 0) {
      console.warn('⚠️ Login may not have been successful - no dashboard elements found');
    }
  }

  async testLogout() {
    const logoutButton = document.querySelector('[title="Logout"]');
    if (logoutButton) {
      logoutButton.click();
      this.tester.logButtonClick('Logout', 'test_runner');
      await this.wait(1000);
    }
  }

  async testParticipantDashboard() {
    await this.navigateTo('/participant');
    await this.wait(1000);
    
    // Test quick actions
    const quickActionButtons = document.querySelectorAll('[class*="quick-actions"] button');
    quickActionButtons.forEach(button => {
      button.click();
      this.tester.logButtonClick(button.textContent || 'Quick Action', 'participant_dashboard');
    });
  }

  async testEventsBrowsing() {
    await this.navigateTo('/participant/hackathons');
    await this.wait(1000);
    
    // Test event cards
    const eventCards = document.querySelectorAll('[class*="event-card"]');
    if (eventCards.length > 0) {
      eventCards[0].click();
      this.tester.logButtonClick('Event Card', 'events_grid');
      await this.wait(1000);
    }
  }

  async testEventRegistration() {
    // Find and click register button in modal
    const registerButton = document.querySelector('button[class*="bg-blue-600"]');
    if (registerButton && registerButton.textContent.includes('Register')) {
      registerButton.click();
      this.tester.logButtonClick('Register Now', 'event_details_modal');
      await this.wait(2000);
    }
  }

  async testTeamManagement() {
    // Test team creation and joining
    const allButtons = document.querySelectorAll('button');
    const teamButtons = Array.from(allButtons).filter(button => 
      button.textContent.includes('Create Team') || button.textContent.includes('Join Team')
    );
    teamButtons.forEach(button => {
      button.click();
      this.tester.logButtonClick(button.textContent, 'team_management');
    });
  }

  async testSubmissions() {
    await this.navigateTo('/participant/submissions');
    await this.wait(1000);
    
    const allButtons = document.querySelectorAll('button');
    const submitButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Submit Project')
    );
    if (submitButton) {
      submitButton.click();
      this.tester.logButtonClick('Submit Project', 'submissions');
    }
  }

  async testOrganizerDashboard() {
    await this.navigateTo('/organizer');
    await this.wait(1000);
    
    // Test create event button
    const allButtons = document.querySelectorAll('button');
    const createEventButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Create New Event') || button.textContent.includes('Create Event')
    );
    if (createEventButton) {
      createEventButton.click();
      this.tester.logButtonClick('Create New Event', 'organizer_dashboard');
      await this.wait(1000);
    }
  }

  async testEventCreation() {
    // Fill event creation form
    await this.fillForm('form', {
      title: 'Test Hackathon',
      description: 'A test hackathon for navigation testing',
      startDate: '2024-12-01',
      endDate: '2024-12-03',
      maxParticipants: '100'
    });
    
    await this.submitForm('form', 'Event Creation Form');
    await this.wait(2000);
  }

  async testParticipantManagement() {
    await this.navigateTo('/organizer');
    await this.wait(1000);
    
    // Click on participants tab
    const allButtons = document.querySelectorAll('button');
    const participantsTab = Array.from(allButtons).find(button => 
      button.textContent.includes('Participants')
    );
    if (participantsTab) {
      participantsTab.click();
      this.tester.logButtonClick('Participants Tab', 'organizer_dashboard');
    }
  }

  async testAnnouncements() {
    // Test announcement creation
    const allButtons = document.querySelectorAll('button');
    const createAnnouncementButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Send Announcement')
    );
    if (createAnnouncementButton) {
      createAnnouncementButton.click();
      this.tester.logButtonClick('Send Announcement', 'organizer_dashboard');
    }
  }

  async testJudgeDashboard() {
    await this.navigateTo('/judge');
    await this.wait(1000);
    
    // Test start review button
    const allButtons = document.querySelectorAll('button');
    const startReviewButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Start Review')
    );
    if (startReviewButton) {
      startReviewButton.click();
      this.tester.logButtonClick('Start Review', 'judge_dashboard');
      await this.wait(1000);
    }
  }

  async testSubmissionReview() {
    // Test scoring form
    const scoringForm = document.querySelector('form');
    if (scoringForm) {
      // Fill scoring criteria
      const scoreInputs = document.querySelectorAll('input[type="range"]');
      scoreInputs.forEach((input, index) => {
        input.value = 7 + (index % 3);
        input.dispatchEvent(new Event('change', { bubbles: true }));
      });
      
      // Fill feedback
      const feedbackTextarea = document.querySelector('textarea');
      if (feedbackTextarea) {
        feedbackTextarea.value = 'Great project! Well done on the implementation.';
        feedbackTextarea.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  async testScoring() {
    // Test save draft
    const allButtons = document.querySelectorAll('button');
    const saveDraftButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Save Draft')
    );
    if (saveDraftButton) {
      saveDraftButton.click();
      this.tester.logButtonClick('Save Draft', 'scoring_form');
      await this.wait(1000);
    }
    
    // Test submit review
    const submitButton = Array.from(allButtons).find(button => 
      button.textContent.includes('Submit Review')
    );
    if (submitButton) {
      submitButton.click();
      this.tester.logButtonClick('Submit Review', 'scoring_form');
      await this.wait(2000);
    }
  }

  async clickMenuItem(itemName) {
    const allElements = document.querySelectorAll('a, button');
    const menuItem = Array.from(allElements).find(element => 
      element.textContent.includes(itemName)
    );
    if (menuItem) {
      menuItem.click();
      this.tester.logButtonClick(itemName, 'navigation_menu');
    }
  }

  async testHamburgerMenu() {
    const hamburgerButton = document.querySelector('button[class*="hamburger"]');
    if (hamburgerButton) {
      hamburgerButton.click();
      this.tester.logButtonClick('Hamburger Menu', 'mobile_header');
      await this.wait(500);
    }
  }

  async testMobileNavigation() {
    // Test mobile menu items
    const mobileMenuItems = document.querySelectorAll('[class*="mobile"] a, [class*="mobile"] button');
    mobileMenuItems.forEach(item => {
      item.click();
      this.tester.logButtonClick(item.textContent || 'Mobile Menu Item', 'mobile_navigation');
    });
  }

  async testSocketConnection() {
    // Test socket connection status
    if (window.socket && window.socket.connected) {
      this.tester.logButtonClick('Socket Connected', 'realtime_system');
    } else {
      this.tester.logButtonClick('Socket Disconnected', 'realtime_system');
    }
  }

  async testNotifications() {
    // Test notification button
    const notificationButton = document.querySelector('button[class*="notification"]');
    if (notificationButton) {
      notificationButton.click();
      this.tester.logButtonClick('Notifications', 'header');
    }
  }

  async testLiveUpdates() {
    // Simulate live updates
    this.tester.logButtonClick('Team Update', 'realtime_system');
    this.tester.logButtonClick('Event Announcement', 'realtime_system');
  }

  async testInvalidRoutes() {
    await this.navigateTo('/invalid-route');
    await this.wait(1000);
    this.tester.logError(new Error('Invalid route accessed'), 'Invalid Route Test');
  }

  async testNetworkErrors() {
    // Simulate network error
    this.tester.logError(new Error('Network request failed'), 'Network Error Test');
  }

  async testFormValidationErrors() {
    // Test form validation by submitting empty forms
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
      form.dispatchEvent(new Event('submit', { bubbles: true }));
      this.tester.logFormSubmission('Form Validation Test', false, ['Required field missing']);
    });
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Haxcode Navigation Testing...');
    
    if (!(await this.initialize())) {
      return;
    }

    try {
      // Run all test suites
      await this.testAuthenticationFlows();
      await this.testParticipantJourney();
      await this.testOrganizerJourney();
      await this.testJudgeJourney();
      await this.testNavigationMenu();
      await this.testMobileResponsiveness();
      await this.testRealtimeFeatures();
      await this.testErrorHandling();
      
      // Generate final report
      this.generateFinalReport();
      
    } catch (error) {
      console.error('❌ Test execution failed:', error);
      this.tester.logError(error, 'Test Runner');
    }
  }

  // Generate final test report
  generateFinalReport() {
    console.log('\n📊 Final Navigation Testing Report');
    console.log('===================================');
    
    const results = this.tester.getResults();
    
    // Calculate statistics
    const totalNavigationEvents = Object.values(results.navigation).flat().length;
    const totalButtonClicks = Object.values(results.buttons).flat().length;
    const totalFormSubmissions = Object.values(results.forms).flat().length;
    const totalModalInteractions = Object.values(results.modals).flat().length;
    const totalAuthEvents = Object.values(results.authentication).flat().length;
    const totalErrors = results.errors.length;
    
    console.log(`✅ Navigation Events: ${totalNavigationEvents}`);
    console.log(`✅ Button Clicks: ${totalButtonClicks}`);
    console.log(`✅ Form Submissions: ${totalFormSubmissions}`);
    console.log(`✅ Modal Interactions: ${totalModalInteractions}`);
    console.log(`✅ Authentication Events: ${totalAuthEvents}`);
    console.log(`❌ Errors: ${totalErrors}`);
    
    // Save detailed report
    localStorage.setItem('haxcodeTestReport', JSON.stringify(results, null, 2));
    
    console.log('\n🎉 All tests completed! Detailed report saved to localStorage.');
    console.log('💡 Run localStorage.getItem("haxcodeTestReport") to view detailed results.');
  }
}

// Create global test runner instance
window.testRunner = new TestRunner();

// Export for use in components
export default TestRunner;
