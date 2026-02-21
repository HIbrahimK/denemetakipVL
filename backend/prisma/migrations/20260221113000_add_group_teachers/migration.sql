-- Create table for multi-teacher authorization in groups
CREATE TABLE IF NOT EXISTS "GroupTeacher" (
  "id" TEXT NOT NULL,
  "groupId" TEXT NOT NULL,
  "teacherId" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "addedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "GroupTeacher_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "GroupTeacher_groupId_teacherId_key" ON "GroupTeacher"("groupId", "teacherId");
CREATE INDEX IF NOT EXISTS "GroupTeacher_groupId_leftAt_idx" ON "GroupTeacher"("groupId", "leftAt");
CREATE INDEX IF NOT EXISTS "GroupTeacher_teacherId_schoolId_leftAt_idx" ON "GroupTeacher"("teacherId", "schoolId", "leftAt");
CREATE INDEX IF NOT EXISTS "GroupTeacher_schoolId_leftAt_idx" ON "GroupTeacher"("schoolId", "leftAt");

ALTER TABLE "GroupTeacher" ADD CONSTRAINT "GroupTeacher_groupId_fkey"
  FOREIGN KEY ("groupId") REFERENCES "MentorGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupTeacher" ADD CONSTRAINT "GroupTeacher_teacherId_fkey"
  FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GroupTeacher" ADD CONSTRAINT "GroupTeacher_schoolId_fkey"
  FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "GroupTeacher" ADD CONSTRAINT "GroupTeacher_addedById_fkey"
  FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill existing primary teacher assignments
INSERT INTO "GroupTeacher" ("id", "groupId", "teacherId", "schoolId", "addedById", "createdAt", "leftAt")
SELECT
  "id",
  "id",
  "teacherId",
  "schoolId",
  "teacherId",
  CURRENT_TIMESTAMP,
  NULL
FROM "MentorGroup"
WHERE "teacherId" IS NOT NULL
ON CONFLICT ("groupId", "teacherId") DO UPDATE SET
  "leftAt" = NULL,
  "schoolId" = EXCLUDED."schoolId";

