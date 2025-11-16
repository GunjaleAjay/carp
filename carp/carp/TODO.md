# TODO: Fix Google Maps API REQUEST_DENIED Error and Connect Analytics

## Google Maps API REQUEST_DENIED Fix

- [ ] Verify GOOGLE_MAPS_API_KEY is set in carp-api/.env
- [ ] Ensure API key is valid and unrestricted
- [ ] Enable required APIs in Google Cloud Console:
  - [ ] Directions API
  - [ ] Distance Matrix API
  - [ ] Places API
- [ ] Enable billing on Google Cloud project
- [ ] Restart backend server after .env changes
- [ ] Test route planning feature in UI

## Analytics Model Connection

- [x] Verify sample data is seeded (vehicle and trips for admin user)
- [x] Test analytics API endpoints
- [x] Verify dashboard displays analytics data
- [x] Test UI components render correctly

## Registration Flow Fix

- [x] Fixed registration redirect to go to vehicles page instead of dashboard
- [ ] Test new user registration flow

## Testing

- [ ] Login as admin user
- [ ] Navigate to dashboard/analytics
- [ ] Verify charts and metrics display
- [ ] Test route planning without API errors
- [ ] Register new user and verify redirect to vehicles page
