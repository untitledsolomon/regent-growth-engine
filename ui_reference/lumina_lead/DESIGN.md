# Design System Specification: High-End B2B Leads Management

## 1. Overview & Creative North Star

### Creative North Star: "The Intelligent Canvas"
Most B2B platforms feel like spreadsheets with a coat of paint. This design system rejects that. Our North Star is **The Intelligent Canvas**—an editorial-grade workspace where data feels curated, not just displayed. We move away from "dashboard-in-a-box" aesthetics by using intentional asymmetry, breathing room (generous whitespace), and a focus on tonal depth over structural lines.

The goal is to create a digital environment that conveys the trustworthiness of a legacy financial institution with the high-tech velocity of a modern SaaS. We achieve this through "Signature Polishing": overlapping elements, high-contrast typography scales, and a departure from the traditional 1px border grid.

---

## 2. Colors

The palette is anchored in a sophisticated "Deep Indigo" and "Slate Gray" foundation. The primary goal is to provide a neutral, premium stage where vibrant interactive accents can guide the user’s eye.

### Palette Strategy
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface_container_low` sidebar should sit against a `surface` main content area.
- **Surface Hierarchy & Nesting:** Treat the UI as physical layers of fine paper.
    - Use `surface_container_lowest` (#ffffff) for the primary interactive cards.
    - Use `surface_container` (#eceef0) for the underlying workspace.
    - This "stacking" creates depth naturally without visual clutter.
- **The Glass & Gradient Rule:** To elevate the "high-tech" atmosphere, use Glassmorphism for floating menus or tooltips. Apply `surface_container_lowest` at 80% opacity with a `20px` backdrop-blur.
- **Signature Textures:** For primary CTAs and hero states, utilize a subtle linear gradient: `primary` (#4648d4) to `primary_container` (#6063ee) at a 135-degree angle. This provides a tactile "soul" to the interface.

---

## 3. Typography

Our typography is split between two high-performance typefaces: **Plus Jakarta Sans** for editorial impact and **Inter** for functional clarity.

### The Scale
- **Display (Plus Jakarta Sans):** Used for high-level dashboard summaries or empty states.
    - *Display-Lg (3.5rem):* Reserved for singular hero data points.
- **Headline (Plus Jakarta Sans):** Used for page titles and major section headers.
    - *Headline-Sm (1.5rem):* The workhorse for lead category titles.
- **Title (Inter):** Used for card titles and navigation.
- **Body (Inter):** Used for all data entries and lead details.
- **Label (Inter):** Used for metadata, tags, and micro-copy.

**Hierarchy Note:** Always maintain a high contrast between Headline and Body sizes. By keeping `Headline-Lg` bold and `Body-Md` light/regular, we create an editorial rhythm that makes dense lead data easier to scan.

---

## 4. Elevation & Depth

We eschew "Shadow-Everything" design. Depth is earned, not given.

- **Tonal Layering:** Instead of a shadow, place a card (`surface_container_lowest`) on a background (`surface_container_low`). This creates a "soft lift" that feels architectural.
- **Ambient Shadows:** When a card must float (e.g., a lead detail modal), use a multi-layered shadow:
    - `box-shadow: 0px 10px 30px rgba(25, 28, 30, 0.04), 0px 4px 8px rgba(25, 28, 30, 0.02);`
    - The shadow color is a tinted version of `on_surface` to mimic natural light.
- **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use `outline_variant` (#c7c4d7) at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Interactivity
- **Primary:** Use the Signature Gradient (Indigo to Light Indigo). Roundedness set to `md` (12px).
- **Secondary:** Transparent background with a "Ghost Border." On hover, shift background to `surface_container_high`.
- **Tertiary (The Vibrant Accent):** Use `tertiary` (#9e00b5) for high-value interactions like "Convert Lead." This provides the "Magenta/Purple" punch requested.

### Cards & Lead Lists
- **Rule:** Forbid divider lines between list items. Use 16px of vertical whitespace or a subtle background hover state (`surface_container_highest`) to define rows.
- **Lead Chips:** Use `secondary_container` for neutral status and `tertiary_fixed` for high-priority leads. No borders—only soft color fills.

### Input Fields
- **Atmosphere:** Clean and "Open."
- **States:** Default state uses `surface_container_highest` fill with no border. Focus state triggers a 2px `primary` "Ghost Border" at 40% opacity and a slight lift.

---

## 6. White-Labeling (Agency Customization)

This design system is built for modularity. To customize for agencies:
1.  **Primary Token Swap:** Replacing the `primary` and `primary_container` tokens will automatically update all CTAs, focus states, and the Signature Gradient.
2.  **Radius Variable:** While we recommend `8px-12px`, the `roundedness-scale` is a global variable. A shift to `0px` transforms the system into "Industrial Brutalism," while `99px` makes it "Playful Organic."
3.  **Logo Injection:** The sidebar header is a flexible container designed to scale logos to a maximum height of `32px`, ensuring brand integrity regardless of the agency's logo aspect ratio.

---

## 7. Do's and Don'ts

### Do
- Use **asymmetric layouts** (e.g., a wide 8-column main area with a 4-column contextual sidebar).
- Use **white space** as a separator. If you feel the need to add a line, add 16px of space instead.
- Use **Plus Jakarta Sans** for any text larger than 24px to maintain the "Editorial" feel.

### Don't
- **Don't use 100% black.** Use `on_surface` (#191c1e) for text to maintain a premium, slate-like softness.
- **Don't use standard drop shadows.** If a component doesn't need to float, keep it flat and use tonal layering.
- **Don't crowd the edges.** Ensure a minimum page padding of `xl` (24px) to let the "Intelligent Canvas" breathe.