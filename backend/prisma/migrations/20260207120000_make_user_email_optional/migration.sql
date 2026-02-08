-- Make user email optional
ALTER TABLE "User" ALTER COLUMN "email" DROP NOT NULL;
