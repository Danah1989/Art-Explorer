# Art Explorer

A full-stack web application for exploring the Art Institute of Chicago's public domain collection. Search and filter artworks by keyword, time period, color palette, and artwork type. Save favorites to a personal gallery with notes.

## Team Members
| Name | 
|------------|
| Dana Ali Alqarni | 
| Reema Dhaifallah Alanazi |
| Hessah |

## Projec Goals
- Create an interactive platform for exploring artworks and museum collections.
- Allow users to search and view detailed artwork information.
- Implement secure Google OAuth authentication.
- Enable users to save their favorite artworks.
- Develop a user-friendly web experience.
- Enhance users’ interest in art through an interactive digital experience.

## Website Flowchart
the following flowchart demonstrates the main workflow of the system.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| HTML | Page Structure|
| CSS | Styling and layout|
| JavaScript | Frontend interactivity|
| Node.js | Runtime environment |
| Express.js | Web framework (MVC architecture) |
| MongoDB + Mongoose | Database and ODM |
| EJS + express-ejs-layouts | Server-side templating |
| express-session | Session management |
| bcryptjs | Password hashing |
| Passport.js | Google OAuth 2.0 authentication |
| connect-mongo | MongoDB session store |
| Axios | HTTP client for API requests |
| Git & GitHub | Code versioning and team collaboration |

## Features

- Full-text search with date range filtering
- Color palette filter with 8 preset colors (Red, Orange, Yellow, Green, Blue, Purple, Pink, Brown)
- Artwork type filter (Painting, Drawing, Print, Sculpture, Photograph, Vessel, Textile)
- Era presets (Renaissance, Impressionist, Modern, Contemporary)
- Color swatch display on artwork cards and detail pages
- Personal favorites gallery with notes
- User registration and login (email/password)
- Google OAuth 2.0 sign-in with account linking
- Session-based authentication
- MongoDB caching layer for API responses
- Responsive design

## Prerequisites

- Node.js v18 or higher
- MongoDB (local installation or MongoDB Atlas)
- Google Cloud Platform project (for OAuth)

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd art-explorer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/art_explorer
SESSION_SECRET=your_secure_random_string_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
API_BASE_URL=https://api.artic.edu/api/v1
CACHE_TTL=3600
```

### 4. Start MongoDB

```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### 5. Run the app

```bash
# Development with auto-restart
npm run dev

# Production
npm start
```

Open **http://localhost:3000**

---

## Project Structure

```
art-explorer/
├── server.js                 Application entry point
├── config/
│   ├── database.js           MongoDB connection
│   └── passport.js           Google OAuth strategy
├── controllers/
│   ├── artController.js      Search and artwork detail
│   ├── authController.js     Registration, login, logout
│   ├── favoriteController.js Favorites CRUD operations
│   └── pageController.js     Homepage
├── middleware/
│   ├── authMiddleware.js     Authentication guards
│   └── errorMiddleware.js    404 and error handlers
├── models/
│   ├── User.js               User schema
│   ├── Favorite.js           Saved artworks schema
│   └── Cache.js              API response cache schema
├── routes/
│   ├── artRoutes.js          /art/* endpoints
│   ├── authRoutes.js         /auth/* endpoints
│   ├── favoriteRoutes.js     /favorites/* endpoints
│   └── pageRoutes.js         Homepage route
├── services/
│   └── artInstituteAPI.js    API client with caching
├── utils/
│   ├── colorUtils.js         Color conversion utilities
│   └── cacheUtils.js         Cache management helpers
├── views/
│   ├── layouts/
│   │   └── main.ejs          Main layout template
│   ├── partials/
│   │   ├── navbar.ejs        Navigation bar
│   │   ├── footer.ejs        Footer
│   │   └── artworkCard.ejs   Reusable artwork card
│   ├── art/
│   │   ├── results.ejs       Search results page
│   │   └── detail.ejs        Artwork detail page
│   ├── auth/
│   │   ├── login.ejs         Sign in page
│   │   └── register.ejs      Create account page
│   ├── favorites/
│   │   └── index.ejs         Personal gallery
│   ├── index.ejs             Homepage
│   └── error.ejs             Error page
└── public/
    ├── css/
    │   └── style.css         Global styles
    ├── js/
    │   ├── main.js           Global JavaScript
    │   ├── navbar.js         Dropdown menu functionality
    │   ├── favorites.js      AJAX save/unsave actions
    │   └── search-filters.js Filter button interactions
    └── images/
        └── logo.png          Site logo
```

## API Endpoints

| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/` | Homepage with featured artwork | No |
| GET | `/art/search` | Search with filters | No |
| GET | `/art/detail/:id` | Artwork detail page | No |
| GET | `/art/type/:typeId` | Artworks filtered by type | No |
| GET | `/auth/login` | Login page | No |
| POST | `/auth/login` | Authenticate user | No |
| GET | `/auth/register` | Registration page | No |
| POST | `/auth/register` | Create new account | No |
| GET | `/auth/google` | Initiate Google OAuth | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| GET | `/auth/logout` | Sign out | Yes |
| GET | `/favorites` | View saved gallery | Yes |
| POST | `/favorites` | Save artwork | Yes |
| POST | `/favorites/toggle` | Toggle save status | Yes |
| DELETE | `/favorites/:id` | Remove saved artwork | Yes |
| PUT | `/favorites/:id/notes` | Update notes | Yes |

## Filter Combination Examples

All filters combine in a single query:

```
/art/search?q=monet&dateStart=1880&dateEnd=1900&colorHue=210&typeId=1
```

→ Paintings by Monet, 1880–1900, with blue tones

## Query Parameters for Search

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `q` | string | Search query | `monet` |
| `dateStart` | number | Start year | `1850` |
| `dateEnd` | number | End year | `1900` |
| `colorHue` | number | Color filter (0-360) | `210` |
| `typeId` | number | Artwork type ID | `1` |
| `page` | number | Page number | `1` |

## Color Filter Values

| Color | Hue Value |
|-------|-----------|
| Red | 0 |
| Orange | 25 |
| Yellow | 50 |
| Green | 120 |
| Blue | 210 |
| Purple | 275 |
| Pink | 330 |
| Brown | 30 |

## Artwork Type IDs

| Type | ID |
|------|-----|
| Painting | 1 |
| Drawing | 14 |
| Print | 18 |
| Sculpture | 3 |
| Photograph | 4 |
| Vessel | 23 |
| Textile | 26 |

## User Model

| Field | Type | Description |
|-------|------|-------------|
| `username` | String | Unique username (3-30 chars) |
| `email` | String | Unique email address |
| `password` | String | Hashed password (local accounts) |
| `googleId` | String | Google OAuth ID (sparse) |
| `displayName` | String | Full name from Google profile |
| `avatar` | String | Profile image URL |
| `createdAt` | Date | Account creation timestamp |

## Favorite Model

| Field | Type | Description |
|-------|------|-------------|
| `user` | ObjectId | Reference to User |
| `artworkId` | Number | Art Institute API ID |
| `title` | String | Artwork title |
| `artist` | String | Artist name |
| `imageId` | String | IIIF image identifier |
| `dateDisplay` | String | Creation date |
| `medium` | String | Artwork medium |
| `dominantColor` | Object | HSL and hex values |
| `notes` | String | User notes |
| `colorTags` | Array | User-defined color tags |
| `savedAt` | Date | Save timestamp |

## Cache Model

| Field | Type | Description |
|-------|------|-------------|
| `key` | String | Unique cache key |
| `data` | Mixed | Cached response data |
| `createdAt` | Date | TTL index (expires after 1 hour) |


## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `SESSION_SECRET` | No | art_explorer_secret_key_2024 | Session encryption secret |
| `GOOGLE_CLIENT_ID` | No | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | - | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | No | http://localhost:3000/auth/google/callback | OAuth callback URL |
| `API_BASE_URL` | No | https://api.artic.edu/api/v1 | Art Institute API URL |
| `CACHE_TTL` | No | 3600 | Cache TTL in seconds |
| `NODE_ENV` | No | development | Environment mode |

## Screenshots

## Future Work
- Add an artwork recommendation system based on user preferences.
- Enable users to leave comments and reviews on artworks.
- Integrate an AI-powered guide to help users explore and understand artworks.
- Add multilingual support for a wider range of users.
  
## Resources

  - Art Institute of Chicago API     
    https://api.artic.edu/docs/

- MongoDB Documentation  
  https://www.mongodb.com/docs/

- Express.js Documentation  
  https://expressjs.com/

- Passport.js Documentation  
  https://www.passportjs.org/docs/

- Node.js Documentation  
  https://nodejs.org/docs/latest/api/

## Notes

- Color filtering works by fetching a pool of up to 500 artworks (5 pages × 100) and filtering client-side
- The featured artwork on the homepage changes on every refresh and is cached for 10 minutes

## License

This project uses the Art Institute of Chicago API. All artwork images and metadata are subject to the Art Institute of Chicago's terms of use.
