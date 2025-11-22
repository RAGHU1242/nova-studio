# 🚀 Fusion Starter

A **production-ready full-stack React starter template** with an integrated Express server, built for speed, scalability, and clean architecture.

It features **React Router 6 SPA mode**, **TypeScript**, **Vitest**, **Zod**, and modern tooling out of the box.

> ⚠️ The Express server is included mainly for **secure server-side logic**.  
> Only create endpoints when strictly necessary — for example:
> - 🔐 Private key handling  
> - 🗄️ Database operations  
> - 🛡️ Secure authentication logic  
> - 🌐 External service integration  



## 🛠 Tech Stack

- **📦 Package Manager**: PNPM *(preferred for faster installs & disk efficiency)*  
- **🎨 Frontend**: React 18 + React Router 6 (SPA) + TypeScript + Vite + TailwindCSS 3  
- **⚙️ Backend**: Express (integrated with Vite dev server for full-stack dev)  
- **🧪 Testing**: Vitest *(fast, Vite-native testing)*  
- **🧩 UI System**: Radix UI + TailwindCSS 3 + Lucide React Icons  
- **✅ Validation**: Zod *(type-safe schema validation)*  
- **🔒 Type Safety**: End-to-end with TypeScript  
- **⚡ Dev Experience**: Hot reloading + Vite middleware integration  



## Project Structure

```
client/                   # React SPA frontend
├── pages/                # Route components (Index.tsx = home)
├── components/ui/        # Pre-built UI component library
├── App.tsx                # App entry point and with SPA routing setup
└── global.css            # TailwindCSS 3 theming and global styles

server/                   # Express API backend
├── index.ts              # Main server setup (express config + routes)
└── routes/               # API handlers

shared/                   # Types used by both client & server
└── api.ts                # Example of how to share api interfaces
```

## ✨ Key Features

## 🌐 SPA Routing System

The application uses **React Router 6** for smooth client-side navigation in SPA mode.

### 📁 File Structure
- `client/pages/Index.tsx` → Main Home Page  
- `client/App.tsx` → Central route configuration  
- `client/pages/` → All page-based routes  

Routes are registered using `react-router-dom` like this:

```tsx
import { Routes, Route } from "react-router-dom";

<Routes>
  <Route path="/" element={<Index />} />
  
  {/* ✅ All custom routes should be added above this catch-all */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

### 🔑 Notes:
- Always place your `*` (NotFound) route **last**.
- Each file inside `client/pages/` represents a single page.
- Keeps routing clean, scalable, and easy to maintain as the app grows.

### 🎨 Styling System

- **Primary Styling**: TailwindCSS 3 utility-first approach  
- **Theme & Design Tokens**: Centralized in `client/global.css`  
- **UI Components**: Reusable component library inside `client/components/ui/`  
- **Utility Function**: `cn()` merges `clsx` + `tailwind-merge` to handle conditional class names cleanly  

#### ✅ `cn()` Utility Example

```tsx
className={cn(
  "base-classes",
  { "conditional-class": condition },
  props.className // user overrides
)}
```

This ensures:
- Clean class management  
- No duplicate Tailwind classes  
- Easy conditional styling  

---

### ⚙️ Express Server Integration

The backend is seamlessly integrated with Vite for full-stack development.

- **Development Mode**: Runs on a **single port (8080)** for both frontend + backend  
- **Hot Reload**: Supports HMR for client and auto-restart for server  
- **API Route Prefix**: All backend routes are under `/api/`

#### Example API Endpoints

- `GET /api/ping` → Simple health check  
- `GET /api/demo` → Demo API endpoint  

---

### 🔗 Shared Types & Path Aliases

Shared TypeScript types can be used across both client and server:

```ts
import { DemoResponse } from "@shared/api";
```

#### Path Aliases

- `@shared/*` → Shared folder  
- `@/*` → Client folder  

This keeps your imports clean, scalable, and maintainable across the codebase.

## 🧑‍💻 Development Commands

Use these commands during development and production:

```bash
pnpm dev        # Start dev server (client + server)
pnpm build      # Production build
pnpm start      # Start production server
pnpm typecheck  # Run TypeScript type checks
pnpm test       # Run Vitest test suite
```

---

## ➕ Adding Features

### 🎨 Adding New Theme Colors

To extend the color palette:

1. Open `client/global.css`
2. Update `tailwind.config.ts`
3. Add or modify Tailwind color tokens as needed

This allows you to control and scale your design system from a single source of truth.

---

### 🌐 Adding a New API Route

If your API requires shared types, define them first.

1. **Create a shared interface** in `shared/api.ts`:

```ts
export interface MyRouteResponse {
  message: string;
  // Add other response properties here
}
```

2. Define your new Express route under `/api/*`  
3. Import the shared type in both client and server

Example usage:

```ts
import { MyRouteResponse } from "@shared/api";
```

This ensures:
- ✅ Full type safety across frontend & backend  
- ✅ Clean shared contract  
- ✅ No duplicated types  


2. Create a new route handler in `server/routes/my-route.ts`:
```typescript
import { RequestHandler } from "express";
import { MyRouteResponse } from "@shared/api"; // Optional: for type safety

export const handleMyRoute: RequestHandler = (req, res) => {
  const response: MyRouteResponse = {
    message: 'Hello from my endpoint!'
  };
  res.json(response);
};
```

3. Register the route in `server/index.ts`:
```typescript
import { handleMyRoute } from "./routes/my-route";

// Add to the createServer function:
app.get("/api/my-endpoint", handleMyRoute);
```

4. Use in React components with type safety:
```typescript
import { MyRouteResponse } from '@shared/api'; // Optional: for type safety

const response = await fetch('/api/my-endpoint');
const data: MyRouteResponse = await response.json();
```

### New Page Route
1. Create component in `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

## Production Deployment

- **Standard**: `pnpm build`
- **Binary**: Self-contained executables (Linux, macOS, Windows)
- **Cloud Deployment**: Use either Netlify or Vercel via their MCP integrations for easy deployment. Both providers work well with this starter template.

## Architecture Notes

- Single-port development with Vite + Express integration
- TypeScript throughout (client, server, shared)
- Full hot reload for rapid development
- Production-ready with multiple deployment options
- Comprehensive UI component library included
- Type-safe API communication via shared interfaces
