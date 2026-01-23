# Project TODO

## Phase 1: Authentication & User System
- [x] Fix Home.tsx to restore landing page with useAuth integration
- [x] Create admin dashboard for managing members
- [x] Create member dashboard for accessing content
- [x] Set up role-based access control (admin vs member)

## Phase 2: Payment System
- [ ] Add Stripe integration for payments (awaiting user API keys)
- [x] Create $97/year membership payment page
- [x] Handle successful payment and grant member access

## Phase 3: Blog System
- [x] Create blog posts database schema
- [x] Create blog listing page
- [x] Create individual blog post page
- [x] Write 15 SEO-optimized blog posts

## Phase 4: Video Script
- [x] Create TTS script for investigative report video

## Phase 5: Automation
- [x] Set up daily blog publishing cron job

## Phase 6: Opt-in Page & SendLane
- [x] Create mini opt-in page with key points from home page
- [x] Set up SendLane API integration for email capture
- [ ] Add SendLane API key secret configuration (user to provide)

## Phase 7: Blog Fixes & Enhancements
- [x] Seed blog posts into database (15 posts seeded)
- [x] Fix Articles navigation link to go to /blog
- [x] Add Latest Articles section to homepage
- [x] Add affiliate banner areas to blog posts (mushroom spores, grow kits)
- [x] Add Amazon book recommendations section (mushroom hunting, identification guides)
- [x] Add strong CTA at end of each blog post
- [ ] Rewrite blog posts as longer mini sales pages (skipped per user request)

## Phase 8: Opt-in Page Improvements
- [x] Move email collection form above the fold on /optin page

## Phase 9: Community Platform
- [x] Create member profiles with anonymous icons
- [x] Create community spaces for different topics
- [x] Create posts and comments system
- [ ] Generate 100 seed users with dialogue (skipped per user request)

## Phase 10: Community CRUD Fixes
- [x] Fix profile creation functionality
- [x] Ensure post creation works
- [x] Add post editing functionality
- [x] Add post deletion functionality
- [x] Create default community spaces

## Phase 11: Admin Dashboard & Vendor Management
- [x] Create vendors database table with categories, contact details (Telegram, website, email)
- [x] Create trusted resources database table with categories and links
- [x] Create vendor categories and resource categories tables
- [x] Build admin vendor management UI (add/edit/delete vendors)
- [x] Build admin resource management UI (add/edit/delete resources)
- [x] Build admin blog article management UI (create/edit/delete posts)
- [ ] Build admin member management UI (grant/revoke premium access)
- [x] Create member-facing vendors page with contact details
- [x] Create member-facing trusted resources page


## Phase 12: Airwallex Payment Integration
- [x] Set up Airwallex API configuration
- [x] Create Airwallex payment checkout flow
- [x] Add Airwallex API key to secrets configuration (ready for user to add keys)
