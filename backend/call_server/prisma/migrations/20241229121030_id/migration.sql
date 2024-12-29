/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "schedule" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Course_title_key" ON "Course"("title");
