-- First, remove duplicate achievements keeping only the latest one for each (schoolId, type) combination
DELETE FROM "Achievement" a
USING (
  SELECT MIN(id) as id, "schoolId", type
  FROM "Achievement"
  WHERE "schoolId" IS NOT NULL
  GROUP BY "schoolId", type
  HAVING COUNT(*) > 1
) b
WHERE a."schoolId" = b."schoolId" 
  AND a.type = b.type 
  AND a.id != b.id;

-- Add unique constraint
CREATE UNIQUE INDEX "Achievement_schoolId_type_key" ON "Achievement"("schoolId", "type");
