module.exports = {
    HELP_KEYWORD: ['help', 'segítség', 'segitseg'],
    DELETE_KEYWORD: ['delete', 'törlés', 'torles'],
    HELP_CONFIG: {
        color: "#000",
        title: "/rm Segítség",
        title_link: "http://benedekadam.info",
        text: [
            "Index szöveg, majd",
            "Saját API-kulcs használata ajánlott, nem biztos, hogy a default minden projekthez hozzáfér. Az API-kulcsod *<https://tasks.introweb.hu/my/api_key|itt>* éred el.",
            "",
            "*Használat:*",
            "_/rm help_ - Segítség kérése (itt vagy most)",
            "_/rm 1234_ - Az #1234-es feladat adatainak lekérése",
            "_/rm j12tia6q06eiqsb1za4n3z2ymwnji5rinywzvt0b_ - A saját API-kulcsod regisztrálása a jövőbeli kéréseidhez. *Csak egyszer kell megtenned*, utána csak akkor, ha valamiért megváltoztatod.",
            "_/rm delete_ - Ha már regisztráltad az API-kulcsod, törli azt. Csak a sajátoddal működik, mást nem tudsz vele törölni",
            "",
            "<https://github.com/benedekAdam/rmtaskmaster|Github repo>"
        ]
    },
    PRIORITY_COLORS: {
        1: "#00FF7F", //alacsony
        2: "#00BFFF", //normal 
        3: "#FFFF33", //magas
        4: "#FF8C00", //surgos
        5: "#FF0000", //azonnal
        closed: "#dedede"
    }
}