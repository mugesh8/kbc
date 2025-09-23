# Login Modal Component

A reusable login modal component that can be used anywhere in your React application.

## Features

- ✅ **Modal Overlay**: Beautiful modal with backdrop blur
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Form Validation**: Built-in validation for email/phone and password
- ✅ **Password Toggle**: Show/hide password functionality
- ✅ **Loading States**: Loading spinner during authentication
- ✅ **Error Handling**: Displays error messages and approval dialogs
- ✅ **Success Callbacks**: Customizable success handling
- ✅ **Accessibility**: Proper focus management and keyboard navigation
- ✅ **Animations**: Smooth enter/exit animations
- ✅ **Memoized Components**: Optimized for performance

## Usage

### Basic Usage

```jsx
import React from 'react';
import LoginModal from './components/User/LoginModal';
import { useLoginModal } from './hooks/useLoginModal';

const MyComponent = () => {
  const { isLoginModalOpen, openLoginModal, closeLoginModal, handleLoginSuccess } = useLoginModal();

  return (
    <div>
      <button onClick={openLoginModal}>Open Login Modal</button>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
};
```

### Advanced Usage with Custom Success Handler

```jsx
import React from 'react';
import LoginModal from './components/User/LoginModal';
import { useLoginModal } from './hooks/useLoginModal';

const MyComponent = () => {
  const { isLoginModalOpen, openLoginModal, closeLoginModal } = useLoginModal();

  const handleCustomLoginSuccess = (result) => {
    console.log('User logged in:', result);
    // Custom logic after successful login
    // e.g., update user context, redirect, etc.
  };

  return (
    <div>
      <button onClick={openLoginModal}>Login</button>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginSuccess={handleCustomLoginSuccess}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | boolean | Yes | Controls modal visibility |
| `onClose` | function | Yes | Callback when modal should close |
| `onLoginSuccess` | function | No | Callback when login is successful |

## Hook: useLoginModal

The `useLoginModal` hook provides state management for the login modal:

```jsx
const {
  isLoginModalOpen,    // boolean - modal open state
  openLoginModal,      // function - opens the modal
  closeLoginModal,     // function - closes the modal
  handleLoginSuccess   // function - default success handler
} = useLoginModal();
```

## Features in Detail

### 1. **Smart Input Detection**
- Automatically detects if input is email or phone number
- Shows appropriate icon (Mail/Phone) based on input type
- Validates email format automatically

### 2. **Password Security**
- Toggle button to show/hide password
- Secure password input by default
- Visual feedback for password visibility

### 3. **Error Handling**
- Form validation errors
- API error messages
- Account approval status dialogs
- Network error handling

### 4. **Loading States**
- Loading spinner during authentication
- Disabled form during submission
- Visual feedback for user actions

### 5. **Responsive Design**
- Mobile-first approach
- Adapts to different screen sizes
- Touch-friendly interface

### 6. **Accessibility**
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

## Styling

The modal uses Tailwind CSS classes and can be customized by modifying the component. The design follows your existing design system with:

- Green gradient color scheme
- Rounded corners and shadows
- Smooth transitions and animations
- Consistent spacing and typography

## Integration

### With React Router
```jsx
// The modal automatically handles navigation after successful login
// It will redirect to '/home' by default
```

### With State Management
```jsx
const handleLoginSuccess = (result) => {
  // Update your global state
  dispatch(setUser(result.data));
  dispatch(setToken(result.token));
};
```

### With Custom Backend
The modal uses the same API endpoints as your existing login page:
- `POST /api/member/login`
- Expects `{ email/contact_no, password }`
- Returns `{ token, data, msg }`

## File Structure

```
src/
├── components/User/
│   ├── LoginModal.js          # Main modal component
│   └── LoginModalExample.js   # Usage example
├── hooks/
│   └── useLoginModal.js       # Modal state hook
└── components/User/
    └── SignupPage.js          # Updated with modal integration
```

## Dependencies

- React 16.8+ (hooks support)
- React Router (for navigation)
- Lucide React (for icons)
- Tailwind CSS (for styling)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Performance

- Components are memoized with `React.memo()`
- Optimized re-renders
- Minimal bundle impact
- Lazy loading ready

