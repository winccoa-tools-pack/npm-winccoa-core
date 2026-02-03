/**
  @brief Language enum
*/
export enum OaLanguage {
    undefined = 65534,
    // special entries for auto-detection.
    // this is not valid language codes
    // it is used in the [general] section as lang="auto" to automatic user language detection
    // but       NOT in  [general] section as langs="auto"
    auto = 65533,

    posix = 254,
    meta_iso88591 = 255,

    de_AT = 10000,
    en_US = 10001,
    hu_HU = 10002,
    jp_JP = 10003,
    zh_CN = 10004,
    en_GB = 10005,
    nl_NL = 10006,
    tr_TR = 10007,
    it_IT = 10008,
    fr_FR = 10009,
    es_ES = 10010,
    de_DE = 10011,
    el_GR = 10012,
    iw_IL = 10013,
    fr_CA = 10014,
    da_DK = 10015,
    fi_FI = 10016,
    no_NO = 10017,
    pt_PT = 10018,
    sv_SE = 10019,
    is_IS = 10020,
    cs_CZ = 10021,
    pl_PL = 10022,
    ro_RO = 10023,
    hr_HR = 10024,
    sk_SK = 10025,
    sl_SI = 10026,
    ru_RU = 10027,
    bg_BG = 10028,
    ar_SA = 10029,
    zh_TW = 10030,
    ko_KR = 10031,
    ja_JP = 10032,
    th_TH = 10033,
    de_CH = 10034,
    fr_CH = 10035,
    it_CH = 10036,
    //  fa_IR = 10037,
    vi_VN = 10038,
    id_ID = 10039,
    lt_LT = 10040,
    ka_GE = 10041,
    ms_MY = 10042,
    sr_SR = 10043,
    pt_BR = 10044,
    es_AR = 10045,
    es_BO = 10046,
    es_CL = 10047,
    es_CO = 10048,
    es_CR = 10049,
    es_CU = 10050,
    es_DO = 10051,
    es_EC = 10052,
    es_GT = 10053,
    es_HN = 10054,
    es_MX = 10055,
    es_NI = 10056,
    es_PA = 10057,
    es_PE = 10058,
    es_PR = 10059,
    es_PY = 10060,
    es_SV = 10061,
    es_UY = 10062,
    es_VE = 10063,
    my_MM = 10064,
    km_KH = 10065,
    uk_UA = 10066,
    sq_AL = 10067,
    mk_MK = 10068,
    lv_LV = 10069,
    kn_IN = 10070,
    hi_IN = 10071,
    af_ZA = 10072,
    ar_DZ = 10073,
    ar_EG = 10074,
    be_BY = 10075,
    bn_BD = 10076,
    bs_BA = 10077,
    ca_ES = 10078,
    et_EE = 10079,
    he_IL = 10080,
    hy_AM = 10081,
    kk_KZ = 10082,
    lo_LA = 10083,
    mn_MN = 10085,
    nb_NO = 10086,
    nn_NO = 10087,
    si_LK = 10088,
    tg_TJ = 10089,
    tk_TM = 10090,
    uz_UZ = 10091,
}

export function OaLanguageFromString(entry: string): OaLanguage {
    if (!entry || entry.trim().length === 0) {
        console.warn(`[${new Date().toISOString()}] Warning: Empty language entry given`);
        return OaLanguage.undefined;
    }

    if (entry.toLowerCase() === 'auto') {
        return OaLanguage.auto;
    }

    if (!entry.endsWith('.utf8')) {
        console.warn(
            `[${new Date().toISOString()}] Warning: Unexpected language entry format. Only .utf8 languages are supported: ${entry}`,
        );
        return OaLanguage.undefined;
    }

    // Parse entry like "de_AT.utf8" to OaLanguage enum
    // Extract the language code part (before the dot and encoding)
    const langCode = entry.split('.')[0]; // e.g., "de_AT"

    // Find matching OaLanguage enum value
    const langValue = Object.entries(OaLanguage).find(([key]) => key === langCode)?.[1];

    if (langValue !== undefined && typeof langValue === 'number') {
        const language = langValue as OaLanguage;
        return language;
    } else {
        console.warn(
            `[${new Date().toISOString()}] Warning: Unknown language entry in project config: ${entry}`,
        );
        return OaLanguage.undefined;
    }
}
