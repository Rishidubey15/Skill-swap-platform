# SkillSwap

SkillSwap is a skill exchange platform built with React and TypeScript. Users can register, log in, create a profile, offer and request skills, and swap skills with others. The app features a responsive UI with light and dark mode support, and uses Tailwind CSS for styling.

## Features

- **Authentication:** Register and log in securely.
- **Profile Management:** Add skills you offer and want to learn, set availability, and manage privacy settings.
- **Skill Browsing:** Search and filter users by skills and location.
- **Skill Swap Requests:** Request to swap skills with other users.
- **Dark/Light Mode:** Toggle between dark and light themes globally.
- **Responsive Design:** Works well on desktop and mobile devices.

## Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** React Router

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## Folder Structure

- `src/pages/` — Main pages (Login, Register, Profile, Browse, etc.)
- `src/components/` — Shared UI components (Navbar, Modals, etc.)
- `src/contexts/` — Context providers (e.g., AuthContext)

## Theming

- The global theme (dark/light) is controlled by a toggle button in the Navbar.
- All input fields, cards, and modals adapt their colors based on the current theme.

## Customization

- Update Tailwind config for custom colors or breakpoints.
- Add new skills, availability options, or user profile fields as needed.

## License

This project is for educational and hackathon purposes.

---

Feel free to contribute or
