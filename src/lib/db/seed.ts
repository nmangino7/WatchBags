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

const listings: Listing[] = [
  // --- Great Deals (underpriced) ---
  { id: 'lst-001', modelId: 'model-sub', source: 'eBay', sourceUrl: 'https://ebay.com/itm/001', askingPrice: 11200, condition: 'excellent', seller: 'luxurywatch_dealer', foundAt: new Date('2026-03-10'), stillActive: true },
  { id: 'lst-002', modelId: 'model-daytona', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/002', askingPrice: 24500, condition: 'mint', seller: 'WatchCollectors_Munich', foundAt: new Date('2026-03-11'), stillActive: true },
  { id: 'lst-003', modelId: 'model-gmt', source: 'eBay', sourceUrl: 'https://ebay.com/itm/003', askingPrice: 15800, condition: 'good', seller: 'gmt_collectors', foundAt: new Date('2026-03-09'), stillActive: true },
  { id: 'lst-004', modelId: 'model-nautilus', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/004', askingPrice: 105000, condition: 'excellent', seller: 'PP_Boutique', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-005', modelId: 'model-royaloak', source: 'eBay', sourceUrl: 'https://ebay.com/itm/005', askingPrice: 33000, condition: 'excellent', seller: 'luxury_time_pieces', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-006', modelId: 'model-birkin25', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/006', askingPrice: 13500, condition: 'good', seller: 'ParisLuxeResale', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-007', modelId: 'model-kelly25', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/007', askingPrice: 14500, condition: 'excellent', seller: 'LuxeConsign_NYC', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-008', modelId: 'model-classic-med', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/008', askingPrice: 6200, condition: 'excellent', seller: 'DesignerCloset_LA', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-009', modelId: 'model-saintlouis', source: 'eBay', sourceUrl: 'https://ebay.com/itm/009', askingPrice: 1200, condition: 'good', seller: 'baglover_2023', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-010', modelId: 'model-aquanaut', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/010', askingPrice: 39500, condition: 'excellent', seller: 'EliteWatches_Geneva', foundAt: new Date('2026-03-11'), stillActive: true },
  { id: 'lst-011', modelId: 'model-constance', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/011', askingPrice: 12800, condition: 'mint', seller: 'HermesAficionado', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-012', modelId: 'model-explorer', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/012', askingPrice: 7800, condition: 'mint', seller: 'ExplorerFanatic', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-013', modelId: 'model-rm055', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/013', askingPrice: 92000, condition: 'excellent', seller: 'UltraLuxWatches', foundAt: new Date('2026-03-14'), stillActive: true },

  // --- Fairly Priced ---
  { id: 'lst-014', modelId: 'model-speedy', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/014', askingPrice: 6200, condition: 'mint', seller: 'ChronoDeals_Berlin', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-015', modelId: 'model-bb58', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/015', askingPrice: 3700, condition: 'excellent', seller: 'WatchHunter_UK', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-016', modelId: 'model-neverfull', source: 'eBay', sourceUrl: 'https://ebay.com/itm/016', askingPrice: 1400, condition: 'good', seller: 'luxreseller_miami', foundAt: new Date('2026-03-12'), stillActive: true },
  { id: 'lst-017', modelId: 'model-santos', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/017', askingPrice: 7200, condition: 'mint', seller: 'SantosCollector', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-018', modelId: 'model-ladydior', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/018', askingPrice: 4500, condition: 'excellent', seller: 'ParisianChic', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-019', modelId: 'model-portugieser', source: 'eBay', sourceUrl: 'https://ebay.com/itm/019', askingPrice: 7000, condition: 'excellent', seller: 'finewatches_nyc', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-020', modelId: 'model-luggage', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/020', askingPrice: 2000, condition: 'good', seller: 'LuxeFindsEU', foundAt: new Date('2026-03-12'), stillActive: true },
  { id: 'lst-021', modelId: 'model-snowflake', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/021', askingPrice: 4600, condition: 'mint', seller: 'JapanWatchDirect', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-022', modelId: 'model-dionysus', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/022', askingPrice: 1700, condition: 'excellent', seller: 'ItBagsOnly', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-023', modelId: 'model-seamaster', source: 'eBay', sourceUrl: 'https://ebay.com/itm/023', askingPrice: 3800, condition: 'excellent', seller: 'diver_watches_inc', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-024', modelId: 'model-cassette', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/024', askingPrice: 1650, condition: 'excellent', seller: 'MinimalistLuxe', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-025', modelId: 'model-navitimer', source: 'Chrono24', sourceUrl: 'https://chrono24.com/listing/025', askingPrice: 5900, condition: 'good', seller: 'PilotWatchCo', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-026', modelId: 'model-baguette', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/026', askingPrice: 1350, condition: 'good', seller: 'VintageItBags', foundAt: new Date('2026-03-12'), stillActive: true },
  { id: 'lst-027', modelId: 'model-loulou', source: 'eBay', sourceUrl: 'https://ebay.com/itm/027', askingPrice: 1450, condition: 'excellent', seller: 'designer_deals_direct', foundAt: new Date('2026-03-13'), stillActive: true },
  { id: 'lst-028', modelId: 'model-reedition', source: 'Vestiaire Collective', sourceUrl: 'https://vestiairecollective.com/listing/028', askingPrice: 850, condition: 'good', seller: 'ItGirlVintage', foundAt: new Date('2026-03-13'), stillActive: true },

  // --- Slightly Overpriced ---
  { id: 'lst-029', modelId: 'model-sub', source: 'eBay', sourceUrl: 'https://ebay.com/itm/029', askingPrice: 14800, condition: 'excellent', seller: 'premiumwatch_dealer', foundAt: new Date('2026-03-14'), stillActive: true },
  { id: 'lst-030', modelId: 'model-boy', source: 'eBay', sourceUrl: 'https://ebay.com/itm/030', askingPrice: 6200, condition: 'good', seller: 'chanel_collector_99', foundAt: new Date('2026-03-12'), stillActive: true },

  // --- Inactive ---
  { id: 'lst-031', modelId: 'model-daytona', source: 'StockX', sourceUrl: 'https://stockx.com/listing/031', askingPrice: 30000, condition: 'mint', seller: 'StockX Verified', foundAt: new Date('2026-03-10'), stillActive: false },
];

// ============================================================================
// Valuations
// ============================================================================

const valuations: Valuation[] = [
  { id: 'val-001', listingId: 'lst-001', fairMarketValue: 13500, confidence: 'high', reasoning: 'Submariner Date trades consistently in the $12K-$15K range. Asking price of $11,200 is well below market for excellent condition. Full box and papers reported.', redFlags: [], marketOutlook: 'Stable. The Submariner is the most liquid Rolex model on the secondary market.', estimatedProfit: 2300, estimatedFees: 1755, netProfit: 545, roiPercentage: 4.9, createdAt: new Date('2026-03-10') },
  { id: 'val-002', listingId: 'lst-002', fairMarketValue: 31000, confidence: 'high', reasoning: 'Rolex Daytona 116500LN in mint condition consistently trades between $28K-$35K. This listing at $24,500 is well below the typical range and represents a strong buying opportunity.', redFlags: [], marketOutlook: 'Stable to appreciating. Daytona prices have settled from 2022 peaks but remain strong.', estimatedProfit: 6500, estimatedFees: 2015, netProfit: 4485, roiPercentage: 18.3, createdAt: new Date('2026-03-11') },
  { id: 'val-003', listingId: 'lst-003', fairMarketValue: 18500, confidence: 'high', reasoning: 'GMT-Master II Pepsi in good condition trades at $17K-$21K. At $15,800 this is a compelling price, though condition may need professional polishing before resale.', redFlags: ['Condition is good \u2014 may need professional polishing before resale'], marketOutlook: 'Stable with upward bias. GMT-Master remains one of the most liquid Rolex references.', estimatedProfit: 2700, estimatedFees: 2405, netProfit: 295, roiPercentage: 1.9, createdAt: new Date('2026-03-09') },
  { id: 'val-004', listingId: 'lst-004', fairMarketValue: 125000, confidence: 'high', reasoning: 'Patek Philippe Nautilus 5711/1A in excellent condition is the most coveted luxury sports watch. Market range is $115K-$140K. At $105K, this is a strong buy.', redFlags: ['High-value transaction \u2014 verify provenance', 'Request full service history'], marketOutlook: 'Appreciating. The 5711/1A-010 was discontinued in 2021 and collector demand remains intense.', estimatedProfit: 20000, estimatedFees: 8125, netProfit: 11875, roiPercentage: 11.3, createdAt: new Date('2026-03-14') },
  { id: 'val-005', listingId: 'lst-005', fairMarketValue: 42000, confidence: 'high', reasoning: 'AP Royal Oak 15500ST in excellent condition is highly sought after. Current market range is $38K-$48K. At $33,000, this is significantly below fair market value.', redFlags: ['Verify authenticity \u2014 high-value eBay purchase requires caution'], marketOutlook: 'Stable. Royal Oak demand remains very strong, especially as 15500 was discontinued.', estimatedProfit: 9000, estimatedFees: 5460, netProfit: 3540, roiPercentage: 10.7, createdAt: new Date('2026-03-14') },
  { id: 'val-006', listingId: 'lst-006', fairMarketValue: 18000, confidence: 'medium', reasoning: 'Birkin 25 in Togo leather in good condition typically sells for $15K-$25K. At $13,500, this is a solid deal. However, condition grading on bags can vary widely.', redFlags: ['Condition listed as good \u2014 request detailed photos', 'Verify authenticity certificate is included'], marketOutlook: 'Strong upward trend. Birkin bags continue to appreciate and are considered alternative investments.', estimatedProfit: 4500, estimatedFees: 2160, netProfit: 2340, roiPercentage: 17.3, createdAt: new Date('2026-03-13') },
  { id: 'val-007', listingId: 'lst-007', fairMarketValue: 22000, confidence: 'high', reasoning: 'Kelly 25 in Epsom leather with excellent condition commands $16K-$28K. At $14,500, this is below the low end and represents strong value.', redFlags: [], marketOutlook: 'Strong appreciation expected. Kelly bags, especially in smaller sizes, have seen significant demand growth.', estimatedProfit: 7500, estimatedFees: 2640, netProfit: 4860, roiPercentage: 33.5, createdAt: new Date('2026-03-14') },
  { id: 'val-008', listingId: 'lst-008', fairMarketValue: 8200, confidence: 'high', reasoning: 'Chanel Classic Flap Medium in lambskin with excellent condition sells for $7K-$9.5K. At $6,200, this is noticeably below market.', redFlags: [], marketOutlook: 'Stable on secondary. Annual retail price increases create a floor for resale values.', estimatedProfit: 2000, estimatedFees: 984, netProfit: 1016, roiPercentage: 16.4, createdAt: new Date('2026-03-14') },
  { id: 'val-009', listingId: 'lst-009', fairMarketValue: 1700, confidence: 'medium', reasoning: 'Goyard Saint Louis PM in good condition typically trades at $1,500-$2,200. At $1,200, this is well-priced.', redFlags: ['Verify Goyard serial and markings \u2014 counterfeits are common', 'Check stitching pattern is genuine hand-painted chevron'], marketOutlook: 'Stable. Goyard maintains value through scarcity and no e-commerce presence.', estimatedProfit: 500, estimatedFees: 221, netProfit: 279, roiPercentage: 23.3, createdAt: new Date('2026-03-14') },
  { id: 'val-010', listingId: 'lst-010', fairMarketValue: 46000, confidence: 'high', reasoning: 'Patek Philippe Aquanaut 5167A in excellent condition trades at $42K-$52K. At $39,500, this is below market and a strong buying opportunity.', redFlags: [], marketOutlook: 'Stable. The Aquanaut is Patek\'s entry-level sports watch with consistent demand.', estimatedProfit: 6500, estimatedFees: 2990, netProfit: 3510, roiPercentage: 8.9, createdAt: new Date('2026-03-11') },
  { id: 'val-011', listingId: 'lst-011', fairMarketValue: 17000, confidence: 'high', reasoning: 'Constance 24 in mint condition trades at $14K-$20K. At $12,800, this is below market and an excellent opportunity.', redFlags: [], marketOutlook: 'Appreciating. Constance bags have seen increasing demand and rising prices.', estimatedProfit: 4200, estimatedFees: 2040, netProfit: 2160, roiPercentage: 16.9, createdAt: new Date('2026-03-14') },
  { id: 'val-012', listingId: 'lst-012', fairMarketValue: 9500, confidence: 'high', reasoning: 'Rolex Explorer I 124270 in mint condition trades at $8,500-$10,500. At $7,800, this is below market.', redFlags: [], marketOutlook: 'Stable to slightly appreciating. The Explorer is increasingly popular among collectors.', estimatedProfit: 1700, estimatedFees: 618, netProfit: 1083, roiPercentage: 13.9, createdAt: new Date('2026-03-14') },
  { id: 'val-013', listingId: 'lst-013', fairMarketValue: 120000, confidence: 'medium', reasoning: 'Richard Mille RM 055 in excellent condition trades at $100K-$140K. At $92,000, this is below typical range and could yield significant profit. However, RM pieces are illiquid.', redFlags: ['High capital outlay with longer time to sell', 'Authentication is critical at this price point'], marketOutlook: 'Stable to slightly depreciating. RM market has cooled from 2021-2022 highs.', estimatedProfit: 28000, estimatedFees: 7800, netProfit: 20200, roiPercentage: 22.0, createdAt: new Date('2026-03-14') },
  { id: 'val-014', listingId: 'lst-014', fairMarketValue: 6500, confidence: 'high', reasoning: 'Omega Speedmaster Moonwatch in mint condition trades at $5,800-$7,200. At $6,200, this is fairly priced within the range.', redFlags: [], marketOutlook: 'Stable. The Moonwatch is an icon with consistent demand.', estimatedProfit: 300, estimatedFees: 423, netProfit: -123, roiPercentage: -2.0, createdAt: new Date('2026-03-14') },
  { id: 'val-015', listingId: 'lst-015', fairMarketValue: 3800, confidence: 'high', reasoning: 'Tudor Black Bay Fifty-Eight in excellent condition trades at $3,400-$4,200. At $3,700, this is mid-range and fairly priced.', redFlags: [], marketOutlook: 'Stable. Tudor offers strong value and the BB58 is their most popular model.', estimatedProfit: 100, estimatedFees: 247, netProfit: -147, roiPercentage: -4.0, createdAt: new Date('2026-03-13') },
  { id: 'val-016', listingId: 'lst-016', fairMarketValue: 1450, confidence: 'medium', reasoning: 'Louis Vuitton Neverfull MM in good condition typically sells for $1,200-$1,700. At $1,400, this is within the expected range.', redFlags: ['Extremely counterfeited model \u2014 authentication is essential'], marketOutlook: 'Stable. The Neverfull is one of the most liquid luxury handbags in the resale market.', estimatedProfit: 50, estimatedFees: 189, netProfit: -139, roiPercentage: -9.9, createdAt: new Date('2026-03-12') },
  { id: 'val-017', listingId: 'lst-017', fairMarketValue: 7600, confidence: 'high', reasoning: 'Cartier Santos Medium in mint condition trades at $6,800-$8,500. At $7,200, this is well-positioned. The Santos has seen a resurgence in popularity.', redFlags: [], marketOutlook: 'Slightly appreciating. The Santos has become one of Cartier\'s most sought-after models.', estimatedProfit: 400, estimatedFees: 494, netProfit: -94, roiPercentage: -1.3, createdAt: new Date('2026-03-14') },
  { id: 'val-018', listingId: 'lst-018', fairMarketValue: 4800, confidence: 'medium', reasoning: 'Lady Dior Medium lambskin in excellent condition typically sells for $4,000-$5,500. At $4,500, this is fairly priced.', redFlags: ['Lambskin is delicate \u2014 verify no deep scratches or discoloration'], marketOutlook: 'Stable. Lady Dior remains a classic that holds value well.', estimatedProfit: 300, estimatedFees: 576, netProfit: -276, roiPercentage: -6.1, createdAt: new Date('2026-03-13') },
  { id: 'val-019', listingId: 'lst-019', fairMarketValue: 7200, confidence: 'medium', reasoning: 'IWC Portugieser Chronograph in excellent condition trades at $6,500-$8,200. At $7,000, this is well-priced within the range.', redFlags: [], marketOutlook: 'Stable. IWC Portugieser maintains steady demand but does not typically appreciate.', estimatedProfit: 200, estimatedFees: 936, netProfit: -736, roiPercentage: -10.5, createdAt: new Date('2026-03-14') },
  { id: 'val-020', listingId: 'lst-020', fairMarketValue: 2100, confidence: 'medium', reasoning: 'Celine Luggage Nano in good condition trades at $1,800-$2,500. At $2,000, this is mid-range.', redFlags: ['Check for color transfer on light-colored leather'], marketOutlook: 'Slightly appreciating. The Luggage Nano is considered a modern classic.', estimatedProfit: 100, estimatedFees: 252, netProfit: -152, roiPercentage: -7.6, createdAt: new Date('2026-03-12') },
  { id: 'val-021', listingId: 'lst-021', fairMarketValue: 4900, confidence: 'high', reasoning: 'Grand Seiko Snowflake SBGA211 in mint condition trades at $4,400-$5,400. At $4,600, this is a fair price.', redFlags: [], marketOutlook: 'Stable to slightly appreciating. Growing global recognition of Grand Seiko supports values.', estimatedProfit: 300, estimatedFees: 319, netProfit: -19, roiPercentage: -0.4, createdAt: new Date('2026-03-14') },
  { id: 'val-022', listingId: 'lst-022', fairMarketValue: 1800, confidence: 'medium', reasoning: 'Gucci Dionysus Small GG Supreme in excellent condition trades at $1,500-$2,200. At $1,700, this is within range.', redFlags: ['Check GG canvas alignment on front flap'], marketOutlook: 'Depreciating. Gucci bags generally lose value, though iconic styles decline slower.', estimatedProfit: 100, estimatedFees: 216, netProfit: -116, roiPercentage: -6.8, createdAt: new Date('2026-03-13') },
  { id: 'val-023', listingId: 'lst-023', fairMarketValue: 4600, confidence: 'high', reasoning: 'Omega Seamaster 300M in excellent condition trades at $4,200-$5,200. At $3,800, this is below market.', redFlags: [], marketOutlook: 'Stable. The Seamaster 300M is one of the most liquid Omega models.', estimatedProfit: 800, estimatedFees: 598, netProfit: 202, roiPercentage: 5.3, createdAt: new Date('2026-03-13') },
  { id: 'val-024', listingId: 'lst-024', fairMarketValue: 2200, confidence: 'medium', reasoning: 'Bottega Veneta Padded Cassette in excellent condition trades at $1,800-$2,600. At $1,650, this is below market.', redFlags: ['Verify intrecciato weave is intact with no loose threads'], marketOutlook: 'Uncertain. BV under Matthieu Blazy has boosted the brand but older designs may soften.', estimatedProfit: 550, estimatedFees: 264, netProfit: 286, roiPercentage: 17.3, createdAt: new Date('2026-03-13') },
  { id: 'val-025', listingId: 'lst-025', fairMarketValue: 6800, confidence: 'high', reasoning: 'Breitling Navitimer B01 in good condition trades at $6,200-$7,800. At $5,900, this is slightly below market.', redFlags: [], marketOutlook: 'Stable. The Navitimer has a dedicated following and steady secondary market.', estimatedProfit: 900, estimatedFees: 442, netProfit: 458, roiPercentage: 7.8, createdAt: new Date('2026-03-14') },
  { id: 'val-026', listingId: 'lst-026', fairMarketValue: 1800, confidence: 'medium', reasoning: 'Fendi Baguette Medium FF Jacquard in good condition trades at $1,500-$2,300. At $1,350, this is below market.', redFlags: ['Verify FF logo alignment and hardware condition'], marketOutlook: 'Stable. The Baguette is an iconic design with enduring appeal.', estimatedProfit: 450, estimatedFees: 216, netProfit: 234, roiPercentage: 17.3, createdAt: new Date('2026-03-12') },
  { id: 'val-027', listingId: 'lst-027', fairMarketValue: 1900, confidence: 'medium', reasoning: 'YSL Loulou Medium in excellent condition trades at $1,600-$2,300. At $1,450, this is below market.', redFlags: ['Check chain strap for tarnishing or wear'], marketOutlook: 'Stable. YSL bags depreciate from retail but popular models maintain reasonable resale.', estimatedProfit: 450, estimatedFees: 247, netProfit: 203, roiPercentage: 14.0, createdAt: new Date('2026-03-13') },
  { id: 'val-028', listingId: 'lst-028', fairMarketValue: 1150, confidence: 'medium', reasoning: 'Prada Re-Edition 2005 Nylon in good condition trades at $1,000-$1,400. At $850, this is below market. Thin margin but good entry-level opportunity.', redFlags: ['Verify triangle logo plate is authentic \u2014 highly counterfeited'], marketOutlook: 'Slightly depreciating. The Re-Edition hype has cooled but remains popular.', estimatedProfit: 300, estimatedFees: 138, netProfit: 162, roiPercentage: 19.1, createdAt: new Date('2026-03-13') },
  { id: 'val-029', listingId: 'lst-029', fairMarketValue: 13500, confidence: 'high', reasoning: 'Rolex Submariner Date 126610LN in excellent condition trades at $12K-$15K. At $14,800, this is near the top of the range and overpriced for a quick flip.', redFlags: ['Price is at the high end \u2014 limited profit margin'], marketOutlook: 'Stable. The Submariner is liquid but this price offers no upside.', estimatedProfit: -1300, estimatedFees: 1755, netProfit: -3055, roiPercentage: -20.6, createdAt: new Date('2026-03-14') },
  { id: 'val-030', listingId: 'lst-030', fairMarketValue: 5200, confidence: 'medium', reasoning: 'Chanel Boy Medium in caviar and good condition trades at $4,500-$6,500. At $6,200, this is overpriced for the condition grade.', redFlags: ['Overpriced for good condition', 'Boy bag demand has softened'], marketOutlook: 'Slightly depreciating. The Boy bag has been less popular in recent seasons.', estimatedProfit: -1000, estimatedFees: 676, netProfit: -1676, roiPercentage: -27.0, createdAt: new Date('2026-03-12') },
  { id: 'val-031', listingId: 'lst-031', fairMarketValue: 31000, confidence: 'high', reasoning: 'Rolex Daytona 116500LN in mint condition via StockX. At $30,000, this is fairly priced but StockX fees are high.', redFlags: [], marketOutlook: 'Stable to appreciating. Daytona in white dial continues to command premiums.', estimatedProfit: 1000, estimatedFees: 3100, netProfit: -2100, roiPercentage: -7.0, createdAt: new Date('2026-03-10') },
];

// ============================================================================
// Price History
// ============================================================================

function generatePriceHistory(modelId: string, basePrice: number, volatility: number, trend: number = 0): PriceHistoryPoint[] {
  const points: PriceHistoryPoint[] = [];
  const sources = ['eBay', 'Chrono24', 'StockX', 'Vestiaire Collective'];
  const now = new Date('2026-03-15');

  for (let i = 0; i < 24; i++) {
    const daysAgo = i * 4 + Math.floor(Math.abs(Math.sin(i * 7 + modelId.length) * 3));
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    // Deterministic pseudo-random based on index and modelId
    const seed = Math.sin(modelId.length * 13 + i * 37) * 0.5 + 0.5;
    const fluctuation = 1 + (seed - 0.5) * volatility;
    const trendAdjust = 1 + (trend * (24 - i)) / 2400;
    const price = Math.round((basePrice * fluctuation * trendAdjust) / 100) * 100;
    const source = sources[i % sources.length];

    points.push({
      id: `ph-${modelId}-${i}`,
      modelId,
      source,
      price,
      recordedAt: date,
    });
  }

  return points.sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());
}

const priceHistory: PriceHistoryPoint[] = [
  // Watches
  ...generatePriceHistory('model-sub', 13500, 0.15, 0.02),
  ...generatePriceHistory('model-daytona', 31000, 0.12, 0.03),
  ...generatePriceHistory('model-gmt', 19000, 0.13, 0.02),
  ...generatePriceHistory('model-datejust', 11500, 0.18, 0.01),
  ...generatePriceHistory('model-explorer', 9200, 0.14, 0.03),
  ...generatePriceHistory('model-nautilus', 125000, 0.10, 0.02),
  ...generatePriceHistory('model-aquanaut', 46000, 0.12, 0.02),
  ...generatePriceHistory('model-calatrava', 27000, 0.10, -0.01),
  ...generatePriceHistory('model-royaloak', 43000, 0.14, 0.02),
  ...generatePriceHistory('model-ro-chrono', 48000, 0.12, 0.02),
  ...generatePriceHistory('model-rm055', 120000, 0.10, -0.03),
  ...generatePriceHistory('model-speedy', 6300, 0.16, 0.01),
  ...generatePriceHistory('model-seamaster', 4600, 0.14, 0.01),
  ...generatePriceHistory('model-bb58', 3700, 0.15, 0.01),
  ...generatePriceHistory('model-pelagos', 4600, 0.12, 0.01),
  ...generatePriceHistory('model-santos', 7500, 0.13, 0.03),
  ...generatePriceHistory('model-portugieser', 7200, 0.14, 0.01),
  ...generatePriceHistory('model-navitimer', 6800, 0.13, 0.01),
  ...generatePriceHistory('model-snowflake', 4900, 0.12, 0.02),
  ...generatePriceHistory('model-whitebirch', 8200, 0.10, 0.02),
  ...generatePriceHistory('model-carrera', 4200, 0.16, 0.00),
  ...generatePriceHistory('model-monaco', 5300, 0.14, 0.01),
  ...generatePriceHistory('model-spirit', 2400, 0.12, 0.01),

  // Handbags
  ...generatePriceHistory('model-birkin25', 19000, 0.15, 0.05),
  ...generatePriceHistory('model-birkin30', 17000, 0.14, 0.04),
  ...generatePriceHistory('model-kelly25', 22000, 0.15, 0.06),
  ...generatePriceHistory('model-constance', 16500, 0.13, 0.04),
  ...generatePriceHistory('model-picotin', 3800, 0.12, 0.02),
  ...generatePriceHistory('model-classic-med', 8200, 0.16, 0.01),
  ...generatePriceHistory('model-classic-jumbo', 8500, 0.18, 0.00),
  ...generatePriceHistory('model-boy', 5500, 0.16, -0.02),
  ...generatePriceHistory('model-mini-flap', 4800, 0.14, 0.01),
  ...generatePriceHistory('model-neverfull', 1400, 0.15, 0.01),
  ...generatePriceHistory('model-speedy25', 1350, 0.14, 0.00),
  ...generatePriceHistory('model-pochette', 1800, 0.13, 0.01),
  ...generatePriceHistory('model-ladydior', 4700, 0.14, 0.01),
  ...generatePriceHistory('model-saddle', 2800, 0.16, -0.01),
  ...generatePriceHistory('model-dionysus', 1800, 0.15, -0.02),
  ...generatePriceHistory('model-marmont', 1500, 0.16, -0.02),
  ...generatePriceHistory('model-reedition', 1200, 0.14, -0.02),
  ...generatePriceHistory('model-cassette', 2100, 0.16, -0.01),
  ...generatePriceHistory('model-loulou', 1900, 0.13, 0.00),
  ...generatePriceHistory('model-luggage', 2100, 0.14, 0.01),
  ...generatePriceHistory('model-baguette', 1800, 0.15, 0.01),
  ...generatePriceHistory('model-saintlouis', 1800, 0.12, 0.02),
  ...generatePriceHistory('model-artois', 2400, 0.11, 0.02),
  ...generatePriceHistory('model-peekaboo', 3300, 0.14, 0.01),
  ...generatePriceHistory('model-hourglass', 1400, 0.16, -0.01),
  ...generatePriceHistory('model-triomphe', 2600, 0.13, 0.01),
];

// ============================================================================
// Inventory
// ============================================================================

const inventory: InventoryItem[] = [
  { id: 'inv-001', modelId: 'model-speedy', purchasePrice: 4200, purchaseDate: new Date('2026-02-15'), condition: 'excellent', status: 'listed', salePrice: undefined, saleDate: undefined, platform: 'Chrono24', notes: 'Box and papers included.' },
  { id: 'inv-002', modelId: 'model-neverfull', purchasePrice: 950, purchaseDate: new Date('2026-01-20'), condition: 'good', status: 'sold', salePrice: 1350, saleDate: new Date('2026-02-28'), platform: 'eBay', notes: 'Missing dust bag.' },
  { id: 'inv-003', modelId: 'model-bb58', purchasePrice: 2800, purchaseDate: new Date('2026-03-01'), condition: 'good', status: 'in_hand', salePrice: undefined, saleDate: undefined, platform: undefined, notes: 'Acquired locally. Light desk diving marks.' },
  { id: 'inv-004', modelId: 'model-classic-med', purchasePrice: 6400, purchaseDate: new Date('2026-02-10'), condition: 'excellent', status: 'listed', salePrice: undefined, saleDate: undefined, platform: 'Vestiaire Collective', notes: 'Includes box, dust bag, and authenticity card.' },
  { id: 'inv-005', modelId: 'model-seamaster', purchasePrice: 3600, purchaseDate: new Date('2026-01-05'), condition: 'good', status: 'sold', salePrice: 4400, saleDate: new Date('2026-02-14'), platform: 'eBay', notes: 'Full kit. Sold within 6 weeks.' },
];

// ============================================================================
// Watchlist
// ============================================================================

const watchlist: WatchlistItem[] = [
  { id: 'wl-001', listingId: 'lst-002', targetPrice: 23000, alertEnabled: true, addedAt: new Date('2026-03-11') },
  { id: 'wl-002', listingId: 'lst-006', targetPrice: 12000, alertEnabled: true, addedAt: new Date('2026-03-13') },
  { id: 'wl-003', listingId: 'lst-005', targetPrice: 31000, alertEnabled: false, addedAt: new Date('2026-03-14') },
  { id: 'wl-004', listingId: 'lst-013', targetPrice: 85000, alertEnabled: true, addedAt: new Date('2026-03-14') },
];

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
