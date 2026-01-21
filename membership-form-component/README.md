# BizGrowth Africa Membership Form Component

A reusable React component for the BizGrowth Africa membership signup form with all styles, animations, and functionality included.

## Features

- ✅ Complete form with validation
- ✅ Scroll animations using Intersection Observer
- ✅ Referral link sharing functionality
- ✅ Success modal with premium styling
- ✅ Google Sheets integration via webhook
- ✅ User ID and referral tracking
- ✅ Responsive design
- ✅ Accessible and keyboard-friendly
- ✅ Dark mode support

## Installation

```bash
# Copy the membership-form-component folder to your React project
# Then import it in your component
```

### Font Setup

The component uses the Poppins font. Make sure to include it in your HTML:

```html
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

Or import it in your CSS:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
```

## Usage

### Basic Usage

```jsx
import MembershipForm from './membership-form-component/MembershipForm';
import './membership-form-component/MembershipForm.css';

function App() {
  return (
    <div>
      <MembershipForm />
    </div>
  );
}
```

### With Custom Webhook URL

```jsx
<MembershipForm 
  webhookUrl="https://your-webhook-url.com/endpoint"
/>
```

### With Custom Success Handler

```jsx
<MembershipForm 
  onSuccess={(data) => {
    console.log('Form submitted:', data);
    // Your custom logic here
  }}
/>
```

### Hide Referral Card or Disclaimer

```jsx
<MembershipForm 
  showReferralCard={false}
  showDisclaimer={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `webhookUrl` | `string` | `'https://script.google.com/macros/s/...'` | Google Sheets webhook URL for form submissions |
| `onSuccess` | `function` | `undefined` | Callback function called after successful form submission |
| `showReferralCard` | `boolean` | `true` | Show/hide the referral card section |
| `showDisclaimer` | `boolean` | `true` | Show/hide the disclaimer text |

## Form Fields

The form includes the following fields:

- **First Name** (required)
- **Last Name** (required)
- **Phone Number** (required)
- **Email** (required)
- **Country** (required)
- **Interest** (required dropdown):
  - Tenders & procurement
  - Grants & fellowships
  - Business news & insights
  - All of the above

## Features Explained

### Scroll Animations

The component uses Intersection Observer API to animate elements as they scroll into view. Elements with the `animate-on-scroll` class will fade in and slide up when they become visible.

### Referral System

The component automatically:
- Generates a unique user ID (stored in localStorage)
- Tracks referrer IDs from URL parameters (`?ref=...`)
- Allows users to copy their referral link
- Includes referral data in form submissions

### Success Modal

After form submission, a premium-styled modal appears with a success message. The modal can be closed by clicking the overlay or the close button.

### Google Sheets Integration

Form submissions are sent to a Google Sheets webhook URL. The payload includes:
- Form data (name, email, phone, etc.)
- User ID and referrer ID
- Timestamp
- User agent and browser information
- Current page URL

## Styling

The component includes all necessary CSS. The styles are scoped to the component and include:

- Responsive design for mobile, tablet, and desktop
- Smooth animations and transitions
- Dark mode support (via media queries)
- Reduced motion support for accessibility

### Custom Styling

You can override styles by targeting the component classes:

```css
.membership-form-wrapper .submit-button {
  /* Your custom styles */
}
```

## Dependencies

- React 16.8+ (for hooks)
- No other external dependencies required

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT
