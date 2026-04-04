-- AlterTable
ALTER TABLE "InterviewHistory" ADD COLUMN     "crossQuestionTopic" TEXT,
ADD COLUMN     "experienceLevel" TEXT,
ADD COLUMN     "pendingCrossQuestion" BOOLEAN NOT NULL DEFAULT false;
