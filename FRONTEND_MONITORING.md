# Frontend Error Monitoring System

A comprehensive frontend error logging and monitoring system for Next.js applications with automatic error detection, reporting, and dashboard capabilities.

## Features

### 🔍 **Automatic Error Detection**

- **JavaScript Errors**: Global error handler for unhandled exceptions
- **Promise Rejections**: Catches unhandled promise rejections
- **Network Errors**: Monitors fetch requests and API failures
- **React Component Errors**: Error boundaries for component failures
- **Performance Issues**: Detects long tasks and layout shifts

### 📊 **Error Categorization**

- **Types**: JavaScript, Promise, Network, Component, Performance
- **Severity Levels**: Low, Medium, High, Critical
- **Context Capture**: URL, user agent, viewport, memory usage, network info

### 🚨 **Real-time Monitoring**

- **Automatic Logging**: Errors are logged automatically to backend
- **Critical Alerts**: Immediate notifications for critical errors
- **Offline Support**: Queue errors when offline, send when reconnected
- **Rate Limiting**: Prevents error spam

### 🛡️ **Security Integration**

- **Backend Logging**: Integrated with security logger
- **Rate Limited**: Protected API endpoints
- **User Tracking**: Optional user ID association
- **Session Tracking**: Automatic session management

## Usage

### Basic Setup

The error monitoring is automatically initialized in your app. No manual setup required!

```tsx
// Error monitoring is automatically active in your app
// through the ErrorMonitoringProvider in your root layout
```

### Manual Error Logging

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";

function MyComponent() {
  const { logError } = useErrorMonitoring();

  const handleAction = () => {
    try {
      // Some risky operation
      riskyOperation();
    } catch (error) {
      logError({
        type: "component",
        message: error.message,
        severity: "medium",
        component: "MyComponent",
        context: { action: "button_click" },
      });
    }
  };
}
```

### Component-Specific Error Logging

```tsx
import { useComponentErrorLogger } from "@/hooks/useErrorMonitoring";

function MyComponent() {
  const logComponentError = useComponentErrorLogger("MyComponent");

  const handleError = (error: Error) => {
    logComponentError(error, {
      userAction: "form_submit",
      formData: { field1: "value1" },
    });
  };
}
```

### Error Boundaries

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary
      fallback={<CustomErrorUI />}
      onError={(error, errorInfo) => {
        // Custom error handling
        console.error("Component error:", error);
      }}
    >
      <MyComponent />
    </ErrorBoundary>
  );
}
```

### Performance Error Monitoring

```tsx
import { usePerformanceErrorMonitoring } from "@/hooks/useErrorMonitoring";

function MyComponent() {
  // Automatically monitors for performance issues
  usePerformanceErrorMonitoring();

  return <div>My Component</div>;
}
```

### Error Statistics

```tsx
import { useErrorMonitoring } from "@/hooks/useErrorMonitoring";

function ErrorDashboard() {
  const { getStats, getErrors } = useErrorMonitoring();

  const stats = getStats();
  const recentErrors = getErrors({
    severity: "high",
    since: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  });

  return (
    <div>
      <h2>Error Statistics</h2>
      <p>Total: {stats.total}</p>
      <p>Critical: {stats.criticalErrors}</p>
      <p>Recent: {stats.recentCount}</p>
    </div>
  );
}
```

## API Endpoints

### POST `/api/monitoring/frontend-errors`

Receives and logs frontend errors.

**Request Body:**

```json
{
  "id": "error-id",
  "type": "javascript|promise|network|component|performance",
  "message": "Error message",
  "severity": "low|medium|high|critical",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "url": "https://example.com/page",
  "component": "ComponentName",
  "context": {
    "route": "/dashboard",
    "viewport": { "width": 1920, "height": 1080 }
  }
}
```

### GET `/api/monitoring/frontend-errors`

Retrieves logged errors with filtering options.

**Query Parameters:**

- `limit`: Number of errors to return (default: 50)
- `severity`: Filter by severity level
- `type`: Filter by error type
- `since`: ISO date string for filtering recent errors

## Demo Page

Visit `/error-monitoring` to see the error monitoring system in action with test buttons for different error types.

## Configuration

### Error Logger Settings

```typescript
// Maximum errors kept in memory
const maxErrors = 100;

// Critical error notifications
const enableNotifications = true;

// Offline retry attempts
const maxRetryAttempts = 3;
```

### Security Settings

The error monitoring respects rate limits:

- Error reporting: 30 requests per minute
- Error retrieval: 20 requests per minute

## Error Types

### JavaScript Errors

- Syntax errors
- Reference errors
- Type errors
- Range errors

### Promise Rejections

- Unhandled async/await errors
- Promise chain failures
- Network request failures

### Network Errors

- HTTP 4xx/5xx responses
- Connection timeouts
- CORS failures

### Component Errors

- React render errors
- Lifecycle method errors
- Hook errors

### Performance Issues

- Long tasks (>50ms)
- Layout shifts (>0.1)
- Memory issues

## Best Practices

1. **Don't Log Sensitive Data**: Avoid logging passwords, tokens, or personal information
2. **Use Appropriate Severity**: Reserve 'critical' for actual system failures
3. **Provide Context**: Include relevant component state and user actions
4. **Monitor Performance**: Use performance error monitoring for optimization insights
5. **Review Regularly**: Check error statistics and trends regularly

## Integration with External Services

The system can be extended to integrate with:

- Sentry
- LogRocket
- Bugsnag
- DataDog
- Custom webhook endpoints

Simply modify the `sendToBackend` method in the error logger to forward errors to your preferred service.
