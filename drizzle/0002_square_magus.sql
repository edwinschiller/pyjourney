CREATE TYPE "public"."learner_event_outcome" AS ENUM('pass', 'fail');--> statement-breakpoint
CREATE TYPE "public"."learner_event_source" AS ENUM('quiz', 'practice', 'apply', 'lesson_complete');--> statement-breakpoint
CREATE TABLE "learner_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"concept_id" uuid NOT NULL,
	"lesson_id" uuid,
	"topic_id" text,
	"source" "learner_event_source" NOT NULL,
	"outcome" "learner_event_outcome" NOT NULL,
	"signal" text NOT NULL,
	"misconception_tag" text,
	"latency_ms" integer,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_misconception_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"concept_id" uuid,
	"tag" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learner_topic_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" text NOT NULL,
	"concept_id" uuid NOT NULL,
	"topic_id" text NOT NULL,
	"topic_title" text DEFAULT '' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"passes" integer DEFAULT 0 NOT NULL,
	"fails" integer DEFAULT 0 NOT NULL,
	"total_latency_ms" integer DEFAULT 0 NOT NULL,
	"last_outcome" "learner_event_outcome",
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "learner_events" ADD CONSTRAINT "learner_events_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_events" ADD CONSTRAINT "learner_events_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_events" ADD CONSTRAINT "learner_events_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_misconception_stats" ADD CONSTRAINT "learner_misconception_stats_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_misconception_stats" ADD CONSTRAINT "learner_misconception_stats_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_topic_stats" ADD CONSTRAINT "learner_topic_stats_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learner_topic_stats" ADD CONSTRAINT "learner_topic_stats_concept_id_concepts_id_fk" FOREIGN KEY ("concept_id") REFERENCES "public"."concepts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "learner_events_student_created_idx" ON "learner_events" USING btree ("student_id","created_at");--> statement-breakpoint
CREATE INDEX "learner_events_student_concept_idx" ON "learner_events" USING btree ("student_id","concept_id");--> statement-breakpoint
CREATE INDEX "learner_events_misconception_idx" ON "learner_events" USING btree ("student_id","misconception_tag");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_misconception_stats_unique_idx" ON "learner_misconception_stats" USING btree ("student_id","tag");--> statement-breakpoint
CREATE INDEX "learner_misconception_stats_student_idx" ON "learner_misconception_stats" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "learner_misconception_stats_count_idx" ON "learner_misconception_stats" USING btree ("student_id","count");--> statement-breakpoint
CREATE UNIQUE INDEX "learner_topic_stats_unique_idx" ON "learner_topic_stats" USING btree ("student_id","concept_id","topic_id");--> statement-breakpoint
CREATE INDEX "learner_topic_stats_student_idx" ON "learner_topic_stats" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "learner_topic_stats_fails_idx" ON "learner_topic_stats" USING btree ("student_id","fails");