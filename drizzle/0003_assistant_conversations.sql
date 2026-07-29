CREATE TABLE IF NOT EXISTS "assistant_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "student_id" text NOT NULL,
  "scope" text NOT NULL,
  "scope_key" text NOT NULL,
  "title" text DEFAULT 'Chat' NOT NULL,
  "messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "assistant_conversations" ADD CONSTRAINT "assistant_conversations_student_id_profiles_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "assistant_conversations_student_scope_idx" ON "assistant_conversations" USING btree ("student_id","scope_key","updated_at");
