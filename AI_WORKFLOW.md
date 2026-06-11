# AI Workflow

This file will be finalized as the project is built. The goal is to document how AI tools were used, where they helped, where they were wrong, and how the generated work was verified.

## Tools Used

- OpenCode / GPT-5.5 for planning, codebase navigation, implementation support, and review.
- Manual review for product decisions, auth scope, API choice, and final code ownership.

## Representative Prompts

To be filled with actual prompts from the implementation process, including at least one prompt where the AI produced an incorrect or incomplete answer.

## Where AI Was Not Used

To be finalized after implementation. Expected examples:

- Final product judgment around login-less browsing and login-required likes.
- Manual verification of mobile scroll feel.
- Final review of auth/session behavior.

## Verification

To be finalized after implementation.

Planned verification:

- Run `pnpm check`.
- Run `pnpm check-types`.
- Manually verify anonymous browsing.
- Manually verify signup, login, logout.
- Manually verify likes persist across refresh for the logged-in user.
- Manually verify Pexels API key is not exposed to client code.
