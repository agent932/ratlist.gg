# Pre-Deployment Checklist

Use this checklist before deploying to production or pushing to GitHub.

## 📋 Code Quality

- [ ] All unit tests passing (`npm test`)
- [ ] Build succeeds without errors (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] TypeScript compiles without errors (`npx tsc --noEmit`)
- [ ] No console.log statements in production code
- [ ] No commented-out code blocks

## 🔒 Security

- [ ] No secrets or API keys in code
- [ ] `.env.local` file is in `.gitignore`
- [ ] `.env.example` file is up to date
- [ ] All API routes have rate limiting
- [ ] All database queries use RLS policies
- [ ] User input is validated with Zod schemas

## 📦 Dependencies

- [ ] All dependencies are up to date (`npm outdated`)
- [ ] No unused dependencies
- [ ] Lock file is committed (`package-lock.json`)
- [ ] No peer dependency warnings

## 📝 Documentation

- [ ] README.md is up to date
- [ ] API endpoints are documented
- [ ] Environment variables are documented in `.env.example`
- [ ] Database schema changes have migrations
- [ ] CHANGELOG updated (if applicable)

## 🗄️ Database

- [ ] All migrations have been tested
- [ ] Migrations are numbered sequentially
- [ ] Seed data is up to date
- [ ] RLS policies are in place
- [ ] Database indexes are optimized

## 🎨 UI/UX

- [ ] Responsive design works on mobile
- [ ] All forms have validation
- [ ] Loading states are implemented
- [ ] Error messages are user-friendly
- [ ] Accessibility (ARIA labels, keyboard navigation)

## 🚀 Vercel Deployment

- [ ] Environment variables set in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`
- [ ] Node version: 18.x
- [ ] Preview deployments enabled
- [ ] Production domain configured

## 📊 Monitoring

- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (Google Analytics, etc.)
- [ ] Performance monitoring setup
- [ ] Uptime monitoring setup

## 🧪 Testing

- [ ] All critical user flows tested manually
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Cross-browser testing completed
- [ ] Mobile testing completed

## 🔄 Git

- [ ] All changes committed
- [ ] Commit messages follow conventions
- [ ] No sensitive data in git history
- [ ] Branch is up to date with main
- [ ] Pull request created (if applicable)

## ✅ Final Steps

- [ ] Review all changed files one more time
- [ ] Test deployment in preview environment
- [ ] Monitor deployment logs for errors
- [ ] Test production deployment after merge
- [ ] Update team/stakeholders

---

**Date Completed:** _______________  
**Deployed By:** _______________  
**Version:** _______________
