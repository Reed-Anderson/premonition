CREATE TABLE "games" (
	"id" text PRIMARY KEY NOT NULL,
	"competition_id" text NOT NULL,
	"week" integer NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"kickoff" timestamp with time zone NOT NULL,
	"home_score" integer,
	"away_score" integer
);
--> statement-breakpoint
ALTER TABLE "games" ADD CONSTRAINT "games_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE no action ON UPDATE no action;