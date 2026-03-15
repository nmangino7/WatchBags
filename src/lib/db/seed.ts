import type {
  Brand,
  Model,
  Listing,
  Valuation,
  PriceHistoryPoint,
  InventoryItem,
  WatchlistItem,
} from '@/types';

// ============================================================================
// Brands
// ============================================================================

const brands: Brand[] = [
  // Watches
  { id: 'brand-rolex', name: 'Rolex', category: 'watch', logoUrl: '/logos/rolex.svg', description: 'Swiss luxury watchmaker known for precision and prestige.' },
  { id: 'brand-patek', name: 'Patek Philippe', category: 'watch', logoUrl: '/logos/patek.svg', description: 'One of the oldest and most prestigious Swiss watch manufacturers.' },
  { id: 'brand-ap', name: 'Audemars Piguet', category: 'watch', logoUrl: '/logos/ap.svg', description: 'Swiss high-end watchmaker famous for the Royal Oak.' },
  { id: 'brand-rm', name: 'Richard Mille', category: 'watch', logoUrl: '/logos/rm.svg', description: 'Ultra-luxury watchmaker known for cutting-edge materials and design.' },
  { id: 'brand-omega', name: 'Omega', category: 'watch', logoUrl: '/logos/omega.svg', description: 'Swiss watchmaker and official timekeeper of the Olympic Games.' },
  { id: 'brand-tudor', name: 'Tudor', category: 'watch', logoUrl: '/logos/tudor.svg', description: 'Sister brand of Rolex offering exceptional value in luxury watches.' },
  { id: 'brand-cartier', name: 'Cartier', category: 'watch', logoUrl: '/logos/cartier.svg', description: 'French luxury goods house renowned for fine jewelry and watches.' },
  { id: 'brand-iwc', name: 'IWC', category: 'watch', logoUrl: '/logos/iwc.svg', description: 'International Watch Company, known for pilot and Portuguese watches.' },
  { id: 'brand-breitling', name: 'Breitling', category: 'watch', logoUrl: '/logos/breitling.svg', description: 'Swiss watchmaker specializing in aviation chronographs.' },
  { id: 'brand-seiko', name: 'Seiko', category: 'watch', logoUrl: '/logos/seiko.svg', description: 'Japanese watchmaker known for innovation and value.' },
  { id: 'brand-grandseiko', name: 'Grand Seiko', category: 'watch', logoUrl: '/logos/grandseiko.svg', description: 'The pinnacle of Japanese watchmaking with Spring Drive technology.' },
  { id: 'brand-tag', name: 'TAG Heuer', category: 'watch', logoUrl: '/logos/tag.svg', description: 'Swiss luxury watchmaker with motorsport heritage.' },
  { id: 'brand-longines', name: 'Longines', category: 'watch', logoUrl: '/logos/longines.svg', description: 'Swiss watchmaker with a rich heritage in elegant timepieces.' },

  // Handbags
  { id: 'brand-hermes', name: 'Herm\u00e8s', category: 'handbag', logoUrl: '/logos/hermes.svg', description: 'French luxury house famous for the Birkin and Kelly bags.' },
  { id: 'brand-chanel', name: 'Chanel', category: 'handbag', logoUrl: '/logos/chanel.svg', description: 'Iconic French fashion house known for the Classic Flap.' },
  { id: 'brand-lv', name: 'Louis Vuitton', category: 'handbag', logoUrl: '/logos/lv.svg', description: 'French luxury brand famous for monogram canvas and leather goods.' },
  { id: 'brand-dior', name: 'Dior', category: 'handbag', logoUrl: '/logos/dior.svg', description: 'French haute couture house known for the Lady Dior and Saddle bags.' },
  { id: 'brand-gucci', name: 'Gucci', category: 'handbag', logoUrl: '/logos/gucci.svg', description: 'Italian luxury brand known for GG monogram and eclectic design.' },
  { id: 'brand-prada', name: 'Prada', category: 'handbag', logoUrl: '/logos/prada.svg', description: 'Italian fashion house known for minimalist luxury and nylon bags.' },
  { id: 'brand-bottega', name: 'Bottega Veneta', category: 'handbag', logoUrl: '/logos/bottega.svg', description: 'Italian brand famous for intrecciato leather weaving.' },
  { id: 'brand-ysl', name: 'Saint Laurent', category: 'handbag', logoUrl: '/logos/ysl.svg', description: 'French luxury brand known for edgy, Parisian elegance.' },
  { id: 'brand-balenciaga', name: 'Balenciaga', category: 'handbag', logoUrl: '/logos/balenciaga.svg', description: 'Spanish-French luxury house known for architectural designs.' },
  { id: 'brand-celine', name: 'Celine', category: 'handbag', logoUrl: '/logos/celine.svg', description: 'French luxury brand known for minimalist, understated style.' },
  { id: 'brand-fendi', name: 'Fendi', category: 'handbag', logoUrl: '/logos/fendi.svg', description: 'Italian luxury house famous for the Baguette and Peekaboo.' },
  { id: 'brand-goyard', name: 'Goyard', category: 'handbag', logoUrl: '/logos/goyard.svg', description: 'French trunk maker known for hand-painted chevron canvas.' },
];

// ============================================================================
// Models
// ============================================================================

const models: Model[] = [
  // --- Rolex ---
  { id: 'model-sub', brandId: 'brand-rolex', name: 'Submariner Date', referenceNumber: '126610LN', msrp: 10250, typicalResaleLow: 12000, typicalResaleHigh: 15000, imageUrl: '/images/rolex-sub.jpg' },
  { id: 'model-daytona', brandId: 'brand-rolex', name: 'Cosmograph Daytona', referenceNumber: '116500LN', msrp: 15200, typicalResaleLow: 28000, typicalResaleHigh: 35000, imageUrl: '/images/rolex-daytona.jpg' },
  { id: 'model-gmt', brandId: 'brand-rolex', name: 'GMT-Master II Pepsi', referenceNumber: '126710BLRO', msrp: 11200, typicalResaleLow: 17000, typicalResaleHigh: 21000, imageUrl: '/images/rolex-gmt.jpg' },
  { id: 'model-datejust', brandId: 'brand-rolex', name: 'Datejust 41', referenceNumber: '126334', msrp: 10750, typicalResaleLow: 10500, typicalResaleHigh: 13500, imageUrl: '/images/rolex-dj.jpg' },
  { id: 'model-explorer', brandId: 'brand-rolex', name: 'Explorer I', referenceNumber: '124270', msrp: 7550, typicalResaleLow: 8500, typicalResaleHigh: 10500, imageUrl: '/images/rolex-explorer.jpg' },

  // --- Patek Philippe ---
  { id: 'model-nautilus', brandId: 'brand-patek', name: 'Nautilus 5711/1A', referenceNumber: '5711/1A-010', msrp: 35000, typicalResaleLow: 115000, typicalResaleHigh: 140000, imageUrl: '/images/patek-nautilus.jpg' },
  { id: 'model-aquanaut', brandId: 'brand-patek', name: 'Aquanaut', referenceNumber: '5167A-001', msrp: 22950, typicalResaleLow: 42000, typicalResaleHigh: 52000, imageUrl: '/images/patek-aquanaut.jpg' },
  { id: 'model-calatrava', brandId: 'brand-patek', name: 'Calatrava', referenceNumber: '5196R-001', msrp: 29400, typicalResaleLow: 24000, typicalResaleHigh: 30000, imageUrl: '/images/patek-calatrava.jpg' },
  { id: 'model-annual-cal', brandId: 'brand-patek', name: 'Annual Calendar', referenceNumber: '5205R-010', msrp: 52600, typicalResaleLow: 40000, typicalResaleHigh: 48000, imageUrl: '/images/patek-annual.jpg' },

  // --- Audemars Piguet ---
  { id: 'model-royaloak', brandId: 'brand-ap', name: 'Royal Oak 41mm', referenceNumber: '15500ST.OO.1220ST.01', msrp: 24100, typicalResaleLow: 38000, typicalResaleHigh: 48000, imageUrl: '/images/ap-ro.jpg' },
  { id: 'model-ro-offshore', brandId: 'brand-ap', name: 'Royal Oak Offshore Chrono', referenceNumber: '26470ST.OO.A101CR.01', msrp: 33500, typicalResaleLow: 28000, typicalResaleHigh: 36000, imageUrl: '/images/ap-offshore.jpg' },
  { id: 'model-ro-chrono', brandId: 'brand-ap', name: 'Royal Oak Chronograph', referenceNumber: '26331ST.OO.1220ST.01', msrp: 33800, typicalResaleLow: 42000, typicalResaleHigh: 55000, imageUrl: '/images/ap-chrono.jpg' },

  // --- Richard Mille ---
  { id: 'model-rm011', brandId: 'brand-rm', name: 'RM 011 Flyback Chronograph', referenceNumber: 'RM011', msrp: 195000, typicalResaleLow: 160000, typicalResaleHigh: 210000, imageUrl: '/images/rm-011.jpg' },
  { id: 'model-rm035', brandId: 'brand-rm', name: 'RM 035 Rafael Nadal', referenceNumber: 'RM035', msrp: 135000, typicalResaleLow: 130000, typicalResaleHigh: 170000, imageUrl: '/images/rm-035.jpg' },
  { id: 'model-rm055', brandId: 'brand-rm', name: 'RM 055 Bubba Watson', referenceNumber: 'RM055', msrp: 115000, typicalResaleLow: 100000, typicalResaleHigh: 140000, imageUrl: '/images/rm-055.jpg' },

  // --- Omega ---
  { id: 'model-speedy', brandId: 'brand-omega', name: 'Speedmaster Moonwatch', referenceNumber: '310.30.42.50.01.001', msrp: 6600, typicalResaleLow: 5800, typicalResaleHigh: 7200, imageUrl: '/images/omega-speedy.jpg' },
  { id: 'model-seamaster', brandId: 'brand-omega', name: 'Seamaster Diver 300M', referenceNumber: '210.30.42.20.01.001', msrp: 5700, typicalResaleLow: 4200, typicalResaleHigh: 5200, imageUrl: '/images/omega-seamaster.jpg' },
  { id: 'model-aquaterra', brandId: 'brand-omega', name: 'Seamaster Aqua Terra 150M', referenceNumber: '220.10.41.21.01.001', msrp: 5800, typicalResaleLow: 4000, typicalResaleHigh: 5000, imageUrl: '/images/omega-aquaterra.jpg' },
  { id: 'model-planetocean', brandId: 'brand-omega', name: 'Planet Ocean 600M', referenceNumber: '215.30.44.21.01.001', msrp: 7500, typicalResaleLow: 5200, typicalResaleHigh: 6400, imageUrl: '/images/omega-po.jpg' },

  // --- Tudor ---
  { id: 'model-bb58', brandId: 'brand-tudor', name: 'Black Bay Fifty-Eight', referenceNumber: 'M79030N-0001', msrp: 3975, typicalResaleLow: 3400, typicalResaleHigh: 4200, imageUrl: '/images/tudor-bb58.jpg' },
  { id: 'model-pelagos', brandId: 'brand-tudor', name: 'Pelagos 39', referenceNumber: 'M25407N-0001', msrp: 4575, typicalResaleLow: 4200, typicalResaleHigh: 5000, imageUrl: '/images/tudor-pelagos.jpg' },
  { id: 'model-bb-chrono', brandId: 'brand-tudor', name: 'Black Bay Chrono', referenceNumber: 'M79360N-0002', msrp: 5425, typicalResaleLow: 4300, typicalResaleHigh: 5200, imageUrl: '/images/tudor-bbchrono.jpg' },

  // --- Cartier ---
  { id: 'model-santos', brandId: 'brand-cartier', name: 'Santos de Cartier Medium', referenceNumber: 'WSSA0029', msrp: 7650, typicalResaleLow: 6800, typicalResaleHigh: 8500, imageUrl: '/images/cartier-santos.jpg' },
  { id: 'model-tank', brandId: 'brand-cartier', name: 'Tank Fran\u00e7aise', referenceNumber: 'WSTA0065', msrp: 4050, typicalResaleLow: 3500, typicalResaleHigh: 4800, imageUrl: '/images/cartier-tank.jpg' },
  { id: 'model-ballon', brandId: 'brand-cartier', name: 'Ballon Bleu 40mm', referenceNumber: 'WSBB0060', msrp: 7200, typicalResaleLow: 5500, typicalResaleHigh: 6800, imageUrl: '/images/cartier-ballon.jpg' },

  // --- IWC ---
  { id: 'model-portugieser', brandId: 'brand-iwc', name: 'Portugieser Chronograph', referenceNumber: 'IW371605', msrp: 9200, typicalResaleLow: 6500, typicalResaleHigh: 8200, imageUrl: '/images/iwc-port.jpg' },
  { id: 'model-pilot-xx', brandId: 'brand-iwc', name: 'Pilot Mark XX', referenceNumber: 'IW328201', msrp: 5400, typicalResaleLow: 4200, typicalResaleHigh: 5100, imageUrl: '/images/iwc-markxx.jpg' },
  { id: 'model-bigpilot', brandId: 'brand-iwc', name: 'Big Pilot 43', referenceNumber: 'IW329301', msrp: 9950, typicalResaleLow: 7500, typicalResaleHigh: 9200, imageUrl: '/images/iwc-bigpilot.jpg' },

  // --- Breitling ---
  { id: 'model-navitimer', brandId: 'brand-breitling', name: 'Navitimer B01 Chronograph', referenceNumber: 'AB0138211B1P1', msrp: 9100, typicalResaleLow: 6200, typicalResaleHigh: 7800, imageUrl: '/images/breitling-navi.jpg' },
  { id: 'model-superocean', brandId: 'brand-breitling', name: 'Superocean Automatic 42', referenceNumber: 'A17375E71G1S1', msrp: 4600, typicalResaleLow: 3100, typicalResaleHigh: 4000, imageUrl: '/images/breitling-so.jpg' },
  { id: 'model-chronomat', brandId: 'brand-breitling', name: 'Chronomat B01 42', referenceNumber: 'AB0134101B1A1', msrp: 8900, typicalResaleLow: 5800, typicalResaleHigh: 7400, imageUrl: '/images/breitling-chronomat.jpg' },

  // --- Seiko ---
  { id: 'model-presage', brandId: 'brand-seiko', name: 'Presage Sharp Edged', referenceNumber: 'SPB167', msrp: 1200, typicalResaleLow: 700, typicalResaleHigh: 950, imageUrl: '/images/seiko-presage.jpg' },
  { id: 'model-prospex62', brandId: 'brand-seiko', name: 'Prospex 1965 Diver', referenceNumber: 'SPB143', msrp: 1100, typicalResaleLow: 750, typicalResaleHigh: 950, imageUrl: '/images/seiko-62mas.jpg' },
  { id: 'model-alpinist', brandId: 'brand-seiko', name: 'Prospex Alpinist', referenceNumber: 'SPB121', msrp: 775, typicalResaleLow: 500, typicalResaleHigh: 700, imageUrl: '/images/seiko-alpinist.jpg' },

  // --- Grand Seiko ---
  { id: 'model-snowflake', brandId: 'brand-grandseiko', name: 'Snowflake', referenceNumber: 'SBGA211', msrp: 5800, typicalResaleLow: 4400, typicalResaleHigh: 5400, imageUrl: '/images/gs-snowflake.jpg' },
  { id: 'model-whitebirch', brandId: 'brand-grandseiko', name: 'White Birch', referenceNumber: 'SLGH005', msrp: 9100, typicalResaleLow: 7500, typicalResaleHigh: 9000, imageUrl: '/images/gs-whitebirch.jpg' },
  { id: 'model-gs-elegance', brandId: 'brand-grandseiko', name: 'Elegance Manual Wind', referenceNumber: 'SBGW231', msrp: 4200, typicalResaleLow: 2800, typicalResaleHigh: 3600, imageUrl: '/images/gs-elegance.jpg' },

  // --- TAG Heuer ---
  { id: 'model-carrera', brandId: 'brand-tag', name: 'Carrera Chronograph', referenceNumber: 'CBS2210.BA0637', msrp: 5750, typicalResaleLow: 3800, typicalResaleHigh: 4800, imageUrl: '/images/tag-carrera.jpg' },
  { id: 'model-aquaracer', brandId: 'brand-tag', name: 'Aquaracer Professional 300', referenceNumber: 'WBP201A.BA0632', msrp: 3150, typicalResaleLow: 2200, typicalResaleHigh: 2900, imageUrl: '/images/tag-aquaracer.jpg' },
  { id: 'model-monaco', brandId: 'brand-tag', name: 'Monaco Chronograph', referenceNumber: 'CBL2111.BA0644', msrp: 6750, typicalResaleLow: 4800, typicalResaleHigh: 5900, imageUrl: '/images/tag-monaco.jpg' },

  // --- Longines ---
  { id: 'model-spirit', brandId: 'brand-longines', name: 'Spirit Zulu Time', referenceNumber: 'L3.812.4.53.6', msrp: 2875, typicalResaleLow: 2200, typicalResaleHigh: 2700, imageUrl: '/images/longines-spirit.jpg' },
  { id: 'model-heritage', brandId: 'brand-longines', name: 'Heritage Classic', referenceNumber: 'L2.828.4.73.2', msrp: 2300, typicalResaleLow: 1600, typicalResaleHigh: 2100, imageUrl: '/images/longines-heritage.jpg' },
  { id: 'model-hydro', brandId: 'brand-longines', name: 'HydroConquest 41mm', referenceNumber: 'L3.781.4.56.9', msrp: 1425, typicalResaleLow: 900, typicalResaleHigh: 1250, imageUrl: '/images/longines-hydro.jpg' },

  // --- Herm\u00e8s ---
  { id: 'model-birkin25', brandId: 'brand-hermes', name: 'Birkin 25 Togo', msrp: 10600, typicalResaleLow: 15000, typicalResaleHigh: 25000, imageUrl: '/images/hermes-birkin25.jpg' },
  { id: 'model-birkin30', brandId: 'brand-hermes', name: 'Birkin 30 Togo', msrp: 11400, typicalResaleLow: 14000, typicalResaleHigh: 22000, imageUrl: '/images/hermes-birkin30.jpg' },
  { id: 'model-kelly25', brandId: 'brand-hermes', name: 'Kelly 25 Epsom', msrp: 10300, typicalResaleLow: 16000, typicalResaleHigh: 28000, imageUrl: '/images/hermes-kelly25.jpg' },
  { id: 'model-constance', brandId: 'brand-hermes', name: 'Constance 24 Evercolor', msrp: 10300, typicalResaleLow: 14000, typicalResaleHigh: 20000, imageUrl: '/images/hermes-constance.jpg' },
  { id: 'model-picotin', brandId: 'brand-hermes', name: 'Picotin Lock 18', msrp: 3075, typicalResaleLow: 3000, typicalResaleHigh: 5000, imageUrl: '/images/hermes-picotin.jpg' },

  // --- Chanel ---
  { id: 'model-classic-med', brandId: 'brand-chanel', name: 'Classic Flap Medium Lambskin', msrp: 10800, typicalResaleLow: 7000, typicalResaleHigh: 9500, imageUrl: '/images/chanel-cf-med.jpg' },
  { id: 'model-classic-jumbo', brandId: 'brand-chanel', name: 'Classic Flap Jumbo Caviar', msrp: 11900, typicalResaleLow: 7500, typicalResaleHigh: 10000, imageUrl: '/images/chanel-cf-jumbo.jpg' },
  { id: 'model-boy', brandId: 'brand-chanel', name: 'Boy Bag Medium Caviar', msrp: 8200, typicalResaleLow: 4500, typicalResaleHigh: 6500, imageUrl: '/images/chanel-boy.jpg' },
  { id: 'model-mini-flap', brandId: 'brand-chanel', name: 'Mini Flap Bag Lambskin', msrp: 5300, typicalResaleLow: 4200, typicalResaleHigh: 5500, imageUrl: '/images/chanel-mini.jpg' },
  { id: 'model-reissue', brandId: 'brand-chanel', name: '2.55 Reissue 226', msrp: 9850, typicalResaleLow: 5500, typicalResaleHigh: 7800, imageUrl: '/images/chanel-reissue.jpg' },

  // --- Louis Vuitton ---
  { id: 'model-neverfull', brandId: 'brand-lv', name: 'Neverfull MM Monogram', msrp: 2030, typicalResaleLow: 1200, typicalResaleHigh: 1700, imageUrl: '/images/lv-neverfull.jpg' },
  { id: 'model-speedy25', brandId: 'brand-lv', name: 'Speedy Bandouli\u00e8re 25', msrp: 1960, typicalResaleLow: 1100, typicalResaleHigh: 1600, imageUrl: '/images/lv-speedy25.jpg' },
  { id: 'model-pochette', brandId: 'brand-lv', name: 'Pochette M\u00e9tis Monogram', msrp: 2440, typicalResaleLow: 1500, typicalResaleHigh: 2100, imageUrl: '/images/lv-pochette.jpg' },
  { id: 'model-capucines', brandId: 'brand-lv', name: 'Capucines MM', msrp: 6550, typicalResaleLow: 3500, typicalResaleHigh: 5200, imageUrl: '/images/lv-capucines.jpg' },

  // --- Dior ---
  { id: 'model-ladydior', brandId: 'brand-dior', name: 'Lady Dior Medium Lambskin', msrp: 6500, typicalResaleLow: 4000, typicalResaleHigh: 5500, imageUrl: '/images/dior-lady.jpg' },
  { id: 'model-saddle', brandId: 'brand-dior', name: 'Saddle Bag Oblique Jacquard', msrp: 3800, typicalResaleLow: 2500, typicalResaleHigh: 3300, imageUrl: '/images/dior-saddle.jpg' },
  { id: 'model-booktote', brandId: 'brand-dior', name: 'Book Tote Medium Oblique', msrp: 3500, typicalResaleLow: 2200, typicalResaleHigh: 3000, imageUrl: '/images/dior-booktote.jpg' },
  { id: 'model-bobby', brandId: 'brand-dior', name: 'Bobby Medium', msrp: 3950, typicalResaleLow: 2000, typicalResaleHigh: 3000, imageUrl: '/images/dior-bobby.jpg' },

  // --- Gucci ---
  { id: 'model-dionysus', brandId: 'brand-gucci', name: 'Dionysus Small GG Supreme', msrp: 2980, typicalResaleLow: 1500, typicalResaleHigh: 2200, imageUrl: '/images/gucci-dionysus.jpg' },
  { id: 'model-jackie', brandId: 'brand-gucci', name: 'Jackie 1961 Medium', msrp: 3100, typicalResaleLow: 1800, typicalResaleHigh: 2500, imageUrl: '/images/gucci-jackie.jpg' },
  { id: 'model-marmont', brandId: 'brand-gucci', name: 'GG Marmont Small Matelass\u00e9', msrp: 2450, typicalResaleLow: 1200, typicalResaleHigh: 1800, imageUrl: '/images/gucci-marmont.jpg' },

  // --- Prada ---
  { id: 'model-reedition', brandId: 'brand-prada', name: 'Re-Edition 2005 Nylon', msrp: 1550, typicalResaleLow: 1000, typicalResaleHigh: 1400, imageUrl: '/images/prada-reedition.jpg' },
  { id: 'model-galleria', brandId: 'brand-prada', name: 'Galleria Saffiano Medium', msrp: 3600, typicalResaleLow: 1800, typicalResaleHigh: 2600, imageUrl: '/images/prada-galleria.jpg' },
  { id: 'model-cleo', brandId: 'brand-prada', name: 'Cleo Brushed Leather Shoulder', msrp: 2200, typicalResaleLow: 1300, typicalResaleHigh: 1800, imageUrl: '/images/prada-cleo.jpg' },

  // --- Bottega Veneta ---
  { id: 'model-cassette', brandId: 'brand-bottega', name: 'Padded Cassette Crossbody', msrp: 3400, typicalResaleLow: 1800, typicalResaleHigh: 2600, imageUrl: '/images/bv-cassette.jpg' },
  { id: 'model-jodie', brandId: 'brand-bottega', name: 'Jodie Mini Intrecciato', msrp: 2900, typicalResaleLow: 1600, typicalResaleHigh: 2300, imageUrl: '/images/bv-jodie.jpg' },
  { id: 'model-pouch', brandId: 'brand-bottega', name: 'The Pouch Clutch', msrp: 3200, typicalResaleLow: 1400, typicalResaleHigh: 2200, imageUrl: '/images/bv-pouch.jpg' },

  // --- Saint Laurent ---
  { id: 'model-loulou', brandId: 'brand-ysl', name: 'Loulou Medium Matelass\u00e9', msrp: 2990, typicalResaleLow: 1600, typicalResaleHigh: 2300, imageUrl: '/images/ysl-loulou.jpg' },
  { id: 'model-sacdejour', brandId: 'brand-ysl', name: 'Sac de Jour Small', msrp: 3250, typicalResaleLow: 1500, typicalResaleHigh: 2200, imageUrl: '/images/ysl-sdj.jpg' },
  { id: 'model-kate', brandId: 'brand-ysl', name: 'Kate Medium Chain Bag', msrp: 2390, typicalResaleLow: 1200, typicalResaleHigh: 1800, imageUrl: '/images/ysl-kate.jpg' },

  // --- Balenciaga ---
  { id: 'model-city', brandId: 'brand-balenciaga', name: 'City Bag Medium', msrp: 2190, typicalResaleLow: 800, typicalResaleHigh: 1400, imageUrl: '/images/bal-city.jpg' },
  { id: 'model-hourglass', brandId: 'brand-balenciaga', name: 'Hourglass Small', msrp: 2490, typicalResaleLow: 1100, typicalResaleHigh: 1700, imageUrl: '/images/bal-hourglass.jpg' },
  { id: 'model-cagole', brandId: 'brand-balenciaga', name: 'Le Cagole XS', msrp: 2350, typicalResaleLow: 1000, typicalResaleHigh: 1600, imageUrl: '/images/bal-cagole.jpg' },

  // --- Celine ---
  { id: 'model-luggage', brandId: 'brand-celine', name: 'Luggage Nano', msrp: 3100, typicalResaleLow: 1800, typicalResaleHigh: 2500, imageUrl: '/images/celine-luggage.jpg' },
  { id: 'model-belt', brandId: 'brand-celine', name: 'Belt Bag Micro', msrp: 2900, typicalResaleLow: 1500, typicalResaleHigh: 2200, imageUrl: '/images/celine-belt.jpg' },
  { id: 'model-triomphe', brandId: 'brand-celine', name: 'Triomphe Bag Teen', msrp: 3750, typicalResaleLow: 2200, typicalResaleHigh: 3100, imageUrl: '/images/celine-triomphe.jpg' },

  // --- Fendi ---
  { id: 'model-baguette', brandId: 'brand-fendi', name: 'Baguette Medium FF Jacquard', msrp: 3100, typicalResaleLow: 1500, typicalResaleHigh: 2300, imageUrl: '/images/fendi-baguette.jpg' },
  { id: 'model-peekaboo', brandId: 'brand-fendi', name: 'Peekaboo ISeeU Medium', msrp: 5200, typicalResaleLow: 2800, typicalResaleHigh: 4000, imageUrl: '/images/fendi-peekaboo.jpg' },
  { id: 'model-first', brandId: 'brand-fendi', name: 'Fendi First Small', msrp: 2890, typicalResaleLow: 1400, typicalResaleHigh: 2100, imageUrl: '/images/fendi-first.jpg' },

  // --- Goyard ---
  { id: 'model-saintlouis', brandId: 'brand-goyard', name: 'Saint Louis PM', msrp: 1620, typicalResaleLow: 1500, typicalResaleHigh: 2200, imageUrl: '/images/goyard-saintlouis.jpg' },
  { id: 'model-artois', brandId: 'brand-goyard', name: 'Artois MM', msrp: 2440, typicalResaleLow: 2000, typicalResaleHigh: 2800, imageUrl: '/images/goyard-artois.jpg' },
  { id: 'model-capvert', brandId: 'brand-goyard', name: 'Cap Vert PM', msrp: 2285, typicalResaleLow: 1800, typicalResaleHigh: 2500, imageUrl: '/images/goyard-capvert.jpg' },
];

// ============================================================================
// Listings
// ============================================================================

// Listings — starts empty, populated by scrapers and manual entry
const listings: Listing[] = [];

// ============================================================================
// Valuations
// ============================================================================

// Valuations — starts empty, populated by AI analysis of scraped/added listings
const valuations: Valuation[] = [];

// Price history — starts empty, populated by scrapers
const priceHistory: PriceHistoryPoint[] = [];

// Inventory — starts empty, user adds items
const inventory: InventoryItem[] = [];

// Watchlist — starts empty, user saves items
const watchlist: WatchlistItem[] = [];

// ============================================================================
// Export
// ============================================================================

export interface SeedDataResult {
  brands: Brand[];
  models: Model[];
  listings: Listing[];
  valuations: Valuation[];
  priceHistory: PriceHistoryPoint[];
  inventory: InventoryItem[];
  inventoryItems: InventoryItem[];
  watchlist: WatchlistItem[];
  watchlistItems: WatchlistItem[];
}

export function getSeedData(): SeedDataResult {
  return {
    brands,
    models,
    listings,
    valuations,
    priceHistory,
    inventory,
    inventoryItems: inventory,
    watchlist,
    watchlistItems: watchlist,
  };
}

// Named exports for direct access
export { brands as BRANDS };
export { models as MODELS };
export { listings as SAMPLE_LISTINGS };
export { valuations as SAMPLE_VALUATIONS };
export { priceHistory as SAMPLE_PRICE_HISTORY };

// ============================================================================
// Mutable helpers — add user-submitted listings at runtime
// ============================================================================

export function addListing(listing: Listing): void {
  listings.push(listing);
}

export function addValuation(valuation: Valuation): void {
  valuations.push(valuation);
}

export function addModel(model: Model): void {
  models.push(model);
}
