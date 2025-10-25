# Frontdesk Human-in-the-Loop AI Supervisor

## Overview
This project implements a human-in-the-loop AI system for handling customer inquiries.
The AI can answer known questions and escalate unknown ones to a human supervisor. Responses are recorded in a knowledge base to improve the AI over time.

## Key Features:
- AI handles known questions automatically.

- Unknown questions create pending help requests for supervisors.

- Supervisor answers update the AI knowledge base automatically.

- Lifecycle of help requests: Pending → Resolved / Unresolved.

- Simple admin UI to manage pending, resolved, and unresolved requests.

---

## Architecture
- Backend: Node.js, Express, MongoDB
- Frontend: React
- Data Models:

HelpRequest: Tracks question, customer, status (PENDING, RESOLVED, UNRESOLVED), supervisor responses, timestamps.

- Knowledge: Stores learned question-answer pairs.

- Flow:

1. Customer asks a question → AI receives it via API.

2. If AI knows the answer → responds immediately.

3. If AI doesn’t know → creates a pending help request.

4. Supervisor answers → AI updates knowledge base and notifies customer (simulated via console/logs).

---
## Installation & Setup
### Clone repo
```
git clone <repo-url>
cd AI-agent
```
### Backend
```
cd backend
npm install
# Add .env with MONGO_URI
npm start
```
### Frontend
```
cd ../frontend
npm install
npm start
```
Access frontend at http://localhost:3000.
---

## Frontend UI

- Pending Requests: Shows all questions awaiting supervisor response.

- Unresolved Requests: Shows questions marked unresolved with reason.

- History: Tracks resolved and unresolved requests.

- Click a request → view details → answer or mark unresolved.

## Backend APIs

- POST /api/ai/call → send question to AI.

- GET /api/supervisor/pending → get pending requests.

- POST /api/supervisor/respond → supervisor answers question.

- GET /api/help-requests → all help requests.

- GET /api/knowledge → AI learned answers.
---

## Project Status
Phase 1 Complete: 
- Simulated AI flow for handling unknown questions
- Supervisor pending/resolved/unresolved lifecycle implemented
- Knowledge base auto-updates
- Admin UI for managing requests
Phase 2 (Future Work): Live call integration, real-time supervisor handoff

---
## Deploy Link
 [https://ai-agent-v83y.onrender.com]

