-- =============================================================================
-- Run in Supabase SQL Editor
-- 1) Normal users may update: username, full_name, mobile, country_code, country,
--    address, state, zip_code, city (+ updated_at via app or trigger)
-- 2) Adds a countries lookup table (many ISO countries) for dropdowns
-- Requires: public.is_admin(uuid) — see replica-database-schema.sql if missing
-- =============================================================================

-- Ensure profile columns exist (safe if already present)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS country_code TEXT DEFAULT '+1';

-- -----------------------------------------------------------------------------
-- Reference table: countries (ISO 3166-1 alpha-2 + English name + optional dial)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.countries (
  iso2 CHAR(2) PRIMARY KEY CHECK (char_length(iso2) = 2),
  name_en TEXT NOT NULL,
  dial_code TEXT,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_countries_sort ON public.countries (sort_order, name_en);

ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Countries readable by everyone" ON public.countries;
CREATE POLICY "Countries readable by everyone"
  ON public.countries
  FOR SELECT
  USING (true);

COMMENT ON TABLE public.countries IS 'ISO country list for UI dropdowns; profiles.country can store iso2 or full name.';

-- Seed: many countries (ON CONFLICT keeps idempotent re-runs)
INSERT INTO public.countries (iso2, name_en, dial_code, sort_order) VALUES
('AF','Afghanistan','+93',1),('AX','Åland Islands',NULL,2),('AL','Albania','+355',3),('DZ','Algeria','+213',4),('AS','American Samoa','+1684',5),('AD','Andorra','+376',6),('AO','Angola','+244',7),('AI','Anguilla','+1264',8),('AQ','Antarctica',NULL,9),('AG','Antigua and Barbuda','+1268',10),
('AR','Argentina','+54',11),('AM','Armenia','+374',12),('AW','Aruba','+297',13),('AU','Australia','+61',14),('AT','Austria','+43',15),('AZ','Azerbaijan','+994',16),('BS','Bahamas','+1242',17),('BH','Bahrain','+973',18),('BD','Bangladesh','+880',19),('BB','Barbados','+1246',20),
('BY','Belarus','+375',21),('BE','Belgium','+32',22),('BZ','Belize','+501',23),('BJ','Benin','+229',24),('BM','Bermuda','+1441',25),('BT','Bhutan','+975',26),('BO','Bolivia','+591',27),('BQ','Bonaire, Sint Eustatius and Saba','+599',28),('BA','Bosnia and Herzegovina','+387',29),('BW','Botswana','+267',30),
('BV','Bouvet Island',NULL,31),('BR','Brazil','+55',32),('IO','British Indian Ocean Territory','+246',33),('BN','Brunei Darussalam','+673',34),('BG','Bulgaria','+359',35),('BF','Burkina Faso','+226',36),('BI','Burundi','+257',37),('CV','Cabo Verde','+238',38),('KH','Cambodia','+855',39),('CM','Cameroon','+237',40),
('CA','Canada','+1',41),('KY','Cayman Islands','+1345',42),('CF','Central African Republic','+236',43),('TD','Chad','+235',44),('CL','Chile','+56',45),('CN','China','+86',46),('CX','Christmas Island','+61',47),('CC','Cocos (Keeling) Islands','+61',48),('CO','Colombia','+57',49),('KM','Comoros','+269',50),
('CG','Congo','+242',51),('CD','Congo, Democratic Republic of the','+243',52),('CK','Cook Islands','+682',53),('CR','Costa Rica','+506',54),('CI','Côte d''Ivoire','+225',55),('HR','Croatia','+385',56),('CU','Cuba','+53',57),('CW','Curaçao','+599',58),('CY','Cyprus','+357',59),('CZ','Czechia','+420',60),
('DK','Denmark','+45',61),('DJ','Djibouti','+253',62),('DM','Dominica','+1767',63),('DO','Dominican Republic','+1809',64),('EC','Ecuador','+593',65),('EG','Egypt','+20',66),('SV','El Salvador','+503',67),('GQ','Equatorial Guinea','+240',68),('ER','Eritrea','+291',69),('EE','Estonia','+372',70),
('SZ','Eswatini','+268',71),('ET','Ethiopia','+251',72),('FK','Falkland Islands (Malvinas)',NULL,73),('FO','Faroe Islands','+298',74),('FJ','Fiji','+679',75),('FI','Finland','+358',76),('FR','France','+33',77),('GF','French Guiana','+594',78),('PF','French Polynesia','+689',79),('TF','French Southern Territories',NULL,80),
('GA','Gabon','+241',81),('GM','Gambia','+220',82),('GE','Georgia','+995',83),('DE','Germany','+49',84),('GH','Ghana','+233',85),('GI','Gibraltar','+350',86),('GR','Greece','+30',87),('GL','Greenland','+299',88),('GD','Grenada','+1473',89),('GP','Guadeloupe','+590',90),
('GU','Guam','+1671',91),('GT','Guatemala','+502',92),('GG','Guernsey','+44',93),('GN','Guinea','+224',94),('GW','Guinea-Bissau','+245',95),('GY','Guyana','+592',96),('HT','Haiti','+509',97),('HM','Heard Island and McDonald Islands',NULL,98),('VA','Holy See','+379',99),('HN','Honduras','+504',100),
('HK','Hong Kong','+852',101),('HU','Hungary','+36',102),('IS','Iceland','+354',103),('IN','India','+91',104),('ID','Indonesia','+62',105),('IR','Iran','+98',106),('IQ','Iraq','+964',107),('IE','Ireland','+353',108),('IM','Isle of Man','+44',109),('IL','Israel','+972',110),
('IT','Italy','+39',111),('JM','Jamaica','+1876',112),('JP','Japan','+81',113),('JE','Jersey','+44',114),('JO','Jordan','+962',115),('KZ','Kazakhstan','+7',116),('KE','Kenya','+254',117),('KI','Kiribati','+686',118),('KP','Korea, Democratic People''s Republic of','+850',119),('KR','Korea, Republic of','+82',120),
('KW','Kuwait','+965',121),('KG','Kyrgyzstan','+996',122),('LA','Lao People''s Democratic Republic','+856',123),('LV','Latvia','+371',124),('LB','Lebanon','+961',125),('LS','Lesotho','+266',126),('LR','Liberia','+231',127),('LY','Libya','+218',128),('LI','Liechtenstein','+423',129),('LT','Lithuania','+370',130),
('LU','Luxembourg','+352',131),('MO','Macao','+853',132),('MG','Madagascar','+261',133),('MW','Malawi','+265',134),('MY','Malaysia','+60',135),('MV','Maldives','+960',136),('ML','Mali','+223',137),('MT','Malta','+356',138),('MH','Marshall Islands','+692',139),('MQ','Martinique','+596',140),
('MR','Mauritania','+222',141),('MU','Mauritius','+230',142),('YT','Mayotte','+262',143),('MX','Mexico','+52',144),('FM','Micronesia','+691',145),('MD','Moldova','+373',146),('MC','Monaco','+377',147),('MN','Mongolia','+976',148),('ME','Montenegro','+382',149),('MS','Montserrat','+1664',150),
('MA','Morocco','+212',151),('MZ','Mozambique','+258',152),('MM','Myanmar','+95',153),('NA','Namibia','+264',154),('NR','Nauru','+674',155),('NP','Nepal','+977',156),('NL','Netherlands','+31',157),('NC','New Caledonia','+687',158),('NZ','New Zealand','+64',159),('NI','Nicaragua','+505',160),
('NE','Niger','+227',161),('NG','Nigeria','+234',162),('NU','Niue','+683',163),('NF','Norfolk Island','+672',164),('MK','North Macedonia','+389',165),('MP','Northern Mariana Islands','+1670',166),('NO','Norway','+47',167),('OM','Oman','+968',168),('PK','Pakistan','+92',169),('PW','Palau','+680',170),
('PS','Palestine, State of','+970',171),('PA','Panama','+507',172),('PG','Papua New Guinea','+675',173),('PY','Paraguay','+595',174),('PE','Peru','+51',175),('PH','Philippines','+63',176),('PN','Pitcairn','+64',177),('PL','Poland','+48',178),('PT','Portugal','+351',179),('PR','Puerto Rico','+1787',180),
('QA','Qatar','+974',181),('RE','Réunion','+262',182),('RO','Romania','+40',183),('RU','Russian Federation','+7',184),('RW','Rwanda','+250',185),('BL','Saint Barthélemy','+590',186),('SH','Saint Helena, Ascension and Tristan da Cunha','+290',187),('KN','Saint Kitts and Nevis','+1869',188),('LC','Saint Lucia','+1758',189),('MF','Saint Martin (French part)','+590',190),
('PM','Saint Pierre and Miquelon','+508',191),('VC','Saint Vincent and the Grenadines','+1784',192),('WS','Samoa','+685',193),('SM','San Marino','+378',194),('ST','Sao Tome and Principe','+239',195),('SA','Saudi Arabia','+966',196),('SN','Senegal','+221',197),('RS','Serbia','+381',198),('SC','Seychelles','+248',199),('SL','Sierra Leone','+232',200),
('SG','Singapore','+65',201),('SX','Sint Maarten (Dutch part)','+1721',202),('SK','Slovakia','+421',203),('SI','Slovenia','+386',204),('SB','Solomon Islands','+677',205),('SO','Somalia','+252',206),('ZA','South Africa','+27',207),('GS','South Georgia and the South Sandwich Islands',NULL,208),('SS','South Sudan','+211',209),('ES','Spain','+34',210),
('LK','Sri Lanka','+94',211),('SD','Sudan','+249',212),('SR','Suriname','+597',213),('SJ','Svalbard and Jan Mayen','+47',214),('SE','Sweden','+46',215),('CH','Switzerland','+41',216),('SY','Syrian Arab Republic','+963',217),('TW','Taiwan','+886',218),('TJ','Tajikistan','+992',219),('TZ','Tanzania','+255',220),
('TH','Thailand','+66',221),('TL','Timor-Leste','+670',222),('TG','Togo','+228',223),('TK','Tokelau','+690',224),('TO','Tonga','+676',225),('TT','Trinidad and Tobago','+1868',226),('TN','Tunisia','+216',227),('TR','Türkiye','+90',228),('TM','Turkmenistan','+993',229),('TC','Turks and Caicos Islands','+1649',230),
('TV','Tuvalu','+688',231),('UG','Uganda','+256',232),('UA','Ukraine','+380',233),('AE','United Arab Emirates','+971',234),('GB','United Kingdom','+44',235),('US','United States','+1',236),('UM','United States Minor Outlying Islands','+1',237),('UY','Uruguay','+598',238),('UZ','Uzbekistan','+998',239),('VU','Vanuatu','+678',240),
('VE','Venezuela','+58',241),('VN','Viet Nam','+84',242),('VG','Virgin Islands (British)','+1284',243),('VI','Virgin Islands (U.S.)','+1340',244),('WF','Wallis and Futuna','+681',245),('EH','Western Sahara','+212',246),('YE','Yemen','+967',247),('ZM','Zambia','+260',248),('ZW','Zimbabwe','+263',249)
ON CONFLICT (iso2) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  dial_code = COALESCE(EXCLUDED.dial_code, public.countries.dial_code),
  sort_order = EXCLUDED.sort_order;

-- -----------------------------------------------------------------------------
-- RLS: users can update own row; admins can update all (if not already present)
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- -----------------------------------------------------------------------------
-- Trigger: non-admins may only change allowed fields (see below)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.enforce_user_profile_self_edit_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    RAISE EXCEPTION 'Cannot change user_id';
  END IF;

  -- Blocked for non-admins (everything else allowed)
  IF (NEW.id IS DISTINCT FROM OLD.id)
     OR (NEW.email IS DISTINCT FROM OLD.email)
     OR (NEW.role IS DISTINCT FROM OLD.role)
     OR (NEW.referral_code IS DISTINCT FROM OLD.referral_code)
     OR (NEW.usdt_wallet_address IS DISTINCT FROM OLD.usdt_wallet_address)
     OR (NEW.two_fa_enabled IS DISTINCT FROM OLD.two_fa_enabled)
     OR (NEW.two_fa_secret IS DISTINCT FROM OLD.two_fa_secret)
     OR (NEW.created_at IS DISTINCT FROM OLD.created_at)
  THEN
    RAISE EXCEPTION 'You can only update username, name, mobile, country, country code, address, state, zip code, and city.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'referral_balance'
  ) THEN
    IF (NEW.referral_balance IS DISTINCT FROM OLD.referral_balance) THEN
      RAISE EXCEPTION 'You can only update allowed profile fields.';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'mining_enabled'
  ) THEN
    IF (NEW.mining_enabled IS DISTINCT FROM OLD.mining_enabled) THEN
      RAISE EXCEPTION 'You can only update allowed profile fields.';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'mining_stop_balance'
  ) THEN
    IF (NEW.mining_stop_balance IS DISTINCT FROM OLD.mining_stop_balance) THEN
      RAISE EXCEPTION 'You can only update allowed profile fields.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_user_profile_self_edit_fields ON public.profiles;
CREATE TRIGGER trg_enforce_user_profile_self_edit_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_user_profile_self_edit_fields();

COMMENT ON FUNCTION public.enforce_user_profile_self_edit_fields() IS 'Non-admins: username, full_name, mobile, country_code, country, address, state, zip_code, city, updated_at only.';
