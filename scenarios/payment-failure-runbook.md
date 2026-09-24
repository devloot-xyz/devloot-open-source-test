# Failed USDC bounty payout runbook

## Identify the transfer state
Look up the transaction ID on the configured Algorand network. A confirmed transaction is successful; an unconfirmed transaction may still be pending. Treat an explicit rejection or expiry as failed.

## Retry safely
Before retrying, search for a successful transfer from the bounty escrow to the intended recipient. Never send again while the original transaction remains pending or a confirmed transfer exists.

## Idempotency check
Record the bounty ID and original transaction ID. Compare both with the payout record and chain history before creating a new payout transaction; one bounty must not produce two successful payouts.

## Escalation
If the state is ambiguous, stop automated retries and ask an administrator to review the bounty ID, transaction ID, network, and public chain status. Keep private keys, seed phrases, and private wallet data out of the review note.
