-- DropForeignKey
ALTER TABLE "MentorGroup" DROP CONSTRAINT "MentorGroup_teacherId_fkey";

-- Ensure GroupType and groupType column exist before indexing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GroupType') THEN
    CREATE TYPE "GroupType" AS ENUM ('MENTOR', 'CLASS', 'GRADE');
  END IF;
END$$;

ALTER TABLE "MentorGroup" ADD COLUMN IF NOT EXISTS "groupType" "GroupType" NOT NULL DEFAULT 'MENTOR';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MentorGroup_schoolId_groupType_idx" ON "MentorGroup"("schoolId", "groupType");

-- AddForeignKey
ALTER TABLE "MentorGroup" ADD CONSTRAINT "MentorGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
