# Marathon Pace Chart 🏃

A web application to calculate marathon split times. Set your target finish time and get pace charts for race day.

## Features

- **Slider-based input** - Easy time selection without typing
- **Unit support** - Switch between kilometers and miles
- **Multi-language** - English, Japanese, Chinese, Spanish, Hindi
- **Shareable** - Share your pace chart on X and Facebook
- **Print-friendly** - Optimized for printing
- **Dark mode** - Eye-friendly dark theme
- **URL sharing** - Share specific target times via URL (e.g., `/3-30-00` for 3:30:00)

## Tech Stack

- React 18
- Vite 5
- TailwindCSS 3
- React Router 6

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment to GitHub Pages

1. Create a new GitHub repository
2. Push this code to the repository
3. Go to **Settings > Pages**
4. Under "Build and deployment", select **GitHub Actions**
5. The included workflow will automatically build and deploy on push to `main`

The workflow automatically handles:
- Converting SVG OGP image to PNG
- Setting correct base path for GitHub Pages
- Building and deploying the app

## URL Routing

The app supports URL-based time sharing:
- `/` - Default (4:00:00)
- `/3-30-00` - 3 hours 30 minutes
- `/2-45-30` - 2 hours 45 minutes 30 seconds

## Customization

### OGP Image
Replace `public/og-image.svg` with your own design. The GitHub Actions workflow will convert it to PNG during build.

### Base Path
The vite config automatically detects if you're using a subdirectory (e.g., `username.github.io/repo-name`) or root domain.

## License

MIT
