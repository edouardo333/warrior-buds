import type { Locale, Dictionary } from "../types";
import en from "./en";
import fr from "./fr";

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export default dictionaries;
