/*
  Warnings:

  - The values [Silver,Gold,Platinum] on the enum `identityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "identityType_new" AS ENUM ('ID_CARD', 'PASSPORT');
ALTER TABLE "profiles" ALTER COLUMN "identity_type" TYPE "identityType_new" USING ("identity_type"::text::"identityType_new");
ALTER TYPE "identityType" RENAME TO "identityType_old";
ALTER TYPE "identityType_new" RENAME TO "identityType";
DROP TYPE "identityType_old";
COMMIT;
