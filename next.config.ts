import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"

const nextConfig: NextConfig = {
  logging: {
    // The dev server prints server action arguments, which would write plain
    // passwords from the login/register forms to the terminal.
    serverFunctions: false,
  },
}

// Loads the i18n request config from i18n/request.ts.
const withNextIntl = createNextIntlPlugin()

export default withNextIntl(nextConfig)
