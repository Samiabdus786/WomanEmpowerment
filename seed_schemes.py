import json
from pymongo import MongoClient

MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client['shaktipath']
schemes_collection = db['schemes']

schemes = [
    # Central Schemes (All India)
    {
        "name": "Mudra Yojana (Shishu)",
        "category": "loan",
        "state": "All India",
        "description": "Provides loans up to ₹50,000 for small business owners and entrepreneurs without collateral.",
        "icon": "🏛️",
        "link": "https://www.mudra.org.in/"
    },
    {
        "name": "PM Vishwakarma Yojana",
        "category": "artisan",
        "state": "All India",
        "description": "Supports traditional artisans and craftspeople with toolkit incentives, training, and collateral-free credit.",
        "icon": "🛠️",
        "link": "https://pmvishwakarma.gov.in/"
    },
    {
        "name": "Sukanya Samriddhi Yojana",
        "category": "banking",
        "state": "All India",
        "description": "A savings scheme targeted at the parents of girl children to build a fund for future education and marriage.",
        "icon": "👧",
        "link": "https://www.nsiindia.gov.in/"
    },
    {
        "name": "Stree Shakti Package",
        "category": "loan",
        "state": "All India",
        "description": "SBI scheme supporting women entrepreneurs by providing concessions in margin and interest rates.",
        "icon": "💼",
        "link": "https://sbi.co.in/"
    },
    {
        "name": "PM Matru Vandana Yojana",
        "category": "health",
        "state": "All India",
        "description": "Maternity benefit program providing cash incentives to pregnant women and lactating mothers.",
        "icon": "🤰",
        "link": "https://wcd.nic.in/"
    },
    {
        "name": "PM Jan Dhan Yojana",
        "category": "banking",
        "state": "All India",
        "description": "Financial inclusion program offering zero-balance bank accounts, insurance, and overdraft facilities.",
        "icon": "🏦",
        "link": "https://pmjdy.gov.in/"
    },
    {
        "name": "Beti Bachao Beti Padhao",
        "category": "education",
        "state": "All India",
        "description": "A campaign to generate awareness and improve the efficiency of welfare services intended for girls in India.",
        "icon": "📚",
        "link": "https://wcd.nic.in/bbbp-scheme"
    },
    {
        "name": "Stand-Up India",
        "category": "loan",
        "state": "All India",
        "description": "Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower.",
        "icon": "🚀",
        "link": "https://www.standupmitra.in/"
    },
    {
        "name": "Annapurna Scheme",
        "category": "loan",
        "state": "All India",
        "description": "Provides loans for women to set up food catering units and packaged food businesses.",
        "icon": "🍱",
        "link": "https://www.mudra.org.in/"
    },
    {
        "name": "Mahila Samman Savings Certificate",
        "category": "banking",
        "state": "All India",
        "description": "A small savings scheme backed by the government designed exclusively for women and girls offering attractive interest rates.",
        "icon": "💰",
        "link": "https://www.indiapost.gov.in/"
    },
    {
        "name": "Udyogini Scheme",
        "category": "loan",
        "state": "All India",
        "description": "Empowers women entrepreneurs by offering low-interest loans for starting small businesses, particularly in rural and underdeveloped areas.",
        "icon": "🏭",
        "link": "https://www.msme.gov.in/"
    },
    {
        "name": "Dena Shakti Scheme",
        "category": "loan",
        "state": "All India",
        "description": "Financial assistance scheme offering loans to women entrepreneurs engaged in agriculture, retail, micro-credit, and education.",
        "icon": "💸",
        "link": "https://financialservices.gov.in/"
    },
    {
        "name": "Bharatiya Mahila Bank Business Loan",
        "category": "loan",
        "state": "All India",
        "description": "Business loans for women to support working capital or manufacturing enterprise expansion up to ₹20 Crores.",
        "icon": "🏦",
        "link": "https://sbi.co.in/"
    },
    {
        "name": "Cent Kalyani Scheme",
        "category": "loan",
        "state": "All India",
        "description": "Offered by Central Bank of India for women running small businesses like tailoring, beauty parlors, or handicrafts.",
        "icon": "✂️",
        "link": "https://www.centralbankofindia.co.in/"
    },
    {
        "name": "PM Ujjwala Yojana",
        "category": "welfare",
        "state": "All India",
        "description": "Provides LPG gas connections to women below poverty line (BPL) to promote clean cooking fuel.",
        "icon": "🔥",
        "link": "https://www.pmuy.gov.in/"
    },
    {
        "name": "Mudra Yojana (Kishore)",
        "category": "loan",
        "state": "All India",
        "description": "Loans ranging from ₹50,000 to ₹5,00,000 for expanding an existing small business under PMMY.",
        "icon": "📈",
        "link": "https://www.mudra.org.in/"
    },
    {
        "name": "Mudra Yojana (Tarun)",
        "category": "loan",
        "state": "All India",
        "description": "Loans up to ₹10,00,000 under PMMY to help significantly scale small women-led businesses.",
        "icon": "🏭",
        "link": "https://www.mudra.org.in/"
    },
    
    # State Specific Schemes
    {
        "name": "Majhi Kanya Bhagyashree",
        "category": "health",
        "state": "Maharashtra",
        "description": "Offers financial incentives to families that retain girl children and promote their education.",
        "icon": "👶",
        "link": "https://maharashtra.gov.in/"
    },
    {
        "name": "Kalyana Lakshmi / Shaadi Mubarak",
        "category": "welfare",
        "state": "Telangana",
        "description": "Financial assistance of ₹1,00,116 for the marriage of girls from poor families.",
        "icon": "💍",
        "link": "https://telangana.gov.in/"
    },
    {
        "name": "Kanyashree Prakalpa",
        "category": "education",
        "state": "West Bengal",
        "description": "Conditional cash transfer aiming at improving the status of the girl child by incentivizing schooling.",
        "icon": "🎓",
        "link": "https://www.wbkanyashree.gov.in/"
    },
    {
        "name": "Ladli Laxmi Yojana",
        "category": "welfare",
        "state": "Madhya Pradesh",
        "description": "Scheme to improve the health and educational status of girls and prevent child marriages.",
        "icon": "👧",
        "link": "https://ladlilaxmi.mp.gov.in/"
    },
    {
        "name": "YSR Cheyutha",
        "category": "loan",
        "state": "Andhra Pradesh",
        "description": "Financial assistance of ₹75,000 to SC, ST, BC, and minority women over 4 years to encourage entrepreneurship.",
        "icon": "🤝",
        "link": "https://navaratnalu.ap.gov.in/"
    },
    {
        "name": "Bhagyalakshmi Scheme",
        "category": "welfare",
        "state": "Karnataka",
        "description": "Aims to promote the birth of girl children in BPL families and raise their status in society.",
        "icon": "🦋",
        "link": "https://karnataka.gov.in/"
    },
    {
        "name": "Indira Gandhi Matritva Sahyog Yojana",
        "category": "health",
        "state": "Rajasthan",
        "description": "A maternity benefit scheme providing financial assistance to pregnant and lactating women.",
        "icon": "🍼",
        "link": "https://wcd.rajasthan.gov.in/"
    },
    {
        "name": "Kalainyar Magalir Urimai Thittam",
        "category": "welfare",
        "state": "Tamil Nadu",
        "description": "Monthly financial assistance of ₹1,000 given to eligible women heads of households.",
        "icon": "💵",
        "link": "https://www.tn.gov.in/"
    },
    {
        "name": "Mukhyamantri Kanya Utthan Yojana",
        "category": "education",
        "state": "Bihar",
        "description": "Provides financial support to girls from birth till they complete their graduation.",
        "icon": "👩‍🎓",
        "link": "https://ekalyan.bih.nic.in/"
    },
    {
        "name": "Navjeevan Yojana",
        "category": "welfare",
        "state": "Gujarat",
        "description": "Financial assistance scheme for widow women residing in Gujarat for livelihood support.",
        "icon": "🙏",
        "link": "https://sje.gujarat.gov.in/"
    },
    {
        "name": "Savitribai Phule Kishori Samriddhi Yojana",
        "category": "education",
        "state": "Jharkhand",
        "description": "Provides ₹40,000 to adolescent girls from class 8 to 12 over a period to promote education.",
        "icon": "📖",
        "link": "https://wcd.jharkhand.gov.in/"
    },
    {
        "name": "Mukhyamantri Mahila Kosh",
        "category": "loan",
        "state": "Chhattisgarh",
        "description": "Provides micro-loans at very low interest to women's Self Help Groups (SHGs) for income generation.",
        "icon": "👩‍🌾",
        "link": "https://cgstate.gov.in/"
    },
    {
        "name": "Mai Bhago Vidya Scheme",
        "category": "education",
        "state": "Punjab",
        "description": "Free bicycles provided to girl students in government schools to encourage continued education.",
        "icon": "🚲",
        "link": "https://punjab.gov.in/"
    },
    {
        "name": "Aashirwad Scheme",
        "category": "welfare",
        "state": "Punjab",
        "description": "Financial assistance given for the marriage of girls from SC/ST, Christian, and BC families.",
        "icon": "✨",
        "link": "https://punjab.gov.in/"
    },
    {
        "name": "Ghar Ghar Rozgar Yojana (Women Quota)",
        "category": "skill",
        "state": "Punjab",
        "description": "Provides vocational training and subsequent job placement explicitly aiming at high female participation.",
        "icon": "👷‍♀️",
        "link": "https://www.pgrkam.com/"
    },
    {
        "name": "Biju Kanya Ratna Yojana",
        "category": "welfare",
        "state": "Odisha",
        "description": "Aims to improve child sex ratio and ensure elementary education for girls in select districts.",
        "icon": "👧",
        "link": "https://odisha.gov.in/"
    },
    {
        "name": "Mission Shakti",
        "category": "welfare",
        "state": "Odisha",
        "description": "Financial inclusion program focusing on women-led Self-Help Groups (WSHGs) connecting them with zero-interest loans.",
        "icon": "🤝",
        "link": "https://missionshakti.odisha.gov.in/"
    },
    {
        "name": "Mukhya Mantri Kanya Vivaah Yojana",
        "category": "welfare",
        "state": "Himachal Pradesh",
        "description": "Cash subsidy to support the poor parents with the expenses of their daughter’s marriage.",
        "icon": "💍",
        "link": "https://himachal.nic.in/"
    },
    {
        "name": "Sakhi - One Stop Centre (OSC)",
        "category": "health",
        "state": "All India",
        "description": "Supports women affected by violence, providing medical, legal, and psychological aid under one roof.",
        "icon": "🏥",
        "link": "https://wcd.nic.in/schemes/one-stop-centre-scheme-1"
    },
    {
        "name": "Working Women Hostel Scheme",
        "category": "welfare",
        "state": "All India",
        "description": "Provides safe and reasonably priced accommodation for working women away from their hometowns.",
        "icon": "🏢",
        "link": "https://wcd.nic.in/"
    },
    {
        "name": "Swadhar Greh",
        "category": "welfare",
        "state": "All India",
        "description": "A scheme for women in difficult circumstances providing shelter, food, clothing and care.",
        "icon": "🏡",
        "link": "https://wcd.nic.in/"
    },
    {
        "name": "Mahila Police Volunteers",
        "category": "welfare",
        "state": "All India",
        "description": "MPVs serve as a public-police interface in order to fight crime against women in villages.",
        "icon": "👮‍♀️",
        "link": "https://wcd.nic.in/"
    },
    {
        "name": "Arundhati Gold Scheme",
        "category": "welfare",
        "state": "Assam",
        "description": "Scheme to provide financial assistance to purchase 10 grams of gold to brides during their marriage.",
        "icon": "🏅",
        "link": "https://assam.gov.in/"
    },
    {
        "name": "Vahli Dikri Yojana",
        "category": "welfare",
        "state": "Gujarat",
        "description": "Provides ₹1,10,000 cash subsidy sequentially to poor families to promote girl child education.",
        "icon": "👶",
        "link": "https://sje.gujarat.gov.in/"
    },
    {
        "name": "Mukhyamantri Rajshri Yojana",
        "category": "welfare",
        "state": "Rajasthan",
        "description": "Grant for girls taking birth in government hospitals; distributed periodically spanning into school education.",
        "icon": "🏥",
        "link": "https://wcd.rajasthan.gov.in/"
    },
    {
        "name": "Sumangala Yojana",
        "category": "welfare",
        "state": "Uttar Pradesh",
        "description": "Financial aid up to ₹15,000 provided to every girl child in six phases to empower families and promote female education.",
        "icon": "🎓",
        "link": "https://mksy.up.gov.in/"
    },
    {
        "name": "Widow Pension Scheme",
        "category": "welfare",
        "state": "Uttar Pradesh",
        "description": "Provides monthly financial assistance to widows to ensure basic livelihood security.",
        "icon": "🙏",
        "link": "https://sspy-up.gov.in/"
    },
    {
        "name": "Dulari Kanya Schema",
        "category": "welfare",
        "state": "Arunachal Pradesh",
        "description": "Financial incentive in the form of a fixed deposit favoring a girl child born in a PHC or govt hospital.",
        "icon": "💸",
        "link": "https://arunachalpradesh.gov.in/"
    },
    {
        "name": "Balika Samridhi Yojana",
        "category": "welfare",
        "state": "All India",
        "description": "Scheme to elevate the status of the girl child by extending post-birth lump sum grants and annual scholarships.",
        "icon": "✏️",
        "link": "https://wcd.nic.in/"
    },
    {
        "name": "PM SHRI Schools (Beti Shiksha Focus)",
        "category": "education",
        "state": "All India",
        "description": "Upgrades selected schools to serve as models of inclusive education, heavily promoting girl-child enrollment.",
        "icon": "🏫",
        "link": "https://pmshri.education.gov.in/"
    },
    {
        "name": "Indira Gandhi National Widow Pension Scheme",
        "category": "welfare",
        "state": "All India",
        "description": "Pension provided strictly for BPL widows in the age group of 40-59 years.",
        "icon": "💶",
        "link": "https://nsap.nic.in/"
    },
]

# Clear existing schemes and insert new ones
schemes_collection.delete_many({})
schemes_collection.insert_many(schemes)

print(f"Successfully inserted {len(schemes)} schemes into MongoDB 'shaktipath' database.")
