# YT-VideoPlayer

A modern, responsive video player application built with Next.js, React, and Tailwind CSS. This project demonstrates a custom-built video player with advanced features like picture-in-picture (PiP) mode, category-based browsing, and playback state persistence.

## 🚀 Features

- **Custom Video Player**: A fully custom-built video player interface with intuitive controls for playback, volume, and seeking.
- **Picture-in-Picture (PiP) Mode**: Seamlessly minimize the video player to a floating window while continuing to browse other videos and categories.
- **Category Browsing**: Filter and explore videos by categories (e.g., Gaming, Music, Technology, etc.) with smooth transitions.
- **Playback Persistence**: The application remembers the playback progress for each video, allowing users to resume exactly where they left off.
- **Responsive Design**: innovative and responsive UI that adapts perfectly to desktop, tablet, and mobile screens.
- **Smooth Animations**: Enhanced user experience with fluid animations powered by Framer Motion.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Library**: [React 18](https://reactjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Local State Management**: React Context API (`PlayerContext`)
- **Video Component**: `react-player`

## 📂 Project Structure

```
YT-VideoPlayer/
├── src/
│   ├── app/            # Next.js App Router pages and layouts
│   ├── components/     # Reusable UI components
│   │   ├── home/       # Homepage specific components (VideoCard, CategoryPills)
│   │   ├── player/     # Video player components (FullPlayer, MiniPlayer, Controls)
│   │   └── ...
│   ├── context/        # Global state management (PlayerContext)
│   ├── lib/            # Utilities and mock data
│   └── types/          # TypeScript definitions
├── public/             # Static assets
└── ...
```

## 🏁 Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- **Node.js**: Version 18 or higher is recommended.
- **npm** or **yarn**: Package manager.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/NitishKumar078/YT-VideoPlayer.git
    cd YT-VideoPlayer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

2.  **Open in Browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📜 Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint to check for code quality issues.
