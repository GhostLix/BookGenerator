export enum ArtStyle {
  Photorealistic = "Photorealistic",
  Watercolor = "Watercolor",
  Anime = "Anime",
  Fantasy = "Fantasy Art",
  PixelArt = "Pixel Art",
  Minimalist = "Minimalist Line Art"
}

export interface ChapterOutline {
  chapter_title: string;
  image_prompt: string;
}

export enum GenerationStatus {
  Pending = "Pending",
  GeneratingText = "Generating Text",
  GeneratingImage = "Generating Image",
  Complete = "Complete",
  Error = "Error"
}

export interface Chapter {
  title: string;
  imagePrompt: string;
  content: string;
  imageUrl: string;
  status: GenerationStatus;
}

export interface Book {
  title: string;
  chapters: Chapter[];
}