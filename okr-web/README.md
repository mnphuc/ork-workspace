# OKR Web Application

This is a [Next.js](https://nextjs.org) project for OKR (Objectives and Key Results) management with internationalization (i18n) support.

## Features

- **Multi-language Support**: Vietnamese and English
- **OKR Management**: Create, update, and track objectives and key results
- **User Authentication**: Login and registration
- **Dashboard**: Overview of OKR progress
- **Alignment**: Link objectives to show dependencies

## Internationalization (i18n)

This application supports multiple languages:

- **Vietnamese (vi)**: Default language
- **English (en)**: Secondary language

### Language Selection

Users can change the language using the language selector in the header. The selected language is saved in localStorage and sent to the backend via `Accept-Language` header.

### Adding New Languages

To add a new language:

1. Create a new translation file in `src/i18n/locales/{language_code}/translation.json`
2. Add the language to the `languages` array in `src/components/LanguageSelector.tsx`
3. Update the backend message files in `okr-service/src/main/resources/messages_{language_code}.properties`
4. Update the supported locales in `okr-service/src/main/java/org/phc/templatejavabe/infrastructure/config/I18nConfig.java`

### Adding New Translation Keys

1. **Frontend**: Add the key to both `src/i18n/locales/vi/translation.json` and `src/i18n/locales/en/translation.json`
2. **Backend**: Add the key to both `messages.properties` and `messages_en.properties`

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
