// Supabase Configuration for AJ Real Estate Group
// Property Status Dashboard

const config = {
  supabase: {
    url: 'https://gcuunlxfgtnppnqkikaz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjdXVubHhmZ3RucHBucWtpa2F6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NzY3MTgsImV4cCI6MjA3NzE1MjcxOH0.8uKySCjd_f8sqOtYAyD2_MyvQIC_2IsYkHE1NoqtQT4'
  }
};

// Status configuration with display names and colors
const STATUS_CONFIG = {
  'WIP': {
    name: 'Work in Progress',
    color: '#3B82F6', // Blue
    showDays: true,
    fields: ['assigned_to', 'notes']
  },
  'LISTED': {
    name: 'Listed for Sale',
    color: '#3B82F6', // Blue
    showAmount: true,
    fields: ['amount', 'notes']
  },
  'VACANT': {
    name: 'Vacant',
    color: '#F97316', // Orange
    showDays: true,
    fields: ['notes']
  },
  'COMING_SOON': {
    name: 'Coming Soon',
    color: '#10B981', // Green
    showTarget: true,
    fields: ['target_date', 'notes']
  },
  'MOVE_OUT': {
    name: 'Move Outs',
    color: '#F97316', // Orange
    showTarget: true,
    fields: ['target_date', 'notes']
  },
  'IN_LINE_WIP': {
    name: 'In Line for WIP',
    color: '#EAB308', // Yellow
    showPriority: true,
    fields: ['priority', 'notes']
  },
  'EVICTION': {
    name: 'Under Eviction',
    color: '#EF4444', // Red
    showDate: true,
    fields: ['status_date', 'notes']
  },
  'LATE_RENT': {
    name: 'Late Rent',
    color: '#EF4444', // Red
    showAmount: true,
    showDays: true,
    fields: ['amount', 'notes']
  },
  'MOVE_IN': {
    name: 'Move Ins Scheduled',
    color: '#10B981', // Green
    showTarget: true,
    fields: ['target_date', 'notes']
  },
  'EXPIRING': {
    name: 'Expiring Leases (60 days)',
    color: '#EAB308', // Yellow
    showTarget: true,
    fields: ['target_date', 'notes']
  },
  'RENTED': {
    name: 'Rented',
    color: '#6B7280', // Gray
    hideFromDashboard: true,
    fields: ['notes']
  }
};

// Auto-refresh interval (60 seconds)
const AUTO_REFRESH_INTERVAL = 60000;
