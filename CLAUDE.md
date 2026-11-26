# CLAUDE.md

## Project

- Clan website for the game ROB RUN.
- Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- Prisma 6 with MongoDB (Prisma 7+ does not support MongoDB yet).
  After a schema change: stop the dev server, run `npm run db:generate`, start it
  again. It keeps the old client in memory, and on Windows it locks the engine
  file, so generating while it runs fails with `EPERM`.
- Shared types live in `types.d.ts` (import from `@/types`).
- The project is open source: write all code comments and docs in English.

## Code style

### No semicolons

Never use semicolons in code (`.ts`, `.tsx`, `.js`, `.mjs`), including type
members (`{ a: string, b: number }` on one line, no delimiter on multiple lines).
Enforced by ESLint (`@stylistic/semi: never`, `@stylistic/member-delimiter-style`
in `eslint.config.mjs`), so run `npx eslint . --fix` after editing.

If a statement would start with `(`, `[` or a template literal, restructure it
instead of adding a semicolon (e.g. `const store = await cookies()` then
`store.set(...)`, not `(await cookies()).set(...)`). CSS keeps its semicolons.

### Mapping in JSX

Never use an implicit return (`.map((item) => ( ... ))`) when rendering lists.
Always use a block body with an explicit `return`:

```tsx
{menuItems.map((item) => {

    return (
        <li key={item.href}>
            <Link href={item.href}>
                {item.label}
            </Link>
        </li>
    )
})}
```

## Pages (App Router)

Every route is split into a server `page.tsx` and a client `page.client.tsx`
in the same folder. The server page only renders the client page.
Reference implementation: `app/auth/login/`, `app/auth/register/`.

```
app/auth/login/
├── page.tsx          # server component
└── page.client.tsx   # client component
```

`page.tsx` — server component, default export is always named `Page`:

```tsx
import LoginPageClient from "./page.client"

export default function Page() {

    return (
        <LoginPageClient/>
    )
}
```

`page.client.tsx` — starts with `'use client'`, default export is named
`<RouteName>PageClient` (PascalCase of the route folder name):

```tsx
'use client'

export default function LoginPageClient() {

    return (
        <div>

        </div>
    )
}
```

Naming examples: `app/auth/login` → `LoginPageClient`,
`app/auth/register` → `RegisterPageClient`, `app/clans` → `ClansPageClient`.
Dynamic routes use the param name: `app/p/[playerId]` → `PlayerIdPageClient`,
`app/c/[clanId]` → `ClanIdPageClient`. Read the param with `useParams()` and
validate it in the server action (`objectIdSchema`).

Layouts are split the same way: `layout.tsx` renders `<RouteName>LayoutClient`
from `layout.client.tsx`. `app/c/[clanId]` loads the clan in its layout, its tabs
(`wall`, `members`, `servers`) are routes and read it with `useClanContext()`
(`context/ClanContext.tsx`). Add new tabs to `clanTabs` in the layout.
The panel is not a tab: leader and officers open it with the settings icon in the header.
It has its own layout with `components/layout/PanelSidebar.tsx`, every area is a page
(`app/c/[clanId]/panel/*`). Add new areas to `panelPages` in that layout, which also
checks `canManage`.

## Metadata

Every `page.tsx` exports `generateMetadata` (the only other code allowed there). Use
`getPageMetadata("key")` from `lib/metadata.ts` and add the title and description to
`Metadata.pages` in both message files; pass `false` for private pages (no indexing).
Dynamic routes use `buildMetadata`. Never write the site name into a title, the
template in the layout adds it.

## i18n (next-intl)

- Languages: English (`en`, default) and Turkish (`tr`), defined in `i18n/config.ts`.
- No locale in the URL: the language comes from the `NEXT_LOCALE` cookie, then the
  browser language, then the default. Change it with the `setLocale` server action
  in `i18n/actions.ts`.
- Never hardcode UI text. Use `useTranslations("Namespace")` (or
  `getTranslations` in async server components) and add every key to **both**
  `messages/en.json` and `messages/tr.json`.
- Translation keys are type-checked against `messages/en.json` (see `types.d.ts`).

## Auth

Server-only helpers in `lib/auth/` (all import `server-only`):

- `password.ts` — argon2id hashing (`hashPassword`, `verifyPassword`,
  `passwordNeedsRehash`). `User.password` stores only the hash; never return it
  from APIs (`UserDto` masks it as `"***"`).
- `tokens.ts` — no JWT. Both tokens are long random opaque strings (64 bytes,
  86 base64url chars, `AUTH_TOKEN_BYTES`); only their SHA-256 hash is stored.
  Access token: 15 min, `AccessToken` model, checked against the database on
  every request, belongs to a refresh token. Refresh token: 30 days,
  `RefreshToken` model, rotated on every use. Logout deletes the session's
  access tokens immediately. Every revoke stores a `revokedReason`
  (`ROTATED` / `LOGOUT` / `REUSE_DETECTED`): only a token `ROTATED` less than
  30 s ago counts as a parallel request; reusing an older rotated token revokes
  all of the user's sessions.
- MongoDB: optional fields that were never written are missing, and
  `field: null` does not match them. Filter with
  `OR: [{ field: null }, { field: { isSet: false } }]` (see `notRevoked`).
- `session.ts` — httpOnly cookies (`access_token`, `refresh_token`):
  `startSession`, `getSession`, `setAuthCookies`, `clearAuthCookies`.
- `config.ts` — lifetimes, cookie names and cookie options.

`proxy.ts` (Next.js 16 replacement for `middleware.ts`, Node.js runtime) runs
before every page: it silently refreshes an expired access token with the
refresh token, and redirects based on `PROTECTED_ROUTES` (login required) and
`GUEST_ONLY_ROUTES` (`/auth/login`, `/auth/register`). Add new protected pages
to `PROTECTED_ROUTES`. Proxy is not the only check: server actions must still
verify the session with `getSession()`.

## Backend (server actions)

There is no API (route handlers) yet. Backend logic lives in server actions
under `actions/<domain>/<action>.ts`, each file starting with `"use server"`.

- Always re-validate input with the same zod schema factory as the form
  (`createXSchema(await getTranslations("Validation"))`).
- Validate every untrusted value with zod, not only form input: cookies,
  token claims, URL params (schemas without messages live in
  `lib/schemas/auth.schema.ts` style files).
- Return `ActionResult<T>` (`@/types`): `{ success: true, data }` or
  `{ success: false, error?, fieldErrors? }`. Messages are already translated
  (`getTranslations`), so the client can show them directly. Use
  `toFieldErrors` from `lib/validation.ts` for zod errors.
- Never return the password hash or other secrets.
- Data leaves the server only through DTOs (see **DTOs** below).

Auth actions: `actions/auth/register.ts`, `login.ts`, `logout.ts`
(`logout`, `logoutAllDevices`), `refresh.ts` (`refreshSession`),
`current-user.ts` (`getCurrentUser`).

## Confirmation

Ask before destructive actions with `components/layout/ConfirmDialog.tsx`.

## Avatars of clans

Always show clan avatars with `components/clans/ClanAvatar.tsx`.
There are no uploads: the leader picks one of the ready-made images (or none) in the
panel. `Clan.avatar` saves only the id from `lib/src/clanAvatars.ts`, the images are
square (256x256) in `public/clan-avatars/<id>.webp`. Add new ones to both, never
rename or remove one that clans may use.

## User avatars

Always show user avatars with `components/user/UserAvatar.tsx` (shadcn `Avatar`):
`<UserAvatar username={user.username} avatar={user.avatar} size="sm"/>`.
Without an image (or while it loads / if it fails) it shows the first letter of
the username.

## Site context

Site-wide client state lives in `context/SiteContext.tsx`, provided in the root
layout. Read and change it with `useSiteContext()` in client components:

```tsx
const { user, setUser } = useSiteContext()
```

- `user` is a `UserDto | null`. It is loaded on the client: the provider calls
  the `getCurrentUser` server action in a `useEffect` after mounting. Do not
  pass user data into the context from the server.
- `isUserLoading` is true until that first load finishes; show the shadcn
  `Spinner` (`components/ui/spinner.tsx`) meanwhile.
- After login/register/logout, update it with `setUser` (e.g. `setUser(null)`
  after `logout()`).
- New site-wide state goes into the same context.

## Profile

`/profile` edits the logged-in user. Like the clan panel it has a layout with
`PanelSidebar` and every area is a page (`app/profile/*`): add new areas to
`profilePages` in that layout. Its actions (`actions/profile`) take the user id
only from `getSession()`, never from the client. Changing the email or the password
needs the current password; a new password logs out every other device. Use
`components/form/FormTextField.tsx` for plain text inputs in forms.

## DTOs

Data leaves the server only through DTO classes in `dtos/<name>DTO.ts`
(e.g. `dtos/userDTO.ts`). Always write them in this style:

- `export class <Name>Dto` with every field declared with its type.
- The constructor takes the source record (a type from `@/types`) and assigns
  **every field one by one**. Never spread the source (`...data`), so relations
  (refresh tokens, memberships) and new sensitive columns are never copied.
- Sensitive values are masked inside the constructor: passwords are always
  `"***"`, emails are masked (`s***@gmail.com`).
- Normalize values in the constructor (`?? null`, date validation, etc.).

```ts
import type { User } from "@/types"

export class UserDto {
    id: string
    username: string
    email: string
    password: string
    avatar: string | null
    createdAt: Date

    constructor(data: Omit<User, "password">) {
        this.id = data.id
        this.username = data.username
        this.email = maskEmail(data.email)
        this.password = PASSWORD_MASK
        this.avatar = data.avatar ?? null
        this.createdAt = data.createdAt
    }
}
```

When a server action returns a DTO to a client component, spread it into a
plain object (`{ ...new UserDto(user) }`); class instances cannot cross the
server/client boundary.

## Forms & validation

Forms use **react-hook-form** + **zod** (`@hookform/resolvers/zod`) + shadcn
`Field` components (`components/ui/field.tsx`).

### Schemas

- One file per form in `lib/schemas/<name>.schema.ts`.
- Schemas are **factory functions** that take a `ValidationTranslator` (from
  `@/types`), so error messages follow the active language. Never hardcode
  error messages; use keys from the `Validation` namespace in `messages/*.json`.
- The same schema is reused on the server for backend validation.

```ts
// lib/schemas/example.schema.ts
import { z } from "zod"
import type { ValidationTranslator } from "@/types"

export function createExampleSchema(t: ValidationTranslator) {
    return z.object({
        username: z
            .string()
            .min(1, t("required"))
            .min(3, t("minLength", { min: 3 }))
            .max(20, t("maxLength", { max: 20 })),
    })
}

export type ExampleFormValues = z.infer<ReturnType<typeof createExampleSchema>>
```

Server side: `createExampleSchema(await getTranslations("Validation")).safeParse(input)`.

### Form component

Every field is a `Controller` rendering a `Field`. Set `data-invalid` on `Field`,
`aria-invalid` on the control, and render `FieldError` only when invalid.

Autocomplete is always disabled: every `<form>` and every input gets
`autoComplete="off"` (HTML has no `false` value; `"off"` is the equivalent).

```tsx
const tv = useTranslations("Validation")
const form = useForm<ExampleFormValues>({
    resolver: zodResolver(createExampleSchema(tv)),
    defaultValues: { username: "" },
})

<form autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
    <FieldGroup>
        <Controller
            name="username"
            control={form.control}
            render={({ field, fieldState }) => {

                return (
                    <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="example-username">{t("username")}</FieldLabel>
                        <Input {...field} id="example-username" autoComplete="off" aria-invalid={fieldState.invalid}/>
                        {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>
                )
            }}
        />
    </FieldGroup>
</form>
```

## Filtering

Filters live in the URL and are changed only with **use-search-query**
(`useSearchQuery`). Reference implementations: `app/clans`, `app/players`.

- Change filters with `routeToSearchParams(pathname, { key: value })`. Pass
  `undefined` to remove a param, and always `page: undefined` with a filter
  change. Reset with `routeToSearchParams(pathname, {}, { reset: true })`.
- The URL is the only state. Do not copy filters into `useState`, except a text
  input that is being typed.
- One zod schema per list in `lib/schemas/<name>-query.schema.ts`, extending
  `listQuerySchema` (`term`, `sort`, `page`). The page uses it to read the URL and the server action must validate the query with it
  again. Every field has a default through `.catch()`.
- Every list uses `pageLimit` from `lib/src/constants.ts` as its page size
  (`skip: (page - 1) * pageLimit, take: pageLimit`). Never hardcode a limit.
- Build filter bars from the shared `components/layout/ListSearch.tsx`,
  `ListRegionSelect.tsx`, `ListServerSelect.tsx`, `ListRoleSelect.tsx`,
  `ListSortSelect.tsx` and `ListResetButton.tsx`. Clan members use
  `components/clans/ClanMemberList.tsx`.
- Every list shows `components/layout/ListPagination.tsx` (shadcn `Pagination`):
  `<ListPagination page={query.page} pageCount={pageCount}/>`.
- Text terms keep only letters, numbers, spaces, `-` and `_`, because a MongoDB
  text search can become a regular expression.

## UI conventions

### Search

Every search UI uses the same structure: a shadcn `Popover` whose trigger is an
`outline` button (like the `Select`s next to it; only `MainMenuSearchBar` in the
header is `secondary`), containing a `Command` with filtering disabled
(`shouldFilter={false}`, because results will come from the backend).
Reference implementation: `components/layout/MainMenuSearchBar.tsx`.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList } from "@/components/ui/command"
import { buttonVariants } from "@/components/ui/button"
import { IoSearch } from "react-icons/io5"

<Popover modal>
    <PopoverTrigger className={buttonVariants({ variant: "outline" })}>
        Search for anything... <IoSearch />
    </PopoverTrigger>
    <PopoverContent>
        <Command shouldFilter={false}>
            <CommandInput placeholder="Type a name..." />
            <CommandList>
                {/* Results go here */}
            </CommandList>
        </Command>
    </PopoverContent>
</Popover>
```

- Only adapt the trigger text and the input placeholder to the context
  (e.g. "Search clans...").
- `MainMenuSearchBar` lists results in `CommandList` (`actions/search/search.ts`,
  `searchLimit` per group). List pages use `ListSearch`, which only changes the
  URL and keeps `CommandList` empty, because the page shows the results.
- Selecting from data that comes from the database (servers, players, clans...) also
  uses this structure with a backend search, never a `Select`. `Select` is only for
  short fixed lists (region, sort, rank...). For servers use
  `components/servers/ServerSearch.tsx`.
- Never add mock data or client-side filtering.

## Servers

- A server is active from `beganAt` for `serverLifetimeDays` (7, in
  `lib/src/constants.ts`). Always use the helpers in `lib/src/serverLifetime.ts`
  (`isServerActive`, `getServerEndsAt`, `getActiveServerRange`), never a
  hardcoded number of days.
- A clan can have many servers (`ClanServer` model). Add them only with
  `addServerToClan` (`lib/clans/servers.ts`), which rejects inactive servers.
  It does not check permissions: the calling server action must.
- A player has at most one active server (`UserServer.isActive`), their other records
  are history and are never deleted. Change it only with `setPlayerServer` /
  `leavePlayerServer`, read it with `getPlayerServers` (`lib/players/servers.ts`).
  "Active" also needs the lifetime of the server: an expired one counts as history.
  Players assign only themselves, on `/profile` (`actions/profile`).
- Location of a player: a district (`districts`) and a settlement (1 to
  `settlementCount`, both in `lib/src/constants.ts`), always both. It is saved per
  server in `UserServer`, change it only with `setPlayerLocation`. Only the player sees
  it: `getPlayerServers` is public and must not return it.

## Clan permissions

Check them in server actions with `getClanAccess` (`lib/clans/access.ts`). The
flags sent to the client (`canManage`, `canEdit`, `canDelete`) only hide buttons.

- Leader and officers: write wall posts, use the panel (`/c/[clanId]/panel`): change
  clan information, add and remove servers. Edit clan data only there, the other
  tabs (except the wall) are read-only.
- Members: the leader changes ranks of and removes everyone else, officers only
  fighters and recruits. Nobody manages themselves. No leadership transfer yet. The
  rules are in `lib/src/clanPermissions.ts`, enforced with `canManageMember`.
- Ranks have a priority (`clanRolePriorities` in `lib/src/clanRoles.ts`), higher is more
  powerful. Compare ranks only by priority. It is also saved in `ClanMember.priority` to
  sort in the database: never write `role` alone, always `getRoleData(role)`.
- Edit a post: its author, while still leader or officer.
- Delete a post: its author, leader, officers, site `MOD` and `ADMIN`.
- See a post: `PUBLIC` posts everyone, `MEMBER` posts only members of the clan (any
  rank). Always filter in the query (`access.isMember`), never in the client.

## Joining clans

- `Clan.joinMode`: `INVITE` (only by invite), `REQUEST` (leader or officer accepts a
  request) or `OPEN` (everyone joins at once). Invites can be sent in every mode.
- New members are `RECRUIT`. Create members only with `addClanMember`
  (`lib/clans/join.ts`), which removes their request and invite in one transaction.
- `joinClan` reads the mode from the database, never from the client.
- Leader and officers: join mode, requests and invites (panel). Everyone except the
  leader can leave.

## Notifications

- Send them on the server with `createNotifications` (`lib/notifications/create.ts`),
  about clans with `notifyUser` / `notifyClanManagers` (`lib/notifications/clan.ts`).
  They never throw, send them after the action has succeeded.
- No text is saved. A new `NotificationType` needs a text in `Notifications.types` of
  both message files, its values are in `NotificationParams`.
- `href` is optional and only a path on this site: with it a click opens that page,
  without it a click only marks the notification as read.
- `sourceKey` says what it is about: a new one replaces the unread one with the same
  key, so nobody can flood a user.
- Show them with `components/notifications/NotificationItem.tsx`. The unread number is
  in the site context (`unreadCount`, `reloadUnreadCount`).
- No polling. Live updates will use a socket, not built yet: wait until the user asks.

## Clan inventory

- `/c/[clanId]/inventory`: items members have, only members see it.
- Items are static in `lib/src/items.ts` (server only, about 480 items), generated by
  `scripts/import-items.py` from saved MetaForge pages; images are in `public/items`.
  Only the id is saved. Send items to the browser as `ItemDto`, never the whole list:
  choose one with `components/items/ItemSearch.tsx` (backend search `searchItems`),
  show one with `ItemImage` and `ItemRarity`. Rarities and their colors are in
  `lib/src/itemRarities.ts`.
- Every item belongs to the membership (deleted with it) and to the active server
  of the member when it was listed. Only items on active servers are shown.
- Each member adds (an item already listed gets the new quantity) and removes only
  their own items.

## LFC and LFP

- `/lfc` (looking for clan): listings of players, one per player (`LfcListing`),
  managed by the player.
- `/lfp` (looking for player): listings of clans, one per clan (`LfpListing`),
  managed by its leader and officers.
- A listing is for the servers it chose (`serverIds`, at most `lfgMaxServers`): a player
  chooses any active servers, a clan some of its own active servers. The save actions
  check that. Expired servers (and servers the clan left) are not shown, and the
  server filter only finds listings for that server.
- An LFP listing also has the rank the clan is looking for (`lfpRoles`, never LEADER).
  It is only information: new members still join as RECRUIT.

## Rich text

- Write with `components/editor/RichTextEditor.tsx`, show with
  `components/editor/RichTextContent.tsx`. `components/rte` is the editor itself
  (https://rte-shadcn.vercel.app), adapted from Radix to Base UI: do not
  overwrite it with `shadcn add`.
- Save two fields: `rawContent` (Json, the `RTEDocument`, to edit again) and
  `content` (HTML). Never accept HTML from the client: validate the document with
  `rteDocumentSchema`, then render it on the server with `serializeToHtml`.
- The editor writes style values into the HTML without escaping. Every value it
  can produce must be allowed by the schema (`lib/src/editorOptions.ts`).
- No font family and no color options (text or marker). The schema resets them.
