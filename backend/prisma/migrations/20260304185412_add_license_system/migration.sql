-- CreateEnum
CREATE TYPE "LicenseStatus" AS ENUM ('ACTIVE', 'GRACE', 'EXPIRED', 'SUSPENDED');

-- CreateTable
CREATE TABLE "LicensePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxStudents" INTEGER NOT NULL,
    "maxUsers" INTEGER NOT NULL,
    "maxStorage" INTEGER NOT NULL,
    "monthlyPrice" DOUBLE PRECISION NOT NULL,
    "yearlyPrice" DOUBLE PRECISION NOT NULL,
    "features" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicensePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolLicense" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "LicenseStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "autoRenew" BOOLEAN NOT NULL DEFAULT false,
    "customPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolLicense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LicensePlan_name_key" ON "LicensePlan"("name");

-- CreateIndex
CREATE INDEX "SchoolLicense_schoolId_idx" ON "SchoolLicense"("schoolId");

-- CreateIndex
CREATE INDEX "SchoolLicense_status_idx" ON "SchoolLicense"("status");

-- CreateIndex
CREATE INDEX "SchoolLicense_endDate_idx" ON "SchoolLicense"("endDate");

-- AddForeignKey
ALTER TABLE "SchoolLicense" ADD CONSTRAINT "SchoolLicense_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolLicense" ADD CONSTRAINT "SchoolLicense_planId_fkey" FOREIGN KEY ("planId") REFERENCES "LicensePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
