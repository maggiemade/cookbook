export type RecipeType = "recipe" | "inspiration";
export type RecipeCategory =
  | "breakfast"
  | "lunch"
  | "dinner"
  | "dessert"
  | "snack"
  | "bread"
  | "drinks"
  | "other";
export type IdeaCategory =
  | "flavor-combo"
  | "technique"
  | "ingredient"
  | "dish-idea"
  | "other";
export type SourceType = "url" | "photo" | "manual" | "text";
export type SortField = "title" | "created_at" | "updated_at" | "category";
export type SortOrder = "asc" | "desc";

export interface Ingredient {
  amount: string;
  unit: string;
  name: string;
  note?: string;
}

export interface Step {
  order: number;
  text: string;
}

export interface Recipe {
  id: string;
  title: string;
  type: RecipeType;
  category: RecipeCategory;
  description?: string;
  source_type?: SourceType;
  source_url?: string;
  source_label?: string;
  ingredients: Ingredient[];
  steps: Step[];
  notes?: string;
  my_notes?: string;
  tags: string[];
  photos: string[];
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description?: string;
  category: IdeaCategory;
  links: string[];
  photos: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Inspiration {
  id: string;
  title: string;
  url?: string;
  photo?: string;
  notes?: string;
  tags: string[];
  created_at: string;
}
