
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { createTransferRequest } from "../services/api";
import "./Transfer.css";

const countries = [
    { name: "Afghanistan", currency: "AFN" },
    { name: "Albania", currency: "ALL" },
    { name: "Algeria", currency: "DZD" },
    { name: "Andorra", currency: "EUR" },
    { name: "Angola", currency: "AOA" },
    { name: "Antigua and Barbuda", currency: "XCD" },
    { name: "Argentina", currency: "ARS" },
    { name: "Armenia", currency: "AMD" },
    { name: "Australia", currency: "AUD" },
    { name: "Austria", currency: "EUR" },
    { name: "Azerbaijan", currency: "AZN" },
    { name: "Bahamas", currency: "BSD" },
    { name: "Bahrain", currency: "BHD" },
    { name: "Bangladesh", currency: "BDT" },
    { name: "Barbados", currency: "BBD" },
    { name: "Belarus", currency: "BYN" },
    { name: "Belgium", currency: "EUR" },
    { name: "Belize", currency: "BZD" },
    { name: "Benin", currency: "XOF" },
    { name: "Bhutan", currency: "BTN" },
    { name: "Bolivia", currency: "BOB" },
    { name: "Bosnia and Herzegovina", currency: "BAM" },
    { name: "Botswana", currency: "BWP" },
    { name: "Brazil", currency: "BRL" },
    { name: "Brunei", currency: "BND" },
    { name: "Bulgaria", currency: "EUR" },
    { name: "Burkina Faso", currency: "XOF" },
    { name: "Burundi", currency: "BIF" },
    { name: "Cabo Verde", currency: "CVE" },
    { name: "Cambodia", currency: "KHR" },
    { name: "Cameroon", currency: "XAF" },
    { name: "Canada", currency: "CAD" },
    { name: "Central African Republic", currency: "XAF" },
    { name: "Chad", currency: "XAF" },
    { name: "Chile", currency: "CLP" },
    { name: "China", currency: "CNY" },
    { name: "Colombia", currency: "COP" },
    { name: "Comoros", currency: "KMF" },
    { name: "Congo", currency: "XAF" },
    { name: "Costa Rica", currency: "CRC" },
    { name: "Croatia", currency: "EUR" },
    { name: "Cuba", currency: "CUP" },
    { name: "Cyprus", currency: "EUR" },
    { name: "Czech Republic", currency: "CZK" },
    { name: "Democratic Republic of the Congo", currency: "CDF" },
    { name: "Denmark", currency: "DKK" },
    { name: "Djibouti", currency: "DJF" },
    { name: "Dominica", currency: "XCD" },
    { name: "Dominican Republic", currency: "DOP" },
    { name: "Ecuador", currency: "USD" },
    { name: "Egypt", currency: "EGP" },
    { name: "El Salvador", currency: "USD" },
    { name: "Equatorial Guinea", currency: "XAF" },
    { name: "Eritrea", currency: "ERN" },
    { name: "Estonia", currency: "EUR" },
    { name: "Eswatini", currency: "SZL" },
    { name: "Ethiopia", currency: "ETB" },
    { name: "Fiji", currency: "FJD" },
    { name: "Finland", currency: "EUR" },
    { name: "France", currency: "EUR" },
    { name: "Gabon", currency: "XAF" },
    { name: "Gambia", currency: "GMD" },
    { name: "Georgia", currency: "GEL" },
    { name: "Germany", currency: "EUR" },
    { name: "Ghana", currency: "GHS" },
    { name: "Greece", currency: "EUR" },
    { name: "Grenada", currency: "XCD" },
    { name: "Guatemala", currency: "GTQ" },
    { name: "Guinea", currency: "GNF" },
    { name: "Guinea-Bissau", currency: "XOF" },
    { name: "Guyana", currency: "GYD" },
    { name: "Haiti", currency: "HTG" },
    { name: "Honduras", currency: "HNL" },
    { name: "Hungary", currency: "HUF" },
    { name: "Iceland", currency: "ISK" },
    { name: "India", currency: "INR" },
    { name: "Indonesia", currency: "IDR" },
    { name: "Iran", currency: "IRR" },
    { name: "Iraq", currency: "IQD" },
    { name: "Ireland", currency: "EUR" },
    { name: "Israel", currency: "ILS" },
    { name: "Italy", currency: "EUR" },
    { name: "Jamaica", currency: "JMD" },
    { name: "Japan", currency: "JPY" },
    { name: "Jordan", currency: "JOD" },
    { name: "Kazakhstan", currency: "KZT" },
    { name: "Kenya", currency: "KES" },
    { name: "Kiribati", currency: "AUD" },
    { name: "Kuwait", currency: "KWD" },
    { name: "Kyrgyzstan", currency: "KGS" },
    { name: "Laos", currency: "LAK" },
    { name: "Latvia", currency: "EUR" },
    { name: "Lebanon", currency: "LBP" },
    { name: "Lesotho", currency: "LSL" },
    { name: "Liberia", currency: "LRD" },
    { name: "Libya", currency: "LYD" },
    { name: "Liechtenstein", currency: "CHF" },
    { name: "Lithuania", currency: "EUR" },
    { name: "Luxembourg", currency: "EUR" },
    { name: "Madagascar", currency: "MGA" },
    { name: "Malawi", currency: "MWK" },
    { name: "Malaysia", currency: "MYR" },
    { name: "Maldives", currency: "MVR" },
    { name: "Mali", currency: "XOF" },
    { name: "Malta", currency: "EUR" },
    { name: "Marshall Islands", currency: "USD" },
    { name: "Mauritania", currency: "MRU" },
    { name: "Mauritius", currency: "MUR" },
    { name: "Mexico", currency: "MXN" },
    { name: "Micronesia", currency: "USD" },
    { name: "Moldova", currency: "MDL" },
    { name: "Monaco", currency: "EUR" },
    { name: "Mongolia", currency: "MNT" },
    { name: "Montenegro", currency: "EUR" },
    { name: "Morocco", currency: "MAD" },
    { name: "Mozambique", currency: "MZN" },
    { name: "Myanmar", currency: "MMK" },
    { name: "Namibia", currency: "NAD" },
    { name: "Nauru", currency: "AUD" },
    { name: "Nepal", currency: "NPR" },
    { name: "Netherlands", currency: "EUR" },
    { name: "New Zealand", currency: "NZD" },
    { name: "Nicaragua", currency: "NIO" },
    { name: "Niger", currency: "XOF" },
    { name: "Nigeria", currency: "NGN" },
    { name: "North Korea", currency: "KPW" },
    { name: "North Macedonia", currency: "MKD" },
    { name: "Norway", currency: "NOK" },
    { name: "Oman", currency: "OMR" },
    { name: "Pakistan", currency: "PKR" },
    { name: "Palau", currency: "USD" },
    { name: "Palestine", currency: "ILS" },
    { name: "Panama", currency: "PAB" },
    { name: "Papua New Guinea", currency: "PGK" },
    { name: "Paraguay", currency: "PYG" },
    { name: "Peru", currency: "PEN" },
    { name: "Philippines", currency: "PHP" },
    { name: "Poland", currency: "PLN" },
    { name: "Portugal", currency: "EUR" },
    { name: "Qatar", currency: "QAR" },
    { name: "Romania", currency: "RON" },
    { name: "Russia", currency: "RUB" },
    { name: "Rwanda", currency: "RWF" },
    { name: "Saint Kitts and Nevis", currency: "XCD" },
    { name: "Saint Lucia", currency: "XCD" },
    { name: "Saint Vincent and the Grenadines", currency: "XCD" },
    { name: "Samoa", currency: "WST" },
    { name: "San Marino", currency: "EUR" },
    { name: "Sao Tome and Principe", currency: "STN" },
    { name: "Saudi Arabia", currency: "SAR" },
    { name: "Senegal", currency: "XOF" },
    { name: "Serbia", currency: "RSD" },
    { name: "Seychelles", currency: "SCR" },
    { name: "Sierra Leone", currency: "SLE" },
    { name: "Singapore", currency: "SGD" },
    { name: "Slovakia", currency: "EUR" },
    { name: "Slovenia", currency: "EUR" },
    { name: "Solomon Islands", currency: "SBD" },
    { name: "Somalia", currency: "SOS" },
    { name: "South Africa", currency: "ZAR" },
    { name: "South Korea", currency: "KRW" },
    { name: "South Sudan", currency: "SSP" },
    { name: "Spain", currency: "EUR" },
    { name: "Sri Lanka", currency: "LKR" },
    { name: "Sudan", currency: "SDG" },
    { name: "Suriname", currency: "SRD" },
    { name: "Sweden", currency: "SEK" },
    { name: "Switzerland", currency: "CHF" },
    { name: "Syria", currency: "SYP" },
    { name: "Tajikistan", currency: "TJS" },
    { name: "Tanzania", currency: "TZS" },
    { name: "Thailand", currency: "THB" },
    { name: "Timor-Leste", currency: "USD" },
    { name: "Togo", currency: "XOF" },
    { name: "Tonga", currency: "TOP" },
    { name: "Trinidad and Tobago", currency: "TTD" },
    { name: "Tunisia", currency: "TND" },
    { name: "Turkey", currency: "TRY" },
    { name: "Turkmenistan", currency: "TMT" },
    { name: "Tuvalu", currency: "AUD" },
    { name: "Uganda", currency: "UGX" },
    { name: "Ukraine", currency: "UAH" },
    { name: "United Arab Emirates", currency: "AED" },
    { name: "United Kingdom", currency: "GBP" },
    { name: "United States", currency: "USD" },
    { name: "Uruguay", currency: "UYU" },
    { name: "Uzbekistan", currency: "UZS" },
    { name: "Vanuatu", currency: "VUV" },
    { name: "Vatican City", currency: "EUR" },
    { name: "Venezuela", currency: "VES" },
    { name: "Vietnam", currency: "VND" },
    { name: "Yemen", currency: "YER" },
    { name: "Zambia", currency: "ZMW" },
    { name: "Zimbabwe", currency: "ZWG" }
];

const banks = {
    Nigeria: [
        "Access Bank", "GTBank", "Zenith Bank", "UBA",
        "First Bank", "Fidelity Bank", "Sterling Bank",
        "Kuda Bank", "Moniepoint", "Richiee Bank"
    ],
    "South Africa": [
        "Standard Bank", "ABSA", "Nedbank", "Capitec"
    ],
    Germany: ["Deutsche Bank", "Commerzbank"],
    France: ["BNP Paribas", "Societe Generale"],
    "United Arab Emirates": ["Emirates NBD", "Mashreq Bank"],
    India: ["State Bank of India", "HDFC Bank", "ICICI Bank"],
    Australia: ["Commonwealth Bank", "Westpac", "ANZ"],
    Romania: [
        "Banca Transilvania",
        "BCR (Banca Comercială Română)",
        "BRD Groupe Société Générale",
        "CEC Bank",
        "Raiffeisen Bank Romania",
        "ING Bank Romania",
        "Garanti BBVA Romania",
        "Alpha Bank Romania",
        "Libra Internet Bank",
        "Exim Banca Românească",
        "ProCredit Bank Romania",
        "Intesa Sanpaolo Bank Romania",
        "First Bank Romania",
        "Patria Bank"
    ],

    Russia: [
        "Sberbank",
        "VTB Bank",
        "Gazprombank",
        "Alfa-Bank",
        "T-Bank",
        "Rosselkhozbank",
        "Sovcombank",
        "Bank Saint Petersburg",
        "MKB (Moscow Credit Bank)",
        "Promsvyazbank",
        "Otkritie Bank",
        "Raiffeisenbank Russia",
        "Rosbank",
        "Ak Bars Bank"
    ],

    Singapore: [
        "DBS Bank",
        "OCBC Bank",
        "United Overseas Bank",
        "Standard Chartered Bank Singapore",
        "Citibank Singapore",
        "HSBC Singapore",
        "Maybank Singapore",
        "Bank of China Singapore",
        "CIMB Bank Singapore",
        "RHB Bank Singapore",
        "ICBC Singapore",
        "JPMorgan Chase Bank Singapore",
        "State Bank of India Singapore",
        "ANZ Singapore",
        "Trust Bank Singapore"
    ],

    Slovakia: [
        "Slovenská sporiteľňa",
        "VÚB Banka",
        "Tatra banka",
        "ČSOB Slovakia",
        "365.bank",
        "Prima banka",
        "Fio banka",
        "mBank Slovakia",
        "Privatbanka",
        "Oberbank Slovakia",
        "Raiffeisen banka Slovakia",
        "BKS Bank Slovakia"
    ],

    Slovenia: [
        "NLB Banka",
        "Nova KBM",
        "SKB Banka",
        "OTP banka",
        "Intesa Sanpaolo Bank",
        "Delavska hranilnica",
        "Addiko Bank",
        "Gorenjska banka",
        "Banka Sparkasse",
        "Deželna banka Slovenije",
        "BKS Bank Slovenia",
        "Primorska hranilnica Vipava"
    ],

    Sweden: [
        "Swedbank",
        "SEB",
        "Handelsbanken",
        "Nordea Sweden",
        "Danske Bank Sweden",
        "Länsförsäkringar Bank",
        "SBAB",
        "SkandiaBanken",
        "Avanza Bank",
        "Nordnet Bank",
        "Ikano Bank",
        "Resurs Bank",
        "Marginalen Bank",
        "Sparbanken Syd",
        "Svea Bank"
    ],

    Switzerland: [
        "UBS",
        "PostFinance",
        "Raiffeisen Switzerland",
        "Zürcher Kantonalbank",
        "Julius Baer",
        "Pictet",
        "Lombard Odier",
        "Banque Cantonale Vaudoise",
        "Basler Kantonalbank",
        "Berner Kantonalbank",
        "Migros Bank",
        "Zuger Kantonalbank",
        "Vontobel",
        "EFG Bank",
        "Swissquote Bank"
    ],

    Thailand: [
        "Bangkok Bank",
        "Kasikornbank",
        "Siam Commercial Bank",
        "Krung Thai Bank",
        "Bank of Ayudhya",
        "TMBThanachart Bank",
        "Government Savings Bank",
        "Government Housing Bank",
        "CIMB Thai",
        "UOB Thailand",
        "Standard Chartered Thailand",
        "ICBC Thai",
        "Land and Houses Bank",
        "Kiatnakin Phatra Bank",
        "TISCO Bank"
    ],

    Turkey: [
        "Ziraat Bankası",
        "Türkiye İş Bankası",
        "Garanti BBVA",
        "Akbank",
        "Yapı Kredi",
        "Halkbank",
        "VakıfBank",
        "QNB Türkiye",
        "DenizBank",
        "TEB",
        "Kuveyt Türk",
        "Albaraka Türk",
        "Türkiye Finans",
        "Şekerbank",
        "ING Türkiye"
    ],
    Brazil: [
        "Banco do Brasil",
        "Itaú Unibanco",
        "Bradesco",
        "Caixa Econômica Federal",
        "Santander Brasil",
        "BTG Pactual",
        "Banco Safra",
        "Banco Inter",
        "Nubank",
        "Banco Votorantim (BV)",
        "Banco Original",
        "Banco Daycoval",
        "Banco ABC Brasil",
        "Banco Pan",
        "Sicoob"
    ],

    Taiwan: [
        "Bank of Taiwan",
        "CTBC Bank",
        "Mega International Commercial Bank",
        "Cathay United Bank",
        "Taipei Fubon Bank",
        "First Commercial Bank",
        "Taiwan Cooperative Bank",
        "E.SUN Commercial Bank",
        "Hua Nan Commercial Bank",
        "Land Bank of Taiwan",
        "Taishin International Bank",
        "Chang Hwa Bank",
        "Union Bank of Taiwan",
        "Taipei Star Bank",
        "Far Eastern International Bank"
    ],

    China: [
        "Industrial and Commercial Bank of China",
        "China Construction Bank",
        "Agricultural Bank of China",
        "Bank of China",
        "Bank of Communications",
        "Postal Savings Bank of China",
        "China Merchants Bank",
        "China CITIC Bank",
        "China Minsheng Bank",
        "Shanghai Pudong Development Bank",
        "Industrial Bank",
        "Ping An Bank",
        "China Everbright Bank",
        "Bank of Beijing",
        "Bank of Shanghai"
    ],

    Portugal: [
        "Caixa Geral de Depósitos",
        "Millennium BCP",
        "Novo Banco",
        "Santander Totta",
        "Banco BPI",
        "Banco Montepio",
        "Banco CTT",
        "ActivoBank",
        "Banco Português de Gestão",
        "Banco Invest",
        "Banco Atlântico Europa",
        "Abanca Portugal",
        "BNI Europa",
        "Bankinter Portugal",
        "Crédito Agrícola"
    ],

    Spain: [
        "Banco Santander",
        "BBVA",
        "CaixaBank",
        "Banco Sabadell",
        "Bankinter",
        "Unicaja Banco",
        "Abanca",
        "Ibercaja Banco",
        "Kutxabank",
        "Cajamar",
        "Laboral Kutxa",
        "Banca March",
        "Deutsche Bank Spain",
        "ING Spain",
        "Openbank"
    ],

    "United States": [
        "JPMorgan Chase",
        "Bank of America",
        "Wells Fargo",
        "Citibank",
        "U.S. Bank",
        "PNC Bank",
        "Truist Bank",
        "Goldman Sachs Bank",
        "Capital One",
        "TD Bank",
        "Citizens Bank",
        "Fifth Third Bank",
        "KeyBank",
        "Regions Bank",
        "Huntington National Bank"
    ],
    "United Kingdom": [
        "HSBC UK",
        "Barclays",
        "Lloyds Bank",
        "NatWest",
        "Santander UK",
        "Nationwide Building Society",
        "Royal Bank of Scotland",
        "TSB Bank",
        "Halifax",
        "Metro Bank",
        "Virgin Money",
        "The Co-operative Bank",
        "Monzo",
        "Starling Bank",
        "Revolut"
    ],

    Canada: [
        "Royal Bank of Canada",
        "TD Canada Trust",
        "Scotiabank",
        "Bank of Montreal",
        "Canadian Imperial Bank of Commerce",
        "National Bank of Canada",
        "Desjardins",
        "Canadian Western Bank",
        "Laurentian Bank",
        "Tangerine Bank",
        "Simplii Financial",
        "EQ Bank",
        "ATB Financial",
        "Meridian Credit Union",
        "HSBC Bank Canada"
    ],
    Austria: [
        "Erste Bank",
        "Raiffeisen Bank International",
        "BAWAG",
        "Bank99",
        "Oberbank",
        "BKS Bank",
        "Hypo Vorarlberg",
        "Volksbank Wien",
        "Addiko Bank",
        "Hypo Tirol Bank",
        "Steiermärkische Sparkasse",
        "HYPO NOE",
        "Santander Consumer Bank Austria",
        "DenizBank Austria"
    ],

    Australia: [
        "Commonwealth Bank",
        "Westpac",
        "ANZ",
        "National Australia Bank",
        "Macquarie Bank",
        "Bendigo Bank",
        "Suncorp Bank",
        "Bank of Queensland",
        "ING Australia",
        "HSBC Australia",
        "AMP Bank",
        "Bank Australia",
        "Great Southern Bank",
        "ME Bank",
        "Judo Bank"
    ],
    Italy: [
        "Intesa Sanpaolo",
        "Banco BPM",
        "BPER Banca",
        "Monte dei Paschi di Siena",
        "Banca Mediolanum",
        "FinecoBank",
        "Banca Sella",
        "Credem",
        "Banca Generali",
        "Banca Popolare di Sondrio",
        "Mediobanca",
        "ING Italia",
        "BNL BNP Paribas",
        "Crédit Agricole Italia"
    ],

    Germany: [
        "Deutsche Bank",
        "Commerzbank",
        "DZ Bank",
        "HypoVereinsbank",
        "ING Germany",
        "DKB",
        "N26",
        "Postbank",
        "Santander Germany",
        "Targobank",
        "Landesbank Baden-Württemberg",
        "BayernLB",
        "Helaba",
        "NordLB",
        "Oldenburgische Landesbank"
    ],

    Poland: [
        "PKO Bank Polski",
        "Bank Pekao",
        "Santander Bank Polska",
        "ING Bank Śląski",
        "mBank",
        "Bank Millennium",
        "Alior Bank",
        "BNP Paribas Bank Polska",
        "Credit Agricole Bank Polska",
        "Bank Ochrony Środowiska",
        "Bank Handlowy w Warszawie",
        "VeloBank",
        "Nest Bank",
        "Plus Bank",
        "Citi Handlowy"
    ],
    Japan: [
        "MUFG Bank",
        "Sumitomo Mitsui Banking Corporation",
        "Mizuho Bank",
        "Resona Bank",
        "SBI Shinsei Bank",
        "Aozora Bank",
        "Japan Post Bank",
        "PayPay Bank",
        "Rakuten Bank",
        "Sony Bank",
        "Seven Bank",
        "SBI Sumishin Net Bank",
        "Shizuoka Bank",
        "Chiba Bank",
        "Bank of Yokohama"
    ],

    Singapore: [
        "DBS Bank",
        "OCBC Bank",
        "United Overseas Bank",
        "Standard Chartered Singapore",
        "Citibank Singapore",
        "HSBC Singapore",
        "Maybank Singapore",
        "Bank of China Singapore",
        "CIMB Singapore",
        "RHB Bank Singapore",
        "State Bank of India Singapore",
        "ICBC Singapore",
        "JPMorgan Chase Bank Singapore",
        "ANZ Singapore",
        "Trust Bank Singapore"
    ],

    Switzerland: [
        "UBS",
        "PostFinance",
        "Raiffeisen Switzerland",
        "Zürcher Kantonalbank",
        "Julius Baer",
        "Pictet",
        "Lombard Odier",
        "Banque Cantonale Vaudoise",
        "Basler Kantonalbank",
        "Berner Kantonalbank",
        "Migros Bank",
        "Zuger Kantonalbank",
        "Vontobel",
        "EFG International",
        "Swissquote Bank"
    ],

    Netherlands: [
        "ING Bank",
        "ABN AMRO",
        "Rabobank",
        "de Volksbank",
        "ASN Bank",
        "Triodos Bank",
        "bunq",
        "Knab",
        "NIBC Bank",
        "Van Lanschot Kempen",
        "RegioBank",
        "LeasePlan Bank",
        "Handelsbanken Netherlands",
        "Deutsche Bank Netherlands",
        "Revolut Bank"
    ],

    "South Korea": [
        "KB Kookmin Bank",
        "Shinhan Bank",
        "Hana Bank",
        "Woori Bank",
        "NH NongHyup Bank",
        "Industrial Bank of Korea",
        "Korea Development Bank",
        "KakaoBank",
        "Toss Bank",
        "K Bank",
        "Busan Bank",
        "Daegu Bank",
        "Kyongnam Bank",
        "Jeonbuk Bank",
        "Jeju Bank"
    ],
    Ghana: [
        "GCB Bank",
        "Ecobank Ghana",
        "Absa Bank Ghana",
        "Standard Chartered Bank Ghana",
        "Fidelity Bank Ghana",
        "CalBank",
        "Zenith Bank Ghana",
        "United Bank for Africa Ghana",
        "Access Bank Ghana",
        "Republic Bank Ghana",
        "Stanbic Bank Ghana",
        "First Atlantic Bank",
        "Consolidated Bank Ghana",
        "Prudential Bank",
        "Guaranty Trust Bank Ghana"
    ],

    Kenya: [
        "KCB Bank Kenya",
        "Equity Bank",
        "Co-operative Bank of Kenya",
        "Absa Bank Kenya",
        "NCBA Bank",
        "Standard Chartered Bank Kenya",
        "Stanbic Bank Kenya",
        "I&M Bank",
        "DTB Kenya",
        "Family Bank",
        "National Bank of Kenya",
        "Bank of Africa Kenya",
        "Citibank Kenya",
        "Prime Bank",
        "Sidian Bank"
    ],

    Uganda: [
        "Stanbic Bank Uganda",
        "Centenary Bank",
        "Absa Bank Uganda",
        "DFCU Bank",
        "Equity Bank Uganda",
        "Bank of Africa Uganda",
        "Standard Chartered Uganda",
        "KCB Bank Uganda",
        "Housing Finance Bank",
        "Finance Trust Bank",
        "PostBank Uganda",
        "NCBA Bank Uganda",
        "I&M Bank Uganda",
        "Exim Bank Uganda",
        "Tropical Bank"
    ],

    Tanzania: [
        "CRDB Bank",
        "NMB Bank",
        "NBC Tanzania",
        "Stanbic Bank Tanzania",
        "Absa Bank Tanzania",
        "Standard Chartered Tanzania",
        "Equity Bank Tanzania",
        "Exim Bank Tanzania",
        "DTB Tanzania",
        "Access Bank Tanzania",
        "Amana Bank",
        "Azania Bank",
        "I&M Bank Tanzania",
        "Citibank Tanzania",
        "KCB Bank Tanzania"
    ],

    Rwanda: [
        "Bank of Kigali",
        "Equity Bank Rwanda",
        "I&M Bank Rwanda",
        "Access Bank Rwanda",
        "BPR Bank Rwanda",
        "Cogebanque",
        "Ecobank Rwanda",
        "GTBank Rwanda",
        "NCBA Rwanda",
        "KCB Bank Rwanda",
        "Zigama CSS",
        "Urwego Bank"
    ],

    Senegal: [
        "CBAO Groupe Attijariwafa Bank",
        "Ecobank Senegal",
        "Société Générale Senegal",
        "Bank of Africa Senegal",
        "UBA Senegal",
        "Banque Atlantique Senegal",
        "Orabank Senegal",
        "Coris Bank International Senegal",
        "BICIS",
        "BSIC Senegal",
        "Banque Islamique du Sénégal",
        "CITIBANK Senegal",
        "LBA Senegal"
    ],

    Morocco: [
        "Attijariwafa Bank",
        "Banque Populaire",
        "Bank of Africa",
        "Société Générale Maroc",
        "Crédit du Maroc",
        "CIH Bank",
        "BMCI",
        "Crédit Agricole du Maroc",
        "Al Barid Bank",
        "CFG Bank",
        "Umnia Bank",
        "Bank Assafa",
        "Arab Bank Morocco",
        "Citibank Morocco",
        "Saham Bank"
    ],

    Egypt: [
        "National Bank of Egypt",
        "Banque Misr",
        "Commercial International Bank",
        "QNB Alahli",
        "Banque du Caire",
        "AlexBank",
        "Arab African International Bank",
        "Faisal Islamic Bank of Egypt",
        "Housing and Development Bank",
        "Arab Bank Egypt",
        "HSBC Egypt",
        "AAIB",
        "Credit Agricole Egypt",
        "Mashreq Egypt",
        "ADIB Egypt"
    ],

    "Saudi Arabia": [
        "Saudi National Bank",
        "Al Rajhi Bank",
        "Riyad Bank",
        "Saudi Awwal Bank",
        "Banque Saudi Fransi",
        "Arab National Bank",
        "Alinma Bank",
        "Bank Albilad",
        "Bank AlJazira",
        "Gulf International Bank Saudi Arabia",
        "Emirates NBD Saudi Arabia",
        "National Bank of Kuwait Saudi Arabia",
        "JPMorgan Chase Saudi Arabia",
        "Deutsche Bank Saudi Arabia",
        "Bank of China Saudi Arabia"
    ],

    Qatar: [
        "Qatar National Bank",
        "Qatar Islamic Bank",
        "Commercial Bank of Qatar",
        "Doha Bank",
        "Masraf Al Rayan",
        "Dukhan Bank",
        "Ahlibank Qatar",
        "Qatar International Islamic Bank",
        "HSBC Qatar",
        "Standard Chartered Qatar",
        "Mashreq Qatar",
        "Arab Bank Qatar",
        "International Bank of Qatar",
        "Al Khaliji Bank",
        "Lesha Bank"
    ],

    Kuwait: [
        "National Bank of Kuwait",
        "Kuwait Finance House",
        "Burgan Bank",
        "Gulf Bank",
        "Commercial Bank of Kuwait",
        "Boubyan Bank",
        "Warba Bank",
        "Kuwait International Bank",
        "Ahli United Bank Kuwait",
        "Al Ahli Bank of Kuwait",
        "Industrial Bank of Kuwait"
    ],

    Oman: [
        "Bank Muscat",
        "Bank Dhofar",
        "National Bank of Oman",
        "Sohar International",
        "Oman Arab Bank",
        "Ahli Bank",
        "Bank Nizwa",
        "Alizz Islamic Bank",
        "Oman Housing Bank",
        "HSBC Oman",
        "Bank of Baroda Oman",
        "State Bank of India Oman"
    ],

    Jordan: [
        "Arab Bank",
        "Housing Bank for Trade and Finance",
        "Jordan Kuwait Bank",
        "Bank of Jordan",
        "Cairo Amman Bank",
        "Capital Bank of Jordan",
        "Jordan Ahli Bank",
        "Arab Jordan Investment Bank",
        "Investbank",
        "Islamic International Arab Bank",
        "Jordan Islamic Bank",
        "Etihad Bank",
        "Société Générale Jordan",
        "Bank al Etihad",
        "ABC Bank Jordan"
    ],

    Turkey: [
        "Ziraat Bankası",
        "İşbank",
        "Garanti BBVA",
        "Akbank",
        "Yapı Kredi",
        "Halkbank",
        "VakıfBank",
        "QNB Türkiye",
        "DenizBank",
        "TEB",
        "Kuveyt Türk",
        "Albaraka Türk",
        "Türkiye Finans",
        "Şekerbank",
        "ING Türkiye"
    ],

    Pakistan: [
        "Habib Bank Limited",
        "National Bank of Pakistan",
        "United Bank Limited",
        "MCB Bank",
        "Allied Bank",
        "Bank Alfalah",
        "Meezan Bank",
        "Faysal Bank",
        "Bank Al Habib",
        "Askari Bank",
        "Standard Chartered Pakistan",
        "JS Bank",
        "Soneri Bank",
        "Bank of Punjab",
        "Dubai Islamic Bank Pakistan"
    ],

    Bangladesh: [
        "Sonali Bank",
        "Janata Bank",
        "Agrani Bank",
        "Rupali Bank",
        "Dutch-Bangla Bank",
        "BRAC Bank",
        "Eastern Bank",
        "The City Bank",
        "Prime Bank",
        "Pubali Bank",
        "Islami Bank Bangladesh",
        "Bank Asia",
        "United Commercial Bank",
        "Mutual Trust Bank",
        "Southeast Bank"
    ],

    Indonesia: [
        "Bank Mandiri",
        "Bank Central Asia",
        "Bank Rakyat Indonesia",
        "Bank Negara Indonesia",
        "CIMB Niaga",
        "Bank Danamon",
        "Bank Permata",
        "Maybank Indonesia",
        "OCBC Indonesia",
        "Panin Bank",
        "Bank Tabungan Negara",
        "Bank Syariah Indonesia",
        "Bank Mega",
        "Bank Jago",
        "Bank Neo Commerce"
    ],

    Malaysia: [
        "Maybank",
        "CIMB Bank",
        "Public Bank",
        "RHB Bank",
        "Hong Leong Bank",
        "AmBank",
        "Bank Islam Malaysia",
        "Alliance Bank Malaysia",
        "Affin Bank",
        "Bank Muamalat Malaysia",
        "UOB Malaysia",
        "OCBC Bank Malaysia",
        "HSBC Malaysia",
        "Standard Chartered Malaysia",
        "MBSB Bank"
    ],

    Thailand: [
        "Bangkok Bank",
        "Kasikornbank",
        "Siam Commercial Bank",
        "Krung Thai Bank",
        "Bank of Ayudhya",
        "TMBThanachart Bank",
        "Government Savings Bank",
        "Government Housing Bank",
        "CIMB Thai",
        "Thanachart Bank",
        "UOB Thailand",
        "Standard Chartered Thailand",
        "ICBC Thai",
        "LH Bank",
        "Kiatnakin Phatra Bank"
    ],

    Vietnam: [
        "Vietcombank",
        "BIDV",
        "VietinBank",
        "Agribank",
        "Techcombank",
        "ACB",
        "MB Bank",
        "VPBank",
        "TPBank",
        "Sacombank",
        "SHB",
        "HDBank",
        "VIB",
        "Eximbank Vietnam",
        "SeABank"
    ],

    Philippines: [
        "BDO Unibank",
        "Bank of the Philippine Islands",
        "Metrobank",
        "Land Bank of the Philippines",
        "Philippine National Bank",
        "Security Bank",
        "China Banking Corporation",
        "UnionBank",
        "EastWest Bank",
        "RCBC",
        "Development Bank of the Philippines",
        "UCPB",
        "Maybank Philippines",
        "Robinsons Bank",
        "CIMB Bank Philippines"
    ],

    NewZealand: [
        "ANZ Bank New Zealand",
        "ASB Bank",
        "Bank of New Zealand",
        "Westpac New Zealand",
        "Kiwibank",
        "TSB Bank",
        "SBS Bank",
        "The Co-operative Bank",
        "Heartland Bank",
        "Rabobank New Zealand",
        "China Construction Bank New Zealand",
        "ICBC New Zealand"
    ],

    Ireland: [
        "AIB",
        "Bank of Ireland",
        "Permanent TSB",
        "EBS",
        "An Post Money",
        "Avant Money",
        "Revolut Bank",
        "N26",
        "Ulster Bank",
        "KBC Bank Ireland"
    ],

    Greece: [
        "National Bank of Greece",
        "Piraeus Bank",
        "Alpha Bank",
        "Eurobank",
        "Attica Bank",
        "Optima Bank",
        "Pancreta Bank",
        "Aegean Baltic Bank",
        "Citibank Greece",
        "HSBC Greece"
    ],

    Sweden: [
        "Swedbank",
        "SEB",
        "Handelsbanken",
        "Nordea Sweden",
        "Danske Bank Sweden",
        "Länsförsäkringar Bank",
        "SBAB",
        "Skandiabanken",
        "Avanza Bank",
        "Nordnet Bank",
        "Ikano Bank",
        "Resurs Bank",
        "Collector Bank",
        "Marginalen Bank",
        "Sparbanken Syd"
    ],

    Norway: [
        "DNB",
        "Nordea Norway",
        "SpareBank 1",
        "Handelsbanken Norway",
        "Danske Bank Norway",
        "Storebrand Bank",
        "Sbanken",
        "BN Bank",
        "OBOS-banken",
        "Landkreditt Bank",
        "Santander Consumer Bank Norway",
        "Sparebanken Sør",
        "Sparebanken Vest",
        "SpareBank 68° Nord",
        "Eika Gruppen"
    ],

    Denmark: [
        "Danske Bank",
        "Jyske Bank",
        "Sydbank",
        "Nordea Denmark",
        "Nykredit Bank",
        "Spar Nord Bank",
        "Arbejdernes Landsbank",
        "Ringkjøbing Landbobank",
        "Lån & Spar Bank",
        "Santander Consumer Bank Denmark",
        "Handelsbanken Denmark",
        "Merkur Cooperative Bank",
        "BankNordik",
        "Fynske Bank",
        "Djurslands Bank"
    ],

    Finland: [
        "Nordea Finland",
        "OP Financial Group",
        "Danske Bank Finland",
        "Aktia Bank",
        "S-Bank",
        "POP Bank",
        "Oma Savings Bank",
        "Ålandsbanken",
        "Handelsbanken Finland",
        "Bank of Åland",
        "Holvi"
    ]

};

const currencies = [
    "AED", // UAE Dirham
    "AFN", // Afghan Afghani
    "ALL", // Albanian Lek
    "AMD", // Armenian Dram
    "AOA", // Angolan Kwanza
    "ARS", // Argentine Peso
    "AUD", // Australian Dollar
    "AWG", // Aruban Florin
    "AZN", // Azerbaijani Manat
    "BAM", // Bosnia-Herzegovina Convertible Mark
    "BBD", // Barbadian Dollar
    "BDT", // Bangladeshi Taka
    "BHD", // Bahraini Dinar
    "BIF", // Burundian Franc
    "BMD", // Bermudian Dollar
    "BND", // Brunei Dollar
    "BOB", // Bolivian Boliviano
    "BRL", // Brazilian Real
    "BSD", // Bahamian Dollar
    "BTN", // Bhutanese Ngultrum
    "BWP", // Botswana Pula
    "BYN", // Belarusian Ruble
    "BZD", // Belize Dollar
    "CAD", // Canadian Dollar
    "CDF", // Congolese Franc
    "CHF", // Swiss Franc
    "CLP", // Chilean Peso
    "CNY", // Chinese Yuan
    "COP", // Colombian Peso
    "CRC", // Costa Rican Colon
    "CUP", // Cuban Peso
    "CVE", // Cape Verdean Escudo
    "CZK", // Czech Koruna
    "DJF", // Djiboutian Franc
    "DKK", // Danish Krone
    "DOP", // Dominican Peso
    "DZD", // Algerian Dinar
    "EGP", // Egyptian Pound
    "ERN", // Eritrean Nakfa
    "ETB", // Ethiopian Birr
    "EUR", // Euro
    "FJD", // Fijian Dollar
    "FKP", // Falkland Islands Pound
    "GBP", // British Pound Sterling
    "GEL", // Georgian Lari
    "GHS", // Ghanaian Cedi
    "GIP", // Gibraltar Pound
    "GMD", // Gambian Dalasi
    "GNF", // Guinean Franc
    "GTQ", // Guatemalan Quetzal
    "GYD", // Guyanese Dollar
    "HKD", // Hong Kong Dollar
    "HNL", // Honduran Lempira
    "HTG", // Haitian Gourde
    "HUF", // Hungarian Forint
    "IDR", // Indonesian Rupiah
    "ILS", // Israeli New Shekel
    "INR", // Indian Rupee
    "IQD", // Iraqi Dinar
    "IRR", // Iranian Rial
    "ISK", // Icelandic Krona
    "JMD", // Jamaican Dollar
    "JOD", // Jordanian Dinar
    "JPY", // Japanese Yen
    "KES", // Kenyan Shilling
    "KGS", // Kyrgyzstani Som
    "KHR", // Cambodian Riel
    "KMF", // Comorian Franc
    "KPW", // North Korean Won
    "KRW", // South Korean Won
    "KWD", // Kuwaiti Dinar
    "KYD", // Cayman Islands Dollar
    "KZT", // Kazakhstani Tenge
    "LAK", // Lao Kip
    "LBP", // Lebanese Pound
    "LKR", // Sri Lankan Rupee
    "LRD", // Liberian Dollar
    "LSL", // Lesotho Loti
    "LYD", // Libyan Dinar
    "MAD", // Moroccan Dirham
    "MDL", // Moldovan Leu
    "MGA", // Malagasy Ariary
    "MKD", // Macedonian Denar
    "MMK", // Myanmar Kyat
    "MNT", // Mongolian Tugrik
    "MOP", // Macanese Pataca
    "MRU", // Mauritanian Ouguiya
    "MUR", // Mauritian Rupee
    "MVR", // Maldivian Rufiyaa
    "MWK", // Malawian Kwacha
    "MXN", // Mexican Peso
    "MYR", // Malaysian Ringgit
    "MZN", // Mozambican Metical
    "NAD", // Namibian Dollar
    "NGN", // Nigerian Naira
    "NIO", // Nicaraguan Cordoba
    "NOK", // Norwegian Krone
    "NPR", // Nepalese Rupee
    "NZD", // New Zealand Dollar
    "OMR", // Omani Rial
    "PAB", // Panamanian Balboa
    "PEN", // Peruvian Sol
    "PGK", // Papua New Guinean Kina
    "PHP", // Philippine Peso
    "PKR", // Pakistani Rupee
    "PLN", // Polish Zloty
    "PYG", // Paraguayan Guarani
    "QAR", // Qatari Riyal
    "RON", // Romanian Leu
    "RSD", // Serbian Dinar
    "RUB", // Russian Ruble
    "RWF", // Rwandan Franc
    "SAR", // Saudi Riyal
    "SBD", // Solomon Islands Dollar
    "SCR", // Seychellois Rupee
    "SDG", // Sudanese Pound
    "SEK", // Swedish Krona
    "SGD", // Singapore Dollar
    "SHP", // Saint Helena Pound
    "SLE", // Sierra Leonean Leone
    "SOS", // Somali Shilling
    "SRD", // Surinamese Dollar
    "SSP", // South Sudanese Pound
    "STN", // Sao Tome and Principe Dobra
    "SVC", // Salvadoran Colon
    "SYP", // Syrian Pound
    "SZL", // Eswatini Lilangeni
    "THB", // Thai Baht
    "TJS", // Tajikistani Somoni
    "TMT", // Turkmenistani Manat
    "TND", // Tunisian Dinar
    "TOP", // Tongan Pa'anga
    "TRY", // Turkish Lira
    "TTD", // Trinidad and Tobago Dollar
    "TWD", // New Taiwan Dollar
    "TZS", // Tanzanian Shilling
    "UAH", // Ukrainian Hryvnia
    "UGX", // Ugandan Shilling
    "USD", // United States Dollar
    "UYU", // Uruguayan Peso
    "UZS", // Uzbekistani Som
    "VES", // Venezuelan Bolivar
    "VND", // Vietnamese Dong
    "VUV", // Vanuatu Vatu
    "WST", // Samoan Tala
    "XAF", // Central African CFA Franc
    "XCD", // East Caribbean Dollar
    "XOF", // West African CFA Franc
    "XPF", // CFP Franc
    "YER", // Yemeni Rial
    "ZAR", // South African Rand
    "ZMW", // Zambian Kwacha
    "ZWL"  // Zimbabwe Gold / ZiG (verify current ISO status before enabling)
];

function Transfer() {
    const { user, token } = useAuth();

    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [transactionPin, setTransactionPin] = useState("");

    const [transferStatus, setTransferStatus] = useState("");
    const [transferReference, setTransferReference] = useState("");

    const [formData, setFormData] = useState({
        country: "",
        bank: "",
        accountNumber: "",
        accountName: "",
        currency: "USD",
        amount: "",
        description: ""
    });

    const amount = Number(formData.amount || 0);
    const transferFee = amount * 0.15;
    const totalDebit = amount + transferFee;
    const availableBalance = Number(user?.balance || 0);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2
        }).format(Number(value || 0));
    };

    const formatAccountNumber = (value) => {
        if (!value) return "Not provided";
        return value.replace(/\d(?=\d{4})/g, "•");
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

        setError("");
        setSuccess("");
    };

    const handleCountryChange = (event) => {
        setFormData((previous) => ({
            ...previous,
            country: event.target.value,
            bank: "",
            currency: "USD"
        }));

        setError("");
    };

    const handleAccountNameChange = (event) => {
        const value = event.target.value.replace(/[^a-zA-Z\s'-]/g, "");

        setFormData((previous) => ({
            ...previous,
            accountName: value
        }));

        setError("");
    };

    const validateTransfer = () => {
        if (!formData.country) {
            return "Please select the recipient's country.";
        }

        if (!formData.bank) {
            return "Please select the recipient's bank.";
        }

        if (!/^[a-zA-Z0-9-]{8,20}$/.test(formData.accountNumber)) {
            return "Enter a valid account number (8–20 characters).";
        }

        if (!formData.accountName.trim()) {
            return "Please enter the recipient's account name.";
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            return "Enter a valid transfer amount.";
        }

        if (totalDebit > availableBalance) {
            return "Insufficient balance to cover the transfer and fee.";
        }

        if (!/^\d{4}$/.test(transactionPin)) {
            return "Enter your valid 4-digit transaction PIN.";
        }

        return null;
    };

    const handleContinue = () => {
        setError("");
        setSuccess("");

        if (!formData.country) {
            setError("Please select the recipient's country.");
            return;
        }

        if (!formData.bank) {
            setError("Please select the recipient's bank.");
            return;
        }

        if (!/^[a-zA-Z0-9-]{8,20}$/.test(formData.accountNumber)) {
            setError("Enter a valid account number (8–20 characters).");
            return;
        }

        if (!formData.accountName.trim()) {
            setError("Please enter the recipient's account name.");
            return;
        }

        if (!Number.isFinite(amount) || amount <= 0) {
            setError("Enter a valid transfer amount.");
            return;
        }

        if (totalDebit > availableBalance) {
            setError("Insufficient balance to cover the transfer and fee.");
            return;
        }

        setShowModal(true);
    };

    const submitTransfer = async () => {
        setError("");

        const validationError = validateTransfer();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const reference = "TRX" + Date.now();

            const response = await createTransferRequest(token, {
                country: formData.country,
                bank: formData.bank,
                accountNumber: formData.accountNumber,
                accountName: formData.accountName,
                currency: formData.currency,
                amount,
                fee: transferFee,
                description: formData.description,
                transactionPin,
                reference,
                status: "PENDING"
            });

            if (!response?.success) {
                throw new Error(
                    response?.message || "Unable to submit transfer request."
                );
            }

            const savedReference = response.reference || reference;

            setTransferStatus("PENDING");
            setTransferReference(savedReference);
            setSuccess("Your transfer request has been submitted successfully.");

            setShowModal(false);
            setTransactionPin("");

            setFormData({
                country: "",
                bank: "",
                accountNumber: "",
                accountName: "",
                currency: "USD",
                amount: "",
                description: ""
            });

        } catch (err) {
            setError(err.message || "Unable to submit transfer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="transfer-page">

            {/* HEADER */}
            <header className="transfer-header">
                <div className="transfer-header-left">
                    <Link to="/dashboard" className="transfer-back-button">
                        ←
                    </Link>

                    <div>
                        <span className="transfer-breadcrumb">BANKING / PAYMENTS</span>
                        <h1>Transfer Money</h1>
                    </div>
                </div>

                <div className="transfer-user">
                    <div className="transfer-user-avatar">
                        {user?.profile_picture ? (
                            <img
                                src={`http://localhost:5000/uploads/profiles/${user.profile_picture}`}
                                alt="Profile"
                            />
                        ) : (
                            user?.full_name?.charAt(0)?.toUpperCase() || "U"
                        )}
                    </div>

                    <div className="transfer-user-info">
                        <strong>{user?.full_name || "Customer"}</strong>
                        <span>{user?.account_number || "No account number"}</span>
                    </div>
                </div>
            </header>

            <main className="transfer-content">

                {/* INTRO */}
                <section className="transfer-intro">
                    <div>
                        <span className="transfer-eyebrow">
                            <span className="live-dot"></span>
                            SECURE BANKING
                        </span>

                        <h2>Send money with confidence.</h2>

                        <p>
                            Make a transfer to a local or international bank account.
                            Every request is securely submitted for administrator approval.
                        </p>
                    </div>

                    <div className="transfer-intro-icon">⇄</div>
                </section>

                {/* ALERTS */}
                {success && (
                    <div className="transfer-alert success">
                        <span>✓</span>
                        <p>{success}</p>
                    </div>
                )}

                {error && (
                    <div className="transfer-alert error">
                        <span>!</span>
                        <p>{error}</p>
                    </div>
                )}

                <div className="transfer-layout">

                    {/* FORM */}
                    <section className="transfer-card">
                        <div className="transfer-card-header">
                            <div>
                                <span className="section-label">PAYMENT DETAILS</span>
                                <h3>Recipient information</h3>
                                <p>Enter the details of the person you want to pay.</p>
                            </div>

                            <div className="transfer-card-icon">↗</div>
                        </div>

                        <form
                            className="transfer-form"
                            onSubmit={(event) => event.preventDefault()}
                        >

                            <div className="transfer-form-group">
                                <label htmlFor="country">Recipient country</label>

                                <select
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleCountryChange}
                                >
                                    <option value="">Select recipient country</option>

                                    {countries.map((country) => (
                                        <option key={country.name} value={country.name}>
                                            {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="transfer-form-group">
                                <label htmlFor="bank">Recipient bank</label>

                                <select
                                    id="bank"
                                    name="bank"
                                    value={formData.bank}
                                    onChange={handleChange}
                                    disabled={!formData.country}
                                >
                                    <option value="">Select recipient bank</option>

                                    {(banks[formData.country] || []).map((bank) => (
                                        <option key={bank} value={bank}>
                                            {bank}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="transfer-form-row">
                                <div className="transfer-form-group">
                                    <label htmlFor="accountNumber">Account number</label>

                                    <input
                                        id="accountNumber"
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        placeholder="Enter account number"
                                        maxLength={20}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="transfer-form-group">
                                    <label htmlFor="accountName">Account name</label>

                                    <input
                                        id="accountName"
                                        type="text"
                                        name="accountName"
                                        value={formData.accountName}
                                        onChange={handleAccountNameChange}
                                        placeholder="Recipient full name"
                                        autoComplete="off"
                                    />
                                </div>
                            </div>

                            <div className="transfer-form-row">
                                <div className="transfer-form-group">
                                    <label htmlFor="currency">Transfer currency</label>

                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleChange}
                                    >
                                        {currencies.map((currency) => (
                                            <option key={currency} value={currency}>
                                                {currency}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="transfer-form-group">
                                    <label htmlFor="amount">Transfer amount (USD)</label>

                                    <div className="amount-input-wrap">
                                        <span>$</span>

                                        <input
                                            id="amount"
                                            type="number"
                                            name="amount"
                                            value={formData.amount}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            min="0.01"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* FEE SUMMARY */}
                            <div className="transfer-fee-box">
                                <div className="fee-heading">
                                    <strong>Transfer breakdown</strong>
                                    <span>15% service fee</span>
                                </div>

                                <div className="fee-line">
                                    <span>Transfer amount</span>
                                    <strong>{formatCurrency(amount)}</strong>
                                </div>

                                <div className="fee-line">
                                    <span>Transfer fee</span>
                                    <strong>{formatCurrency(transferFee)}</strong>
                                </div>

                                <div className="fee-line total">
                                    <span>Total debit</span>
                                    <strong>{formatCurrency(totalDebit)}</strong>
                                </div>
                            </div>

                            <div className="transfer-form-group">
                                <label htmlFor="description">
                                    Payment description <span>(Optional)</span>
                                </label>

                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="What is this payment for?"
                                />
                            </div>

                            <button
                                type="button"
                                className="continue-btn"
                                onClick={handleContinue}
                            >
                                Review transfer <span>→</span>
                            </button>

                            <div className="transfer-form-security">
                                <span>🔒</span>
                                Your transaction is protected by secure authentication.
                            </div>
                        </form>
                    </section>

                    {/* SIDE PANEL */}
                    <aside className="transfer-side">

                        <div className="transfer-balance-card">
                            <div className="balance-card-top">
                                <span>AVAILABLE BALANCE</span>
                                <span className="balance-card-symbol">$</span>
                            </div>

                            <h2>{formatCurrency(availableBalance)}</h2>

                            <div className="balance-card-bottom">
                                <span>Skyravon Bank Account</span>
                                <strong>{user?.account_number || "----------"}</strong>
                            </div>
                        </div>

                        <div className="transfer-side-card">
                            <div className="side-card-icon">🛡️</div>
                            <h3>Protected transactions</h3>
                            <p>
                                Your transfer request is submitted securely and remains
                                pending until an administrator reviews it.
                            </p>
                        </div>

                        <div className="transfer-side-card">
                            <div className="side-card-icon">⚡</div>
                            <h3>Simple and convenient</h3>
                            <p>
                                Review your recipient information, confirm your PIN,
                                and submit your payment request.
                            </p>
                        </div>

                        <div className="transfer-help-card">
                            <span>NEED HELP?</span>
                            <p>Having trouble with your transfer?</p>
                            <Link to="/support">Contact support →</Link>
                        </div>

                    </aside>
                </div>

                {/* PENDING STATUS */}
                {transferStatus === "PENDING" && (
                    <section className="transfer-status-card">
                        <div className="status-icon">✓</div>

                        <div className="status-content">
                            <span className="status-tag">REQUEST SUBMITTED</span>
                            <h3>Transfer awaiting approval</h3>

                            <p>
                                Your transfer request has been received. An administrator
                                will review and approve or decline the transaction.
                            </p>

                            <div className="status-details">
                                <div>
                                    <span>Current status</span>
                                    <strong className="pending-text">PENDING</strong>
                                </div>

                                <div>
                                    <span>Transaction reference</span>
                                    <strong>{transferReference}</strong>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* CONFIRMATION MODAL */}
                {showModal && (
                    <div
                        className="transfer-modal-overlay"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget && !loading) {
                                setShowModal(false);
                            }
                        }}
                    >
                        <div
                            className="transfer-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="confirm-transfer-title"
                        >
                            <div className="transfer-modal-header">
                                <div>
                                    <span className="section-label">FINAL STEP</span>
                                    <h2 id="confirm-transfer-title">Confirm transfer</h2>
                                    <p>Review the payment information before submitting.</p>
                                </div>

                                <button
                                    type="button"
                                    className="close-modal"
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                    aria-label="Close confirmation"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="modal-recipient">
                                <div className="recipient-avatar">
                                    {formData.accountName.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <strong>{formData.accountName}</strong>
                                    <span>{formData.bank} · {formData.country}</span>
                                </div>
                            </div>

                            <div className="transfer-review">
                                <div className="review-item">
                                    <span>Account number</span>
                                    <strong>{formatAccountNumber(formData.accountNumber)}</strong>
                                </div>

                                <div className="review-item">
                                    <span>Transfer currency</span>
                                    <strong>{formData.currency}</strong>
                                </div>

                                <div className="review-item">
                                    <span>Transfer amount</span>
                                    <strong>{formatCurrency(amount)}</strong>
                                </div>

                                <div className="review-item">
                                    <span>Transfer fee</span>
                                    <strong>{formatCurrency(transferFee)}</strong>
                                </div>

                                <div className="review-item total">
                                    <span>Total debit</span>
                                    <strong>{formatCurrency(totalDebit)}</strong>
                                </div>
                            </div>

                            <div className="transfer-pin-section">
                                <label htmlFor="transactionPin">Transaction PIN</label>

                                <input
                                    id="transactionPin"
                                    type="password"
                                    inputMode="numeric"
                                    autoComplete="off"
                                    maxLength={4}
                                    value={transactionPin}
                                    onChange={(event) => {
                                        setTransactionPin(
                                            event.target.value.replace(/\D/g, "").slice(0, 4)
                                        );
                                        setError("");
                                    }}
                                    placeholder="Enter 4-digit PIN"
                                />

                                <small>
                                    Your PIN is used to authenticate this transfer request.
                                </small>
                            </div>

                            {error && (
                                <div className="transfer-alert error">
                                    <span>!</span>
                                    <p>{error}</p>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setShowModal(false)}
                                    disabled={loading}
                                >
                                    Go back
                                </button>

                                <button
                                    type="button"
                                    className="confirm-btn"
                                    onClick={submitTransfer}
                                    disabled={loading}
                                >
                                    {loading ? "Submitting..." : "Confirm transfer →"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* FOOTER */}
                <footer className="transfer-footer">
                    <p>
                        © {new Date().getFullYear()} Skyravon Bank. All rights reserved.
                    </p>

                    <div className="transfer-footer-links">
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Support</Link>
                    </div>
                </footer>

            </main>
        </div>
    );
}

export default Transfer;
