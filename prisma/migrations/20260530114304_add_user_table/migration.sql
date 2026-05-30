/*
  Warnings:

  - You are about to drop the column `fotoUrl` on the `Resident` table. All the data in the column will be lost.
  - Added the required column `jenisData` to the `Resident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Resident" DROP COLUMN "fotoUrl",
ADD COLUMN     "jenisData" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FamilyMember" (
    "id" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "hubungan" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "residentId" INTEGER NOT NULL,

    CONSTRAINT "FamilyMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "FamilyMember" ADD CONSTRAINT "FamilyMember_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
