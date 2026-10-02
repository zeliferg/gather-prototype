// The group vote, as pure helpers: the host sees fixture votes arrive; the guest casts a real one.
import { restaurants, votes as fixtureVotes, type Guest, type RestaurantId, type Vote } from './fixtures';

export type Tally = Record<RestaurantId, string[]>;

const empty = (): Tally => ({ tavola: [], corner: [], noodle: [] });

/** Voter ids per place. `only` limits the fixture votes to guests who are still coming (and, for the
 *  host, to the first `arrived` of them); `exclude` drops "you" so your own `mine` can take its place. */
export function tallyVotes({ only, arrived = Infinity, exclude, mine }: {
  only: Pick<Guest, 'id'>[]; arrived?: number; exclude?: string; mine?: { id: string; restaurant: RestaurantId } | null;
}): Tally {
  const ids = new Set(only.map((g) => g.id));
  const t = empty();
  fixtureVotes.filter((v) => ids.has(v.guestId) && v.guestId !== exclude).slice(0, arrived)
    .forEach((v: Vote) => t[v.restaurant].push(v.guestId));
  if (mine) t[mine.restaurant].push(mine.id);
  return t;
}

export const voteCount = (t: Tally) => (Object.values(t) as string[][]).reduce((n, v) => n + v.length, 0);

/** The place with most votes, or null when the top is tied. */
export function leader(t: Tally): RestaurantId | null {
  const sorted = restaurants.map((r) => r.id).sort((a, b) => t[b].length - t[a].length);
  if (t[sorted[0]].length === 0 || t[sorted[0]].length === t[sorted[1]].length) return null;
  return sorted[0];
}

/** Most votes first; the fixture order (the fairness ranking) breaks ties, so an empty tally keeps it. */
export function rankByVotes(t: Tally) {
  return [...restaurants].sort((a, b) => t[b.id].length - t[a.id].length);
}

/** What the host books once the vote is in: the leader, or the best spot when the top is tied. */
export const winner = (t: Tally): RestaurantId => leader(t) ?? restaurants[0].id;
