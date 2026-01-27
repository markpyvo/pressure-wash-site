# Copilot Instructions for Water Boys Pressure Washing Site

## Project Overview
A Next.js marketing website for a local pressure washing business in Langley, BC. The site showcases services, builds trust through storytelling, and drives customer conversions via quote requests. Built by Mark Pyvovarov (CS student at McGill).

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, hosted on Vercel

## Architecture & Key Patterns

### Routing Structure
- **App Router pattern** (`app/` directory): Each page route is a folder with `page.tsx`
  - `/app/page.tsx` - Homepage hero + services grid
  - `/app/[service]/page.tsx` - Individual service detail pages (pressure-washing, house-washing, window-cleaning, gutter-cleaning)
  - `/app/quote/page.tsx` - Quote request page (future AI feature)
  - `/app/gallery/page.tsx` - Before/after showcase
  - `/app/about/page.tsx` - Company story & mission

### Layout & Global Structure
- **Shared navbar/contact bar** in `app/layout.tsx`: Phone + email links, applies to all routes
- **Consistent max-width container** (`max-w-6xl`) for content centering
- **Full-bleed sections** use CSS trick: `w-screen ml-[calc(50%-50vw)] mr-[calc(50%-50vw)]` to extend backgrounds to viewport edges (see homepage Services section)
- **Font setup:** Montserrat (primary), Geist Mono (secondary) via Next.js Google Fonts

### Styling Conventions
- **Primary color:** `#2d3a6b` (dark blue) - used for headings, buttons, accents
- **Tailwind-first approach:** Utility classes for layout, inline styles only for custom colors
- **Responsive breakpoints:** `sm:` (640px), `md:` (768px), `lg:` (1024px)
- **Image handling:** Use Next.js `Image` component with `sizes` prop for responsive images
- Example from service pages:
  ```tsx
  <Image
    src="/wash.jpg"
    alt="descriptive text"
    fill
    className="object-cover"
    sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw"
    priority
  />
  ```

## Critical Components

### BeforeAfterSlider
- **File:** `app/components/BeforeAfterSlider.tsx`
- **Purpose:** Interactive before/after image showcase (used on gallery page)
- **Pattern:** Client-side component (`'use client'`), uses refs + requestAnimationFrame for smooth dragging
- **Key detail:** Calculates clip percentage and updates on mouse/touch drag events
- When adding similar interactive components, follow this same performance pattern

### Service Page Template
- **Pattern:** Consistent layout across all service pages
  - Left column: Title + description + bullet list with checkmark icons + CTA button
  - Right column: Hero image
  - Bottom section: "Why choose us" or benefits
- **Reuse structure** when adding new services (don't create unique layouts per service)
- **Icon SVG pattern:** Checkmark icons use inline SVG with `viewBox="0 0 20 20"`

## Development Workflows

### Local Development
```bash
npm run dev        # Starts Next.js dev server (hot reload enabled)
npm run build      # Production build
npm start          # Run production server
npm run lint       # ESLint check
```

### Key Commands
- **Dev server:** Runs on `http://localhost:3000` by default
- **Linting:** ESLint config uses Next.js preset (see `eslint.config.mjs`)
- **Type checking:** Strict mode enabled in `tsconfig.json`

## Project-Specific Conventions

### Color System
- Use `style={{ color: "#2d3a6b" }}` for semantic branding (don't abstract into separate color variables)
- White backgrounds throughout; light blue-gray sections use `rgba(45, 58, 107, 0.08)`

### CTA Buttons
- **Link-style:** `className="hover:opacity-70 transition"` for navigation links
- **Primary action:** `style={{ backgroundColor: "#2d3a6b", color: "#ffffff" }} className="px-6 py-3 rounded-lg font-bold text-lg"`

### Typography
- **Headings:** Inline style `{{ color: "#2d3a6b" }}` + Tailwind size classes (`text-4xl`, `text-5xl`)
- **Body text:** Gray-600 (`className="text-gray-600"`) for secondary text
- **Links:** Use Next.js `Link` component for internal routes

### Mobile-First Responsive
- Default styles are mobile, then override with `md:` / `lg:` breakpoints
- Example: `grid-cols-1 md:grid-cols-2 gap-12` (1 col on mobile, 2 on desktop)

## Integration Points & Future Features

### Quote Feature
- **File:** `app/quote/page.tsx` (currently placeholder)
- **Planned:** AI-powered quote generation system
- **Note:** This is the primary conversion funnel—any changes should maintain clear form design and CTAs

### SEO & Metadata
- **Metadata template:** Set in `app/layout.tsx` - update title/description for local search optimization
- **Image optimization:** Already using Next.js Image component with responsive sizing

### Gallery Page
- **Feature:** Before/after comparisons (uses `BeforeAfterSlider` component)
- **Extensibility:** Consider data-driven approach (JSON array of before/after pairs) if gallery grows

## Gotchas & Edge Cases

1. **Overflow-x hidden:** Set on main elements to prevent horizontal scroll from full-bleed sections
2. **Image paths:** All images stored in `public/` folder (yellowguy.jpg, wash.jpg, etc.)
3. **Contact info hardcoded:** Phone number `(206) 619-7551` and email appear in `layout.tsx` - update these if business changes
4. **Metadata:** Default metadata in layout.tsx still says "Create Next App" - should be updated
5. **TypeScript strict mode:** Ensure all React components properly type children/props

## Testing & Quality
- **Linting:** Run `npm run lint` before committing (ESLint enabled)
- **Type safety:** TypeScript strict mode enforces type annotations
- **Responsive design:** Test at breakpoints: 320px (mobile), 768px (tablet), 1024px+ (desktop)

## Key Files to Understand
- [app/layout.tsx](app/layout.tsx) - Global layout, contact bar, fonts
- [app/page.tsx](app/page.tsx) - Homepage structure, services grid pattern
- [app/components/BeforeAfterSlider.tsx](app/components/BeforeAfterSlider.tsx) - Interactive client component example
- [globals.css](app/globals.css) - Tailwind config + theme variables
- [package.json](package.json) - Dependencies and scripts
