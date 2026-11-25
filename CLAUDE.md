# CLAUDE.md

## Project

- Clan website for the game ROB RUN.
- Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui.
- Prisma 6 with MongoDB (Prisma 7+ does not support MongoDB yet).
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
  `ListSortSelect.tsx` and `ListResetButton.tsx`.
- Every list shows `components/layout/ListPagination.tsx` (shadcn `Pagination`):
  `<ListPagination page={query.page} pageCount={pageCount}/>`.
- Text terms keep only letters, numbers, spaces, `-` and `_`, because a MongoDB
  text search can become a regular expression.

## UI conventions

### Search

Every search UI uses the same structure: a shadcn `Popover` whose trigger is a
`secondary` button, containing a `Command` with filtering disabled
(`shouldFilter={false}`, because results will come from the backend).
Reference implementation: `components/layout/MainMenuSearchBar.tsx`.

```tsx
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandInput, CommandList } from "@/components/ui/command"
import { buttonVariants } from "@/components/ui/button"
import { IoSearch } from "react-icons/io5"

<Popover modal>
    <PopoverTrigger className={buttonVariants({ variant: "secondary" })}>
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
- Never add mock data or client-side filtering.

## Servers

- A server is active from `beganAt` for `serverLifetimeDays` (7, in
  `lib/src/constants.ts`). Always use the helpers in `lib/src/serverLifetime.ts`
  (`isServerActive`, `getServerEndsAt`, `getActiveServerRange`), never a
  hardcoded number of days.
- A clan can have many servers (`ClanServer` model). Add them only with
  `addServerToClan` (`lib/clans/servers.ts`), which rejects inactive servers.
  It does not check permissions: the calling server action must.
- A player can have many servers (`UserServer` model). Add them only with
  `addServerToPlayer` (`lib/players/servers.ts`), with the same rules.
  Players assign only themselves. The action and UI are not built yet: wait until
  the user asks for them.

## Clan permissions

Check them in server actions with `getClanAccess` (`lib/clans/access.ts`). The
flags sent to the client (`canManage`, `canEdit`, `canDelete`) only hide buttons.

- Leader and officers: write wall posts, add and remove servers.
- Edit a post: its author, while still leader or officer.
- Delete a post: its author, leader, officers, site `MOD` and `ADMIN`.

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
