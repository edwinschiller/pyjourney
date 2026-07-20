CREATE TYPE "public"."saved_program_source" AS ENUM('ide', 'lesson');--> statement-breakpoint
CREATE TABLE "saved_programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"title" text NOT NULL,
	"code" text NOT NULL,
	"source" "saved_program_source" DEFAULT 'ide' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "saved_programs" ADD CONSTRAINT "saved_programs_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "saved_programs_student_id_idx" ON "saved_programs" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "saved_programs_student_updated_idx" ON "saved_programs" USING btree ("student_id","updated_at");