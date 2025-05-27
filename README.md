# Prompt management UI

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/shubhanshusinghs-projects/v0-prompt-management-ui)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/6oaobrbkh7w)

## Overview

Exemplar Prompt Hub is a comprehensive prompt management system that helps you organize, version, and test your AI prompts. This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev). Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Features

### Prompt Management
- **Create and Edit Prompts**: Easily create new prompts with names, descriptions, and tags
- **Version Control**: Track different versions of your prompts with version history
- **Tagging System**: Organize prompts with custom tags for better categorization
- **Search Functionality**: Quickly find prompts using search and tag filters
- **Metadata Support**: Add custom metadata to prompts for additional context

### Prompt Playground
- **Multi-Model Testing**: Test prompts across different AI models simultaneously
- **Variable Support**: Use dynamic variables in prompts with `{{variable}}` syntax
- **Side-by-Side Comparison**: Compare responses from different models
- **Model Selection**: Choose from various AI models including GPT-4 and Claude

### User Interface
- **Modern Design**: Clean and intuitive interface built with Next.js and Tailwind CSS
- **Responsive Layout**: Works seamlessly across different screen sizes
- **Real-time Updates**: Instant feedback on actions with toast notifications
- **Accessible Components**: Built with Radix UI for better accessibility

## Tech Stack

This project is built using modern web technologies:

- **Framework**: Next.js 15.2.4 with React 19
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: 
  - Radix UI for accessible components
  - Lucide React for icons
  - Various UI components like Accordion, Dialog, Toast, etc.
- **Form Handling**: React Hook Form with Zod validation
- **Development**: TypeScript for type safety

## Project Structure

```
├── app/                 # Next.js app directory
├── components/         # Reusable UI components
├── lib/               # Utility functions and configurations
├── public/            # Static assets
├── styles/            # Global styles
└── hooks/             # Custom React hooks
```

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

Your project is live at:

**[https://vercel.com/shubhanshusinghs-projects/v0-prompt-management-ui](https://vercel.com/shubhanshusinghs-projects/v0-prompt-management-ui)**

## Development

Continue building your app on:

**[https://v0.dev/chat/projects/6oaobrbkh7w](https://v0.dev/chat/projects/6oaobrbkh7w)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
