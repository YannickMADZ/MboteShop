/* Données de départ insérées dans MongoDB (produits + articles du blog)
   Photos : Unsplash (https://unsplash.com/license), libres d'utilisation, y compris commerciale.
   Elles sont chargées directement depuis le CDN d'Unsplash : on choisit la taille et le cadrage dans l'URL. */

// Construit l'URL d'une photo Unsplash recadrée (carré 800×800 par défaut)
function photo(id, { largeur = 800, hauteur = 800, cadrage = "entropy" } = {}) {
  const crop = cadrage ? `&crop=${cadrage}` : "";
  return `https://images.unsplash.com/photo-${id}?w=${largeur}&h=${hauteur}&fit=crop${crop}&auto=format&q=80`;
}
const banniere = (id) => photo(id, { largeur: 1200, hauteur: 675 });

const produits = [
  { nom: "Sneakers Nike Air", prix: 35000, categorie: "Chaussures", image: photo("1542291026-7eec264c27ff"), vedette: true,
    description: "Des sneakers légères et confortables, parfaites pour la ville. Semelle amortissante et tige respirante." },
  { nom: "T-shirt Coton Bio", prix: 15000, categorie: "Vêtements", image: photo("1521572163474-6864f9cf17ab", { cadrage: null }),
    description: "T-shirt 100 % coton biologique, coupe droite, doux et résistant aux lavages." },
  { nom: "Sweat à capuche Urban", prix: 25000, categorie: "Vêtements", image: photo("1620799140188-3b2a02fd9a77", { cadrage: null }), vedette: true,
    description: "Sweat molletonné avec capuche et poche kangourou. Idéal pour les soirées fraîches." },
  { nom: "Jean Slim Brut", prix: 22000, categorie: "Vêtements", image: photo("1542272604-787c3835535d"),
    description: "Jean coupe slim en denim brut légèrement stretch pour plus de confort." },
  { nom: "Baskets Running Pro", prix: 42000, categorie: "Chaussures", image: photo("1562183241-b937e95585b6"),
    description: "Chaussures de course avec semelle réactive et maintien du pied renforcé." },
  { nom: "Mocassins Cuir", prix: 30000, categorie: "Chaussures", image: photo("1616406432452-07bc5938759d"),
    description: "Mocassins en cuir véritable, cousus main, pour une allure élégante au quotidien." },
  { nom: "Casquette Classic", prix: 8000, categorie: "Accessoires", image: photo("1588850561407-ed78c282e89b"),
    description: "Casquette ajustable en coton avec visière incurvée." },
  { nom: "Montre Minimaliste", prix: 45000, categorie: "Accessoires", image: photo("1523275335684-37898b6baf30"), vedette: true,
    description: "Montre au design épuré, cadran 40 mm et bracelet interchangeable." },
  { nom: "Sac à dos Voyage", prix: 28000, categorie: "Accessoires", image: photo("1553062407-98eeb64c6a62"),
    description: "Sac à dos 25 L déperlant avec compartiment ordinateur rembourré." },
  { nom: "Lunettes de soleil", prix: 12000, categorie: "Accessoires", image: photo("1572635196237-14b3f281503f"),
    description: "Verres polarisés protection UV400, monture légère et résistante." },
  { nom: "Casque Bluetooth", prix: 55000, categorie: "Électronique", image: photo("1505740420928-5e560c06d30e"), vedette: true,
    description: "Casque sans fil à réduction de bruit, 30 h d'autonomie et charge rapide." },
  { nom: "Smartphone X12 128 Go", prix: 150000, categorie: "Électronique", image: photo("1511707171634-5f897ff02aa9"),
    description: "Écran 6,5 pouces, triple capteur photo, 128 Go de stockage et batterie 5000 mAh." },
  { nom: "Enceinte portable", prix: 30000, categorie: "Électronique", image: photo("1608043152269-423dbba4e7e1"),
    description: "Enceinte Bluetooth étanche avec un son puissant et 12 h d'autonomie." },
  { nom: "Ordinateur portable 14\"", prix: 350000, categorie: "Électronique", image: photo("1496181133206-80ce9b88a853"),
    description: "Ordinateur ultra-fin, 16 Go de RAM, SSD 512 Go, parfait pour les études et le travail." }
];

const articles = [
  {
    titre: "Bien choisir ses sneakers pour la ville",
    resume: "Confort, maintien, entretien : nos conseils pour trouver la paire qui vous accompagnera toute la journée.",
    image: banniere("1460353581641-37baddab0fa2"),
    contenu: "Une bonne paire de sneakers se choisit d'abord pour le confort. Essayez-la en fin de journée, quand le pied est légèrement gonflé, et vérifiez qu'il reste un petit centimètre devant les orteils.\n\nRegardez ensuite la semelle : une semelle amortissante est idéale si vous marchez beaucoup. Pour un usage quotidien en ville, une tige respirante évite la transpiration lors des journées chaudes.\n\nEnfin, pensez à l'entretien : une brosse douce et un chiffon humide suffisent la plupart du temps. Évitez la machine à laver, qui abîme les colles et déforme la chaussure."
  },
  {
    titre: "5 accessoires pour compléter votre style",
    resume: "Montre, lunettes, casquette… ces petits détails qui font toute la différence dans une tenue.",
    image: banniere("1523275335684-37898b6baf30"),
    contenu: "Un accessoire bien choisi suffit à transformer une tenue simple. La montre minimaliste reste un indispensable : elle se porte aussi bien avec un jean qu'avec une tenue de bureau.\n\nLes lunettes de soleil protègent vos yeux tout en ajoutant une touche de caractère. Choisissez des verres polarisés avec une protection UV400.\n\nCasquette, sac à dos et bracelet complètent le look. La règle d'or : pas plus de deux ou trois accessoires visibles à la fois pour garder un style équilibré."
  },
  {
    titre: "Casque Bluetooth : comment bien l'utiliser",
    resume: "Autonomie, réduction de bruit, charge : tirez le meilleur de votre casque sans fil.",
    image: banniere("1505740420928-5e560c06d30e"),
    contenu: "Pour préserver la batterie de votre casque, évitez de le laisser se décharger complètement. Une recharge régulière, même partielle, prolonge sa durée de vie.\n\nLa réduction de bruit active est très utile dans les transports, mais elle consomme davantage d'énergie : désactivez-la quand vous êtes au calme.\n\nPensez aussi à votre audition : écoutez à un volume modéré et faites des pauses régulières, surtout lors des longues sessions."
  }
];

module.exports = { produits, articles };
