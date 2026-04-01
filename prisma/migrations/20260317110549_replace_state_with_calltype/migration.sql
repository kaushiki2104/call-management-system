/*
  Warnings:

  - You are about to drop the column `endReason` on the `Call` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Call` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CallType" AS ENUM ('INCOMING', 'OUTGOING', 'MISSED', 'REJECTED');

-- AlterTable
ALTER TABLE "Call" DROP COLUMN "endReason",
DROP COLUMN "state",
ADD COLUMN     "callType" "CallType" NOT NULL DEFAULT 'OUTGOING';

-- DropEnum
DROP TYPE "CallEndReason";

-- DropEnum
DROP TYPE "CallState";
