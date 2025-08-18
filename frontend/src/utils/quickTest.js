// Quick Test Script for Haxcode Platform
// Run this in browser console: quickTest()

const quickTest = () => {
  console.log('🚀 Running Quick Haxcode Test...');
  
  const results = {
    navigation: [],
    buttons: [],
    forms: [],
    errors: []
  };

  // Test 1: Check if navigation tester is available
  if (window.navigationTester) {
    console.log('✅ Navigation tester is available');
    results.navigation.push('Navigation tester loaded');
  } else {
    console.log('❌ Navigation tester not found');
    results.errors.push('Navigation tester not loaded');
  }

  // Test 2: Check current page
  const currentPath = window.location.pathname;
  console.log(`📍 Current page: ${currentPath}`);
  results.navigation.push(`Current page: ${currentPath}`);

  // Test 3: Test basic navigation
  const testNavigation = () => {
    const originalPath = window.location.pathname;
    
    // Test navigation to login
    window.history.pushState({}, '', '/login');
    window.dispatchEvent(new PopStateEvent('popstate'));
    console.log('🧭 Navigated to /login');
    results.navigation.push('Navigated to /login');
    
    setTimeout(() => {
      // Test navigation to register
      window.history.pushState({}, '', '/register');
      window.dispatchEvent(new PopStateEvent('popstate'));
      console.log('🧭 Navigated to /register');
      results.navigation.push('Navigated to /register');
      
      setTimeout(() => {
        // Return to original path
        window.history.pushState({}, '', originalPath);
        window.dispatchEvent(new PopStateEvent('popstate'));
        console.log(`🧭 Returned to ${originalPath}`);
        results.navigation.push(`Returned to ${originalPath}`);
      }, 1000);
    }, 1000);
  };

  // Test 4: Check for interactive elements
  const testInteractiveElements = () => {
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    const forms = document.querySelectorAll('form');
    const inputs = document.querySelectorAll('input');

    console.log(`🔘 Found ${buttons.length} buttons`);
    console.log(`🔗 Found ${links.length} links`);
    console.log(`📝 Found ${forms.length} forms`);
    console.log(`⌨️ Found ${inputs.length} inputs`);

    results.buttons.push(`${buttons.length} buttons found`);
    results.forms.push(`${forms.length} forms found`);

    // Test first few buttons
    buttons.forEach((button, index) => {
      if (index < 3) {
        console.log(`🔘 Button ${index + 1}: ${button.textContent?.trim() || 'No text'}`);
        results.buttons.push(`Button ${index + 1}: ${button.textContent?.trim() || 'No text'}`);
      }
    });
  };

  // Test 5: Check for dashboard elements
  const testDashboardElements = () => {
    const cards = document.querySelectorAll('[class*="card"]');
    const stats = document.querySelectorAll('[class*="stats"]');
    const modals = document.querySelectorAll('[class*="modal"]');

    console.log(`🃏 Found ${cards.length} cards`);
    console.log(`📊 Found ${stats.length} stats elements`);
    console.log(`🪟 Found ${modals.length} modal elements`);

    results.buttons.push(`${cards.length} cards found`);
    results.buttons.push(`${stats.length} stats elements found`);
    results.buttons.push(`${modals.length} modal elements found`);
  };

  // Test 6: Check responsive design
  const testResponsiveDesign = () => {
    const isMobile = window.innerWidth < 768;
    const hamburgerMenu = document.querySelector('[class*="hamburger"], [class*="menu"]');
    
    console.log(`📱 Viewport: ${window.innerWidth}x${window.innerHeight} (${isMobile ? 'Mobile' : 'Desktop'})`);
    console.log(`🍔 Hamburger menu: ${hamburgerMenu ? 'Found' : 'Not found'}`);

    results.navigation.push(`Viewport: ${window.innerWidth}x${window.innerHeight}`);
    results.buttons.push(`Hamburger menu: ${hamburgerMenu ? 'Found' : 'Not found'}`);
  };

  // Test 7: Check for errors
  const testErrorHandling = () => {
    const errorElements = document.querySelectorAll('[class*="error"], [class*="alert"]');
    console.log(`⚠️ Found ${errorElements.length} error/alert elements`);
    results.errors.push(`${errorElements.length} error elements found`);
  };

  // Test 8: Check real-time features
  const testRealtimeFeatures = () => {
    const socket = window.socket;
    const notificationElements = document.querySelectorAll('[class*="notification"], [class*="bell"]');
    
    console.log(`🔌 Socket connection: ${socket ? 'Available' : 'Not available'}`);
    console.log(`🔔 Notification elements: ${notificationElements.length} found`);

    results.navigation.push(`Socket: ${socket ? 'Available' : 'Not available'}`);
    results.buttons.push(`Notifications: ${notificationElements.length} elements found`);
  };

  // Run all tests
  testInteractiveElements();
  testDashboardElements();
  testResponsiveDesign();
  testErrorHandling();
  testRealtimeFeatures();
  testNavigation();

  // Generate summary
  setTimeout(() => {
    console.log('\n📊 Quick Test Summary');
    console.log('====================');
    console.log(`✅ Navigation Tests: ${results.navigation.length}`);
    console.log(`✅ Button Tests: ${results.buttons.length}`);
    console.log(`✅ Form Tests: ${results.forms.length}`);
    console.log(`❌ Error Tests: ${results.errors.length}`);
    
    console.log('\n🎉 Quick test completed!');
    console.log('💡 Run simpleTestRunner.runBasicTests() for more comprehensive testing.');
    
    // Save results
    localStorage.setItem('haxcodeQuickTestResults', JSON.stringify(results, null, 2));
  }, 3000);

  return results;
};

// Make it globally available
window.quickTest = quickTest;

// Auto-run if in development
if (import.meta.env?.DEV) {
  console.log('🧪 Development mode detected - quick test available');
  console.log('💡 Run quickTest() to test basic functionality');
}

export default quickTest;
