# CLAUDE.MD

This file provides guidance to Claude Code when working with code in this repository.

## Repository Overview

This is the **PBN Fintech** project repository - a peer-to-peer cash exchange platform for the Netherlands. The repository contains:

- Project documentation and specifications
- The main application code in `pbn-fintech-app/`
- Technical specifications and analysis documents

**Important**: For detailed development guidance, commands, and architecture information, see **`pbn-fintech-app/CLAUDE.md`**.

## Repository Structure

```
pbn-fintech/
├── pbn-fintech-app/              # Main application directory
│   ├── CLAUDE.md                 # ⭐ Detailed development guide (READ THIS)
│   ├── backend/                  # Node.js + Express + Prisma backend
│   ├── mobile/                   # React Native app (empty - not implemented yet)
│   ├── web/                      # Web frontend
│   ├── docker-compose.yml        # Docker development environment
│   └── README.md                 # Application documentation
│
├── development_setup_guide.md    # Initial setup instructions
├── technical_specifications.md   # Technical specs & 4-week roadmap
├── technical_specifications_pure_p2p.md  # Pure P2P model specs
├── pbn_musk_analysis.md         # Business model analysis
├── pure_p2p_model_revision.md   # P2P model revision notes
├── PBN Fintec.pdf               # Original project documentation
└── vercel.json                  # Vercel deployment configuration
```

## Quick Start

### Working with the Application Code

All application development happens in the `pbn-fintech-app/` directory:

```bash
cd pbn-fintech-app

# Read the detailed development guide
cat CLAUDE.md

# Start the backend development environment
docker-compose up -d          # Start PostgreSQL + Redis
cd backend && npm run dev     # Start backend server
```

### Key Documentation Files

1. **`pbn-fintech-app/CLAUDE.md`** - Primary development guide
   - Complete architecture overview
   - All development commands
   - Database schema details
   - Current implementation status
   - Business context and metrics

2. **`development_setup_guide.md`** - Initial setup walkthrough
   - Prerequisites installation
   - First-time project setup
   - Day 1-2 development steps

3. **`technical_specifications.md`** - Product roadmap
   - 4-week MVP development plan
   - Technology stack decisions
   - Success metrics and KPIs

## Project Context

**PBN Fintech** is a pure peer-to-peer cash exchange platform:
- NOT a digital payment app
- NOT connected to banks
- Facilitates hand-to-hand physical cash exchanges between users
- Target market: Netherlands (Amsterdam, Rotterdam, The Hague)
- Revenue model: €2 flat fee per transaction (€1 from each party)

**Core Flow**:
1. User posts "Need €200 cash" or "Have €200 cash"
2. Matching engine finds compatible requests within 5km
3. Users coordinate safe meeting location
4. Hand-to-hand cash exchange with QR verification + GPS check
5. Both parties confirm and rate the transaction

## Current Development Status

**Repository Status**: Active development on branch `claude/update-claude-md-QSZjk`

**Application Status** (see `pbn-fintech-app/CLAUDE.md` for details):
- ✅ Backend infrastructure setup (Node.js + Express + Prisma)
- ✅ Authentication system (phone verification, JWT sessions)
- ✅ Database schema (complete)
- ✅ Docker development environment
- ⚠️ Core features need implementation (matching, transactions, reviews)
- ❌ Mobile app (empty directory - not started)

## Git Workflow

This repository is actively developed with Claude Code:
- Current branch: `claude/update-claude-md-QSZjk`
- Main development branch: Check git status for current configuration
- All pushes should go to the designated Claude branch

## Environment Configuration

The application requires environment variables. See `pbn-fintech-app/.env.example` for required configuration:
- Database connection (PostgreSQL)
- Redis connection
- JWT secret
- Twilio credentials (for SMS verification)
- Optional: Google Maps API, Dutch ID OCR API

## Important Notes for Claude Code

1. **Always work in `pbn-fintech-app/` directory** for code changes
2. **Read `pbn-fintech-app/CLAUDE.md`** before making backend changes
3. **This is a pure P2P platform** - no banking integration, no digital payments
4. **Security is critical** - QR verification, GPS checks, dual confirmation required
5. **TypeScript strict mode** - all code uses strict TypeScript
6. **Prisma workflow** - Always run `npm run db:generate` after schema changes

## Next Steps

If you're starting work on this project:
1. Read `pbn-fintech-app/CLAUDE.md` for complete context
2. Review `technical_specifications.md` for the development roadmap
3. Check current git branch and recent commits
4. Start Docker services: `cd pbn-fintech-app && docker-compose up -d`
5. Run backend: `cd backend && npm run dev`

For detailed commands, architecture, and implementation guidance, navigate to `pbn-fintech-app/` and refer to the CLAUDE.md file there.
