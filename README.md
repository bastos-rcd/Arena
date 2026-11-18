# Arena

**Arena** is a sports competition application for friends. Create a challenge, invite your friends and see who comes out on top over a set period.

## Tech stack

- **Frontend** : [Vite](https://vite.dev/) + [React](https://react.dev/) + TypeScript
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **Backend** : [Supabase](https://supabase.com/)

## Design

- **Sober and modern** : few elements, no unnecessary decoration
- **Dark theme only** : a single theme to maintain, well suited for sports use
- **One accent** : the Volt color is reserved for what matters (primary action, best time, status)

### Color palette

#### Neutrals

| Name     | Color   | Usage                                |
| -------- | ------- | ------------------------------------ |
| Ink      | #0E1116 | App background                       |
| Graphite | #171B22 | Cards, containers                    |
| Slate    | #252C37 | Borders, dividers, raised areas      |
| Snow     | #F2F4F7 | Primary text, icons                  |
| Mist     | #8B94A3 | Secondary text, labels, placeholders |

#### Accent

| Name | Color   | Usage                                     |
| ---- | ------- | ----------------------------------------- |
| Volt | #C8F751 | Primary button, best times, status badges |

#### Functional

| Name    | Color   | Usage                                        |
| ------- | ------- | -------------------------------------------- |
| Gold    | #E8B84A | 1st place                                    |
| Silver  | #B9C0CC | 2nd place                                    |
| Bronze  | #C8814F | 3rd place                                    |
| Success | #3DDC97 | Confirmations (activity validated, etc.)     |
| Error   | #FF5C5C | Errors (route mismatch, failed import, etc.) |

### Logo

**Concept** : a running track seen from above (stadium shape), with a solid center core. The symbol is abstract, contains no text and works for every sport in the app.

- `arena-icon.svg`

![arena-icon](public/arena-icon.svg)

- `arena-logo.svg`

![arena-logo](public/arena-logo.svg)

### Typography

**Single typeface** : [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts, open license).

## Quick start

1. Clone repository

   ```bash
   git clone https://github.com/bastos-rcd/Arena.git
   cd Arena
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start the local Supabase stack

   ```bash
   npx supabase start
   ```

4. Write your Supabase environment variables into `.env.local` file

   ```
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_URL=http://192.168.1.39:54321
   VITE_SUPABASE_PUBLISHABLE_KEY=<publishable or anon key>
   ```

5. Run the app

   ```bash
   npm run dev
   npm run dev -- --host
   ```

## License

This project is licensed under the [MIT License](LICENSE).
