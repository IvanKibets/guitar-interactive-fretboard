# 🎸 Interactive Guitar Fretboard

A powerful web application for guitarists that allows you to visualize notes on the fretboard, learn scales, practice harmonics, and listen to note sounds.

**🌐 Available online: [https://guitar-flex.online](https://guitar-flex.online)**

![Guitar Fretboard](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css)
![Web Audio API](https://img.shields.io/badge/Web%20Audio-API-orange?style=for-the-badge)
![Mobile Friendly](https://img.shields.io/badge/Mobile-Friendly-success?style=for-the-badge)

## ✨ Key Features

### 🎯 Fretboard Visualization
- **24 frets** with photorealistic wood texture
- Realistic metallic strings with gradients
- Fret markers in the style of classic acoustic guitars (Cort AD810, Yamaha F310)
- Clear note display with octaves (e.g., C3, F#4)

### 🎼 Scale & Key Management
- **Visual circle of fifths** with 24 segments
- 12 major keys (outer circle)
- 12 minor keys (inner circle)
- Interactive selection with parallel key highlighting
- Automatic note filtering by selected scale

### 🔧 Instrument Setup
- **Tuning presets**: Standard, Drop D, Drop C, DADGAD, Open G, Open D
- Create and save **custom tunings**
- Quick adjustment of each string individually
- Visual **capo** on any fret (1-12)
- Automatic recalculation of notes and fret numbering with capo

### 🎵 Natural Harmonics
- Display harmonics on frets 5, 7, 12, 19, 24
- Color-coded difficulty indication:
    - 🟢 Green (easy): frets 12, 24 — octave higher
    - 🟡 Yellow (medium): frets 7, 19 — octave + fifth
    - 🟠 Orange (hard): fret 5 — two octaves higher
- Works correctly with capo

### 🔊 Listening Mode
- Synthesized **guitar sound** using Web Audio API
- 6 harmonics for realistic acoustic guitar timbre
- Natural attack and decay
- Accurate frequencies for all notes

### 📐 Creating "Boxes"
- Hide notes by individual frets (checkboxes)
- Show/hide individual notes by clicking
- Restore hidden notes with repeated clicks
- Export configuration to PNG with timestamp

### 💾 Saving
- Export fretboard to high-quality PNG
- Save custom tunings (in session)
- Snapshots include: notes, tuning, capo, key

### 📱 Mobile Version
- **Responsive design** - automatic switch to mobile version
- **Vertical fretboard** - strings left to right (E2 → E4), frets top to bottom
- **Touch-optimized** - enlarged elements (48x48px) for comfortable tapping
- **Compact controls** - grouped in 3 sections to save space
- **Minimum width 320px** - works even on old devices
- **Full functionality** - all desktop version features
- Tested on Android and iOS

---

## 🚀 Installation and Launch

### 🌐 Online Version (Easiest Way)

The application is available online without installation:

**👉 [https://guitar-flex.online](https://guitar-flex.online)**

Works on all devices: desktop, tablet, smartphone.

---

### 🐳 Quick Start with Docker (For Local Launch)

If you want to run the application locally, use the ready-made Docker image:

```bash
docker run -p 80:80 arkol/guitar-interactive-fretbar:latest
```

After launch, open your browser and go to:
```
http://localhost:80
```

**Docker Advantages:**
- ✅ No need to install Node.js and dependencies
- ✅ Works the same on all platforms (Windows, Mac, Linux)
- ✅ Ready to use in seconds
- ✅ Isolated environment without conflicts

**Requirements:**
- Installed [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

### 💻 Installation from Source (For Development)

#### Prerequisites
- **Node.js** version 14.0 or higher
- **npm** or **yarn**

#### Installation via WebStorm

##### Step 1: Clone or Create Project
```bash
# In WebStorm terminal
npx create-react-app guitar-interactive-fretboard
cd guitar-interactive-fretboard
```

##### Step 2: Install Dependencies
```bash
npm install lucide-react html2canvas
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

##### Step 3: Configure Tailwind CSS

Open `tailwind.config.js` and replace content:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Open `src/index.css` and replace content:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

##### Step 4: Add html2canvas

Open `public/index.html` and add to `<head>`:
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
```

##### Step 5: Add Application Code

Replace `src/App.js` content with code from the artifact.

##### Step 6: Launch
```bash
npm start
```

The application will open at `http://localhost:3000`

---

## 📖 User Guide

### Basic Operating Modes

#### 🎨 Edit Mode (Default)
- **Click on note** — hide/show it
- **Checkbox under fret** — hide/show all notes on that fret
- **Click on empty space** — restore hidden note

#### 🔊 Listening Mode
1. Click **"Listening"** button (with 🔊 icon)
2. Click on notes to play their sound
3. Notes are colored purple

### Working with Keys

#### Selection via Circle of Fifths
1. Click **"Select"** button in the "Key" section
2. A visual circle opens:
    - **Outer circle** — major keys
    - **Inner circle** — minor keys
3. **Hover** over a segment — see major and parallel minor highlighting
4. **Click** to select key
5. Only notes from the selected scale remain on the fretboard

#### Working with Selected Key
- In **edit mode**: click on empty spaces to restore notes
- In **listening mode**: click on notes to hear the scale sound
- Click **"Reset"** to restore all notes

### Tuning Setup

#### Using Presets
Select one of the ready-made tunings:
- **Standard**: E-A-D-G-B-E
- **Drop D**: D-A-D-G-B-E
- **Drop C**: C-G-C-F-A-D
- **DADGAD**: D-A-D-G-A-D
- **Open G**: D-G-D-G-B-D
- **Open D**: D-A-D-F#-A-D

#### Creating Custom Tuning (Desktop Only)
1. Adjust each string via dropdown lists on the left
2. Click **"+"** button next to tuning selection
3. Enter name (e.g., "Drop A#")
4. Click **"Save"**
5. Your tuning will be added to the list

#### Deleting Custom Tuning
1. Select custom tuning from the list
2. Click **"🗑️"** button
3. Tuning will be deleted

### Using Capo

1. Select fret in **"Capo"** dropdown (1-12)
2. Capo displays as a semi-transparent black rectangle
3. Fret numbering starts from capo (0, 1, 2, 3...)
4. All notes and harmonics recalculate automatically

### Working with Harmonics

1. Turn on **"Harmonics"** switch
2. Diamond shapes appear on harmonic positions
3. Color indicates difficulty:
    - 🟢 Green — easy to produce
    - 🟡 Yellow — medium difficulty
    - 🟠 Orange — hard
4. Inside the diamond — the note that will sound when producing the harmonic

### Exporting Snapshots

1. Configure fretboard as needed (notes, tuning, capo, key)
2. Click **"Save PNG"** button 📥
3. Image downloads with name `fretboard-YYYY-MM-DD-HH-MM.png`
4. Image includes all visible fretboard state

---

## 🎯 Practical Use Cases

### For Learning Scales
1. Open [guitar-flex.online](https://guitar-flex.online)
2. Select a key via circle of fifths (e.g., C major)
3. Study note positions on the fretboard
4. Use listening mode to memorize sounds

### For Creating Scale Boxes
1. Select a key
2. Hide unnecessary notes on certain frets
3. Save result as PNG for reference

### For Learning Harmonics
1. Turn on harmonics mode
2. Try different tunings and capo positions
3. Use color coding to understand difficulty

### For Experimenting with Tunings
1. Create a non-standard tuning (on desktop)
2. See how note positions change
3. Find interesting chord voicings

### On Mobile Device
1. Open [guitar-flex.online](https://guitar-flex.online) on your phone
2. Vertical fretboard is perfect for practice on the go
3. Use listening mode to check notes
4. Save snapshots to gallery for quick access

---

## 🛠️ Technologies

- **React 18** — UI building library
- **Tailwind CSS** — utility-first CSS framework
- **Lucide React** — icons
- **Web Audio API** — guitar sound synthesis
- **html2canvas** — PNG export
- **CSS Gradients** — realistic wood and metal textures

---

## 🎨 Design

### Visual Style
- **Skeuomorphism** — realistic materials and textures
- Wood texture of fretboard styled after Cort AD810 / Yamaha F310
- Metallic strings with correct thicknesses and gradients
- Deep shadows and light highlights for volume

### Color Palette
- **Background**: brown wood gradients (#3e2723, #4a2c1c)
- **Fretboard**: sandy and amber shades (#D4A574, #C19A6B)
- **Notes**: golden (#ffd700, #fffacd)
- **Accents**: green for keys, purple for listening mode

---

## ⚙️ Troubleshooting

### Sound Doesn't Play
**Cause**: Browser autoplay policy  
**Solution**:
1. Click anywhere on the page before using listening mode
2. Reload the page and try again
3. Check browser sound settings

### Tailwind Styles Not Applied
**Cause**: Incorrect configuration  
**Solution**:
1. Make sure `tailwind.config.js` is configured correctly
2. Check that `@tailwind` directives are in `src/index.css`
3. Restart dev server (`npm start`)

### PNG Export Doesn't Work
**Cause**: html2canvas not loaded  
**Solution**:
1. Check for script in `public/index.html`
2. Open browser console (F12) and check for errors
3. Try using a different browser

### Mobile Version Issues
**Cause**: Browser cache or viewport settings  
**Solution**:
1. Hard reload page (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Check that viewport meta tag is present in HTML

---

## 🚧 Future Improvements

- [ ] Save custom tunings to localStorage
- [ ] More harmonic types (artificial, tapping)
- [ ] Chord mode with diagrams
- [ ] Export/import configurations in JSON
- [ ] Support for other instruments (bass, ukulele, 7-string)
- [ ] Metronome for practice
- [ ] "Guess the note" mode for ear training
- [ ] Dark/light theme
- [ ] Tablature mode
- [ ] Undo history

---

## 📊 Statistics

- 🌐 Online: [guitar-flex.online](https://guitar-flex.online)
- 📱 Full mobile device support
- 🎵 24 frets × 6 strings = 144 positions
- 🎼 12 major + 12 minor keys
- 🎸 6 preset tunings
- 🔊 Realistic guitar sound synthesis

---

## 📄 License

This project was created for educational purposes. Feel free to use and modify for your needs.

---

## 🤝 Contributing

Found a bug or have an improvement idea? Open an issue or pull request!

---

## 👨‍💻 Author

Created with ❤️ for guitarists of all levels.

**Try it now:** [guitar-flex.online](https://guitar-flex.online)

---

## 📞 Support

If you encounter problems:
1. Check the "Troubleshooting" section
2. Open an issue with detailed description
3. Attach screenshots and console logs

---

**Happy practicing! 🎸🎵**