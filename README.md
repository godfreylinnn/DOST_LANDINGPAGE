# DOST PSTO Eastern Samar Landing Page

This is a simple local website for DOST PSTO Eastern Samar. It uses Python for the local server, HTML for page structure, CSS for design, JavaScript for dynamic content, and JSON files for the text, links, photos, and system logo links you will edit most often.

## 1. How to Run the Website

Open PowerShell in this project folder:

```powershell
cd "C:\Users\Mark Jenesio Godes\Desktop\OJT"
python app.py
```

Then open this in your browser:

```text
http://127.0.0.1:8000
```

If Chrome still shows an old version, press:

```text
Ctrl + F5
```

That forces the browser to reload the latest CSS and JavaScript.

## 2. Project Folder Guide

```text
OJT/
  app.py
  README.md
  data/
    profile.json
    systems.json
  static/
    index.html
    styles.css
    script.js
    assets/
      dost-logo-photo.jpg
      DOST_background.jpg
```

## 3. What Each File Does

`app.py`

This starts the local website at `http://127.0.0.1:8000`. It also creates two API links:

- `/api/profile` loads `data/profile.json`
- `/api/systems` loads `data/systems.json`

`static/index.html`

This is the page structure. It contains the top bar with live Philippine Standard Time and search, sidebar, hero section, combined About Us and Facebook live section, forms section, systems section, and contact section.

`static/styles.css`

This controls the design: colors, layout, sidebar behavior, navbar search, live time display, Facebook updates styling, logo-only system links, spacing, and mobile responsiveness.

`static/script.js`

This loads the JSON files and places the data into the HTML. It also controls the sidebar open/close behavior, live Philippine Standard Time clock, Facebook iframe, logo-only system links, and system search bar button.

`data/profile.json`

This is where you edit office details, Facebook link, logo path, background photo path, and office hours.

`data/systems.json`

This is where you add, remove, or update system cards and links.

`static/assets`

Put all images here. Use filenames without spaces, like `my-photo.jpg` instead of `my photo.jpg`.

## 4. How the Data Flows

1. You run `python app.py`.
2. The browser opens `static/index.html`.
3. `index.html` loads `styles.css` and `script.js`.
4. `script.js` requests `/api/profile` and `/api/systems`.
5. `app.py` returns the JSON files from the `data` folder.
6. `script.js` displays the JSON data on the page.

## 5. Edit Office Details

Open:

```text
data/profile.json
```

Example:

```json
{
  "office": "DOST PSTO Eastern Samar",
  "fullName": "Department of Science and Technology - Provincial Science and Technology Office Eastern Samar",
  "tagline": "Science, technology, and innovation services for Eastern Samar.",
  "location": "Eastern Samar State University, Borongan City, Eastern Samar",
  "telephone": "(055) 261-2664",
  "email": "atamoscojr@region8.dost.gov.ph",
  "facebook": "https://www.facebook.com/dostpstceasternsamar",
  "assets": {
    "logo": "assets/dost-logo-photo.jpg",
    "logoAlt": "DOST logo",
    "background": "assets/DOST_background.jpg"
  },
  "quickInfo": {
    "label": "Office Hours",
    "title": "Monday to Friday",
    "detail": "8:00 AM - 5:00 PM"
  }
}
```

Important JSON rules:

- Keep double quotes around text.
- Put commas between items.
- Do not put a comma after the last item inside `{}`.
- Image paths should start with `assets/`.
- Image files must be inside `static/assets`.

## 6. Change the Logo

1. Put your logo image inside:

```text
static/assets
```

2. Use a simple filename, for example:

```text
dost-new-logo.jpg
```

3. Edit `data/profile.json`:

```json
"assets": {
  "logo": "assets/dost-new-logo.jpg",
  "logoAlt": "DOST logo",
  "background": "assets/DOST_background.jpg"
}
```

4. Refresh the browser with `Ctrl + F5`.

## 7. Change the Background Photo

1. Put your background photo inside:

```text
static/assets
```

2. Use a simple filename, for example:

```text
office-background.jpg
```

3. Edit `data/profile.json`:

```json
"assets": {
  "logo": "assets/dost-logo-photo.jpg",
  "logoAlt": "DOST logo",
  "background": "assets/office-background.jpg"
}
```

4. Refresh the browser with `Ctrl + F5`.

## 8. Navbar Search and Philippine Standard Time

The top bar contains the system search form and live Philippine Standard Time display:

```html
<div class="pst-clock" aria-live="polite">
<form id="system-search-form" class="system-search nav-search" role="search">
```

The clock is updated every second in `static/script.js` with the `Asia/Manila` timezone.

The search filters the systems listed in `data/systems.json`. When you press the search button or Enter, the page scrolls to the systems section.

## 9. Edit Facebook Live and About Us

The Facebook live section uses this value from `data/profile.json`:

```json
"facebook": "https://www.facebook.com/dostpstceasternsamar"
```

To change the Facebook page, replace the URL.

The page uses an iframe in `static/index.html`:

```html
<iframe id="facebook-frame"></iframe>
```

Then `static/script.js` builds the Facebook plugin URL using the link from `profile.json`.

The Facebook live area is beside the About Us panel. It is styled in `static/styles.css` with:

- `.facebook-shell`
- `.facebook-card-head`
- `.facebook-badge`
- `#facebook-frame`
- `.about-panel`

If Facebook does not show:

- Make sure the Facebook page URL is public.
- Make sure you are connected to the internet.
- Some networks or browsers block Facebook embeds.
- The direct fallback link under the embed should still work.

To edit the About Us text, open:

```text
static/index.html
```

Find:

```html
<div id="about" class="section-copy about-panel">
```

Edit the heading and paragraphs inside that panel.

## 10. Add or Edit System Logo Links

Open:

```text
data/systems.json
```

Each system looks like this:

```json
{
  "name": "CEST",
  "description": "Community Empowerment thru Science and Technology portal.",
  "url": "https://cest.dost8.ph/",
  "image": "assets/CEST.jpg",
  "status": "Available",
  "category": "Online Service"
}
```

Fields:

- `name`: system name used for search and screen reader labels
- `description`: short explanation used for search
- `url`: system link
- `image`: logo image shown on the page
- `status`: example `Available`, `Internal`, or `Coming Soon`, used for search
- `category`: example `Online Service` or `Internal Tool`, used for search

If you do not have a real link yet, use:

```json
"url": "#"
```

The system area now shows pure logo links without visible text. If no image is added, the page shows a simple initial-based fallback logo.

The systems search is in the top navbar and uses this form in `static/index.html`:

```html
<form id="system-search-form" class="system-search nav-search" role="search">
```

The button is icon-only and is styled with CSS.

## 11. Add a New System

In `data/systems.json`, add a comma after the previous item, then add another object:

```json
{
  "name": "New System Name",
  "description": "Short description of the system.",
  "url": "https://example.com",
  "image": "assets/new-system-logo.png",
  "status": "Available",
  "category": "Services"
}
```

Example full list:

```json
[
  {
    "name": "Client Assistance Portal",
    "description": "Submit requests and track assistance.",
    "url": "#",
    "image": "assets/client-assistance-logo.png",
    "status": "Available",
    "category": "Services"
  },
  {
    "name": "New System Name",
    "description": "Short description of the system.",
    "url": "https://example.com",
    "image": "assets/new-system-logo.png",
    "status": "Available",
    "category": "Services"
  }
]
```

## 12. How the Sidebar Works

The top bar has a hamburger button:

```html
<button id="sidebar-toggle" class="sidebar-toggle"></button>
```

The sidebar contains only navigation buttons:

```html
<aside id="site-sidebar" class="site-sidebar">
  <nav class="side-nav">
    <a href="#about">About Us</a>
    <a href="#forms">Forms</a>
    <a href="#systems">Systems</a>
    <a href="#contact">Contact</a>
  </nav>
</aside>
```

The outside clickable overlay is:

```html
<div id="sidebar-overlay" class="sidebar-overlay" hidden></div>
```

In `static/script.js`, this opens and closes the sidebar:

```js
function setSidebarOpen(isOpen) {
  document.body.classList.toggle("sidebar-open", isOpen);
}
```

In `static/styles.css`, this hides the sidebar:

```css
.site-sidebar {
  transform: translateX(-100%);
}
```

And this shows it:

```css
body.sidebar-open .site-sidebar {
  transform: translateX(0);
}
```

The sidebar closes when:

- You click outside it
- You click a sidebar link
- You press `Escape`

## 13. Change Theme Colors

Open:

```text
static/styles.css
```

At the top, edit the CSS variables:

```css
:root {
  --blue: #006eb6;
  --blue-700: #075697;
  --blue-900: #062b63;
  --cyan: #00aeef;
  --gold: #f6c343;
}
```

These colors are reused across the page.

## 14. Browser Cache Tip

The HTML loads CSS and JavaScript like this:

```html
<link rel="stylesheet" href="styles.css?v=7">
<script defer src="script.js?v=7"></script>
```

The `?v=7` part helps force the browser to load a newer version. If you edit CSS or JS and Chrome still shows the old design, change the version number, then refresh.

## 15. Common Problems

Image does not show:

- Check that the image is inside `static/assets`.
- Check the filename spelling.
- Avoid spaces in filenames.
- Include the extension, like `.jpg` or `.png`.
- Check `data/profile.json`.

System logos do not show:

- Check `data/systems.json`.
- Make sure the file starts with `[` and ends with `]`.
- Make sure each item uses `{}`.
- Make sure commas are placed correctly.
- Make sure the image file exists inside `static/assets`.
- Make sure the `image` path starts with `assets/`.

Facebook does not show:

- Check the Facebook URL in `data/profile.json`.
- Make sure the page is public.
- Check your internet connection.
- Try the fallback link under the Facebook box.

Website does not update:

- Press `Ctrl + F5`.
- Restart `python app.py`.
- Update the CSS/JS version number in `static/index.html`.

## 16. Safe Editing Workflow

1. Stop the server if it is running.
2. Edit one file only.
3. Save the file.
4. Run `python app.py`.
5. Refresh the browser with `Ctrl + F5`.
6. Check if the change worked.
7. If something breaks, undo only the last change.
