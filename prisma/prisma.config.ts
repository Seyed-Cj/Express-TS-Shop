import { defineConfig } from "prisma/config";

export default defineConfig({
  migrate: {
    datasource: "db",
  },
  datasources: {
    db: {
      url: process.env.DATABASE_URL!,
    },
  },
});