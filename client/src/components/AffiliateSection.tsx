import { ExternalLink, BookOpen, Leaf, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";

// Affiliate Banner Component for Mushroom Spores & Grow Kits
export function AffiliateBannerSpores() {
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-card via-card/80 to-card border-2 border-primary/30 rounded-lg">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Leaf className="w-8 h-8 text-primary" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-headline text-lg text-foreground mb-2">
            🍄 Premium Mushroom Spores & Cultivation Supplies
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start your mycology journey with quality spores from our vetted partners. 
            For microscopy and research purposes only. Educational resources included.
          </p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
            <a 
              href="#spore-affiliate" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="font-typewriter text-xs">
                BROWSE SPORES
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </a>
            <a 
              href="#growkit-affiliate" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <Button variant="outline" size="sm" className="font-typewriter text-xs">
                GROW KITS
                <ExternalLink className="w-3 h-3 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center italic">
        * Affiliate link. We may earn a commission at no extra cost to you.
      </p>
    </div>
  );
}

// Affiliate Banner for Amanita Products
export function AffiliateBannerAmanita() {
  return (
    <div className="my-8 p-6 bg-gradient-to-r from-red-950/30 via-card to-red-950/30 border-2 border-red-800/30 rounded-lg">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center">
            <FlaskConical className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-headline text-lg text-foreground mb-2">
            🔴 Quality Amanita Muscaria Products
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Properly prepared Amanita products from trusted sources. Lab-tested for safety. 
            Explore tinctures, dried caps, and microdose preparations.
          </p>
          <a 
            href="#amanita-affiliate" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button variant="outline" size="sm" className="font-typewriter text-xs border-red-800/50 hover:border-red-600">
              SHOP AMANITA PRODUCTS
              <ExternalLink className="w-3 h-3 ml-2" />
            </Button>
          </a>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mt-4 text-center italic">
        * Affiliate link. Always research local laws before purchasing.
      </p>
    </div>
  );
}

// Amazon Book Recommendations Section
export function AmazonBookRecommendations() {
  const books = [
    {
      title: "Psilocybin Mushrooms of the World",
      author: "Paul Stamets",
      description: "The definitive identification guide from the world's leading mycologist.",
      category: "Identification",
      amazonLink: "#amazon-book-1",
    },
    {
      title: "How to Change Your Mind",
      author: "Michael Pollan",
      description: "A groundbreaking exploration of the new science of psychedelics.",
      category: "Science",
      amazonLink: "#amazon-book-2",
    },
    {
      title: "The Mushroom Cultivator",
      author: "Paul Stamets & J.S. Chilton",
      description: "The practical guide to growing mushrooms at home.",
      category: "Cultivation",
      amazonLink: "#amazon-book-3",
    },
    {
      title: "Mushrooms Demystified",
      author: "David Arora",
      description: "A comprehensive guide to mushroom identification and foraging.",
      category: "Foraging",
      amazonLink: "#amazon-book-4",
    },
    {
      title: "Mycelium Running",
      author: "Paul Stamets",
      description: "How mushrooms can help save the world.",
      category: "Ecology",
      amazonLink: "#amazon-book-5",
    },
    {
      title: "Fly Agaric: A Compendium",
      author: "Kevin Feeney",
      description: "The most comprehensive book on Amanita muscaria history and use.",
      category: "Amanita",
      amazonLink: "#amazon-book-6",
    },
  ];

  return (
    <div className="my-12 p-8 bg-card/50 border border-border rounded-lg">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-primary" />
        <h3 className="font-headline text-xl text-foreground">
          Recommended Reading
        </h3>
      </div>
      <p className="text-muted-foreground mb-6">
        Expand your knowledge with these essential books on mushroom identification, 
        cultivation, foraging, and the science of psychedelics.
      </p>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.map((book, index) => (
          <a
            key={index}
            href={book.amazonLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 bg-background/50 border border-border rounded-lg hover:border-primary/50 transition-colors group"
          >
            <span className="text-xs font-typewriter text-primary uppercase">
              {book.category}
            </span>
            <h4 className="font-headline text-sm text-foreground mt-1 group-hover:text-primary transition-colors">
              {book.title}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              by {book.author}
            </p>
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {book.description}
            </p>
            <span className="inline-flex items-center text-xs text-primary mt-3 font-typewriter">
              VIEW ON AMAZON
              <ExternalLink className="w-3 h-3 ml-1" />
            </span>
          </a>
        ))}
      </div>
      
      <p className="text-xs text-muted-foreground mt-6 text-center italic">
        * As an Amazon Associate, we earn from qualifying purchases at no extra cost to you.
      </p>
    </div>
  );
}

// Combined sidebar affiliate widget
export function AffiliateSidebar() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-card border border-border rounded-lg">
        <h4 className="font-headline text-sm mb-3 text-foreground">Quick Links</h4>
        <div className="space-y-2">
          <a 
            href="#spore-affiliate" 
            className="block text-xs text-muted-foreground hover:text-primary transition-colors font-typewriter"
          >
            → Premium Spore Suppliers
          </a>
          <a 
            href="#growkit-affiliate" 
            className="block text-xs text-muted-foreground hover:text-primary transition-colors font-typewriter"
          >
            → Home Grow Kits
          </a>
          <a 
            href="#amanita-affiliate" 
            className="block text-xs text-muted-foreground hover:text-primary transition-colors font-typewriter"
          >
            → Amanita Products
          </a>
          <a 
            href="#books-affiliate" 
            className="block text-xs text-muted-foreground hover:text-primary transition-colors font-typewriter"
          >
            → Recommended Books
          </a>
        </div>
      </div>
    </div>
  );
}
