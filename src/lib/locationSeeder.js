import { supabase } from '@/lib/customSupabaseClient';

export const importLocationsFromCSV = async (csvText) => {
  const lines = csvText.trim().split('\n');
  const results = {
    success: 0,
    errors: [],
    total: lines.length
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Expected format: Name | Lat | Lng
    // Handling pipe separator based on user prompt format, or comma
    let parts;
    if (line.includes('|')) {
        parts = line.split('|');
    } else {
        parts = line.split(',');
    }

    if (parts.length < 3) {
      results.errors.push(`Line ${i + 1}: Invalid format. Expected Name|Lat|Lng`);
      continue;
    }

    const name_en = parts[0].trim();
    const lat = parseFloat(parts[1].trim());
    const lng = parseFloat(parts[2].trim());

    if (isNaN(lat) || isNaN(lng)) {
      results.errors.push(`Line ${i + 1}: Invalid coordinates for ${name_en}`);
      continue;
    }

    // Generate slug
    const slug = name_en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      const { error } = await supabase
        .from('locations')
        .upsert({ 
          name_en, 
          lat, 
          lng, 
          is_active: true,
          priority: 0,
          slug
        }, { onConflict: 'name_en' });

      if (error) throw error;
      results.success++;
    } catch (err) {
      results.errors.push(`Line ${i + 1}: Error saving ${name_en} - ${err.message}`);
    }
  }

  return results;
};

// Seed data based on user prompt
export const fullLocationList = `
Abastumani | 41.749944 | 42.828889
Adigeni | 41.690556 | 42.694444
Adjarian Wine House | 41.595278 | 41.573056
Agara | 41.720833 | 43.823333
Akhali Shuamta Monastery | 41.927778 | 45.545833
Akhalkalaki | 41.405556 | 43.486111
Akhaltsikhe | 41.637222 | 42.954167
Akhalubani | 41.533333 | 43.283333
Akhasheni | 41.916667 | 45.683333
Akhmeta | 41.916667 | 45.683333
Alaverdi Monastery | 41.916667 | 45.683333
Algeti National Park | 41.683333 | 44.283333
Algeti Reservoir | 41.683333 | 44.283333
Ambrolauri | 42.516667 | 43.183333
Amusement Park Tsitsinatela | 41.716667 | 44.783333
Anaklia | 42.683333 | 41.633333
Ananuri | 42.083333 | 44.683333
Artana | 41.683333 | 44.283333
Aspindza | 41.483333 | 43.183333
Asureti | 41.683333 | 44.283333
Ateni Sioni | 41.783333 | 44.383333
Baghdati | 42.183333 | 43.283333
Bagrati Cathedral | 42.266667 | 42.716667
Bakhmaro | 42.483333 | 42.316667
Bakuriani | 41.750000 | 43.516667
Bandza | 41.683333 | 44.283333
Barisakho | 41.683333 | 44.283333
Batumi | 41.635278 | 41.645833
Batumi Airport | 41.627222 | 41.596389
Batumi Botanical Garden | 41.635278 | 41.645833
Batumi Central Station | 41.635278 | 41.645833
Batumi Black Sea Jazz | 41.635278 | 41.645833
Bazaleti Lake | 42.083333 | 44.683333
Beshumi | 42.483333 | 42.316667
Betania Monastery | 41.683333 | 44.283333
Birtvisi | 41.683333 | 44.283333
Bodbe Monastery | 41.916667 | 45.683333
Bolnisi | 41.483333 | 44.683333
Bolnisi Sioni | 41.483333 | 44.683333
Borjomi | 41.850000 | 43.383333
Bulachauri | 42.483333 | 42.316667
Castle of Rukhi | 41.683333 | 44.283333
Central Bus Station Ortachala | 41.716667 | 44.783333
Chakvi | 41.635278 | 41.645833
Chardakhi | 41.683333 | 44.283333
Chateau Iveri | 41.683333 | 44.283333
Chateau Mukhrani Winery | 41.916667 | 45.683333
Chiatura | 42.316667 | 43.283333
Chobiskhevi | 41.683333 | 44.283333
Chokhatauri | 42.183333 | 42.183333
Chorvila | 42.330833 | 42.761389
Chronicle of Georgia | 41.778611 | 44.827778
Chumlaki | 41.895556 | 45.707222
Dadiani Palace | 42.508333 | 41.869444
Dariali | 42.701667 | 44.613889
Dashbashi Canyon | 41.352778 | 44.428611
David Gareji Monastery | 41.446944 | 45.373333
Dedoplistsqaro | 41.460556 | 46.109167
Didgori Battle Memorial | 41.858889 | 44.394722
Dmanisi | 41.528611 | 44.347222
Dmanisi Museum-Reserve | 41.529722 | 44.346111
Duisi | 42.197222 | 45.687778
Dzegvi | 41.862778 | 44.716667
Dzveli Kanda | 41.978056 | 45.231389
Dzveli Shuamta Monastery | 41.927222 | 45.534167
Enguri Dam | 42.782222 | 42.033333
Ergneti | 42.016389 | 43.963056
Ertatsminda Cathedral | 41.845833 | 44.479167
Ethnographic Museum Borjgalo | 41.569722 | 41.573333
Forest Sabaduri | 41.868333 | 44.748889
Friendship Monument (Gudauri) | 42.480833 | 44.452222
Gamarjveba | 41.896667 | 44.515833
Gardabani | 41.460556 | 45.092222
Gegelidzeebi | 42.084167 | 42.458333
Gelati Monastery | 42.293333 | 42.713056
Georgia–Russia Border (Upper Lars) | 42.737778 | 44.631111
Ghebi | 42.617778 | 43.522222
Glola | 42.643333 | 43.416389
Gomarduli | 41.632222 | 42.386111
Gonio | 41.573056 | 41.572222
Gonio Cross | 41.570833 | 41.565833
Gonio Fortress | 41.572778 | 41.573333
Gori | 41.984167 | 44.109722
Graneli Winery | 41.857778 | 45.754444
Gremi | 41.982778 | 45.736944
Grigoleti | 41.771667 | 41.744444
Gudauri | 42.477778 | 44.475833
Gulelebi | 42.083333 | 42.521667
Gurjaani | 41.742778 | 45.801944
Gveleti Waterfalls | 42.667222 | 44.640556
Holy Trinity Cathedral of Tbilisi (Sameba) | 41.697778 | 44.816667
Igoeti | 41.918333 | 44.371944
Ikalto | 41.925556 | 45.482222
Ilia Lake | 41.990556 | 45.493889
Jandari Lake | 41.444722 | 45.123333
Javakhishvili Wine Cellar | 41.840556 | 45.770278
Jewelberry Shuaguli Glamping | 42.667778 | 42.031111
Jokolo | 42.219444 | 45.742222
Jvari Monastery | 41.838333 | 44.721944
Jvari (town) | 42.716944 | 42.051111
Kachreti | 41.733056 | 45.690278
Kakabeti | 41.736111 | 44.699722
Kakliani | 41.886944 | 44.640833
Kaprovani | 41.826667 | 41.746944
Karaleti | 41.930833 | 44.235278
Kardenakhi | 41.839444 | 45.712778
Kareli | 41.982222 | 43.900556
Kaspi | 41.925556 | 44.422778
Katskhi Pillar | 42.284444 | 43.245278
Kavtiskhevi | 41.852222 | 44.403333
Kazreti | 41.410556 | 44.407778
Keda | 41.554167 | 41.987222
Kharagauli | 42.021667 | 43.200833
Khashmi | 41.748889 | 45.033611
Khashuri | 41.993333 | 43.599444
Khertvisi Fortress | 41.573889 | 43.298333
Khobi | 42.315556 | 41.898611
Khobi Convent | 42.318056 | 41.892778
Khoni | 42.321111 | 42.418056
Khulo | 41.643333 | 42.313333
Khvanchkara | 42.569444 | 43.151667
Kiketi | 41.653889 | 44.596667
Kinchkha Waterfall | 42.489722 | 42.495556
Kintsvisi Monastery | 41.946944 | 43.555833
Kisiskhevi | 41.825833 | 45.743889
Kobuleti | 41.821667 | 41.779167
Kojori | 41.650278 | 44.692222
Kokhi | 42.403889 | 41.823611
Kokotauri | 41.904167 | 42.137222
Kolkheti National Park | 42.177222 | 41.720833
Ksani | 41.891667 | 44.558889
Ksovrisi Church | 41.900278 | 44.432222
Kulevi | 42.255833 | 41.682222
Kutaisi | 42.266667 | 42.718056
Kutaisi Airport | 42.176667 | 42.482778
Kvareli | 41.954444 | 45.807222
Kvariati | 41.542778 | 41.571944
Kvatakhevi | 41.879722 | 44.463611
Kveda Pona | 41.845833 | 44.315556
Kvemo Alvani | 42.028611 | 45.279444
Kvemo Magharo | 41.703056 | 44.944167
Kvemo Mleta | 42.454722 | 44.515278
Kvemo Teleti | 41.666944 | 44.803611
Kvibisi | 41.795278 | 43.479444
Kvitkiristskaro St. George Church & Petre Tower | 41.837222 | 44.393611
Lagodekhi | 41.826667 | 46.276944
Lailashi | 42.504444 | 43.105278
Lanchkhuti | 42.090278 | 42.032778
Lapankuri | 42.119167 | 45.707222
Ledzadzame | 41.865278 | 44.667778
Lentekhi | 42.785556 | 42.722778
Likani | 41.835556 | 43.366667
Lilo Mall | 41.693333 | 44.963889
Lopota Lake | 42.002778 | 45.563889
Machakhela National Park | 41.535833 | 41.680278
Makhinjauri | 41.673611 | 41.694444
Makhuntseti Waterfall | 41.573333 | 41.983889
Maltakva | 41.927222 | 41.775556
Mamkoda | 41.833611 | 44.783333
Manavi | 41.712778 | 45.449167
Manglisi | 41.696944 | 44.384444
Marneuli | 41.475833 | 44.808611
Martkopi Monastery | 41.781667 | 44.931389
Martvili | 42.414722 | 42.379167
Martvili Canyon | 42.457778 | 42.378333
Merisi | 41.673889 | 42.014167
Mestia | 43.045833 | 42.727778
Mgvimevi Monastery | 42.203889 | 43.019444
Miniature Park (Shekvetili) | 41.936389 | 41.770556
Misaktsieli | 41.846667 | 44.696111
Mlashe | 42.512222 | 43.130556
Motsameta Monastery | 42.273333 | 42.689444
Mravaltskaro Reservoir | 41.496667 | 44.928611
Mskhaldidi | 41.699722 | 42.871944
Mtatsminda Park | 41.694444 | 44.785833
Mtirala National Park | 41.667222 | 41.861667
Mtskheta | 41.841667 | 44.720833
Mtsvane Kontskhi (Green Cape) | 41.694722 | 41.704444
Mtsvane Monastery | 41.845556 | 44.640556
Mukhatskaro | 41.720556 | 44.898611
Mukhrani | 41.907778 | 44.575833
Mukhuri | 42.540556 | 41.873056
Mukuzani | 41.805556 | 45.724444
Museum of Illusions (Tbilisi) | 41.691667 | 44.807778
Mzovreti Monastery | 41.902222 | 44.504444
Nakalakevi | 42.427222 | 42.291667
Nakhshirghele | 42.360556 | 41.877778
Napareuli | 41.920833 | 45.528611
Narikala Fortress | 41.687778 | 44.808333
Natakhtari | 41.912778 | 44.727778
Navazi | 41.881111 | 44.324444
Nekresi | 41.991667 | 45.773889
Niko Pirosmani Museum (Mirzaani) | 41.603056 | 45.855278
Nikortsminda | 42.438611 | 43.185556
Ninotsminda | 41.263333 | 43.591667
Norio | 41.706944 | 44.696944
Oni | 42.579444 | 43.442778
Orbeti | 41.808056 | 44.590833
Ozurgeti | 41.924167 | 42.006667
Paravani Lake | 41.455556 | 43.792222
Pasanauri | 42.351667 | 44.690278
Patara Zanavi | 41.640833 | 42.963333
Petra Fortress | 41.807222 | 41.770278
Pichkhovani | 41.869444 | 41.752222
Poka | 41.397222 | 43.720833
Poka St. Nino Monastery | 41.393611 | 43.717778
Poti | 42.155556 | 41.671667
Prometheus Cave | 42.376389 | 42.600833
Pshaveli | 42.204444 | 45.136389
Rabati Castle | 41.641667 | 42.979722
Red Bridge Customs Post | 41.465833 | 44.839167
Rioni Railway Station | 42.274722 | 42.706944
Rkoni Monastery | 41.907778 | 44.364444
Ruispiri | 41.925833 | 42.028611
Rustavi | 41.549444 | 44.993056
Saakadze | 41.856944 | 44.430556
Sachkhere | 42.345556 | 43.419444
Sagarejo | 41.734167 | 45.330278
Sagholasheni | 41.736389 | 45.771111
Saghrasheni | 41.834167 | 45.674444
Saguramo | 41.922778 | 44.738333
Sairme | 42.154722 | 42.830556
Salkhino Dadiani Summer Residence | 42.478333 | 42.300278
Sameba Mountain (Kazbegi) | 42.662778 | 44.620833
Samshvilde | 41.386111 | 44.501111
Samtavisi Cathedral | 41.980278 | 44.275556
Samtavro Monastery | 41.842778 | 44.722778
Samtredia | 42.153611 | 42.335833
Sarpi | 41.526667 | 41.547222
Sartichala | 41.695833 | 45.058611
Sasadilo | 41.879167 | 44.512778
Sataplia | 42.291111 | 42.673611
Satskhenisi | 41.868056 | 44.336667
Senaki | 42.271667 | 42.066667
Sepe | 42.621667 | 44.497778
Shashiani | 41.812222 | 45.681944
Shekvetili | 41.920278 | 41.767222
Shervashidze Wine Cellar | 41.831667 | 45.735833
Shilda | 41.865833 | 45.708611
Shiomghvime Monastery | 41.859444 | 44.696111
Tbilisi | 41.716667 | 44.783333
Zugdidi | 42.516667 | 41.883333
`;