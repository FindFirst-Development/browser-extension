## ADDED Requirements

### Requirement: Popup pre-fills current tab's title and URL
When the user opens the popup on a normal web page, the extension SHALL pre-fill the bookmark title with the active tab's document title and the URL with the tab's URL.

#### Scenario: Popup opened on a standard page
- **WHEN** the user clicks the extension icon on a standard `http(s)://` page
- **THEN** the popup's title field is populated with the tab's `document.title`
- **THEN** the popup's URL field is populated with the tab's URL
- **THEN** the user can edit both fields before saving

#### Scenario: Popup opened on a browser internal page
- **WHEN** the user clicks the extension icon on a `chrome://`, `about:`, or `moz-extension://` page
- **THEN** the popup shows an empty form with a placeholder message indicating the page cannot be bookmarked

### Requirement: User can save the current page as a bookmark
The extension popup SHALL allow the user to save the current page to FindFirst with an optional set of tags.

#### Scenario: Successful bookmark save
- **WHEN** the user submits the popup form with a valid title, URL, and zero or more tags
- **THEN** the background service worker calls `POST /api/bookmark` with `{ url, title, tags: [tagName, ...] }`
- **THEN** the server responds with 201
- **THEN** the popup displays a success confirmation message
- **THEN** the form is cleared after 1.5 seconds and returns to ready state

#### Scenario: Save with duplicate URL
- **WHEN** the user saves a URL that already exists in FindFirst
- **THEN** the server responds with an appropriate error (4xx)
- **THEN** the popup displays an error message indicating the bookmark already exists

#### Scenario: Save fails due to network error
- **WHEN** the API call to save the bookmark fails due to a network error
- **THEN** the popup displays an error message
- **THEN** the form data is preserved so the user can retry

#### Scenario: Save attempted while unauthenticated
- **WHEN** the user submits the save form and the session is expired
- **THEN** the popup transitions to the sign-in form with a session-expired notice

### Requirement: Right-click context menu saves a page or link
The extension SHALL register a context menu item that allows saving the current page or a selected link to FindFirst without opening the popup.

#### Scenario: Context menu on a link
- **WHEN** the user right-clicks a hyperlink and selects "Save to FindFirst"
- **THEN** the extension saves the link's `href` as the URL and the link's text as the title (if non-empty) or the href as the title
- **THEN** a browser notification confirms the save or reports an error

#### Scenario: Context menu on the page (no link selected)
- **WHEN** the user right-clicks on a page background and selects "Save to FindFirst"
- **THEN** the extension saves the active tab's URL and title
- **THEN** a browser notification confirms the save or reports an error

#### Scenario: Context menu save while unauthenticated
- **WHEN** the user uses the context menu to save and no session exists
- **THEN** the extension shows a browser notification instructing the user to sign in via the extension popup

### Requirement: Save button is disabled during in-flight request
The extension SHALL prevent duplicate submissions while a save request is in progress.

#### Scenario: Submit button state during save
- **WHEN** the user clicks the save button and the request is in flight
- **THEN** the save button is disabled and shows a loading indicator
- **THEN** the button returns to its normal state after the request completes (success or error)
