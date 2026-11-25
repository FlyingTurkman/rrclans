import type { Region as PrismaRegion } from "@prisma/client"

// ROB RUN server regions (short codes).
// EU = Europe, NA = North America (servers are hosted in East US).
export const regions = ["EU", "NA"] as const

export type Region = (typeof regions)[number]

// Compile-time check: fails to build if this list and the Prisma `Region`
// enum in prisma/schema.prisma drift apart.
type Equals<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
const regionsMatchPrisma: Equals<Region, PrismaRegion> = true
void regionsMatchPrisma
