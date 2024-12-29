/*
  Warnings:

  - The `status` column on the `Enrollment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UserClassStatus" AS ENUM ('ENROLLED', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Enrollment" DROP COLUMN "status",
ADD COLUMN     "status" "UserClassStatus" NOT NULL DEFAULT 'ENROLLED';
