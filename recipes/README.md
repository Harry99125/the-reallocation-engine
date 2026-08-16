# Recipes

Recipes are agent-executable specifications for repeatable work: they describe the inputs a flow accepts, the steps it follows, the output contract it must satisfy, and the phase gates that must pass before the work proceeds. New professional contributions pair the AI recipe with a concise human-facing `.card.md`; the commands and pair version must change together.

Every recipe has a corresponding implementation in `scripts/`. Scripts are also callable as tools by the conductor, whether the conductor is Cowork or Codex.

For the operating principle behind this separation, see [AI does AI things; humans do human things](../docs/labor-separation.md).

The first complete two-customer pair is:

- AI recipe: [`Zening-AIRecipe.md`](Zening-AIRecipe.md)
- Human card: [`Zening.card.md`](Zening.card.md)
