# AJ Property Status Dashboard

A real-time property management dashboard for AJ Real Estate Group built with Supabase and vanilla JavaScript.

## Features

- **Real-time Status Tracking**: Monitor 75 properties across 10 different status categories
- **Color-Coded Cards**: Visual status indicators (Red for urgent, Orange for attention, Yellow for watch, Green for positive, Blue for active)
- **Quick Updates**: Click any property name to update its status in seconds
- **Auto-Refresh**: Dashboard automatically refreshes every 60 seconds
- **Status History**: Tracks all changes with timestamps and user attribution
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices
- **Calculated Metrics**: Automatically calculates days in status, days late, etc.

## Status Categories

1. **Work in Progress (WIP)** - Properties actively being renovated
2. **Listed for Sale** - Properties on the market with listing price
3. **Vacant** - Empty properties with days vacant tracked
4. **Coming Soon** - Properties preparing for lease with target date
5. **Move Outs** - Scheduled tenant departures with target date
6. **In Line for WIP** - Properties queued for renovation with priority
7. **Under Eviction** - Legal proceedings with filing date
8. **Late Rent** - Overdue payments with amount and days late
9. **Move Ins Scheduled** - New tenants with move-in date
10. **Expiring Leases (60 days)** - Leases ending soon with expiration date
11. **Rented** - Default status (hidden from main dashboard)

## Setup Instructions

### Step 1: Database Setup

1. Log into your Supabase project: https://gcuunlxfgtnppnqkikaz.supabase.co
2. Go to the SQL Editor
3. Run the SQL script from `database/schema.sql`
4. This will create:
   - `property_status` table
   - `status_history` table
   - Initial "RENTED" status for all active properties
   - Necessary indexes for performance

### Step 2: Deploy Frontend

You have several options:

#### Option A: Simple Local Testing
1. Open `frontend/index.html` directly in your browser
2. Works immediately with no server needed

#### Option B: Local Web Server
```bash
cd frontend
python -m http.server 8000
# Or use any other local server
```
Then visit: http://localhost:8000

#### Option C: Deploy to Netlify/Vercel (Recommended for Production)

**Netlify:**
1. Drag and drop the `frontend` folder to Netlify
2. Your dashboard will be live instantly

**Vercel:**
```bash
cd frontend
vercel
```

## Daily Usage

### Updating Property Status

1. **Find the property** in its current status card
2. **Click the property name** to open the update modal
3. **Select new status** from the dropdown
4. **Fill in relevant details**:
   - Amount (for Listed for Sale, Late Rent)
   - Target Date (for Coming Soon, Move Outs, Move Ins, Expiring Leases)
   - Priority (for In Line for WIP)
   - Assigned To (for Work in Progress)
   - Notes (optional but recommended)
5. **Enter your name** in "Updated By"
6. **Click "Save Changes"**

The dashboard will automatically refresh and show the property in its new status.

### Tips for Quick Daily Updates

- **Morning Routine**: Review each colored section (red cards first for urgent items)
- **Batch Updates**: Update all similar changes at once (e.g., all move-outs)
- **Use Notes**: Add context for future reference
- **Target Dates**: Always set target dates for future events
- **Manual Refresh**: Click the refresh button anytime to see latest changes

## File Structure

```
dashboard/
├── database/
│   └── schema.sql              # Database table definitions
├── frontend/
│   ├── index.html              # Main dashboard page
│   ├── styles.css              # All styling and responsive design
│   ├── app.js                  # Dashboard logic and Supabase integration
│   └── config.js               # Supabase credentials and status config
└── README.md                   # This file
```

## Technical Details

### Database Schema

**property_status table:**
- `id` - Primary key
- `property_id` - References properties table
- `status` - Current status code
- `status_date` - When status was set
- `priority` - Queue priority (for WIP)
- `assigned_to` - Person assigned (for WIP)
- `target_date` - Future date for events
- `amount` - Dollar amount (for sales/rent)
- `notes` - Additional context
- `updated_at` - Last update timestamp
- `updated_by` - Person who made update

**status_history table:**
- `id` - Primary key
- `property_id` - References properties table
- `old_status` - Previous status
- `new_status` - New status
- `changed_by` - Person who made change
- `changed_at` - When change occurred
- `notes` - Notes from the change

### Technology Stack

- **Frontend**: Vanilla JavaScript (no frameworks)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Pure CSS with CSS Grid
- **CDN**: Supabase JS Client from CDN

## Customization

### Adding a New Status

1. Open `frontend/config.js`
2. Add entry to `STATUS_CONFIG`:
```javascript
'NEW_STATUS': {
    name: 'Display Name',
    color: '#HexColor',
    showDays: true, // optional
    showAmount: true, // optional
    showTarget: true, // optional
    fields: ['field1', 'field2']
}
```
3. Add color class in `frontend/styles.css`:
```css
.status-NEW_STATUS { background-color: #HexColor; }
```
4. Add option to dropdown in `frontend/index.html`

### Changing Auto-Refresh Interval

In `frontend/config.js`, modify:
```javascript
const AUTO_REFRESH_INTERVAL = 60000; // milliseconds (60000 = 1 minute)
```

## Troubleshooting

### Dashboard won't load
- Check browser console for errors
- Verify Supabase credentials in `config.js`
- Ensure database tables are created

### Properties not showing
- Confirm properties have `active = true` in database
- Check that `property_status` records exist
- Look for JavaScript errors in browser console

### Status updates not saving
- Verify "Updated By" field is filled
- Check Supabase permissions
- Ensure all required fields for that status are filled

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify database connection
3. Ensure all files are properly uploaded/deployed

## Version

Version 1.0 - Built for AJ Real Estate Group
Last Updated: November 2025
