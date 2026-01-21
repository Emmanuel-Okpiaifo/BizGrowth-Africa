// Example usage of the MembershipForm component

import React from 'react';
import MembershipForm from './MembershipForm';
import './MembershipForm.css';

// Make sure to include Poppins font in your main HTML or CSS
// <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

function App() {
  const handleSuccess = (formData) => {
    console.log('Form submitted successfully:', formData);
    // You can add custom logic here, like:
    // - Track analytics events
    // - Show custom notifications
    // - Redirect to a thank you page
  };

  return (
    <div className="App">
      {/* Basic usage */}
      <MembershipForm />

      {/* With custom webhook and success handler */}
      <MembershipForm 
        webhookUrl="https://your-custom-webhook-url.com/endpoint"
        onSuccess={handleSuccess}
      />

      {/* Without referral card */}
      <MembershipForm 
        showReferralCard={false}
      />

      {/* Fully customized */}
      <MembershipForm 
        webhookUrl="https://your-webhook.com/endpoint"
        onSuccess={handleSuccess}
        showReferralCard={true}
        showDisclaimer={true}
      />
    </div>
  );
}

export default App;
