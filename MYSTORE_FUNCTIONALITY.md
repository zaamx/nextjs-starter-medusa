# Mystore URL Parameter Functionality

## Overview

This feature allows customers to arrive at the site via a URL with a `mystore` parameter that automatically sets and locks a predetermined sponsor for registration.

## URL Format

```
https://store.wenow.global/mx?mystore=123
```

Where `123` is the `netme_id` of the predetermined sponsor.

## How It Works

### 1. URL Parameter Detection
- The `MystoreHandler` component detects the `mystore` parameter in the URL
- It validates that the parameter is a numeric value
- Stores the sponsor ID in localStorage with a "locked" flag

### 2. Automatic Sponsor Selection
- When the `SponsorInput` component loads, it checks for stored mystore data
- If found, it automatically searches for the sponsor by `netme_id`
- Automatically selects and displays the sponsor information
- Locks the input to prevent changes

### 3. UI Behavior
- **Locked State**: Shows "Bloqueado" button instead of "Buscar"
- **Loading State**: Shows "Cargando..." while fetching sponsor data
- **Visual Indicators**: Different colors and styling for locked vs. normal state
- **Clear Button**: Hidden when locked to prevent clearing

## Components

### MystoreHandler
- Client component that runs on all pages
- Detects and stores mystore parameter
- No visual output

### SponsorInput (Enhanced)
- Handles locked sponsor state
- Automatic sponsor loading
- Prevents changes when locked
- Visual feedback for different states

### API Route
- `/api/sponsor-search` - Endpoint for searching sponsors by query

## Storage

The mystore data is stored in localStorage with these keys:
- `wenow_mystore_sponsor_id` - The sponsor ID
- `wenow_mystore_locked` - Boolean flag indicating if locked

## Usage Examples

### Normal Registration
```
https://store.wenow.global/mx
```
- User can freely select any sponsor

### Predetermined Sponsor
```
https://store.wenow.global/mx?mystore=123
```
- Sponsor with `netme_id=123` is automatically selected
- Input is locked and cannot be changed
- User sees "Patrocinador Predeterminado" message

## Technical Details

### Validation
- Only numeric values are accepted for the mystore parameter
- Invalid values are ignored
- Sponsor must exist in the system to be selected

### Error Handling
- Graceful fallback if sponsor search fails
- Console logging for debugging
- User-friendly error messages

### Performance
- Debounced search to prevent excessive API calls
- Cached sponsor data in localStorage
- Efficient re-rendering with React hooks
