-- AlterTable
ALTER TABLE "InterviewHistory" ADD COLUMN     "isCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "questionNumber" INTEGER NOT NULL DEFAULT 1;
