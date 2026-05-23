## ADDED Requirements

### Requirement: Existing tags are offered as autocomplete suggestions
When the user types in the tag input field, the extension SHALL offer matching tags from the user's FindFirst account as autocomplete suggestions.

#### Scenario: Autocomplete on keystroke
- **WHEN** the user types one or more characters in the tag input
- **THEN** the extension filters the cached tag list and displays matching suggestions in a dropdown
- **THEN** suggestions are matched case-insensitively against the prefix typed

#### Scenario: No matching tags
- **WHEN** the user types text that matches no existing tags
- **THEN** no autocomplete dropdown is shown (the typed value will be created as a new tag on save)

#### Scenario: User selects an autocomplete suggestion
- **WHEN** the user clicks or keyboard-selects a suggestion from the dropdown
- **THEN** the tag is added to the pending tag list and the input is cleared
- **THEN** the dropdown closes

### Requirement: Tag list is fetched and cached on popup open
The extension SHALL fetch the user's tags from `GET /api/tags` when the popup opens and cache them in memory for the lifetime of that popup session.

#### Scenario: Tags fetched successfully
- **WHEN** the popup opens for an authenticated user
- **THEN** the background service worker calls `GET /api/tags`
- **THEN** the tag list is available for autocomplete without an additional network round-trip

#### Scenario: Tag fetch fails
- **WHEN** `GET /api/tags` returns an error or times out
- **THEN** the popup proceeds without autocomplete (user can still type free-form tags)
- **THEN** no error is surfaced to the user for this non-critical failure

### Requirement: User can add a new tag not yet in FindFirst
When the user types a tag name that does not exist in their account, submitting the bookmark SHALL create the tag via the API automatically.

#### Scenario: New tag created on bookmark save
- **WHEN** the user types a tag name not in the existing tag list and saves the bookmark
- **THEN** the `POST /api/bookmark` request body includes the new tag name in the `tags` array
- **THEN** FindFirst creates the tag server-side as part of the bookmark creation
- **THEN** no separate tag-creation API call is required from the extension

### Requirement: Tags are displayed as removable chips in the popup
Selected tags SHALL be rendered as distinct visual chips in the popup UI with an individual remove action.

#### Scenario: Removing a tag before save
- **WHEN** the user clicks the remove button on a tag chip
- **THEN** the tag is removed from the pending tag list
- **THEN** it is no longer included in the save request

#### Scenario: Adding a tag by pressing Enter or comma
- **WHEN** the user types a tag name and presses Enter or a comma
- **THEN** the typed value is added as a tag chip
- **THEN** the input field is cleared
