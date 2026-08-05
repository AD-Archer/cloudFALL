# CLOUDFALL

A Hack Club **You Ship, We Ship** landing page: destroy the cloud by making it free.
Pick a subscription your household pays for every month, build the self-hosted thing
that replaces it, ship it open-source, and spend the hours you logged on discs to keep
your library on.


## Quick start

```bash
just          # list all recipes
just dev      # http://localhost:5174
just build    # static production build into dist/
just preview  # preview the production build
just clean    # remove node_modules and build output
```

`just dev` and `just build` install dependencies on first run. There is no server to
run: deploy `dist/` anywhere static.

## The backend is Stern

Everything that changes often is read at runtime from Stern's public content API
(no key, CORS open, edge-cached about 60s), so an edit in Stern shows up here within a
minute:

| What | Endpoint |
|------|----------|
| Program, images, accent, hours shipped | `/api/public/programs/cloudfall` |
| The live shop | `/api/public/programs/cloudfall/prizes` |
| Rules, project types, AI cap | `/api/public/programs/cloudfall/rules` |
| FAQ | `/api/public/programs/cloudfall/faq` |
| News | `/api/public/programs/cloudfall/news` |
| Events | `/api/public/programs/cloudfall/events` |
| Explore ideas and examples | `/api/public/programs/cloudfall/examples` |
