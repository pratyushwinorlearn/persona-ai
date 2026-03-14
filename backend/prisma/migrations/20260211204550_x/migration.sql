/*
  Warnings:

  - You are about to drop the column `isCorrect` on the `InterviewHistory` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `InterviewHistory` table. All the data in the column will be lost.
  - You are about to drop the column `questionNumber` on the `InterviewHistory` table. All the data in the column will be lost.
  - You are about to drop the column `userAnswer` on the `InterviewHistory` table. All the data in the column will be lost.
  - You are about to drop the column `weakTopic` on the `InterviewHistory` table. All the data in the column will be lost.
  - Added the required column `interviewId` to the `Answer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentQuestion` to the `InterviewHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Answer" ADD COLUMN     "interviewId" INTEGER NOT NULL,
ADD COLUMN     "weakTopic" TEXT;

-- AlterTable
ALTER TABLE "InterviewHistory" DROP COLUMN "isCorrect",
DROP COLUMN "question",
DROP COLUMN "questionNumber",
DROP COLUMN "userAnswer",
DROP COLUMN "weakTopic",
ADD COLUMN     "currentQuestion" TEXT NOT NULL,
ALTER COLUMN "questionCount" SET DEFAULT 1;

-- AddForeignKey
ALTER TABLE "Answer" ADD CONSTRAINT "Answer_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "InterviewHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
