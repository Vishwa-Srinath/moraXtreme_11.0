CREATE TYPE "public"."setting_value_type" AS ENUM('string', 'number', 'boolean', 'json', 'timestamp');--> statement-breakpoint
CREATE TYPE "public"."team_member_role" AS ENUM('leader', 'member');--> statement-breakpoint
CREATE TYPE "public"."team_status" AS ENUM('draft', 'submitted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."university_type" AS ENUM('public', 'private', 'foreign', 'other');--> statement-breakpoint
CREATE TABLE "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb,
	"value_type" "setting_value_type" DEFAULT 'json' NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"team_id" text NOT NULL,
	"role" "team_member_role" NOT NULL,
	"member_order" integer NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"whatsapp_number" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" text PRIMARY KEY NOT NULL,
	"team_name" text NOT NULL,
	"university_id" text,
	"custom_university_name" text,
	"team_size" integer NOT NULL,
	"status" "team_status" DEFAULT 'draft' NOT NULL,
	"registration_code" text,
	"submitted_at" timestamp with time zone,
	"cancelled_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"country" text DEFAULT 'Sri Lanka' NOT NULL,
	"type" "university_type" DEFAULT 'public' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_settings_value_type_idx" ON "app_settings" USING btree ("value_type");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_team_order_unique" ON "team_members" USING btree ("team_id","member_order");--> statement-breakpoint
CREATE UNIQUE INDEX "team_members_one_leader_per_team_unique" ON "team_members" USING btree ("team_id") WHERE "team_members"."role" = 'leader';--> statement-breakpoint
CREATE INDEX "team_members_email_idx" ON "team_members" USING btree ("email");--> statement-breakpoint
CREATE INDEX "team_members_whatsapp_idx" ON "team_members" USING btree ("whatsapp_number");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_registration_code_unique" ON "teams" USING btree ("registration_code");--> statement-breakpoint
CREATE INDEX "teams_status_idx" ON "teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "teams_university_id_idx" ON "teams" USING btree ("university_id");--> statement-breakpoint
CREATE UNIQUE INDEX "universities_name_country_unique" ON "universities" USING btree ("name","country");--> statement-breakpoint
CREATE INDEX "universities_active_idx" ON "universities" USING btree ("is_active");--> statement-breakpoint
INSERT INTO "universities" ("id", "name", "country", "type", "is_active") VALUES
('university-of-moratuwa', 'University of Moratuwa', 'Sri Lanka', 'public', true),
('university-of-colombo', 'University of Colombo', 'Sri Lanka', 'public', true),
('university-of-peradeniya', 'University of Peradeniya', 'Sri Lanka', 'public', true),
('university-of-sri-jayewardenepura', 'University of Sri Jayewardenepura', 'Sri Lanka', 'public', true),
('university-of-ruhuna', 'University of Ruhuna', 'Sri Lanka', 'public', true),
('university-of-kelaniya', 'University of Kelaniya', 'Sri Lanka', 'public', true),
('sabaragamuwa-university-of-sri-lanka', 'Sabaragamuwa University of Sri Lanka', 'Sri Lanka', 'public', true),
('university-of-jaffna', 'University of Jaffna', 'Sri Lanka', 'public', true),
('university-of-vavuniya', 'University of Vavuniya', 'Sri Lanka', 'public', true),
('uva-wellassa-university', 'Uva Wellassa University', 'Sri Lanka', 'public', true),
('wayamba-university-of-sri-lanka', 'Wayamba University of Sri Lanka', 'Sri Lanka', 'public', true),
('rajarata-university-of-sri-lanka', 'Rajarata University of Sri Lanka', 'Sri Lanka', 'public', true),
('south-eastern-university', 'South Eastern University', 'Sri Lanka', 'public', true),
('open-university-of-sri-lanka', 'Open University of Sri Lanka', 'Sri Lanka', 'public', true),
('informatics-institute-of-technology', 'Informatics Institute of Technology (IIT)', 'Sri Lanka', 'private', true),
('general-sir-john-kotelawala-defence-university', 'General Sir John Kotelawala Defence University (KDU)', 'Sri Lanka', 'public', true),
('sri-lanka-institute-of-information-technology', 'Sri Lanka Institute of Information Technology (SLIIT)', 'Sri Lanka', 'private', true),
('national-institute-of-business-management', 'National Institute of Business Management (NIBM)', 'Sri Lanka', 'private', true),
('national-school-of-business-management', 'National School of Business Management (NSBM)', 'Sri Lanka', 'private', true),
('sri-lanka-technological-campus', 'Sri Lanka Technological Campus (SLTC)', 'Sri Lanka', 'private', true),
('university-of-vocational-technology', 'University of Vocational Technology', 'Sri Lanka', 'public', true);--> statement-breakpoint
INSERT INTO "app_settings" ("key", "value", "value_type", "description") VALUES
('registrationOpenAt', NULL, 'timestamp', 'UTC timestamp when registration opens.'),
('registrationCloseAt', NULL, 'timestamp', 'UTC timestamp when registration closes.'),
('registrationForceClosed', 'false'::jsonb, 'boolean', 'Manual override that closes registration immediately.'),
('registrationCloseMessage', '"Registration is currently closed."'::jsonb, 'string', 'Message shown when registration is unavailable.');
