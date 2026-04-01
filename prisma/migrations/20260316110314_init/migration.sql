-- CreateEnum
CREATE TYPE "PlatformRole" AS ENUM ('SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "OrgRole" AS ENUM ('ADMIN', 'MANAGER', 'LEADER', 'USER');

-- CreateEnum
CREATE TYPE "CallState" AS ENUM ('INITIATED', 'RINGING', 'ENDED');

-- CreateEnum
CREATE TYPE "CallEndReason" AS ENUM ('COMPLETED', 'USER_REJECTED', 'CLIENT_REJECTED', 'MISSED', 'NETWORK_FAILED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "password" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdById" TEXT,
    "orgRole" "OrgRole",
    "platformRole" "PlatformRole",
    "supervisorId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Call" (
    "id" TEXT NOT NULL,
    "callerId" TEXT,
    "receiverId" TEXT,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3) NOT NULL,
    "callerNumber" TEXT NOT NULL,
    "receiverNumber" TEXT NOT NULL,
    "endReason" "CallEndReason",
    "organizationId" TEXT NOT NULL,
    "state" "CallState" NOT NULL,

    CONSTRAINT "Call_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recording" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recording_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_name_key" ON "Organization"("name");

-- CreateIndex
CREATE INDEX "Organization_name_idx" ON "Organization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_orgRole_idx" ON "User"("orgRole");

-- CreateIndex
CREATE INDEX "User_supervisorId_idx" ON "User"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_organizationId_key" ON "User"("phoneNumber", "organizationId");

-- CreateIndex
CREATE INDEX "Call_organizationId_startedAt_idx" ON "Call"("organizationId", "startedAt");

-- CreateIndex
CREATE INDEX "Call_callerId_idx" ON "Call"("callerId");

-- CreateIndex
CREATE INDEX "Call_receiverId_idx" ON "Call"("receiverId");

-- CreateIndex
CREATE INDEX "Call_callerNumber_idx" ON "Call"("callerNumber");

-- CreateIndex
CREATE INDEX "Call_receiverNumber_idx" ON "Call"("receiverNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Recording_callId_key" ON "Recording"("callId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_callerId_fkey" FOREIGN KEY ("callerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Call" ADD CONSTRAINT "Call_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recording" ADD CONSTRAINT "Recording_callId_fkey" FOREIGN KEY ("callId") REFERENCES "Call"("id") ON DELETE CASCADE ON UPDATE CASCADE;
