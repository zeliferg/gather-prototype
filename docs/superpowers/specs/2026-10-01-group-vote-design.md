# v2: group vote on the spot — design

Date: 2026-10-01. First change of v2, from the first interview round: "most people
wanted to see if participants can have a say in the selection".
Decisions in the user's words: guests "pick favourite", "the last say will be on the host",
the mode is chosen "when they are creating the party", and "we only get to pick a spot after
everyone joins … they'd get a text saying time to vote … the host would see votes and makes
a call … guests will get the notif of jordan picked a spot".

## Host

- **ORG 1 Create Party**: a new field under Your location, *Who picks the spot*: a segmented
  control, **Everyone votes** (default) / **I'll pick**. Saved as `decide: 'vote' | 'host'`.
  Editable in the Edit details drawer until booked.
- **ORG 4 hub**: no card for it (2 Oct 2026 revision, below). *Who picks the spot* lives in the
  Edit details drawer, with Your location and Your preferences.
- **Everyone's in** (ORG 5): vote mode copy adds "Everyone's voting on their favourite now."
  CTA *See the vote*.
- **Votes arrive** on their own once everyone's in: one fixture vote every `VOTE_TICK_MS`
  (2.5 s), in fixture order, on whatever host screen is open (`VoteWatcher` on host routes).
  The hub's Places card becomes *The vote so far* with a count per row, leader first, footer
  *See the votes*. When the last fixture vote lands, a Gather banner **Votes are in!** (stays
  until closed, tap → ORG 6) and the card head reads *Votes are in*.
- **ORG 6**: title *The vote so far* / *Votes are in*, subtitle "Guests picked their favourite.
  You have the last say." Cards sort by votes; the leader carries *Most votes*, the rest
  *Great spot*. Each card has a vote line at the right of its name: voters' faces, "2 of 4 votes"
  (no bar, no chevron: 2 Oct 2026 revision).
- **ORG 6c / confirm**: one extra line "2 of 4 voted for this." If the host confirms a place
  that isn't leading, the confirm step says "Most votes went to <leader>. Everyone gets a text
  with your pick."
- With **I'll pick**, every host screen is exactly v1.

## Guest (always vote mode; the guest build cannot know the host's choice)

- **P 3b after joining**: "You're in. Waiting for everyone, then we all vote on a spot."
- `VOTE_OPEN_DELAY_MS` (8 s) after joining: a Messages banner "Everyone's in! Time to vote on
  a spot for Jordan's Dinner." Tap → P 3b. The card is now **Pick your favourite**, caption
  "Jordan has the last say.", three rows (photo, name, cuisine · Reserve/Walk-in, radio).
  Tapping a row votes at once (radio springs, *Your vote* chip); tapping another changes it.
  After voting the rows show the tally (fixture votes minus "you", plus yours) as bars and
  counts, and "3 of 4 have voted · Jordan books once everyone has."
- `BOOKING_DELAY_MS` (15 s) after the vote (or 20 s after the vote opened if never cast): the
  host books. Winner = the place with most votes; a tie at the top goes to the first option
  (the best spot). Banner "Jordan picked a spot. Jordan's Dinner is at <place>, Fri Sep 12 at
  7:00 PM." The booked card carries *Won the vote* or *Jordan's pick*; details and
  confirmation name the booked place. The fixtures split the others 1/1/1, so the tester's
  vote always decides unless they never vote.

## Fixtures and code

- `fixtures.ts`: `votes` (priya→tavola, marcus→corner, alex→tavola, sam→noodle),
  `DecideMode`, `VOTE_TICK_MS`, `VOTE_OPEN_DELAY_MS`, `sms.voteOpen`, `sms.spotConfirmed(place)`.
- `vote.ts` (pure, tested): `tallyVotes`, `leader`, `rankByVotes`.
- `state.tsx`: `decide`, `vote`, `votedAt`, `voteOpenAt`, `hostVotesIn`, `votesInSeen`.
- Screens: OrgCreateParty, EditDetails, OrgHub, OrgListReady, OrgOptions + RestaurantCard,
  PWaiting, PBooked, BookingWatcher; new `VoteWatcher`. No new routes.
- Tests: `vote.test.tsx`; host spine on the default vote path plus an "I'll pick is v1" check
  from seeded state; participant spine votes and sees the matching winner.

## Revision, 2 Oct 2026 (the user's first v2 comments, by frame)

- **ORG 4 / ORG 4 The vote so far**: the Places card is a `<button>`, and the browser's default
  `align-items: flex-start` on buttons shrink-wrapped its column, so dividers and the chevron
  stopped short. `button.card { align-items: stretch }` fixes every button-card.
- **ORG 4**: the *Your preferences* and *How we'll decide* cards are gone. Both are rows in Edit
  details (`EditDetails decide` prop on the hub; ORG 10 passes nothing, so Who picks never shows
  after booking). Your preferences is a `PickerField` that swaps the drawer for the chips sheet
  and back; Save commits name, When, decide and preferences together. The Guests card is
  `card--compact` (12px vertical padding, 8px gap, 24px head when there is no + action).
- **"Your party is live" banner**: removed after Verify (it rode on router `location.state`, so
  every return to the hub replayed it). The "everyone got a text" moment is now on **ORG 10**, once,
  600 ms after it opens: a Gather banner "<party> is on: <place>, <date> at <time>, table for N.
  Everyone got a text with the details." (walk-in: "…Everyone got a text to head over then.").
  `bookedTold` in state closes it for good.
- **ORG 6 vote cards**: no chevron on any card (the whole card opens the place), no progress bar.
  `VoteLine` is inline: faces (max 3) + "N of M votes", at the right of the name row
  (`.rcard__title`, wraps under the name when the name is long). Guest side uses the same line.
- **ORG 10 booked card**: the place's photo (140px) with the *Booked* (or *Walk-in*) chip on it,
  name + "address · Table for N", a 32px (i) `card__action` → a *Reservation details* drawer
  (When, Table, Where, Hours, "Booked on OpenTable", See full menu), then Directions / Add to calendar.
- Figma: Flow1 v6 host lane refreshed in place (ids 599–605) plus four new row-2 frames
  (607 Edit details → Your preferences, 606 I'll pick hub, 608 ORG 10 with banner, 609 the drawer).
