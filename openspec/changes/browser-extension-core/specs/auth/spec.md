## ADDED Requirements

### Requirement: User can sign in to a FindFirst instance
The extension SHALL provide a sign-in form that authenticates the user against a configured FindFirst server. On success, the extension SHALL mark the session as authenticated in `browser.storage.local` and store the username for display. Credentials SHALL NOT be persisted in storage.

#### Scenario: Successful sign-in
- **WHEN** the user submits valid username and password on the sign-in form
- **THEN** the background service worker calls `POST /user/signin` with `Authorization: Basic base64(user:pass)` and `credentials: "include"`
- **THEN** the server responds with 200 and sets the JWT cookie
- **THEN** the extension stores `{ isAuthenticated: true, username }` in `browser.storage.local`
- **THEN** the popup transitions to the bookmark-save view

#### Scenario: Invalid credentials
- **WHEN** the user submits incorrect username or password
- **THEN** the server responds with 401
- **THEN** the extension displays an error message on the sign-in form
- **THEN** no auth state is written to storage

#### Scenario: Server unreachable
- **WHEN** the user submits sign-in credentials and the server cannot be reached
- **THEN** the extension displays a connectivity error message
- **THEN** the user remains on the sign-in form

### Requirement: User can sign out
The extension SHALL provide a sign-out action that clears the authenticated session.

#### Scenario: Sign-out clears session
- **WHEN** the user clicks the sign-out button
- **THEN** the extension removes `isAuthenticated` and `username` from `browser.storage.local`
- **THEN** the popup returns to the sign-in view on next open

### Requirement: Unauthenticated users are redirected to sign-in
The extension SHALL detect when no authenticated session exists and present the sign-in form instead of the bookmark-save UI.

#### Scenario: Extension opened without a session
- **WHEN** the user clicks the extension icon and `isAuthenticated` is false or absent in storage
- **THEN** the popup displays the sign-in form

#### Scenario: Session expired mid-use
- **WHEN** an API call returns 401 during bookmark save
- **THEN** the extension clears auth state from storage
- **THEN** the popup displays the sign-in form with a message indicating the session expired

### Requirement: Auth state is checked before every API call
The background service worker SHALL verify auth state before executing any API request and surface a session-expired error if the server returns 401.

#### Scenario: 401 on API call
- **WHEN** any API call from the background service worker receives a 401 response
- **THEN** the background clears `isAuthenticated` from storage
- **THEN** the background returns an `{ error: "session_expired" }` message to the caller
