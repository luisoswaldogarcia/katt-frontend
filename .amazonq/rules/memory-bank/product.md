# Product Overview - Katt

## Purpose
Katt is a cat-themed virtual assistant web application designed as a management platform for healthcare/business contexts. It provides CRUD operations for patients/clients and doctors/companies with a configurable preset system.

## Value Proposition
- Mobile-first PWA installable on devices
- Multi-context support (healthcare "salud" or business "negocio") via label presets
- Custom fields system allowing users to extend entity data models without code changes
- Dark/light theme with purple-toned design

## Key Features
- **Patient/Client Management**: List, create, edit, detail views with custom fields
- **Doctor/Company Management**: Same CRUD pattern with configurable labels
- **Agenda**: Scheduling/calendar functionality
- **Chat**: Conversational interface with AI agent
- **Agent (Agente)**: AI assistant interaction
- **Custom Fields**: Dynamic form fields configurable per module (patient/doctor)
- **Preset System**: Switch between "salud" (healthcare) and "negocio" (business) terminology
- **PWA**: Installable, standalone display, auto-update via workbox
- **Theme Toggle**: Dark/light mode persisted in localStorage

## Target Users
- Healthcare clinic administrators managing patients and doctors
- Small business owners managing clients and companies
- Spanish-speaking users (UI entirely in Spanish)

## Current State
- Demo mode with in-memory data store (no backend yet)
- Frontend-only with localStorage persistence for settings/custom fields
