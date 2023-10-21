module.exports = {
    NOT_AUTH    :   "Kayıtlı olmadığın için mesajlarını okuyamıyorum. /kayit komutu ile kayıt olabilirsin.",
    ALREADY_AUTH   :   (days,username) => `Seni zaten ${days} gündür tanıyorum ${username} :)`,
    SAVE_SUCCESS    :   "Başarıyla kayıt oldun.",
    NEW_BULTEN_MESSAGE  :   (bultenNo, bultenHref) => `Yeni SPK bülteni yayınlandı! Bülten No: ${bultenNo} ulaşmak için [tıklayın](${bultenHref})`,
    LAST_BULTEN_MESSAGE :   (bultenNo, bultenHref) => `${bultenNo} numaralı SPK bültene ulaşmak için [tıklayın](${bultenHref})`,
    BULTEN_NOT_FOUND    :   "Böyle bir bülten bulunamadı. Bülten numarasını YYYY-AA şeklinde giriniz, örneğin 2023-60",
    AUTH_SUCCESS    :   "Başarıyla kayıt oldun.",
    AUTH_FAIL   :   "Kayıt olurken bir hata oluştu.",
    BIST_NO_PARAMS : (bistCount) => `BIST kodu girmediniz. Kayıtlı ${bistCount} adet şirket var, şirketleri görmek için  Örnek kullanım: /bist TARKM`,
    BIST_DETAIL : (bistName, bistHref) => `${bistName} 'in detaylarına ulaşmak için [tıklayın](${bistHref})`,
    BIST_LIST : (letter, bistList) => `${letter} harfi ile kayıtlı şirketler\n${bistList}`,
    BIST_FIRST_LETTER_REQ : "BIST şirketlerini listelemek için ilk harfi girmelisiniz. Örnek kullanım: /bistlist A",
};
