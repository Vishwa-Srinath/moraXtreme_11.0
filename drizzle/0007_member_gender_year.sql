CREATE TYPE "public"."participant_gender" AS ENUM('female', 'male', 'other', 'prefer_not_to_say');--> statement-breakpoint
CREATE TYPE "public"."year_of_study" AS ENUM('year_1', 'year_2', 'year_3', 'year_4', 'year_5_plus');--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "gender" "participant_gender";--> statement-breakpoint
ALTER TABLE "team_members" ADD COLUMN "year_of_study" "year_of_study";