This document captures my thoughts on implementing this project.

Upon seeing the requirement, we need to build a web application to communicate with users through LINE OA enabling sending and receiving messages via the web application.

Since speed is important nowadays from idea to prototype, and through multiple iterations to get faster feedback from users, I started with an initial POC in the /line-bot-poc directory.

The aim was to get it working as fast as possible as a proof of concept.
It helped me explore the LINE API, navigate through the LINE Business Dashboard, obtain the channel access token and channel secret, and understand how LINE messages are sent and received through a webhook endpoint.

There were a few trade-offs in the POC:

No authentication

Frontend queried the database directly

DB migration files lived inside the frontend page itself

Although this made it effortless to get everything ready quickly, it's not ideal architecturally.

I wired up Vercel Postgres through a Neon serverless database, added environment variables in Vercel, and kept the UI minimal.

After all, it met the objective of sending and receiving messages between company staff and end users.

-----

Next, although the POC met all the requirements, I still had some time to explore how I could improve it.

With v2, I wanted to:

Keep DB migration files separated

Move SQL query logic to API routes

Require an authorization bearer token (still hard-coded for simplicity, since auth is out of scope)

On the feature side, I wanted to introduce a mini bot to help handle chats.

Since each customer may have different levels of knowledge and context complexity:

For basic customers, I could introduce a simpler infrastructure

Offer a cheaper package plan with faster onboarding

Provide a simple persona plus a small customer-specific knowledge base

Because the information size is reasonable, I would attach it along with past conversations utilizing the OpenRouter API with a reasonably balanced LLM model (quality / speed / pricing).

I also improved the UI, added mobile view support, and enabled persona updates directly from the dashboard.

-----

Looking further (Out of scope):
- Capability to upload documents
- Tool calling lookups (e.g. calendar availability)
- Setting up RAG
- Embeddings
- Vector database integration