# TaqwaFund Prototype

TaqwaFund is a competition prototype for a Smart Sharia Financial Readiness Platform for MSMEs / UMKM.

The product helps UMKM assess financial readiness, improve weak indicators, and only then explore relevant sharia financing alternatives. TaqwaFund is not a lender, bank, or financing approval provider.

## Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React
- lucide-react
- localStorage for prototype persistence

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Demo Flow

1. Open `/`
2. Continue to `/assessment`
3. Submit the pre-filled assessment
4. Review TaqwaScore at `/score`
5. Complete recommendations in `/planning`
6. Score improves from 68 to 82
7. Explore alternatives at `/financing-match`

## Route List

- `/` Main dashboard
- `/dashboard` Main dashboard
- `/assessment` Financial Readiness Assessment
- `/score` TaqwaScore result
- `/planning` Contextual AI improvement planning
- `/improvement` Redirect to `/planning`
- `/financing-match` Sharia Financing Match
- `/assistant` Compatibility redirect to `/planning`
- `/education` Sharia Financial Education
- `/profile` Business Profile

## Demo Persona

- Name: Bu Aisyah
- Business: Rumah Kue Aisyah
- Category: Kuliner
- Monthly revenue: Rp30.000.000
- Monthly expense: Rp20.000.000
- Financing need: Rp25.000.000
- Purpose: Membeli oven produksi

## TaqwaScore Disclaimer

TaqwaScore is a prototype financial readiness indicator, not a credit approval model. It does not determine financing approval, final creditworthiness, or any bank or financing institution decision.

## Vercel Deployment

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Use the default Next.js settings.
4. Build command: `npm run build`
5. Output is handled by Next.js.
