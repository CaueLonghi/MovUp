-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `birthday` DATETIME(3) NOT NULL,
    `senha` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FichaMedica` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `peso` DOUBLE NOT NULL,
    `altura` DOUBLE NOT NULL,
    `sexo` VARCHAR(191) NOT NULL,
    `Fascite_plantar` BOOLEAN NOT NULL,
    `Fratura_inferior` BOOLEAN NOT NULL,
    `Tendinite` BOOLEAN NOT NULL,
    `Canelite` BOOLEAN NOT NULL,
    `Diabetes` BOOLEAN NOT NULL,
    `Colesterol` BOOLEAN NOT NULL,
    `Tempo_corrida` DOUBLE NOT NULL,
    `userId` INTEGER NOT NULL,

    UNIQUE INDEX `FichaMedica_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analise` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `data` LONGBLOB NOT NULL,

    INDEX `Analise_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FichaMedica` ADD CONSTRAINT `FichaMedica_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analise` ADD CONSTRAINT `Analise_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
