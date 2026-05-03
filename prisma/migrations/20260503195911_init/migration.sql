-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "DateType" AS ENUM ('ANY', 'WEEKDAY', 'WEEKEND');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "homeLat" DOUBLE PRECISION,
    "homeLon" DOUBLE PRECISION,
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "preferredMinWind" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "preferredMaxWind" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "preferredSpotTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "KiteSpot" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "suitableWindDirections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "offshoreWindDirections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "idealMinWindKnots" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "idealMaxWindKnots" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "beginnerFriendly" BOOLEAN NOT NULL DEFAULT false,
    "spotTypes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tideRelevant" BOOLEAN NOT NULL DEFAULT false,
    "thermalPotential" INTEGER NOT NULL DEFAULT 0,
    "parkingInfo" TEXT,
    "waterDepth" TEXT,
    "seasonRestrictions" TEXT,
    "dangerNotes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "webcamUrl" TEXT,
    "localInfoUrl" TEXT,
    "restricted" BOOLEAN NOT NULL DEFAULT false,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KiteSpot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ForecastData" (
    "id" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'open-meteo',
    "forecastTime" TIMESTAMP(3) NOT NULL,
    "windSpeedKnots" DOUBLE PRECISION NOT NULL,
    "gustKnots" DOUBLE PRECISION NOT NULL,
    "windDirectionDegrees" DOUBLE PRECISION NOT NULL,
    "windDirectionCompass" TEXT NOT NULL,
    "temperatureC" DOUBLE PRECISION NOT NULL,
    "precipitationMm" DOUBLE PRECISION NOT NULL,
    "cloudCoverPercent" DOUBLE PRECISION NOT NULL,
    "weatherWarnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForecastData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpotRating" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "userId" TEXT,
    "forecastDate" TIMESTAMP(3) NOT NULL,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "windowEnd" TIMESTAMP(3) NOT NULL,
    "score" INTEGER NOT NULL,
    "explanation" TEXT NOT NULL,
    "windDirectionQuality" TEXT NOT NULL,
    "windStrengthQuality" TEXT NOT NULL,
    "riskWarnings" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bestTimeWindow" TEXT NOT NULL,
    "beginnerWarning" TEXT,
    "ratingMeta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpotRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAlert" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "selectedSpotIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "windDirections" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "minWindKnots" DOUBLE PRECISION,
    "maxWindKnots" DOUBLE PRECISION,
    "maxGustKnots" DOUBLE PRECISION,
    "dateType" "DateType" NOT NULL DEFAULT 'ANY',
    "minTemperatureC" DOUBLE PRECISION,
    "maxRainMm" DOUBLE PRECISION,
    "region" TEXT,
    "maxTravelKm" DOUBLE PRECISION,
    "beginnerOnly" BOOLEAN NOT NULL DEFAULT false,
    "flatWaterOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FavoriteSpot" (
    "userId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteSpot_pkey" PRIMARY KEY ("userId","spotId")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "id" TEXT NOT NULL,
    "alertId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spotId" TEXT NOT NULL,
    "forecastWindowStart" TIMESTAMP(3) NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "fingerprint" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringRule" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "settings" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "KiteSpot_slug_key" ON "KiteSpot"("slug");

-- CreateIndex
CREATE INDEX "ForecastData_forecastTime_idx" ON "ForecastData"("forecastTime");

-- CreateIndex
CREATE INDEX "ForecastData_spotId_forecastTime_idx" ON "ForecastData"("spotId", "forecastTime");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastData_spotId_forecastTime_source_key" ON "ForecastData"("spotId", "forecastTime", "source");

-- CreateIndex
CREATE UNIQUE INDEX "SpotRating_key_key" ON "SpotRating"("key");

-- CreateIndex
CREATE INDEX "SpotRating_forecastDate_score_idx" ON "SpotRating"("forecastDate", "score");

-- CreateIndex
CREATE INDEX "SpotRating_spotId_forecastDate_idx" ON "SpotRating"("spotId", "forecastDate");

-- CreateIndex
CREATE INDEX "UserAlert_userId_enabled_idx" ON "UserAlert"("userId", "enabled");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationLog_fingerprint_key" ON "NotificationLog"("fingerprint");

-- CreateIndex
CREATE INDEX "NotificationLog_userId_sentAt_idx" ON "NotificationLog"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "NotificationLog_spotId_forecastWindowStart_idx" ON "NotificationLog"("spotId", "forecastWindowStart");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringRule_key_key" ON "ScoringRule"("key");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ForecastData" ADD CONSTRAINT "ForecastData_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "KiteSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "KiteSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpotRating" ADD CONSTRAINT "SpotRating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAlert" ADD CONSTRAINT "UserAlert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSpot" ADD CONSTRAINT "FavoriteSpot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteSpot" ADD CONSTRAINT "FavoriteSpot_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "KiteSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_alertId_fkey" FOREIGN KEY ("alertId") REFERENCES "UserAlert"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_spotId_fkey" FOREIGN KEY ("spotId") REFERENCES "KiteSpot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
