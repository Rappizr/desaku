-- CreateTable
CREATE TABLE "Resident" (
    "id" SERIAL NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "dusun" TEXT NOT NULL,
    "statusEkonomi" TEXT NOT NULL,
    "fotoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resident_nik_key" ON "Resident"("nik");
