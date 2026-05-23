## ADDED Requirements

### Requirement: User can configure the FindFirst server URL
The extension SHALL provide an options page where the user can enter the base URL of their FindFirst server. The URL SHALL be persisted in `browser.storage.local` and used for all API calls.

#### Scenario: Setting the server URL for the first time
- **WHEN** the user opens the options page and no server URL is configured
- **THEN** the URL input is empty with placeholder text showing the default (e.g., `http://localhost:8080`)
- **WHEN** the user enters a valid URL and saves
- **THEN** the URL is stored in `browser.storage.local` under key `serverUrl`
- **THEN** a success message is shown

#### Scenario: Updating an existing server URL
- **WHEN** the user opens the options page and a server URL is already configured
- **THEN** the URL input is pre-populated with the stored URL
- **WHEN** the user changes the URL and saves
- **THEN** the new URL is stored and auth state is cleared (forcing re-login)
- **THEN** the options page shows a message indicating re-authentication is required

#### Scenario: Invalid URL format
- **WHEN** the user enters a value that is not a valid HTTP or HTTPS URL and tries to save
- **THEN** an inline validation error is shown
- **THEN** the value is NOT saved to storage

### Requirement: Options page shows connection status
The options page SHALL display the current connection status to the configured FindFirst server.

#### Scenario: Connected and authenticated
- **WHEN** the options page loads and the user is authenticated
- **THEN** the page shows a green status indicator with the logged-in username

#### Scenario: Server reachable but not authenticated
- **WHEN** the options page loads, the server is reachable, but `isAuthenticated` is false
- **THEN** the page shows a yellow status indicator with message "Not signed in"

#### Scenario: Server unreachable
- **WHEN** the options page loads and the configured server URL does not respond
- **THEN** the page shows a red status indicator with message "Cannot reach server"

### Requirement: Default server URL is used when none is configured
If no server URL has been set by the user, the extension SHALL fall back to `http://localhost:8080` as the default base URL for all API calls.

#### Scenario: API call with no configured server URL
- **WHEN** any API call is made and `serverUrl` is absent from storage
- **THEN** the call uses `http://localhost:8080` as the base URL

### Requirement: Options page is accessible from the popup
The popup SHALL include a link or gear icon that opens the extension's options page.

#### Scenario: Navigating to options from popup
- **WHEN** the user clicks the settings icon in the popup
- **THEN** the extension opens the options page (via `browser.runtime.openOptionsPage()`)
