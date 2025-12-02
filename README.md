### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Backend API running on port 5000

### Step 1: Create Next.js App

```bash
npx create-next-app@latest carehub
```

**Choose these options:**

- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src/ directory (No)
- ✅ Import alias (@/\*)

### Step 2: Install Dependencies

```bash
cd carehub
npm install daisyui lucide-react
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:5000/api
```

**Terminal 1 - Backend:**

```bash
cd carehub-api
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd carehub
npm run dev
```
