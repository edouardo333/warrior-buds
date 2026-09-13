import {
  Leaf,
  Gem,
  Flame,
  Sparkles,
  Cigarette,
  GraduationCap,
  ShieldAlert,
  Droplet,
  Cookie,
  SprayCan,
  type LucideIcon,
} from "lucide-react";

export type LocalizedText = { en: string; fr: string };

export type LearningTopic = {
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  body: { en: string[]; fr: string[] };
};

export type LearningAccent = "red" | "orange" | "yellow";

export type LearningCategory = {
  slug: string;
  icon: LucideIcon;
  emoji: string;
  accent: LearningAccent;
  title: LocalizedText;
  description: LocalizedText;
  topics: LearningTopic[];
};

export const LEARNING_CATEGORIES: LearningCategory[] = [
  {
    slug: "cannabis-basics",
    icon: Leaf,
    emoji: "🌿",
    accent: "red",
    title: { en: "Cannabis Basics", fr: "Bases du cannabis" },
    description: {
      en: "The foundational strain types and how they're generally described.",
      fr: "Les grandes familles de variétés et comment elles sont généralement décrites.",
    },
    topics: [
      {
        slug: "sativa",
        title: { en: "Sativa", fr: "Sativa" },
        summary: {
          en: "Traditionally associated with uplifting, energizing effects and taller, narrow-leafed plants.",
          fr: "Traditionnellement associée à des effets stimulants et énergisants, avec des plants hauts aux feuilles fines.",
        },
        body: {
          en: [
            "Sativa is one of the two classic cannabis plant types, historically linked to tall, thin-leafed plants that originated in warmer equatorial climates. In dispensary language, “sativa” is used more as a category of experience than a strict botanical rule.",
            "Sativa-leaning products are commonly described by consumers as energizing, uplifting, and social — often chosen for daytime use. Modern cannabis is heavily hybridized, so the real effect of any product depends more on its specific cannabinoid and terpene profile than on the sativa label alone.",
          ],
          fr: [
            "Le sativa est l'un des deux types classiques de plants de cannabis, historiquement lié à des plants hauts aux feuilles fines originaires de climats équatoriaux chauds. Dans le langage des dispensaires, « sativa » sert surtout à décrire une catégorie d'expérience plutôt qu'une règle botanique stricte.",
            "Les produits à dominance sativa sont souvent décrits par les consommateurs comme énergisants, stimulants et sociaux — souvent choisis pour une utilisation de jour. Le cannabis moderne est fortement hybridé, donc l'effet réel d'un produit dépend davantage de son profil précis de cannabinoïdes et de terpènes que de la seule étiquette « sativa ».",
          ],
        },
      },
      {
        slug: "hybrid",
        title: { en: "Hybrid", fr: "Hybride" },
        summary: {
          en: "A cross between sativa and indica genetics, blending characteristics of both.",
          fr: "Un croisement entre les génétiques sativa et indica, combinant les caractéristiques des deux.",
        },
        body: {
          en: [
            "Hybrid strains are bred by crossing sativa and indica genetics to combine traits from both plant types. Most cannabis available today, including many products labeled “sativa” or “indica,” is technically some form of hybrid.",
            "Hybrids are often described as sativa-dominant, indica-dominant, or balanced, depending on which characteristics are more pronounced. Rather than relying on the hybrid label alone, many consumers look at the cannabinoid and terpene breakdown to get a better sense of what a specific product may feel like.",
          ],
          fr: [
            "Les variétés hybrides sont créées en croisant des génétiques sativa et indica afin de combiner des traits des deux types de plants. La majorité du cannabis offert aujourd'hui, y compris plusieurs produits étiquetés « sativa » ou « indica », est techniquement une forme d'hybride.",
            "Les hybrides sont souvent décrits comme à dominance sativa, à dominance indica ou équilibrés, selon les caractéristiques les plus marquées. Plutôt que de se fier uniquement à l'étiquette « hybride », plusieurs consommateurs examinent le profil de cannabinoïdes et de terpènes pour mieux comprendre ce qu'un produit spécifique peut procurer.",
          ],
        },
      },
      {
        slug: "indica",
        title: { en: "Indica", fr: "Indica" },
        summary: {
          en: "Traditionally associated with relaxing, calming effects and shorter, bushier plants.",
          fr: "Traditionnellement associée à des effets relaxants et apaisants, avec des plants plus courts et touffus.",
        },
        body: {
          en: [
            "Indica is the second classic cannabis plant type, traditionally linked to shorter, bushier plants adapted to harsher mountain climates. Like sativa, the term is now used more to describe a general style of effect than a precise genetic category.",
            "Indica-leaning products are commonly described as relaxing, calming, and grounding, and are often associated with evening use. As with all cannabis products, individual response varies — the specific product's cannabinoid and terpene content plays a larger role than the indica label alone.",
          ],
          fr: [
            "L'indica est le second type classique de plant de cannabis, traditionnellement lié à des plants plus courts et touffus adaptés aux climats montagneux plus rudes. Comme pour le sativa, le terme sert aujourd'hui davantage à décrire un style général d'effet qu'une catégorie génétique précise.",
            "Les produits à dominance indica sont souvent décrits comme relaxants, apaisants et ancrants, et sont fréquemment associés à une utilisation en soirée. Comme pour tous les produits de cannabis, la réponse individuelle varie — le contenu précis en cannabinoïdes et en terpènes du produit joue un rôle plus important que la seule étiquette « indica ».",
          ],
        },
      },
    ],
  },
  {
    slug: "cannabis-concentrates",
    icon: Gem,
    emoji: "\u{1F48E}",
    accent: "orange",
    title: { en: "Cannabis Concentrates", fr: "Concentrés de cannabis" },
    description: {
      en: "Extracted forms of cannabis, from hash to live resin, explained simply.",
      fr: "Les formes extraites du cannabis, du hash au live resin, expliquées simplement.",
    },
    topics: [
      {
        slug: "hash",
        title: { en: "Hash", fr: "Hash" },
        summary: {
          en: "One of the oldest cannabis concentrates, made by compressing collected resin glands (trichomes).",
          fr: "L'un des plus anciens concentrés de cannabis, fabriqué en compressant les glandes de résine (trichomes) recueillies.",
        },
        body: {
          en: [
            "Hash (or hashish) is made by separating the resin glands, called trichomes, from the cannabis plant and compressing them into a dense block or ball. It's one of the oldest known cannabis concentrates, with production methods that go back centuries.",
            "Because it's made almost entirely of trichomes, hash is significantly more concentrated than dried flower. It can be smoked, crumbled into a joint, or vaporized, and quality varies widely depending on the extraction method used.",
          ],
          fr: [
            "Le hash (ou haschich) est fabriqué en séparant les glandes de résine, appelées trichomes, de la plante de cannabis, puis en les compressant en un bloc ou une boule dense. C'est l'un des plus anciens concentrés de cannabis connus, avec des méthodes de production remontant à des siècles.",
            "Comme il est composé presque entièrement de trichomes, le hash est nettement plus concentré que la fleur séchée. Il peut être fumé, émietté dans un joint ou vaporisé, et sa qualité varie beaucoup selon la méthode d'extraction utilisée.",
          ],
        },
      },
      {
        slug: "shatter",
        title: { en: "Shatter", fr: "Shatter" },
        summary: {
          en: "A glass-like, translucent concentrate known for its brittle, snappable texture.",
          fr: "Un concentré translucide et vitreux reconnu pour sa texture cassante.",
        },
        body: {
          en: [
            "Shatter is a type of cannabis extract known for its hard, glass-like appearance and translucent amber color. It gets its name from the way it snaps or “shatters” when broken, similar to hard candy.",
            "It's typically made using a solvent-based extraction process, followed by careful purging and curing to achieve its stable, brittle texture. Shatter is generally considered a high-potency concentrate and is most often vaporized using specialized equipment.",
          ],
          fr: [
            "Le shatter est un type d'extrait de cannabis reconnu pour son apparence dure et vitreuse ainsi que sa couleur ambrée translucide. Son nom vient de la façon dont il se casse net, un peu comme un bonbon dur.",
            "Il est généralement fabriqué à l'aide d'un procédé d'extraction à base de solvant, suivi d'une purge et d'un affinage soignés pour obtenir sa texture stable et cassante. Le shatter est généralement considéré comme un concentré à haute puissance et est le plus souvent vaporisé à l'aide d'équipement spécialisé.",
          ],
        },
      },
      {
        slug: "crumble",
        title: { en: "Crumble", fr: "Crumble" },
        summary: {
          en: "A drier, crumbly cannabis concentrate with a texture similar to honeycomb or brown sugar.",
          fr: "Un concentré de cannabis plus sec et friable, à la texture rappelant le nid d'abeille ou la cassonade.",
        },
        body: {
          en: [
            "Crumble is a cannabis concentrate that gets its name from its dry, crumbly texture — somewhere between honeycomb and brown sugar. It's produced through a similar extraction process to shatter, but with different temperature and agitation choices during purging that create air pockets and a softer structure.",
            "Its texture makes crumble easier to handle and portion than stickier concentrates like wax or shatter. It's commonly vaporized or added to flower, and tends to be favored by consumers who want a less sticky, easier-to-scoop format.",
          ],
          fr: [
            "Le crumble est un concentré de cannabis dont le nom vient de sa texture sèche et friable — quelque part entre le nid d'abeille et la cassonade. Il est produit selon un procédé d'extraction semblable à celui du shatter, mais avec des choix de température et d'agitation différents pendant la purge, créant des poches d'air et une structure plus souple.",
            "Sa texture rend le crumble plus facile à manipuler et à doser que des concentrés plus collants comme le wax ou le shatter. Il est généralement vaporisé ou ajouté à la fleur, et tend à être préféré par les consommateurs qui recherchent un format moins collant et plus facile à prélever.",
          ],
        },
      },
      {
        slug: "thc-diamonds",
        title: { en: "THC Diamonds", fr: "Diamants de THC" },
        summary: {
          en: "Highly refined, crystalline THC structures — among the purest and most potent concentrate forms.",
          fr: "Des structures de THC cristallines hautement raffinées — parmi les concentrés les plus purs et les plus puissants.",
        },
        body: {
          en: [
            "THC diamonds are crystalline structures formed when THCA (the raw, acidic form of THC) is isolated and allowed to crystallize over time. The result looks like small, translucent gems or rock candy.",
            "Because the crystallization process isolates cannabinoids so precisely, diamonds are among the most concentrated and potent extract formats available. They're often sold alongside a terpene-rich liquid (“sauce”) and are almost always vaporized rather than smoked directly.",
          ],
          fr: [
            "Les diamants de THC sont des structures cristallines formées lorsque le THCA (la forme brute et acide du THC) est isolé et laissé à cristalliser avec le temps. Le résultat ressemble à de petites gemmes translucides ou à du sucre candi.",
            "Comme le processus de cristallisation isole les cannabinoïdes avec une grande précision, les diamants figurent parmi les formats d'extrait les plus concentrés et les plus puissants disponibles. Ils sont souvent vendus accompagnés d'un liquide riche en terpènes (le « sauce ») et sont presque toujours vaporisés plutôt que fumés directement.",
          ],
        },
      },
      {
        slug: "live-resin",
        title: { en: "Live Resin", fr: "Live Resin" },
        summary: {
          en: "Made from fresh-frozen plants to preserve the original terpene profile.",
          fr: "Fabriqué à partir de plants congelés frais pour préserver le profil terpénique original.",
        },
        body: {
          en: [
            "Live resin is made using cannabis plants that are flash-frozen immediately after harvest, rather than dried and cured first. Freezing the plant material preserves volatile terpenes that are normally lost during a standard drying process.",
            "This process gives live resin a reputation for a stronger, more true-to-plant aroma and flavor compared to concentrates made from cured flower. It's a favorite among consumers who prioritize flavor and the full terpene profile of a specific cultivar.",
          ],
          fr: [
            "Le live resin est fabriqué à partir de plants de cannabis congelés instantanément juste après la récolte, plutôt que séchés et affinés au préalable. La congélation du matériel végétal préserve les terpènes volatils qui sont normalement perdus lors d'un processus de séchage standard.",
            "Ce procédé donne au live resin une réputation d'arôme et de saveur plus intenses et plus fidèles à la plante, comparativement aux concentrés fabriqués à partir de fleur affinée. C'est un favori chez les consommateurs qui accordent la priorité à la saveur et au profil terpénique complet d'un cultivar spécifique.",
          ],
        },
      },
      {
        slug: "rosin",
        title: { en: "Rosin", fr: "Rosin" },
        summary: {
          en: "A solventless concentrate made using heat and pressure alone.",
          fr: "Un concentré sans solvant obtenu uniquement par chaleur et pression.",
        },
        body: {
          en: [
            "Rosin is produced without any chemical solvents — instead, heat and pressure are applied directly to cannabis flower, hash, or kief to squeeze out the resin. This makes it one of the more straightforward extraction methods available.",
            "Because no solvents are involved, rosin is often chosen by consumers who prefer a solventless product. Texture can range from sappy and pliable to more stable and shatter-like, depending on the starting material and pressing technique.",
          ],
          fr: [
            "Le rosin est produit sans aucun solvant chimique — la chaleur et la pression sont plutôt appliquées directement sur la fleur de cannabis, le hash ou le kief pour en extraire la résine. C'est l'une des méthodes d'extraction les plus simples qui soient.",
            "Comme aucun solvant n'est utilisé, le rosin est souvent choisi par les consommateurs qui préfèrent un produit sans solvant. La texture peut varier, allant d'une consistance collante et malléable à une texture plus stable rappelant le shatter, selon le matériel de départ et la technique de pressage.",
          ],
        },
      },
      {
        slug: "wax",
        title: { en: "Wax", fr: "Wax" },
        summary: {
          en: "A soft, opaque concentrate with a sticky, malleable texture.",
          fr: "Un concentré mou et opaque, à la texture collante et malléable.",
        },
        body: {
          en: [
            "Wax is a broad term for cannabis concentrates with a soft, opaque, and sticky texture — somewhere between crumble and a thick oil. It's produced through a solvent-based extraction, then whipped or agitated during purging to create its characteristic creamy consistency.",
            "Its stickiness makes wax easy to work with for dabbing but messier to handle than crumble or shatter. It tends to be prized for its aroma and flavor, and is generally consumed with a dab rig or vaporizer designed for concentrates.",
          ],
          fr: [
            "Le wax est un terme général désignant les concentrés de cannabis à la texture molle, opaque et collante — quelque part entre le crumble et une huile épaisse. Il est produit par extraction à base de solvant, puis fouetté ou agité pendant la purge pour créer sa consistance crémeuse caractéristique.",
            "Sa texture collante rend le wax facile à travailler pour le dabbing, mais plus salissant à manipuler que le crumble ou le shatter. Il est généralement apprécié pour son arôme et sa saveur, et se consomme habituellement avec un dab rig ou un vaporisateur conçu pour les concentrés.",
          ],
        },
      },
    ],
  },
  {
    slug: "high-potency-products",
    icon: Flame,
    emoji: "\u{1F525}",
    accent: "yellow",
    title: { en: "High-Potency Products", fr: "Produits à haute puissance" },
    description: {
      en: "Vapes, cartridges, pens, and distillate — the concentrated delivery formats.",
      fr: "Vapoteuses, cartouches, stylos et distillat — les formats concentrés.",
    },
    topics: [
      {
        slug: "disposable-thc-vapes",
        title: { en: "Disposable THC Vapes", fr: "Vapoteuses de THC jetables" },
        summary: {
          en: "All-in-one, pre-filled vaporizers designed to be used until empty, then discarded.",
          fr: "Des vaporisateurs tout-en-un préremplis, conçus pour être utilisés jusqu'à épuisement, puis jetés.",
        },
        body: {
          en: [
            "Disposable THC vapes are pre-filled, pre-charged devices that combine the battery, heating element, and cannabis oil into a single unit. There's no charging, filling, or maintenance involved — you simply use it until the oil is gone.",
            "They're valued for their convenience and discretion, making them a popular entry point for newer consumers. Potency and oil composition (distillate, live resin, etc.) vary by product, so checking the label is the best way to know what you're getting.",
          ],
          fr: [
            "Les vapoteuses jetables de THC sont des dispositifs préremplis et préchargés qui combinent la pile, l'élément chauffant et l'huile de cannabis en une seule unité. Il n'y a ni recharge, ni remplissage, ni entretien — on l'utilise simplement jusqu'à ce que l'huile soit épuisée.",
            "Elles sont appréciées pour leur commodité et leur discrétion, ce qui en fait un point d'entrée populaire pour les nouveaux consommateurs. La puissance et la composition de l'huile (distillat, live resin, etc.) varient selon le produit, alors vérifier l'étiquette demeure la meilleure façon de savoir ce que l'on consomme.",
          ],
        },
      },
      {
        slug: "510-cartridges",
        title: { en: "510 Cartridges", fr: "Cartouches 510" },
        summary: {
          en: "Refillable, threaded oil cartridges that attach to a compatible battery.",
          fr: "Des cartouches d'huile filetées et remplaçables qui se fixent à une pile compatible.",
        },
        body: {
          en: [
            "510 refers to a standardized thread size used across most vape cartridges and batteries, meaning most 510 cartridges are compatible with most 510 batteries. Cartridges are prefilled with cannabis oil and screw directly onto a separately purchased battery.",
            "Because the battery and cartridge are separate, this format gives consumers more control — batteries can offer variable voltage or airflow settings, and cartridges can be swapped once empty. It's a common choice for consumers who go through oil regularly.",
          ],
          fr: [
            "510 fait référence à une taille de filetage standardisée utilisée sur la plupart des cartouches et piles de vapotage, ce qui signifie que la plupart des cartouches 510 sont compatibles avec la plupart des piles 510. Les cartouches sont préremplies d'huile de cannabis et se vissent directement sur une pile achetée séparément.",
            "Comme la pile et la cartouche sont séparées, ce format offre plus de contrôle aux consommateurs — les piles peuvent proposer des réglages de voltage ou de débit d'air variables, et les cartouches peuvent être remplacées une fois vides. C'est un choix courant pour les consommateurs qui utilisent de l'huile régulièrement.",
          ],
        },
      },
      {
        slug: "wax-pens",
        title: { en: "Wax Pens", fr: "Stylos à wax" },
        summary: {
          en: "Portable vaporizers built specifically for wax-style concentrates.",
          fr: "Des vaporisateurs portables conçus spécifiquement pour les concentrés de type wax.",
        },
        body: {
          en: [
            "Wax pens are compact, battery-powered vaporizers designed to heat concentrates like wax, crumble, or budder rather than oil or flower. Most use a small heating coil or ceramic chamber that the concentrate is loaded into directly.",
            "They're generally more portable and easier to use than a traditional dab rig, making them a popular choice for consumers who enjoy concentrates on the go. Cleaning the chamber regularly helps maintain flavor and performance.",
          ],
          fr: [
            "Les stylos à wax sont des vaporisateurs compacts alimentés par pile, conçus pour chauffer des concentrés comme le wax, le crumble ou le budder plutôt que de l'huile ou de la fleur. La plupart utilisent une petite bobine chauffante ou une chambre en céramique dans laquelle le concentré est déposé directement.",
            "Ils sont généralement plus portables et plus faciles à utiliser qu'un dab rig traditionnel, ce qui en fait un choix populaire pour les consommateurs qui apprécient les concentrés en déplacement. Nettoyer la chambre régulièrement aide à préserver la saveur et la performance.",
          ],
        },
      },
      {
        slug: "dab-pens",
        title: { en: "Dab Pens", fr: "Dab Pens" },
        summary: {
          en: "Vaporizers designed for a wide range of concentrate textures, often with adjustable heat settings.",
          fr: "Des vaporisateurs conçus pour une large gamme de textures de concentrés, souvent avec des réglages de chaleur ajustables.",
        },
        body: {
          en: [
            "Dab pens are similar to wax pens but often support a broader range of concentrate textures — from shatter to rosin to diamonds — and may include adjustable temperature settings. Some models use quartz or ceramic coils designed to handle stickier or harder extracts.",
            "Temperature plays a large role in the experience: lower settings tend to preserve flavor, while higher settings produce thicker vapor. Many consumers experiment with settings to find what best matches the specific concentrate they're using.",
          ],
          fr: [
            "Les dab pens ressemblent aux stylos à wax, mais prennent souvent en charge une plus large gamme de textures de concentrés — du shatter au rosin en passant par les diamants — et peuvent inclure des réglages de température ajustables. Certains modèles utilisent des bobines en quartz ou en céramique conçues pour gérer des extraits plus collants ou plus durs.",
            "La température joue un rôle important dans l'expérience : des réglages plus bas ont tendance à préserver la saveur, tandis que des réglages plus élevés produisent une vapeur plus dense. Plusieurs consommateurs expérimentent avec les réglages pour trouver ce qui convient le mieux au concentré utilisé.",
          ],
        },
      },
      {
        slug: "distillate",
        title: { en: "Distillate", fr: "Distillat" },
        summary: {
          en: "A highly refined cannabis oil, stripped down to isolate specific cannabinoids.",
          fr: "Une huile de cannabis hautement raffinée, épurée pour isoler des cannabinoïdes spécifiques.",
        },
        body: {
          en: [
            "Distillate is a cannabis extract refined through a distillation process that isolates individual cannabinoids, most commonly THC, from the rest of the plant compounds. The result is a thick, viscous, often near-clear oil with very high cannabinoid concentration.",
            "Because the distillation process strips out terpenes and other compounds, distillate on its own tends to have little flavor or aroma — producers often reintroduce terpenes afterward. It's widely used as a base for cartridges, edibles, and other formulated products due to its consistency and stability.",
          ],
          fr: [
            "Le distillat est un extrait de cannabis raffiné par un procédé de distillation qui isole des cannabinoïdes individuels, le plus souvent le THC, du reste des composés de la plante. Le résultat est une huile épaisse, visqueuse et souvent presque transparente, avec une concentration très élevée en cannabinoïdes.",
            "Comme le procédé de distillation retire les terpènes et autres composés, le distillat seul a tendance à avoir peu de saveur ou d'arôme — les producteurs y réintroduisent souvent des terpènes par la suite. Il est largement utilisé comme base pour les cartouches, les comestibles et d'autres produits formulés en raison de sa constance et de sa stabilité.",
          ],
        },
      },
    ],
  },
  {
    slug: "psychedelics",
    icon: Sparkles,
    emoji: "\u{1F344}",
    accent: "red",
    title: { en: "Psychedelics", fr: "Psychédéliques" },
    description: {
      en: "An educational look at psilocybin mushrooms and microdosing.",
      fr: "Un survol éducatif des champignons à psilocybine et du microdosage.",
    },
    topics: [
      {
        slug: "magic-mushrooms",
        title: { en: "Magic Mushrooms", fr: "Champignons magiques" },
        summary: {
          en: "An educational overview of psilocybin-containing mushrooms and their history.",
          fr: "Un survol éducatif des champignons contenant de la psilocybine et de leur histoire.",
        },
        body: {
          en: [
            "“Magic mushrooms” is a common term for a group of fungi that naturally contain psilocybin, a compound that has been used in ceremonial and cultural contexts for centuries in various parts of the world. There are hundreds of known psilocybin-containing species, most commonly from the Psilocybe genus.",
            "This content is provided for general education only. Legal status varies significantly by jurisdiction, so it's important to understand your local laws before making any decisions.",
          ],
          fr: [
            "« Champignons magiques » est un terme courant désignant un groupe de champignons contenant naturellement de la psilocybine, un composé utilisé dans des contextes cérémoniels et culturels depuis des siècles dans diverses régions du monde. On connaît des centaines d'espèces contenant de la psilocybine, la plupart appartenant au genre Psilocybe.",
            "Ce contenu est fourni à titre éducatif seulement. Le statut légal varie considérablement selon la juridiction, il est donc important de bien comprendre les lois de votre région avant de prendre toute décision.",
          ],
        },
      },
      {
        slug: "microdosing",
        title: { en: "Microdosing", fr: "Microdosage" },
        summary: {
          en: "The practice of taking very small, sub-perceptual amounts on a structured schedule.",
          fr: "La pratique de prendre de très petites quantités, sous le seuil de perception, selon un horaire structuré.",
        },
        body: {
          en: [
            "Microdosing refers to consuming very small amounts of a substance — well below a dose that produces a noticeable perceptual effect — often on a structured schedule such as every third day. The concept has been applied to various substances and is discussed largely within self-reported, anecdotal, and early-stage research contexts.",
            "Scientific research on microdosing is still developing, and findings are mixed. This information is educational only and not a recommendation or guarantee of any outcome — anyone considering it should research thoroughly and understand the legal status where they live.",
          ],
          fr: [
            "Le microdosage désigne la consommation de très petites quantités d'une substance — bien en dessous d'une dose produisant un effet perceptible notable — souvent selon un horaire structuré, par exemple aux trois jours. Le concept a été appliqué à diverses substances et est surtout discuté dans des contextes de témoignages personnels, d'anecdotes et de recherches à un stade précoce.",
            "La recherche scientifique sur le microdosage est encore en développement, et les résultats sont mitigés. Cette information est fournie à titre éducatif seulement et ne constitue ni une recommandation ni une garantie de résultat — toute personne qui l'envisage devrait faire des recherches approfondies et comprendre le statut légal de sa région.",
          ],
        },
      },
      {
        slug: "psilocybin-basics",
        title: { en: "Psilocybin Basics", fr: "Bases de la psilocybine" },
        summary: {
          en: "A general introduction to psilocybin as a naturally occurring compound.",
          fr: "Une introduction générale à la psilocybine en tant que composé naturel.",
        },
        body: {
          en: [
            "Psilocybin is a naturally occurring compound found in certain species of fungi. Once consumed, it's converted by the body into psilocin, which is the compound understood to be responsible for its perceptual effects.",
            "Interest in psilocybin has grown in recent years, including within early-stage clinical research settings. This overview is educational only, is not medical advice, and does not suggest or guarantee any specific outcome — regulations and legal status vary widely by location.",
          ],
          fr: [
            "La psilocybine est un composé naturel présent dans certaines espèces de champignons. Une fois consommée, elle est convertie par le corps en psilocine, le composé considéré comme responsable de ses effets perceptifs.",
            "L'intérêt pour la psilocybine s'est accru au cours des dernières années, y compris dans des cadres de recherche clinique à un stade précoce. Ce survol est fourni à titre éducatif seulement, ne constitue pas un avis médical et ne suggère ni ne garantit aucun résultat spécifique — la réglementation et le statut légal varient grandement selon l'endroit.",
          ],
        },
      },
    ],
  },
  {
    slug: "nicotine-products",
    icon: Cigarette,
    emoji: "\u{1F6AC}",
    accent: "orange",
    title: { en: "Nicotine Products", fr: "Produits de nicotine" },
    description: {
      en: "Disposables, pouches, and devices for nicotine consumers.",
      fr: "Vapoteuses jetables, sachets et dispositifs pour consommateurs de nicotine.",
    },
    topics: [
      {
        slug: "disposable-nicotine-vapes",
        title: { en: "Disposable Vapes (50%)", fr: "Vapoteuses jetables (50 %)" },
        summary: {
          en: "Pre-filled, single-use nicotine vapes, often available in higher nicotine strengths.",
          fr: "Des vapoteuses jetables et préremplies à usage unique, souvent offertes en concentrations de nicotine plus élevées.",
        },
        body: {
          en: [
            "Disposable nicotine vapes are single-use, pre-filled devices designed to be used until the e-liquid or battery runs out. The “50%” commonly refers to a higher nicotine salt concentration (roughly 50mg/mL), typically formulated for a smoother throat hit at higher strength.",
            "These products are intended for adult nicotine consumers only. Nicotine is habit-forming, and strength, flavor, and puff count vary by brand — checking the label is the best way to understand what a specific device contains.",
          ],
          fr: [
            "Les vapoteuses de nicotine jetables sont des dispositifs préremplis à usage unique, conçus pour être utilisés jusqu'à épuisement du liquide ou de la pile. Le « 50 % » fait généralement référence à une concentration plus élevée de sels de nicotine (environ 50 mg/mL), habituellement formulée pour une inhalation plus douce à haute concentration.",
            "Ces produits sont destinés uniquement aux consommateurs adultes de nicotine. La nicotine crée une dépendance, et la concentration, la saveur et le nombre de bouffées varient selon la marque — vérifier l'étiquette demeure la meilleure façon de savoir ce que contient un dispositif spécifique.",
          ],
        },
      },
      {
        slug: "nicotine-pouches",
        title: { en: "Nicotine Pouches", fr: "Sachets de nicotine" },
        summary: {
          en: "Smoke-free, tobacco-free pouches placed between the lip and gum.",
          fr: "Des sachets sans fumée ni tabac, placés entre la lèvre et la gencive.",
        },
        body: {
          en: [
            "Nicotine pouches are small, pre-portioned pouches containing nicotine, flavoring, and plant-based fibers — with no tobacco leaf involved. They're placed between the lip and gum, where nicotine is absorbed over time, and don't require spitting.",
            "They're often chosen by nicotine consumers looking for a smoke-free and vapor-free option that can be used discreetly. Strength varies significantly by brand, so checking the milligram rating on the packaging is important.",
          ],
          fr: [
            "Les sachets de nicotine sont de petits sachets préportionnés contenant de la nicotine, des arômes et des fibres végétales — sans aucune feuille de tabac. Ils sont placés entre la lèvre et la gencive, où la nicotine est absorbée progressivement, et ne nécessitent pas de cracher.",
            "Ils sont souvent choisis par les consommateurs de nicotine à la recherche d'une option sans fumée ni vapeur, utilisable discrètement. La concentration varie considérablement selon la marque, il est donc important de vérifier l'indication en milligrammes sur l'emballage.",
          ],
        },
      },
      {
        slug: "vape-devices",
        title: { en: "Vape Devices", fr: "Dispositifs de vapotage" },
        summary: {
          en: "Reusable, rechargeable devices designed for refillable e-liquid.",
          fr: "Des dispositifs réutilisables et rechargeables conçus pour un liquide remplissable.",
        },
        body: {
          en: [
            "Vape devices (or “mods”) are reusable, rechargeable systems designed to be refilled with e-liquid rather than replaced after a single use. They range from simple pod systems to more advanced setups with adjustable wattage and airflow.",
            "Because they're refillable, consumers can choose their preferred e-liquid nicotine strength and flavor rather than being limited to what comes pre-filled. Regular coil replacement and basic maintenance help keep performance and flavor consistent.",
          ],
          fr: [
            "Les dispositifs de vapotage (ou « mods ») sont des systèmes réutilisables et rechargeables conçus pour être remplis de liquide plutôt que remplacés après un seul usage. Ils vont de simples systèmes à cartouche à des configurations plus avancées avec puissance et débit d'air ajustables.",
            "Comme ils sont remplissables, les consommateurs peuvent choisir la concentration de nicotine et la saveur du liquide qu'ils préfèrent, plutôt que d'être limités à ce qui est préversé. Le remplacement régulier de la bobine et un entretien de base aident à maintenir une performance et une saveur constantes.",
          ],
        },
      },
    ],
  },
  {
    slug: "cannabis-education",
    icon: GraduationCap,
    emoji: "\u{1F4DA}",
    accent: "yellow",
    title: { en: "Cannabis Education", fr: "Éducation sur le cannabis" },
    description: {
      en: "The core concepts behind potency, dosing, and how effects actually work.",
      fr: "Les concepts clés derrière la puissance, le dosage et le fonctionnement des effets.",
    },
    topics: [
      {
        slug: "thc-vs-cbd",
        title: { en: "THC vs CBD", fr: "THC vs CBD" },
        summary: {
          en: "The two best-known cannabinoids, and how their effects generally differ.",
          fr: "Les deux cannabinoïdes les plus connus, et la manière dont leurs effets diffèrent généralement.",
        },
        body: {
          en: [
            "THC (tetrahydrocannabinol) and CBD (cannabidiol) are the two most well-known cannabinoids found in cannabis. THC is the primary compound associated with the plant's intoxicating effects, while CBD does not produce that same effect and is generally associated with a more subtle, non-intoxicating experience.",
            "Many products combine both in different ratios — a higher CBD-to-THC ratio is often chosen by consumers seeking a milder experience, while higher THC ratios are associated with stronger effects. Individual response to both compounds varies widely from person to person.",
          ],
          fr: [
            "Le THC (tétrahydrocannabinol) et le CBD (cannabidiol) sont les deux cannabinoïdes les plus connus présents dans le cannabis. Le THC est le principal composé associé aux effets intoxicants de la plante, tandis que le CBD ne produit pas cet effet et est généralement associé à une expérience plus subtile et non intoxicante.",
            "Plusieurs produits combinent les deux dans différentes proportions — un ratio CBD/THC plus élevé est souvent choisi par les consommateurs recherchant une expérience plus douce, tandis que des ratios de THC plus élevés sont associés à des effets plus intenses. La réponse individuelle aux deux composés varie grandement d'une personne à l'autre.",
          ],
        },
      },
      {
        slug: "terpenes",
        title: { en: "Terpenes", fr: "Terpènes" },
        summary: {
          en: "The aromatic compounds responsible for a strain's distinct smell and flavor.",
          fr: "Les composés aromatiques responsables de l'odeur et de la saveur distinctes d'une variété.",
        },
        body: {
          en: [
            "Terpenes are aromatic compounds found throughout the plant kingdom, including cannabis, and are responsible for the distinct smells associated with different strains — from citrusy and piney to earthy and skunky. They're the same class of compounds found in things like lavender, pine trees, and citrus fruit peels.",
            "Beyond aroma, many consumers believe terpenes contribute to the overall feel of a product alongside cannabinoids, sometimes referred to as the “entourage effect” — though this remains an area of ongoing research rather than an established medical claim.",
          ],
          fr: [
            "Les terpènes sont des composés aromatiques présents dans tout le règne végétal, y compris le cannabis, et sont responsables des odeurs distinctes associées aux différentes variétés — allant d'agrumes et de pin à des notes terreuses ou de skunk. Ce sont les mêmes composés que l'on retrouve dans la lavande, les conifères ou les pelures d'agrumes.",
            "Au-delà de l'arôme, plusieurs consommateurs croient que les terpènes contribuent à la sensation globale d'un produit en complément des cannabinoïdes, un phénomène parfois appelé « effet d'entourage » — bien qu'il s'agisse toujours d'un domaine de recherche en cours plutôt que d'une affirmation médicale établie.",
          ],
        },
      },
      {
        slug: "cannabinoids",
        title: { en: "Cannabinoids", fr: "Cannabinoïdes" },
        summary: {
          en: "The broader family of active compounds found in the cannabis plant.",
          fr: "La famille plus large de composés actifs présents dans la plante de cannabis.",
        },
        body: {
          en: [
            "Cannabinoids are a class of active compounds naturally produced by the cannabis plant. More than 100 have been identified, with THC and CBD being the most studied, alongside others like CBG, CBN, and THCA.",
            "Each cannabinoid is associated with different characteristics, and they're generally understood to interact with each other rather than acting entirely in isolation. Product labels increasingly list a fuller cannabinoid breakdown, which can help consumers compare products beyond just total THC.",
          ],
          fr: [
            "Les cannabinoïdes forment une classe de composés actifs produits naturellement par la plante de cannabis. Plus de 100 ont été identifiés, le THC et le CBD étant les plus étudiés, aux côtés d'autres comme le CBG, le CBN et le THCA.",
            "Chaque cannabinoïde est associé à des caractéristiques différentes, et on comprend généralement qu'ils interagissent entre eux plutôt que d'agir de façon entièrement isolée. Les étiquettes de produits indiquent de plus en plus une répartition complète des cannabinoïdes, ce qui peut aider les consommateurs à comparer les produits au-delà du seul THC total.",
          ],
        },
      },
      {
        slug: "potency-guide",
        title: { en: "Potency Guide", fr: "Guide de puissance" },
        summary: {
          en: "How to read and understand THC/CBD percentages on product labels.",
          fr: "Comment lire et comprendre les pourcentages de THC et de CBD sur les étiquettes de produits.",
        },
        body: {
          en: [
            "Potency refers to the concentration of cannabinoids in a product, usually shown as a percentage (for flower) or milligrams (for edibles and concentrates). A higher percentage means a greater concentration of that cannabinoid, not necessarily a “better” product.",
            "Comparing potency across product types can be misleading — a small amount of a high-potency concentrate can contain far more THC than a much larger amount of flower. Reading labels carefully and comparing similar formats is the most reliable way to understand what you're purchasing.",
          ],
          fr: [
            "La puissance fait référence à la concentration de cannabinoïdes dans un produit, généralement indiquée en pourcentage (pour la fleur) ou en milligrammes (pour les comestibles et les concentrés). Un pourcentage plus élevé signifie une concentration plus importante de ce cannabinoïde, et non nécessairement un « meilleur » produit.",
            "Comparer la puissance entre différents types de produits peut être trompeur — une petite quantité d'un concentré très puissant peut contenir beaucoup plus de THC qu'une quantité bien plus grande de fleur. Lire attentivement les étiquettes et comparer des formats similaires demeure la façon la plus fiable de comprendre ce que l'on achète.",
          ],
        },
      },
      {
        slug: "dosage-guide",
        title: { en: "Dosage Guide", fr: "Guide de dosage" },
        summary: {
          en: "General educational information on how cannabis dosing is typically discussed.",
          fr: "Des informations éducatives générales sur la façon dont le dosage du cannabis est habituellement abordé.",
        },
        body: {
          en: [
            "Dosage generally refers to the amount of a cannabinoid, most often THC, consumed in a single serving — commonly measured in milligrams for edibles and concentrates. Because absorption and individual tolerance vary so widely, there's no universal “right” dose that applies to everyone.",
            "This section is educational only and not a personalized recommendation. Many new consumers are encouraged to become familiar with lower amounts before considering anything higher, and to speak with in-store staff about product-specific labeling.",
          ],
          fr: [
            "Le dosage fait généralement référence à la quantité d'un cannabinoïde, le plus souvent le THC, consommée en une seule portion — habituellement mesurée en milligrammes pour les comestibles et les concentrés. Comme l'absorption et la tolérance individuelle varient énormément, il n'existe pas de « bonne » dose universelle qui convienne à tout le monde.",
            "Cette section est fournie à titre éducatif seulement et ne constitue pas une recommandation personnalisée. Plusieurs nouveaux consommateurs sont encouragés à se familiariser avec de plus petites quantités avant d'envisager quoi que ce soit de plus élevé, et à discuter avec le personnel en boutique de l'étiquetage propre à chaque produit.",
          ],
        },
      },
      {
        slug: "onset-time",
        title: { en: "Onset Time", fr: "Temps d'apparition" },
        summary: {
          en: "How long it generally takes to feel effects, and why it varies by product type.",
          fr: "Le temps généralement nécessaire pour ressentir les effets, et pourquoi il varie selon le type de produit.",
        },
        body: {
          en: [
            "Onset time is the amount of time between consuming a product and noticing its effects, and it varies significantly by consumption method. Inhaled products (smoking or vaping) tend to have a faster onset, often within minutes, because cannabinoids enter the bloodstream through the lungs.",
            "Edibles are processed through the digestive system and liver, which generally takes much longer — commonly discussed as anywhere from 30 minutes to over two hours. This is why waiting before consuming more is a frequently discussed practice, since effects can take time to appear.",
          ],
          fr: [
            "Le temps d'apparition est le délai entre la consommation d'un produit et le moment où l'on en ressent les effets, et il varie considérablement selon la méthode de consommation. Les produits inhalés (fumés ou vapotés) ont tendance à avoir une apparition plus rapide, souvent en quelques minutes, car les cannabinoïdes entrent dans la circulation sanguine par les poumons.",
            "Les comestibles sont traités par le système digestif et le foie, ce qui prend généralement beaucoup plus de temps — souvent discuté comme allant de 30 minutes à plus de deux heures. C'est pourquoi attendre avant d'en consommer davantage est une pratique fréquemment recommandée, puisque les effets peuvent prendre du temps à apparaître.",
          ],
        },
      },
      {
        slug: "duration-of-effects",
        title: { en: "Duration of Effects", fr: "Durée des effets" },
        summary: {
          en: "A general look at how long effects are commonly reported to last by product type.",
          fr: "Un survol général de la durée habituellement rapportée des effets selon le type de produit.",
        },
        body: {
          en: [
            "How long effects last depends heavily on the consumption method, the amount consumed, and individual factors like metabolism and tolerance. Inhaled products tend to have a shorter overall duration, often discussed in the range of one to a few hours.",
            "Edibles are generally reported to last considerably longer, sometimes several hours, because of how they're processed by the body. These are general educational ranges only — individual experiences can differ substantially.",
          ],
          fr: [
            "La durée des effets dépend fortement de la méthode de consommation, de la quantité consommée et de facteurs individuels comme le métabolisme et la tolérance. Les produits inhalés ont tendance à avoir une durée globale plus courte, souvent discutée dans une fourchette d'une à quelques heures.",
            "Les comestibles sont généralement rapportés comme ayant une durée bien plus longue, parfois plusieurs heures, en raison de la façon dont ils sont traités par le corps. Il s'agit ici de fourchettes éducatives générales seulement — l'expérience individuelle peut varier considérablement.",
          ],
        },
      },
      {
        slug: "how-to-choose",
        title: { en: "How to Choose the Right Product", fr: "Comment choisir le bon produit" },
        summary: {
          en: "A practical framework for narrowing down options in-store.",
          fr: "Un cadre pratique pour restreindre les options en boutique.",
        },
        body: {
          en: [
            "With so many formats, potencies, and cannabinoid ratios available, choosing a product can feel overwhelming. A useful starting point is thinking about consumption method first (smoking, vaping, edibles, etc.), then narrowing by desired potency and cannabinoid ratio.",
            "Reading labels, comparing terpene profiles, and asking in-store staff questions are all practical ways to narrow down options. There's no single “correct” product — the right choice depends on personal preference, experience level, and comfort with different formats.",
          ],
          fr: [
            "Avec autant de formats, de puissances et de ratios de cannabinoïdes disponibles, choisir un produit peut sembler accablant. Un bon point de départ consiste à réfléchir d'abord à la méthode de consommation (fumer, vapoter, comestibles, etc.), puis à restreindre selon la puissance et le ratio de cannabinoïdes souhaités.",
            "Lire les étiquettes, comparer les profils de terpènes et poser des questions au personnel en boutique sont toutes des façons pratiques de restreindre les options. Il n'existe pas de produit « correct » unique — le bon choix dépend des préférences personnelles, du niveau d'expérience et de l'aisance avec différents formats.",
          ],
        },
      },
      {
        slug: "beginners-guide",
        title: { en: "Beginner's Guide", fr: "Guide du débutant" },
        summary: {
          en: "A starting point for anyone new to cannabis products.",
          fr: "Un point de départ pour toute personne débutant avec les produits de cannabis.",
        },
        body: {
          en: [
            "If you're new to cannabis, it generally helps to start with lower-potency products and simpler formats before exploring concentrates or high-milligram edibles. Understanding the basic differences between flower, edibles, vapes, and concentrates makes it easier to know what to expect.",
            "It's also worth taking time to understand onset time and duration before trying a new format, since patience matters more than most people expect. Staff at the store are a good resource for first-time questions about any specific product.",
          ],
          fr: [
            "Si vous débutez avec le cannabis, il est généralement utile de commencer par des produits à plus faible puissance et des formats plus simples avant d'explorer les concentrés ou les comestibles à forte teneur en milligrammes. Comprendre les différences de base entre la fleur, les comestibles, les vapoteuses et les concentrés facilite les attentes.",
            "Il vaut aussi la peine de prendre le temps de comprendre le temps d'apparition et la durée des effets avant d'essayer un nouveau format, car la patience compte plus qu'on ne le pense généralement. Le personnel en boutique est une bonne ressource pour toute question de débutant sur un produit spécifique.",
          ],
        },
      },
    ],
  },
  {
    slug: "responsible-use",
    icon: ShieldAlert,
    emoji: "⚠️",
    accent: "red",
    title: { en: "Responsible Use", fr: "Consommation responsable" },
    description: {
      en: "Practical guidance for safer, more informed consumption.",
      fr: "Des conseils pratiques pour une consommation plus sûre et informée.",
    },
    topics: [
      {
        slug: "start-low-go-slow",
        title: { en: "Start Low, Go Slow", fr: "Commencer petit, aller lentement" },
        summary: {
          en: "A widely shared principle for approaching any new product cautiously.",
          fr: "Un principe largement partagé pour aborder tout nouveau produit avec prudence.",
        },
        body: {
          en: [
            "“Start low, go slow” is a commonly shared principle encouraging consumers, especially those trying a new product or format, to begin with a smaller amount and give it time to take effect before considering more. It's especially relevant for edibles, given their longer and less predictable onset time.",
            "This approach helps consumers get a clearer sense of how a specific product affects them individually before deciding whether to try more. It's general guidance, not a personalized recommendation, and doesn't apply the same way to every product or person.",
          ],
          fr: [
            "« Commencer petit, aller lentement » est un principe couramment partagé encourageant les consommateurs, particulièrement ceux qui essaient un nouveau produit ou format, à commencer par une petite quantité et à lui laisser le temps de faire effet avant d'envisager d'en prendre davantage. C'est particulièrement pertinent pour les comestibles, étant donné leur temps d'apparition plus long et moins prévisible.",
            "Cette approche aide les consommateurs à mieux comprendre comment un produit spécifique les affecte individuellement avant de décider d'en prendre davantage. Il s'agit d'une indication générale, non d'une recommandation personnalisée, et elle ne s'applique pas de la même façon à chaque produit ou à chaque personne.",
          ],
        },
      },
      {
        slug: "safe-storage",
        title: { en: "Safe Storage", fr: "Entreposage sécuritaire" },
        summary: {
          en: "Practical tips for storing cannabis and related products securely and properly.",
          fr: "Des conseils pratiques pour entreposer le cannabis et les produits connexes de façon sécuritaire et adéquate.",
        },
        body: {
          en: [
            "Cannabis products should be stored out of reach of children and pets, ideally in their original, labeled packaging, in a cool, dry, and dark place away from direct sunlight and heat. Proper storage also helps preserve freshness, potency, and flavor over time.",
            "Many jurisdictions have specific legal requirements around secure storage, particularly for households with children. Checking local regulations is a good habit for any cannabis consumer.",
          ],
          fr: [
            "Les produits de cannabis devraient être entreposés hors de portée des enfants et des animaux, idéalement dans leur emballage d'origine étiqueté, dans un endroit frais, sec et sombre, à l'abri de la lumière directe du soleil et de la chaleur. Un entreposage adéquat aide aussi à préserver la fraîcheur, la puissance et la saveur avec le temps.",
            "Plusieurs juridictions ont des exigences légales précises concernant l'entreposage sécuritaire, particulièrement pour les foyers avec enfants. Vérifier la réglementation locale est une bonne habitude pour tout consommateur de cannabis.",
          ],
        },
      },
      {
        slug: "impairment-driving",
        title: { en: "Impairment & Driving", fr: "Affaiblissement des facultés et conduite" },
        summary: {
          en: "Why driving after cannabis use is never recommended, regardless of product type.",
          fr: "Pourquoi conduire après avoir consommé du cannabis n'est jamais recommandé, peu importe le type de produit.",
        },
        body: {
          en: [
            "Cannabis can impair coordination, reaction time, and judgment — all of which are critical for safe driving. Unlike alcohol, impairment from cannabis doesn't follow a simple, predictable timeline, and it can vary by product, individual, and tolerance.",
            "Driving under the influence of cannabis is illegal everywhere in Canada and carries serious legal consequences. The only reliable approach is to never drive after consuming cannabis, and to plan alternate transportation ahead of time.",
          ],
          fr: [
            "Le cannabis peut nuire à la coordination, au temps de réaction et au jugement — des éléments essentiels à la conduite sécuritaire. Contrairement à l'alcool, l'affaiblissement des facultés causé par le cannabis ne suit pas un échéancier simple et prévisible, et il peut varier selon le produit, la personne et la tolérance.",
            "Conduire sous l'influence du cannabis est illégal partout au Canada et entraîne de sérieuses conséquences légales. La seule approche fiable consiste à ne jamais conduire après avoir consommé du cannabis, et à planifier un autre moyen de transport à l'avance.",
          ],
        },
      },
      {
        slug: "mixing-products",
        title: { en: "Mixing Products", fr: "Combiner des produits" },
        summary: {
          en: "General considerations around combining cannabis with alcohol or other substances.",
          fr: "Des considérations générales sur la combinaison du cannabis avec l'alcool ou d'autres substances.",
        },
        body: {
          en: [
            "Combining cannabis with alcohol or other substances can amplify effects in ways that are harder to predict than either substance alone. This can make it more difficult to gauge impairment accurately.",
            "If you choose to consume more than one substance, doing so slowly, with awareness, and in a safe environment is commonly recommended. This is general educational information only — anyone with specific health questions should speak with a qualified professional.",
          ],
          fr: [
            "Combiner le cannabis avec de l'alcool ou d'autres substances peut amplifier les effets d'une façon plus difficile à prévoir que chaque substance prise seule. Cela peut rendre plus difficile l'évaluation précise de l'affaiblissement des facultés.",
            "Si vous choisissez de consommer plus d'une substance, le faire lentement, avec attention et dans un environnement sécuritaire est généralement recommandé. Il s'agit d'une information éducative générale seulement — toute personne ayant des questions de santé spécifiques devrait consulter un professionnel qualifié.",
          ],
        },
      },
      {
        slug: "first-time-tips",
        title: { en: "First-Time Tips", fr: "Conseils pour une première fois" },
        summary: {
          en: "Practical suggestions for a more comfortable first experience.",
          fr: "Des suggestions pratiques pour une première expérience plus confortable.",
        },
        body: {
          en: [
            "For a first experience, many people find it helpful to be in a comfortable, familiar environment with people they trust, to start with a lower-potency product, and to avoid mixing with alcohol or other substances. Having water, snacks, and something relaxing to do on hand is also commonly suggested.",
            "It also helps to plan not to drive, and to give a product enough time to take effect before assuming it “isn't working.” If anything feels uncomfortable, staying calm, changing your environment, and giving it time are the most commonly suggested responses.",
          ],
          fr: [
            "Pour une première expérience, plusieurs trouvent utile de se trouver dans un environnement confortable et familier, entouré de personnes de confiance, de commencer par un produit à plus faible puissance et d'éviter de le combiner avec de l'alcool ou d'autres substances. Avoir de l'eau, des collations et une activité relaxante à portée de main est aussi une suggestion courante.",
            "Il est aussi utile de prévoir ne pas conduire, et de laisser assez de temps à un produit pour faire effet avant de conclure qu'il « ne fonctionne pas ». Si quelque chose semble inconfortable, rester calme, changer d'environnement et laisser du temps passer sont les réponses les plus souvent suggérées.",
          ],
        },
      },
      {
        slug: "faq",
        title: { en: "Frequently Asked Questions", fr: "Foire aux questions" },
        summary: {
          en: "Quick answers to common questions about shopping and consuming responsibly.",
          fr: "Des réponses rapides aux questions courantes sur les achats et la consommation responsable.",
        },
        body: {
          en: [
            "This section gathers some of the most common questions customers ask about cannabis products in general — covering things like how to store products safely, what to expect from different formats, and where to find reliable information. It's meant as a quick-reference starting point rather than a complete guide.",
            "For anything specific to a product you're considering, in-store staff are always the best resource, since labeling and formulations can vary between brands. This section, like the rest of the Learning Center, is educational only and not medical advice.",
          ],
          fr: [
            "Cette section rassemble certaines des questions les plus fréquentes posées par la clientèle au sujet des produits de cannabis en général — comment entreposer les produits en toute sécurité, à quoi s'attendre selon les différents formats, et où trouver de l'information fiable. Elle se veut un point de référence rapide plutôt qu'un guide complet.",
            "Pour toute question spécifique à un produit qui vous intéresse, le personnel en boutique demeure toujours la meilleure ressource, puisque l'étiquetage et les formulations peuvent varier d'une marque à l'autre. Cette section, comme le reste du Centre d'apprentissage, est fournie à titre éducatif seulement et ne constitue pas un avis médical.",
          ],
        },
      },
    ],
  },
  {
    slug: "cbd",
    icon: Droplet,
    emoji: "\u{1F4A7}",
    accent: "yellow",
    title: { en: "CBD", fr: "CBD" },
    description: {
      en: "Understand CBD, its different formats, and the essential concepts to know.",
      fr: "Comprendre le CBD, ses différents formats et les notions essentielles à connaître.",
    },
    topics: [
      {
        slug: "what-is-cbd",
        title: { en: "What Is CBD?", fr: "Qu'est-ce que le CBD?" },
        summary: {
          en: "An introduction to CBD, one of the main non-intoxicating cannabinoids found in cannabis.",
          fr: "Une introduction au CBD, l'un des principaux cannabinoïdes non intoxicants présents dans le cannabis.",
        },
        body: {
          en: [
            "CBD (cannabidiol) is one of the many naturally occurring cannabinoids found in the cannabis plant. Unlike THC, CBD is generally described as non-intoxicating, meaning it isn't typically associated with the “high” commonly linked to cannabis use.",
            "CBD is available in a wide range of formats, including oils, capsules, topicals, and vapes, and is often chosen by consumers exploring cannabis without the intoxicating effects associated with THC. As with all cannabis products, individual experience can vary, and checking product labeling is the best way to understand what a specific item contains.",
          ],
          fr: [
            "Le CBD (cannabidiol) est l'un des nombreux cannabinoïdes naturellement présents dans la plante de cannabis. Contrairement au THC, le CBD est généralement décrit comme non intoxicant, ce qui signifie qu'il n'est habituellement pas associé au « high » couramment lié à la consommation de cannabis.",
            "Le CBD est offert dans une large gamme de formats, notamment les huiles, les capsules, les produits topiques et les vapoteuses, et est souvent choisi par les consommateurs qui explorent le cannabis sans les effets intoxicants associés au THC. Comme pour tous les produits de cannabis, l'expérience individuelle peut varier, et vérifier l'étiquette du produit demeure la meilleure façon de savoir ce qu'il contient.",
          ],
        },
      },
      {
        slug: "cbd-product-types",
        title: { en: "Full-Spectrum, Broad-Spectrum & Isolate", fr: "Spectre complet, spectre large et isolat" },
        summary: {
          en: "The three common categories used to describe how much of the cannabis plant a CBD product contains.",
          fr: "Les trois catégories courantes utilisées pour décrire la quantité de la plante de cannabis présente dans un produit de CBD.",
        },
        body: {
          en: [
            "CBD products are commonly grouped into three categories based on what else from the plant they contain alongside CBD. Full-spectrum products contain a range of cannabinoids and compounds naturally found in cannabis, including trace amounts of THC. Broad-spectrum products aim to include multiple cannabinoids while removing THC, and isolate products contain purified CBD with no other cannabinoids.",
            "Which category a consumer chooses often comes down to personal preference, since each format offers a different balance of compounds. Reading the product label and any accompanying lab results is the most reliable way to understand exactly what a specific product contains.",
          ],
          fr: [
            "Les produits de CBD sont généralement classés en trois catégories selon ce qu'ils contiennent d'autre de la plante en plus du CBD. Les produits à spectre complet contiennent une gamme de cannabinoïdes et de composés naturellement présents dans le cannabis, y compris des traces de THC. Les produits à spectre large visent à inclure plusieurs cannabinoïdes tout en retirant le THC, tandis que les produits isolats contiennent du CBD purifié sans autre cannabinoïde.",
            "Le choix d'une catégorie plutôt qu'une autre dépend souvent des préférences personnelles, puisque chaque format offre un équilibre différent de composés. Lire l'étiquette du produit et les résultats d'analyses en laboratoire qui l'accompagnent demeure la façon la plus fiable de savoir exactement ce que contient un produit précis.",
          ],
        },
      },
      {
        slug: "cbd-formats",
        title: { en: "Common CBD Formats", fr: "Formats courants de CBD" },
        summary: {
          en: "An overview of the everyday ways CBD products are packaged and consumed.",
          fr: "Un survol des façons courantes dont les produits de CBD sont emballés et consommés.",
        },
        body: {
          en: [
            "CBD is sold in many of the same formats used across the broader cannabis market, including oils and tinctures taken under the tongue, capsules, topical creams and balms, and vape cartridges. Each format offers a different way of incorporating CBD into a routine.",
            "Oils and tinctures are often chosen for their flexibility, since the amount used can be adjusted drop by drop, while capsules offer a pre-measured, consistent option. Topical formats are applied directly to the skin, and vapes provide a fast-acting inhaled option. As with any cannabis product, checking the label helps clarify what a specific item contains.",
          ],
          fr: [
            "Le CBD est vendu dans plusieurs des mêmes formats que l'on retrouve sur l'ensemble du marché du cannabis, notamment les huiles et teintures prises sous la langue, les capsules, les crèmes et baumes topiques, ainsi que les cartouches de vapotage. Chaque format offre une façon différente d'intégrer le CBD à une routine.",
            "Les huiles et teintures sont souvent privilégiées pour leur flexibilité, puisque la quantité utilisée peut être ajustée goutte par goutte, tandis que les capsules offrent une option préformatée et constante. Les formats topiques s'appliquent directement sur la peau, et les vapoteuses offrent une option inhalée à action rapide. Comme pour tout produit de cannabis, vérifier l'étiquette aide à clarifier ce que contient un article précis.",
          ],
        },
      },
    ],
  },
  {
    slug: "edibles",
    icon: Cookie,
    emoji: "\u{1F36A}",
    accent: "red",
    title: { en: "Edibles", fr: "Comestibles" },
    description: {
      en: "Learn about the different types of edible products and their characteristics.",
      fr: "Comprendre les différents types de produits comestibles et leurs particularités.",
    },
    topics: [
      {
        slug: "what-are-edibles",
        title: { en: "What Are Edibles?", fr: "Que sont les comestibles?" },
        summary: {
          en: "A general introduction to cannabis-infused food and drink products.",
          fr: "Une introduction générale aux produits alimentaires et aux boissons infusés au cannabis.",
        },
        body: {
          en: [
            "Edibles are food or drink products infused with cannabis extract, most commonly distillate. Rather than being smoked or vaporized, cannabis is consumed through digestion, which changes how and when its effects are felt.",
            "Because edibles are processed by the digestive system and liver, their onset is generally slower and less predictable than inhaled products — often discussed as anywhere from 30 minutes to over two hours. This is a key reason “start low, go slow” is such commonly repeated guidance for this category specifically.",
          ],
          fr: [
            "Les comestibles sont des produits alimentaires ou des boissons infusés à l'extrait de cannabis, le plus souvent du distillat. Plutôt que d'être fumé ou vapoté, le cannabis est consommé par digestion, ce qui change la façon et le moment où ses effets sont ressentis.",
            "Comme les comestibles sont traités par le système digestif et le foie, leur apparition est généralement plus lente et moins prévisible que celle des produits inhalés — souvent discutée comme allant de 30 minutes à plus de deux heures. C'est une raison importante pour laquelle « commencer petit, aller lentement » est un conseil si souvent répété spécifiquement pour cette catégorie.",
          ],
        },
      },
      {
        slug: "gummies-chocolates",
        title: { en: "Gummies & Chocolates", fr: "Gommes et chocolats" },
        summary: {
          en: "Two of the most common edible formats, typically divided into individual pieces.",
          fr: "Deux des formats de comestibles les plus courants, généralement divisés en morceaux individuels.",
        },
        body: {
          en: [
            "Gummies and chocolates are among the most widely available edible formats, typically made by infusing a cannabis extract into a food base and dividing it into individual pieces or squares. This piece-based format is designed to make each unit easy to identify and separate from the rest of the package.",
            "Flavor, texture, and formulation vary by brand, and packaging typically indicates how the product is divided. As with all edibles, checking the label for how the total product is portioned is an important step before consuming.",
          ],
          fr: [
            "Les gommes et les chocolats comptent parmi les formats de comestibles les plus répandus, généralement fabriqués en infusant un extrait de cannabis dans une base alimentaire, puis en la divisant en morceaux ou en carrés individuels. Ce format en morceaux vise à rendre chaque unité facile à reconnaître et à séparer du reste de l'emballage.",
            "La saveur, la texture et la formulation varient selon la marque, et l'emballage indique généralement comment le produit est divisé. Comme pour tous les comestibles, vérifier l'étiquette pour savoir comment le produit total est réparti est une étape importante avant la consommation.",
          ],
        },
      },
      {
        slug: "edible-beverages",
        title: { en: "Edible Beverages", fr: "Boissons comestibles" },
        summary: {
          en: "Cannabis-infused drinks, from sparkling beverages to teas and coffees.",
          fr: "Des boissons infusées au cannabis, des breuvages pétillants aux thés et cafés.",
        },
        body: {
          en: [
            "Cannabis-infused beverages include sparkling drinks, teas, coffees, and other beverage formats infused with cannabis extract. They're often chosen by consumers who prefer a familiar drinking experience over solid edibles.",
            "Because beverages are still processed through digestion, they generally share the slower, less predictable onset associated with other edibles, though some formulations are designed for faster absorption. Shaking or stirring the product as directed, and checking the label for how it's portioned, are both commonly recommended steps.",
          ],
          fr: [
            "Les boissons infusées au cannabis comprennent les breuvages pétillants, les thés, les cafés et d'autres formats de boissons infusés à l'extrait de cannabis. Elles sont souvent choisies par les consommateurs qui préfèrent une expérience de consommation familière plutôt que les comestibles solides.",
            "Comme les boissons sont tout de même traitées par digestion, elles partagent généralement l'apparition plus lente et moins prévisible associée aux autres comestibles, bien que certaines formulations soient conçues pour une absorption plus rapide. Agiter ou brasser le produit selon les indications, et vérifier l'étiquette pour savoir comment il est réparti, sont deux étapes couramment recommandées.",
          ],
        },
      },
    ],
  },
  {
    slug: "topicals",
    icon: SprayCan,
    emoji: "\u{1F9F4}",
    accent: "orange",
    title: { en: "Topicals", fr: "Produits topiques" },
    description: {
      en: "Learn about topical products, their formats, and their general use.",
      fr: "Découvrir les produits topiques, leurs formats et leur utilisation générale.",
    },
    topics: [
      {
        slug: "what-are-topicals",
        title: { en: "What Are Topicals?", fr: "Que sont les produits topiques?" },
        summary: {
          en: "An introduction to cannabis products designed to be applied directly to the skin.",
          fr: "Une introduction aux produits de cannabis conçus pour être appliqués directement sur la peau.",
        },
        body: {
          en: [
            "Topicals are cannabis-infused products designed to be applied directly to the skin rather than inhaled or ingested, including creams, balms, oils, and patches. Most topical formats are not intended to produce an intoxicating effect, since standard topicals generally don't absorb deeply enough to reach the bloodstream in the same way inhaled or ingested products do.",
            "Topicals are typically applied to a specific area and are chosen by consumers looking for a localized, non-intoxicating way to incorporate cannabinoids into a routine. As with any cannabis product, checking the label for ingredients and intended use is recommended before applying.",
          ],
          fr: [
            "Les produits topiques sont des produits infusés au cannabis conçus pour être appliqués directement sur la peau plutôt qu'inhalés ou ingérés, incluant les crèmes, les baumes, les huiles et les timbres. La plupart des formats topiques ne visent pas à produire un effet intoxicant, puisque les topiques standards ne pénètrent généralement pas assez profondément pour atteindre la circulation sanguine de la même façon que les produits inhalés ou ingérés.",
            "Les produits topiques sont généralement appliqués sur une zone précise et sont choisis par les consommateurs à la recherche d'une façon localisée et non intoxicante d'intégrer des cannabinoïdes à une routine. Comme pour tout produit de cannabis, il est recommandé de vérifier l'étiquette pour connaître les ingrédients et l'usage prévu avant l'application.",
          ],
        },
      },
      {
        slug: "creams-balms",
        title: { en: "Creams & Balms", fr: "Crèmes et baumes" },
        summary: {
          en: "The most common topical formats, applied by hand to a specific area.",
          fr: "Les formats topiques les plus courants, appliqués à la main sur une zone précise.",
        },
        body: {
          en: [
            "Creams and balms are among the most common topical formats, typically combining a cannabis extract with a lotion, oil, or wax-based carrier. They're applied by hand directly to the skin, usually over a localized area.",
            "Texture and absorption vary by product — creams tend to be lighter and absorb more quickly, while balms are thicker and longer-lasting on the skin. Checking the ingredient list is useful for consumers with sensitivities, since formulations differ between brands.",
          ],
          fr: [
            "Les crèmes et les baumes comptent parmi les formats topiques les plus courants, combinant généralement un extrait de cannabis à une lotion, une huile ou une base cireuse. Ils s'appliquent à la main directement sur la peau, habituellement sur une zone localisée.",
            "La texture et l'absorption varient selon le produit — les crèmes ont tendance à être plus légères et à s'absorber plus rapidement, tandis que les baumes sont plus épais et persistent plus longtemps sur la peau. Vérifier la liste des ingrédients est utile pour les consommateurs ayant des sensibilités, puisque les formulations diffèrent d'une marque à l'autre.",
          ],
        },
      },
      {
        slug: "transdermal-patches",
        title: { en: "Transdermal Patches", fr: "Timbres transdermiques" },
        summary: {
          en: "Adhesive patches designed for slow, sustained release through the skin.",
          fr: "Des timbres adhésifs conçus pour une libération lente et continue à travers la peau.",
        },
        body: {
          en: [
            "Transdermal patches are adhesive patches applied to the skin that are designed to release cannabinoids gradually over an extended period. Unlike standard topicals, some transdermal formats are specifically engineered to pass through the skin into the bloodstream.",
            "Because they can be designed differently from standard topical creams, it's important to read the label carefully to understand whether a specific patch is intended for localized use or systemic absorption. Placement instructions and wear time also vary by product.",
          ],
          fr: [
            "Les timbres transdermiques sont des timbres adhésifs appliqués sur la peau, conçus pour libérer des cannabinoïdes graduellement sur une période prolongée. Contrairement aux topiques standards, certains formats transdermiques sont spécifiquement conçus pour traverser la peau et atteindre la circulation sanguine.",
            "Comme ils peuvent être conçus différemment des crèmes topiques standards, il est important de lire attentivement l'étiquette pour comprendre si un timbre précis est destiné à un usage localisé ou à une absorption systémique. Les instructions de placement et la durée de port varient également selon le produit.",
          ],
        },
      },
    ],
  },
];
