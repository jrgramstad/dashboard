# Netlify Deployment Guide

## 🚀 Quick Deploy Steps

### Step 1: Set Up Database (Do This First!)

1. Go to: https://gcuunlxfgtnppnqkikaz.supabase.co
2. Navigate to: **SQL Editor**
3. Copy and paste the contents of `database/schema.sql`
4. Click **Run**
5. Verify tables created: `property_status` and `status_history`

### Step 2: Push to GitHub

```bash
# If not already on GitHub
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### Step 3: Deploy to Netlify

#### Option A: Netlify UI (Drag & Drop)
1. Go to: https://app.netlify.com/
2. Click "Add new site" → "Deploy manually"
3. **Drag and drop the `frontend` folder ONLY**
4. Wait 30 seconds
5. Click the URL to view your dashboard!

#### Option B: Netlify Git Integration (Recommended)
1. Go to: https://app.netlify.com/
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select your repository
4. Configure build settings:
   - **Base directory:** `frontend`
   - **Build command:** (leave empty)
   - **Publish directory:** `frontend`
5. Click "Deploy site"
6. Wait for deployment to complete
7. Your dashboard is live!

### Step 4: Test the Dashboard

1. Open your Netlify URL
2. Verify you see "AJ Property Status Dashboard" header
3. Check that property cards load (may be empty if database not set up)
4. Click a property name to test the update modal
5. Try updating a status to verify everything works

---

## 📋 Netlify Settings Reference

### Site Settings
```
Base directory:    frontend
Build command:     (empty)
Publish directory: frontend
```

### Environment Variables
**Not needed!** Supabase credentials are already in `config.js`

### Custom Domain (Optional)
- Go to: Site settings → Domain management
- Add custom domain: `properties.ajrealestategroup.com` (or your domain)
- Follow DNS configuration instructions

---

## 🔧 Troubleshooting

### Dashboard loads but no data shows
- ✅ Run the database schema in Supabase first
- ✅ Check browser console for errors
- ✅ Verify Supabase credentials in config.js

### "Failed to load dashboard data" error
- Check Supabase is accessible
- Verify tables exist: `properties`, `property_status`, `status_history`
- Check browser console for specific error

### Cards show but clicking properties doesn't work
- Clear browser cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Check browser console for JavaScript errors

---

## 📱 Post-Deployment Checklist

- [ ] Database schema executed successfully
- [ ] Dashboard loads and shows header
- [ ] Property cards display correctly
- [ ] Modal opens when clicking property names
- [ ] Status updates save successfully
- [ ] Dashboard auto-refreshes every 60 seconds
- [ ] Mobile view works correctly
- [ ] Share URL with Jessica for testing

---

## 🎯 Next Steps After Deployment

1. **Run Database Setup** (if not done already)
   - Execute `database/schema.sql` in Supabase
   - Verify all 75 properties have initial "RENTED" status

2. **Test Full Workflow**
   - Update a test property status
   - Verify it appears in the correct card
   - Check that history is recorded

3. **Share with Team**
   - Bookmark the Netlify URL
   - Add to browser home screen on mobile
   - Train Jessica on daily usage

4. **Optional: Custom Domain**
   - Purchase domain or use existing
   - Configure DNS in Netlify
   - Enable HTTPS (automatic)

---

## 💡 Pro Tips

- **Instant Deploy**: Every push to GitHub auto-deploys to Netlify
- **Preview URLs**: Pull requests get their own preview URLs
- **Rollbacks**: Easily rollback to previous deployments in Netlify UI
- **Analytics**: Enable Netlify Analytics to track usage
- **Forms**: Can add contact forms using Netlify Forms (future enhancement)

---

## 🆘 Need Help?

- **Netlify Docs**: https://docs.netlify.com/
- **Supabase Docs**: https://supabase.com/docs
- **Dashboard Issues**: Check browser console for errors

---

**Deployment Time: ~5 minutes**
**Database Setup Time: ~2 minutes**
**Total Time to Production: ~7 minutes**

Happy deploying! 🎉
