CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" varchar(200) NOT NULL,
	"telefono" varchar(50) NOT NULL,
	"correo" varchar(255) NOT NULL,
	"mensaje" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
