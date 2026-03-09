import { z } from "zod";

export const EchoSchema = z.object({
  title: z.string().max(100, "Title is too long").default("Untitled Echo"),
  description: z.string().min(10, "Narrative must be at least 10 characters").max(2000),
  intensity: z.number().min(1).max(10),
  location: z.string().min(1, "Location is required"),
  latitude: z.number().refine((n) => n !== 0, "Latitude cannot be zero"),
  longitude: z.number().refine((n) => n !== 0, "Longitude cannot be zero"),
  is_public: z.boolean(),
  display_name: z.string().min(2).max(50),
  image_url: z.url().optional().or(z.literal('')),
});

export type EchoInput = z.infer<typeof EchoSchema>;