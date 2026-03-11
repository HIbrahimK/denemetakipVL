CREATE TABLE "UserAccessLog" (
  "id" TEXT NOT NULL,
  "schoolId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "path" TEXT NOT NULL,
  "route" TEXT,
  "area" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "statusCode" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserAccessLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserAccessLog_schoolId_createdAt_idx" ON "UserAccessLog"("schoolId", "createdAt");
CREATE INDEX "UserAccessLog_userId_createdAt_idx" ON "UserAccessLog"("userId", "createdAt");
CREATE INDEX "UserAccessLog_path_createdAt_idx" ON "UserAccessLog"("path", "createdAt");
CREATE INDEX "UserAccessLog_createdAt_idx" ON "UserAccessLog"("createdAt");

ALTER TABLE "UserAccessLog"
ADD CONSTRAINT "UserAccessLog_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT "UserAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;