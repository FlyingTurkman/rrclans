// Fake players and clans for local testing.
//   npm run db:seed        deletes the old fake records and adds new ones
//   npm run db:seed:clear  only deletes the fake records
//
// Fake records are recognized by SEED_EMAIL_DOMAIN (users), SEED_HREF_PREFIX
// (clans) and SEED_SERVER_PREFIX (servers). Everything else in the database is
// left alone.

import { PrismaClient } from "@prisma/client"
import { argon2id, hash } from "argon2"

const SEED_EMAIL_DOMAIN = "@seed.example.com"
const SEED_HREF_PREFIX = "seed-"
const SEED_SERVER_PREFIX = "Seed Server "
const SEED_PASSWORD = "password123"

const PLAYER_COUNT = 120
const CLAN_COUNT = 60
// The last players are in no clan.
const CLANLESS_COUNT = 15

if (process.env.NODE_ENV === "production") {
    throw new Error("The seed script must not run in production.")
}

const prisma = new PrismaClient()

// Same numbers as lib/src/clanRoles.ts.
const rolePriorities = { LEADER: 4, OFFICER: 3, FIGHTER: 2, RECRUIT: 1 }

const adjectives = ["Iron", "Dark", "Silent", "Crimson", "Golden", "Frozen", "Savage", "Desert", "Royal", "Shadow"]
const nouns = ["Wolves", "Ravens", "Vipers", "Outlaws", "Bandits", "Kings"]
const nameParts = ["Fox", "Hawk", "Bear", "Ghost", "Rider", "Storm", "Blade", "Viper", "Raven", "Titan", "Nomad", "Reaper"]
const names = ["Emre", "Ayşe", "Çağrı", "Şule", "Mert", "Elif", "John", "Emma", "Lucas", "Sofia", "Oğuz", "İrem"]
const surnames = ["Yılmaz", "Demir", "Şahin", "Çelik", "Öztürk", "Smith", "Miller", "Garcia", "Novak", "Koç"]

// Small seeded generator, so every run creates the same data.
let state = 20261125

function random() {
    state = (state * 1664525 + 1013904223) % 4294967296

    return state / 4294967296
}

function pick(list) {
    return list[Math.floor(random() * list.length)]
}

// Random date in the last `days` days.
function pastDate(days) {
    return new Date(Date.now() - Math.floor(random() * days * 24 * 60 * 60 * 1000))
}

async function clear() {
    const users = await prisma.user.findMany({ where: { email: { endsWith: SEED_EMAIL_DOMAIN } }, select: { id: true } })
    const clans = await prisma.clan.findMany({ where: { clanHref: { startsWith: SEED_HREF_PREFIX } }, select: { id: true } })

    const userIds = users.map((user) => user.id)
    const clanIds = clans.map((clan) => clan.id)

    const servers = await prisma.server.findMany({ where: { serverName: { startsWith: SEED_SERVER_PREFIX } }, select: { id: true } })
    const serverIds = servers.map((server) => server.id)

    await prisma.clanServer.deleteMany({ where: { OR: [{ clanId: { in: clanIds } }, { serverId: { in: serverIds } }] } })
    await prisma.userServer.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { serverId: { in: serverIds } }] } })
    await prisma.clanPost.deleteMany({ where: { OR: [{ authorId: { in: userIds } }, { clanId: { in: clanIds } }] } })
    await prisma.notification.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.clanJoinRequest.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { clanId: { in: clanIds } }] } })
    await prisma.clanInvite.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { clanId: { in: clanIds } }] } })
    await prisma.lfcListing.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.lfpListing.deleteMany({ where: { clanId: { in: clanIds } } })
    await prisma.server.deleteMany({ where: { id: { in: serverIds } } })
    await prisma.clanMember.deleteMany({ where: { OR: [{ userId: { in: userIds } }, { clanId: { in: clanIds } }] } })
    await prisma.accessToken.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } })
    await prisma.user.deleteMany({ where: { id: { in: userIds } } })
    await prisma.clan.deleteMany({ where: { id: { in: clanIds } } })

    console.log(`Deleted ${userIds.length} fake players, ${clanIds.length} fake clans and ${serverIds.length} fake servers.`)
}

async function seed() {
    // Same argon2 settings as lib/auth/password.ts.
    const password = await hash(SEED_PASSWORD, { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 })

    const users = Array.from({ length: PLAYER_COUNT }, (_, index) => {
        const number = index + 1
        const username = `${nameParts[index % nameParts.length]}${pick(nameParts)}${number}`
        const name = pick(names)
        const surname = pick(surnames)

        return {
            username,
            name,
            surname,
            fullname: `${name} ${surname}`,
            email: `player${number}${SEED_EMAIL_DOMAIN}`,
            password,
            steamUsername: random() < 0.6 ? `${username.toLowerCase()}_steam` : null,
            createdAt: pastDate(20),
        }
    })

    await prisma.user.createMany({ data: users })

    const clans = Array.from({ length: CLAN_COUNT }, (_, index) => {
        const adjective = adjectives[index % adjectives.length]
        const noun = nouns[Math.floor(index / adjectives.length) % nouns.length]

        return {
            clanName: `${adjective} ${noun}`,
            clanTag: `${adjective.slice(0, 2)}${noun.slice(0, 2)}`.toUpperCase(),
            clanHref: `${SEED_HREF_PREFIX}${adjective}-${noun}`.toLowerCase(),
            region: random() < 0.6 ? "EU" : "NA",
            joinMode: ["INVITE", "REQUEST", "OPEN"][index % 3],
            createdAt: pastDate(20),
        }
    })

    await prisma.clan.createMany({ data: clans })

    // Read the ids back in creation order.
    const userRecords = await prisma.user.findMany({ where: { email: { in: users.map((user) => user.email) } }, select: { id: true, email: true } })
    const clanRecords = await prisma.clan.findMany({ where: { clanHref: { in: clans.map((clan) => clan.clanHref) } }, select: { id: true, clanHref: true } })

    const userIdByEmail = new Map(userRecords.map((user) => [user.email, user.id]))
    const clanIdByHref = new Map(clanRecords.map((clan) => [clan.clanHref, clan.id]))

    const userIds = users.map((user) => userIdByEmail.get(user.email))
    const clanIds = clans.map((clan) => clanIdByHref.get(clan.clanHref))

    // One leader per clan. The other players join random clans, mostly the
    // first ones, so some clans are big. Every fifth one is in two clans.
    const members = clanIds.map((clanId, index) => ({ clanId, userId: userIds[index], role: "LEADER", priority: rolePriorities.LEADER, createdAt: pastDate(10) }))

    for (let index = CLAN_COUNT; index < PLAYER_COUNT - CLANLESS_COUNT; index++) {
        const clanIndex = Math.floor(random() * random() * CLAN_COUNT)
        const joined = index % 5 === 0 ? [clanIndex, (clanIndex + 1) % CLAN_COUNT] : [clanIndex]

        for (const joinedIndex of joined) {
            const role = pick(["OFFICER", "FIGHTER", "FIGHTER", "RECRUIT", "RECRUIT"])

            members.push({
                clanId: clanIds[joinedIndex],
                userId: userIds[index],
                role,
                priority: rolePriorities[role],
                createdAt: pastDate(10),
            })
        }
    }

    await prisma.clanMember.createMany({ data: members })

    // Servers that began 0, 2, 4, 6, 8 and 10 days ago, so some have expired.
    const servers = Array.from({ length: 6 }, (_, index) => ({
        serverName: `${SEED_SERVER_PREFIX}${index + 1}`,
        beganAt: new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000),
    }))

    await prisma.server.createMany({ data: servers })

    const serverRecords = await prisma.server.findMany({ where: { serverName: { startsWith: SEED_SERVER_PREFIX } }, select: { id: true, beganAt: true } })

    await prisma.clanServer.createMany({
        data: clanIds.flatMap((clanId) => serverRecords.filter(() => random() < 0.4).map((server) => ({ clanId, serverId: server.id }))),
    })

    // Some servers per player, at most one of the newest three is active.
    await prisma.userServer.createMany({
        data: userIds.flatMap((userId) => {
            const joined = serverRecords.filter(() => random() < 0.4)
            const active = joined.find(({ beganAt }) => Date.now() - beganAt.getTime() < 5 * 24 * 60 * 60 * 1000)

            return joined.map((server) => ({ userId, serverId: server.id, isActive: server === active }))
        }),
    })

    // Players without a clan search for one, every third clan searches for players.
    await prisma.lfcListing.createMany({
        data: userIds.slice(-CLANLESS_COUNT).map((userId) => ({
            userId,
            region: random() < 0.6 ? "EU" : "NA",
            message: pick(["Active every evening, looking for a friendly clan.", "Fighter with a lot of free time.", "New player, happy to learn."]),
        })),
    })

    await prisma.lfpListing.createMany({
        data: clanIds.filter((_, index) => index % 3 === 0).map((clanId) => ({
            clanId,
            message: pick(["We need active fighters for district conflicts.", "Recruits welcome, we help new players.", "Looking for players with a microphone."]),
        })),
    })

    console.log(`Added ${users.length} fake players, ${clans.length} fake clans and ${members.length} memberships.`)
    console.log(`Log in with player1${SEED_EMAIL_DOMAIN} / ${SEED_PASSWORD}`)
}

try {
    await clear()

    if (!process.argv.includes("--clear")) await seed()
} finally {
    await prisma.$disconnect()
}
